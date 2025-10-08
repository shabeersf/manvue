<?php
require_once "includes/includepath.php";

// Initialize classes
$api = new api();
$rest = new rest();
$objgen = new general();

$authkey = true;

// Validate request method
$api->valide_method('POST');

$c_date = date('Y-m-d H:i:s');

if (isset($authkey) && $authkey == true) {

    error_reporting(E_ALL ^ (E_NOTICE | E_WARNING | E_DEPRECATED));

    try {
        error_log("=== EMPLOYER SIGNUP REQUEST START ===");
        error_log("POST data: " . json_encode($rest->_request));

        // Get contact person data
        $first_name = isset($rest->_request['firstName']) ? trim($objgen->check_input($rest->_request['firstName'])) : '';
        $last_name = isset($rest->_request['lastName']) ? trim($objgen->check_input($rest->_request['lastName'])) : '';
        $mobile_number = isset($rest->_request['mobileNumber']) ? trim($objgen->check_input($rest->_request['mobileNumber'])) : '';
        $gender = isset($rest->_request['gender']) ? trim($objgen->check_input($rest->_request['gender'])) : null;

        // Get company data
        $company_name = isset($rest->_request['companyName']) ? trim($objgen->check_input($rest->_request['companyName'])) : '';
        $full_address = isset($rest->_request['fullAddress']) ? trim($objgen->check_input($rest->_request['fullAddress'])) : '';
        $city = isset($rest->_request['city']) ? trim($objgen->check_input($rest->_request['city'])) : '';
        $state = isset($rest->_request['state']) ? trim($objgen->check_input($rest->_request['state'])) : '';
        $gst_number = isset($rest->_request['gstNumber']) ? trim($objgen->check_input($rest->_request['gstNumber'])) : '';
        $industry = isset($rest->_request['industry']) ? trim($objgen->check_input($rest->_request['industry'])) : '';
        $company_website = isset($rest->_request['companyWebsite']) ? trim($objgen->check_input($rest->_request['companyWebsite'])) : '';
        $company_size = isset($rest->_request['companySize']) ? trim($objgen->check_input($rest->_request['companySize'])) : null;
        $company_type = isset($rest->_request['companyType']) ? trim($objgen->check_input($rest->_request['companyType'])) : 'startup';
        $founded_year = isset($rest->_request['foundedYear']) ? (int)$rest->_request['foundedYear'] : null;
        $company_description = isset($rest->_request['companyDescription']) ? trim($objgen->check_input($rest->_request['companyDescription'])) : '';

        // Get login credentials
        $email = isset($rest->_request['email']) ? trim($objgen->check_input($rest->_request['email'])) : '';
        $password = isset($rest->_request['password']) ? $rest->_request['password'] : '';

        error_log("Company: " . $company_name . ", Contact: " . $first_name . " " . $last_name . ", Mobile: " . $mobile_number);

        $errors = [];

        // Validate contact person
        if (empty($first_name)) {
            $errors[] = "First name is required";
        }

        if (empty($last_name)) {
            $errors[] = "Last name is required";
        }

        if (empty($mobile_number)) {
            $errors[] = "Mobile number is required";
        } elseif (!preg_match('/^\d{10}$/', $mobile_number)) {
            $errors[] = "Please enter a valid 10-digit mobile number";
        }

        // Validate company
        if (empty($company_name)) {
            $errors[] = "Company name is required";
        }

        if (empty($gst_number)) {
            $errors[] = "GST number is required";
        } elseif (!preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/', $gst_number)) {
            $errors[] = "Please enter a valid GST number";
        }

        if (empty($industry)) {
            $errors[] = "Industry is required";
        }

        // Validate login credentials
        if (empty($email)) {
            $errors[] = "Email is required";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Please enter a valid email address";
        }

        if (empty($password)) {
            $errors[] = "Password is required";
        } elseif (strlen($password) < 8) {
            $errors[] = "Password must be at least 8 characters";
        }

        // Check if email already exists as employer - allow dual accounts
        if (empty($errors)) {
            $email_check = $objgen->get_Onerow("users", "and email='" . $email . "' and user_type='employer'");
            if ($email_check) {
                $errors[] = "Email already registered as employer";
            }
        }

        // Check if mobile already exists as employer - allow dual accounts
        if (empty($errors)) {
            $mobile_check = $objgen->get_Onerow("users", "and phone='" . $mobile_number . "' and user_type='employer'");
            if ($mobile_check) {
                $errors[] = "Mobile number already registered as employer";
            }
        }

        // Check if GST number already exists
        if (empty($errors)) {
            $gst_check = $objgen->get_Onerow("companies", "and gst_number='" . $gst_number . "'");
            if ($gst_check) {
                $errors[] = "GST number already registered";
            }
        }

        // If validation passed, proceed with registration
        if (empty($errors)) {

            // Encrypt password
            $encrypted_password = $objgen->encrypt_pass($password);

            error_log("Creating employer user account...");

            // Build user insert query
            $user_columns = "first_name, last_name, email, phone, password, user_type, email_verified, created_at, updated_at";
            $user_values = "'" . $first_name . "', '" . $last_name . "', '" . $email . "', '" . $mobile_number . "', '" . $encrypted_password . "', 'employer', 0, '" . $c_date . "', '" . $c_date . "'";

            // Add optional gender
            if ($gender) {
                $user_columns .= ", gender";
                $user_values .= ", '" . $gender . "'";
            }

            // Add optional city/state to users table
            if ($city) {
                $user_columns .= ", location_city";
                $user_values .= ", '" . $city . "'";
            }

            if ($state) {
                $user_columns .= ", location_state";
                $user_values .= ", '" . $state . "'";
            }

            // Insert into users table (status defaults to 'active' per schema)
            $user_insert = $objgen->ins_Row("users", $user_columns, $user_values);

            if ($user_insert != "") {
                $errors[] = "Failed to create user account: " . $user_insert;
                error_log("User insert failed: " . $user_insert);
            } else {
                $user_id = $objgen->get_insetId();
                error_log("User created with ID: " . $user_id);

                // Insert into companies table
                error_log("Creating company record...");

                // Build company insert query
                $company_columns = "user_id, company_name, gst_number, industry, status, created_at, updated_at";
                $company_values = "'" . $user_id . "', '" . $company_name . "', '" . $gst_number . "', '" . $industry . "', 'pending_verification', '" . $c_date . "', '" . $c_date . "'";

                // Add optional fields
                if ($full_address) {
                    $company_columns .= ", headquarters_address";
                    $company_values .= ", '" . $full_address . "'";
                }

                if ($city) {
                    $company_columns .= ", headquarters_city";
                    $company_values .= ", '" . $city . "'";
                }

                if ($state) {
                    $company_columns .= ", headquarters_state";
                    $company_values .= ", '" . $state . "'";
                }

                if ($company_website) {
                    $company_columns .= ", company_website";
                    $company_values .= ", '" . $company_website . "'";
                }

                if ($company_size) {
                    $company_columns .= ", company_size";
                    $company_values .= ", '" . $company_size . "'";
                }

                if ($company_type) {
                    $company_columns .= ", company_type";
                    $company_values .= ", '" . $company_type . "'";
                }

                if ($founded_year) {
                    $company_columns .= ", founded_year";
                    $company_values .= ", " . $founded_year;
                }

                if ($company_description) {
                    $company_columns .= ", company_description";
                    $company_values .= ", '" . $company_description . "'";
                }

                $company_insert = $objgen->ins_Row("companies", $company_columns, $company_values);

                if ($company_insert != "") {
                    // Rollback user creation if company creation fails
                    $objgen->del_Row("users", "user_id=" . $user_id);
                    $errors[] = "Failed to create company record: " . $company_insert;
                    error_log("Company insert failed: " . $company_insert);
                } else {
                    $company_id = $objgen->get_insetId();
                    error_log("Company created with ID: " . $company_id);

                    // Create employer preferences
                    error_log("Creating employer preferences...");
                    $prefs_insert = $objgen->ins_Row(
                        "user_preferences",
                        "user_id, email_notifications, push_notifications, sms_notifications, job_alerts, created_at, updated_at",
                        "'" . $user_id . "', 1, 1, 0, 1, '" . $c_date . "', '" . $c_date . "'"
                    );

                    if ($prefs_insert != "") {
                        error_log("Preferences insert warning: " . $prefs_insert);
                    }

                    error_log("=== EMPLOYER SIGNUP SUCCESS - PENDING VERIFICATION ===");

                    // Success response
                    $response_arr = [
                        "data" => [
                            "user_id" => $user_id,
                            "company_id" => $company_id,
                            "first_name" => $first_name,
                            "last_name" => $last_name,
                            "company_name" => $company_name,
                            "email" => $email,
                            "phone" => $mobile_number,
                            "user_status" => "active",
                            "company_status" => "pending_verification",
                            "message" => "Registration successful! Your company is pending verification."
                        ],
                        "response_code" => 201,
                        "status" => "Success",
                        "message" => "Employer registration successful. Company pending verification.",
                        "success" => true,
                        "requires_verification" => true
                    ];

                    $rest->response($api->json($response_arr), 201);
                }
            }
        }

        // If there are errors, return them
        if (!empty($errors)) {
            error_log("=== EMPLOYER SIGNUP VALIDATION FAILED ===");
            error_log("Errors: " . json_encode($errors));

            $response_arr = [
                "data" => null,
                "errors" => $errors,
                "response_code" => 422,
                "status" => "Validation Error",
                "message" => implode(", ", $errors),
                "success" => false
            ];
            $rest->response($api->json($response_arr), 422);
        }

    } catch (Exception $e) {
        error_log("=== EMPLOYER SIGNUP FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());

        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Registration failed due to server error",
            "success" => false
        ];
        $rest->response($api->json($response_arr), 500);
    }

} else {
    // Unauthorized
    $response_arr = [
        'data' => null,
        'errors' => ["Unauthorized access"],
        'response_code' => 401,
        'status' => 'Error',
        'message' => "Unauthorized access",
        'success' => false
    ];
    $rest->response($api->json($response_arr), 401);
}

?>
