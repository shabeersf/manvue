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
        error_log("=== UPDATE COMPANY REQUEST START ===");
        error_log("POST data: " . json_encode($rest->_request));

        // Get company_id and user_id from request
        $company_id = isset($rest->_request['companyId']) ? (int)$rest->_request['companyId'] : null;
        $user_id = isset($rest->_request['userId']) ? (int)$rest->_request['userId'] : null;
        $field_name = isset($rest->_request['fieldName']) ? trim($objgen->check_input($rest->_request['fieldName'])) : '';
        $field_value = isset($rest->_request['fieldValue']) ? $rest->_request['fieldValue'] : '';

        error_log("Company ID: $company_id, User ID: $user_id, Field: $field_name");

        $errors = [];

        // Validation
        if (!$company_id) {
            $errors[] = "Company ID is required";
        }

        if (!$user_id) {
            $errors[] = "User ID is required";
        }

        if (empty($field_name)) {
            $errors[] = "Field name is required";
        }

        // Verify company exists and belongs to user
        if (empty($errors)) {
            $company_data = $objgen->get_Onerow("companies", "and company_id=" . $company_id . " AND user_id=" . $user_id);

            if (!$company_data) {
                error_log("Company not found or doesn't belong to user");
                $errors[] = "Company not found or unauthorized";
            }
        }

        // Get user data for validation
        if (empty($errors)) {
            $user_check = $objgen->get_Onerow('users', 'and user_id=' . $user_id);
            if ($user_check) {
                $user_type = $user_check['user_type'];
                error_log('User type: ' . $user_type);
            } else {
                $errors[] = 'Invalid user or user account is not active';
            }
        }

        if (empty($errors)) {

            // Process field value based on field type
            $processed_value = trim($objgen->check_input($field_value));

            // Map frontend field names to database columns and their target table
            $field_mapping = [
                // Company table fields
                'companyName' => ['table' => 'companies', 'column' => 'company_name'],
                'industry' => ['table' => 'companies', 'column' => 'industry'],
                'companySize' => ['table' => 'companies', 'column' => 'company_size'],
                'companyType' => ['table' => 'companies', 'column' => 'company_type'],
                'foundedYear' => ['table' => 'companies', 'column' => 'founded_year'],
                'website' => ['table' => 'companies', 'column' => 'company_website'],
                'gst_number' => ['table' => 'companies', 'column' => 'gst_number'],
                'address' => ['table' => 'companies', 'column' => 'headquarters_address'],
                'description' => ['table' => 'companies', 'column' => 'company_description'],
                'linkedin' => ['table' => 'companies', 'column' => 'linkedin_url'],
                'twitter' => ['table' => 'companies', 'column' => 'twitter_url'],
                'facebook' => ['table' => 'companies', 'column' => 'facebook_url'],
                // User table fields (contact person)
                'firstName' => ['table' => 'users', 'column' => 'first_name'],
                'lastName' => ['table' => 'users', 'column' => 'last_name'],
                'gender' => ['table' => 'users', 'column' => 'gender'],
                'email' => ['table' => 'users', 'column' => 'email'],
                'phone' => ['table' => 'users', 'column' => 'phone'],
                // Location fields - stored in users table
                'location_city' => ['table' => 'users', 'column' => 'location_city'],
                'location_state' => ['table' => 'users', 'column' => 'location_state'],
            ];

            // Check if field is allowed to be updated
            $allowed_fields = array_keys($field_mapping);

            if (!in_array($field_name, $allowed_fields)) {
                error_log("Field not allowed for update: $field_name");
                $errors[] = "Invalid field name";
            }
        }

        // If validation passed, proceed with update
        if (empty($errors)) {

            $field_info = $field_mapping[$field_name];
            $target_table = $field_info['table'];
            $db_column = $field_info['column'];
            $update_success = false;

            error_log("Updating $target_table.$db_column with value: $processed_value");

            // Additional validations based on field
            if ($field_name === 'email') {
                if (!filter_var($processed_value, FILTER_VALIDATE_EMAIL)) {
                    $errors[] = "Invalid email format";
                } else {
                    // Check for duplicate email in any user account
                    $existing_email = $objgen->chk_Ext("users", "email='$processed_value' AND user_id != $user_id");
                    if ($existing_email > 0) {
                        $errors[] = "This email is already registered";
                    }
                }
            }

            if ($field_name === 'phone') {
                if (!preg_match('/^[0-9]{10}$/', $processed_value)) {
                    $errors[] = "Phone number must be 10 digits";
                } else {
                    // Check for duplicate phone in any user account
                    $existing_phone = $objgen->chk_Ext("users", "phone='$processed_value' AND user_id != $user_id");
                    if ($existing_phone > 0) {
                        $errors[] = "This mobile number is already registered";
                    }
                }
            }

            // Validation for firstName, lastName
            if ($field_name === 'firstName' || $field_name === 'lastName') {
                if (empty($processed_value)) {
                    $errors[] = ucfirst($field_name) . " cannot be empty";
                }
            }

            // Validation for gender
            if ($field_name === 'gender') {
                $valid_genders = ['male', 'female', 'other', 'prefer_not_to_say'];
                if (!in_array(strtolower($processed_value), $valid_genders)) {
                    $errors[] = "Invalid gender value";
                }
            }

            // Special handling for founded_year (integer)
            if ($field_name === 'foundedYear') {
                $processed_value = (int)$processed_value;
                if ($processed_value < 1800 || $processed_value > date('Y')) {
                    $errors[] = "Invalid founded year";
                }
            }

            // Perform update if no validation errors
            if (empty($errors)) {
                if ($target_table === 'users') {
                    // Update users table
                    if ($field_name === 'foundedYear') {
                        $update_result = $objgen->upd_Row(
                            "users",
                            $db_column . "=" . $processed_value . ", updated_at='" . $c_date . "'",
                            "user_id=" . $user_id
                        );
                    } else {
                        $update_result = $objgen->upd_Row(
                            "users",
                            $db_column . "='" . $processed_value . "', updated_at='" . $c_date . "'",
                            "user_id=" . $user_id
                        );
                    }
                } else {
                    // Update companies table
                    if ($field_name === 'foundedYear') {
                        $update_result = $objgen->upd_Row(
                            "companies",
                            $db_column . "=" . $processed_value . ", updated_at='" . $c_date . "'",
                            "company_id=" . $company_id
                        );
                    } else {
                        $update_result = $objgen->upd_Row(
                            "companies",
                            $db_column . "='" . $processed_value . "', updated_at='" . $c_date . "'",
                            "company_id=" . $company_id
                        );
                    }
                }

                if ($update_result === "") {
                    $update_success = true;
                    error_log("Field updated successfully in $target_table table");
                } else {
                    $errors[] = "Failed to update data: " . $update_result;
                    error_log("Update error: " . $update_result);
                }
            }

            // If update was successful, get updated company data
            if ($update_success && empty($errors)) {

                // Get updated company data
                $updated_company = $objgen->get_Onerow("companies", "and company_id=" . $company_id);
                $updated_user = $objgen->get_Onerow("users", "and user_id=" . $user_id);

                $response_data = [
                    'company_id' => $updated_company['company_id'],
                    'field_name' => $field_name,
                    'field_value' => $processed_value,
                    'updated_at' => $c_date,
                    'company_name' => $objgen->check_tag($updated_company['company_name']),
                    'email' => $objgen->check_tag($updated_user['email']),
                    'phone' => $objgen->check_tag($updated_user['phone']),
                    'location_city' => $objgen->check_tag($updated_user['location_city']),
                    'location_state' => $objgen->check_tag($updated_user['location_state']),
                ];

                error_log("=== UPDATE COMPANY SUCCESS ===");

                // Success response
                $response_arr = [
                    "data" => $response_data,
                    "response_code" => 200,
                    "status" => "Success",
                    "message" => "Company profile updated successfully",
                    "success" => true
                ];

                $rest->response($api->json($response_arr), 200);
            }
        }

        // If there are errors, return them
        if (!empty($errors)) {
            error_log("=== UPDATE COMPANY FAILED ===");
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
        error_log("=== UPDATE COMPANY FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());

        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Failed to update company profile",
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

$api->processApi();
?>
