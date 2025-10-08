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

        if (empty($errors)) {

            // Process field value based on field type
            $processed_value = trim($objgen->check_input($field_value));

            // Map frontend field names to database columns
            $field_mapping = [
                'companyName' => 'company_name',
                'industry' => 'industry',
                'companySize' => 'company_size',
                'foundedYear' => 'founded_year',
                'website' => 'company_website',
                'headquarters' => 'headquarters_city', // Will handle specially
                'email' => 'email', // User table field
                'phone' => 'phone', // User table field
                'address' => 'headquarters_address',
                'description' => 'company_description',
                'mission' => 'company_description', // Extended description
                'vision' => 'company_description', // Extended description
                'values' => 'company_description', // Extended description
                'workCulture' => 'company_description', // Extended description
                'linkedin' => 'linkedin_url',
                'twitter' => 'twitter_url',
                'facebook' => 'facebook_url',
                'gstNumber' => 'gst_number',
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

            $db_field = $field_mapping[$field_name];
            $update_success = false;

            // Handle user table fields (email, phone)
            if ($field_name === 'email' || $field_name === 'phone') {

                error_log("Updating user table field: $db_field");

                // Additional validation for email and phone
                if ($field_name === 'email') {
                    if (!filter_var($processed_value, FILTER_VALIDATE_EMAIL)) {
                        $errors[] = "Invalid email format";
                    } else {
                        // Check for duplicate email
                        $existing_email = $objgen->chk_Ext("users", "email='$processed_value' AND user_id != $user_id");
                        if ($existing_email > 0) {
                            $errors[] = "Email already exists";
                        }
                    }
                }

                if ($field_name === 'phone') {
                    if (!preg_match('/^[0-9]{10}$/', $processed_value)) {
                        $errors[] = "Phone number must be 10 digits";
                    } else {
                        // Check for duplicate phone
                        $existing_phone = $objgen->chk_Ext("users", "phone='$processed_value' AND user_id != $user_id");
                        if ($existing_phone > 0) {
                            $errors[] = "Phone number already exists";
                        }
                    }
                }

                if (empty($errors)) {
                    // Update user table
                    $update_result = $objgen->upd_Row(
                        "users",
                        $db_field . "='" . $processed_value . "', updated_at='" . $c_date . "'",
                        "user_id=" . $user_id
                    );

                    if ($update_result === "") {
                        $update_success = true;
                        error_log("User field updated successfully");
                    } else {
                        $errors[] = "Failed to update user data: " . $update_result;
                        error_log("User update error: " . $update_result);
                    }
                }

            } else {
                // Handle company table fields

                error_log("Updating company table field: $db_field");

                // Special handling for founded_year (integer)
                if ($field_name === 'foundedYear') {
                    $processed_value = (int)$processed_value;
                    if ($processed_value < 1800 || $processed_value > date('Y')) {
                        $errors[] = "Invalid founded year";
                    }
                }

                // Special handling for headquarters (split into city, state, country)
                if ($field_name === 'headquarters') {
                    $parts = explode(',', $processed_value);
                    if (count($parts) >= 2) {
                        $city = trim($parts[0]);
                        $state = trim($parts[1]);
                        $country = isset($parts[2]) ? trim($parts[2]) : 'India';

                        $update_result = $objgen->upd_Row(
                            "companies",
                            "headquarters_city='" . $city . "', headquarters_state='" . $state . "', headquarters_country='" . $country . "', updated_at='" . $c_date . "'",
                            "company_id=" . $company_id
                        );
                    } else {
                        $errors[] = "Invalid headquarters format. Use: City, State, Country";
                    }
                } else if (empty($errors)) {
                    // Standard company field update
                    if ($field_name === 'foundedYear') {
                        $update_result = $objgen->upd_Row(
                            "companies",
                            $db_field . "=" . $processed_value . ", updated_at='" . $c_date . "'",
                            "company_id=" . $company_id
                        );
                    } else {
                        $update_result = $objgen->upd_Row(
                            "companies",
                            $db_field . "='" . $processed_value . "', updated_at='" . $c_date . "'",
                            "company_id=" . $company_id
                        );
                    }
                }

                if (empty($errors)) {
                    if ($update_result === "") {
                        $update_success = true;
                        error_log("Company field updated successfully");
                    } else {
                        $errors[] = "Failed to update company data: " . $update_result;
                        error_log("Company update error: " . $update_result);
                    }
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
