<?php
require_once "includes/includepath.php";

// JWT Functions
function generate_jwt($headers, $payload, $secret = 'secret')
{
    $headers_encoded = base64url_encode(json_encode($headers));
    $payload_encoded = base64url_encode(json_encode($payload));
    $signature = hash_hmac(
        'SHA256',
        "$headers_encoded.$payload_encoded",
        $secret,
        true
    );
    $signature_encoded = base64url_encode($signature);
    $jwt = "$headers_encoded.$payload_encoded.$signature_encoded";
    return $jwt;
}

function base64url_encode($data)
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

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
        error_log("=== EMPLOYER LOGIN REQUEST START ===");
        error_log("POST data: " . json_encode($rest->_request));

        // Get request data with null safety
        $email_or_mobile = isset($rest->_request['emailOrMobile']) ? trim($objgen->check_input($rest->_request['emailOrMobile'])) : '';
        $password = isset($rest->_request['password']) ? $rest->_request['password'] : '';

        error_log("Employer login attempt - Email/Mobile: " . $email_or_mobile);

        $errors = [];

        // Basic validation
        if (empty($email_or_mobile)) {
            $errors[] = "Email or mobile number is required";
        }

        if (empty($password)) {
            $errors[] = "Password is required";
        }

        if (empty($errors)) {

            // Check if input is email or mobile
            $is_email = strpos($email_or_mobile, '@') !== false;

            // Build query based on input type
            if ($is_email) {
                $where_clause = "email='" . $email_or_mobile . "'";
            } else {
                // Remove spaces and special characters from phone input
                $clean_phone = preg_replace('/[^0-9+]/', '', $email_or_mobile);
                $where_clause = "phone='" . $clean_phone . "'";
            }

            // Add user type to query - employer only
            $where_clause .= " AND user_type='employer'";

            error_log("Query where clause: " . $where_clause);

            // Get user data
            $user_data = $objgen->get_Onerow("users", "and " . $where_clause);

            if (!$user_data) {
                error_log("Employer not found with given credentials");
                $errors[] = "Incorrect email or password. Please try again.";
            } else {
                error_log("Employer found: " . $user_data['user_id']);

                // Check user account status
                if ( $user_data['status'] == 'suspended') {
                    error_log("Account inactive or suspended");
                    $errors[] = "Your account is " . $user_data['status'] . ". Please contact support.";
                } else {
                    // Verify password first
                    $stored_password = $user_data['password'];
                    $decrypted_password = $objgen->decrypt_pass($stored_password);

                    error_log("Password verification attempt");

                    if ($password !== $decrypted_password) {
                        error_log("Password mismatch");
                       $errors[] = "Incorrect email or password. Please try again.";
                    } else {
                        error_log("Password verified successfully");
                    }
                }
            }
        }

        // If validation passed, proceed with login
        if (empty($errors)) {

            $user_id = $user_data['user_id'];

            // Update last login time
            $objgen->upd_Row(
                "users",
                "last_login='" . $c_date . "', updated_at='" . $c_date . "'",
                "user_id=" . $user_id
            );

            // Get company data
            $company_data = $objgen->get_Onerow("companies", "and user_id=" . $user_id);

            if (!$company_data) {
                error_log("Company data not found for employer");
                $errors[] = "Company information not found. Please contact support.";
            } 
            // else {
            //     // Check company verification status
            //     // if ($company_data['status'] == 'pending_verification') {
            //     //     error_log("Company pending verification");
            //     //     $errors[] = "Your company is pending verification. You'll be notified once verified.";
            //     // } elseif ($company_data['status'] == 'inactive' || $company_data['status'] == 'suspended') {
            //     //     error_log("Company inactive or suspended");
            //     //     $errors[] = "Your company is " . $company_data['status'] . ". Please contact support.";
            //     // }
            // }
        }

        // Final check and response
        if (empty($errors)) {

            // Get active jobs count
            $active_jobs = $objgen->get_AllRowscnt("jobs", "and company_id=" . $company_data['company_id'] . " and job_status='active'");

            // Get total applications count
            $total_applications_sql = "SELECT COUNT(*) as count FROM applications a
                INNER JOIN jobs j ON a.job_id = j.job_id
                WHERE j.company_id = " . $company_data['company_id'];
            $applications_result = $objgen->get_AllRows_qry($total_applications_sql);
            $total_applications = $applications_result ? (int)$applications_result[0]['count'] : 0;

            // Get pending applications count
            $pending_applications_sql = "SELECT COUNT(*) as count FROM applications a
                INNER JOIN jobs j ON a.job_id = j.job_id
                WHERE j.company_id = " . $company_data['company_id'] . "
                AND a.application_status = 'submitted'";
            $pending_result = $objgen->get_AllRows_qry($pending_applications_sql);
            $pending_applications = $pending_result ? (int)$pending_result[0]['count'] : 0;

            // Prepare response data
            $response_data = [
                'user_id' => $user_data['user_id'],
                'first_name' => $objgen->check_tag($user_data['first_name']),
                'last_name' => $objgen->check_tag($user_data['last_name']),
                'email' => $objgen->check_tag($user_data['email']),
                'phone' => $objgen->check_tag($user_data['phone']),
                'user_type' => 'employer',
                'profile_image' => $user_data['profile_image'] ? IMAGE_PATH . "medium/" . $user_data['profile_image'] : "",
                'status' => $objgen->check_tag($user_data['status']),
                'email_verified' => (bool)$user_data['email_verified'],
                'company' => [
                    'company_id' => $company_data['company_id'],
                    'company_name' => $objgen->check_tag($company_data['company_name']),
                    'company_logo' => $company_data['company_logo'] ? IMAGE_PATH . "medium/" . $company_data['company_logo'] : "",
                    'headquarters_address' => $company_data['headquarters_address'] ? $objgen->check_tag($company_data['headquarters_address']) : "",
                    'headquarters_city' => $company_data['headquarters_city'] ? $objgen->check_tag($company_data['headquarters_city']) : "",
                    'headquarters_state' => $company_data['headquarters_state'] ? $objgen->check_tag($company_data['headquarters_state']) : "",
                    'gst_number' => $objgen->check_tag($company_data['gst_number']),
                    'gst_verified' => (bool)$company_data['gst_verified'],
                    'industry' => $company_data['industry'] ? $objgen->check_tag($company_data['industry']) : "",
                    'company_size' => $company_data['company_size'] ? $objgen->check_tag($company_data['company_size']) : "",
                    'website' => $company_data['company_website'] ? $objgen->check_tag($company_data['company_website']) : "",
                    'status' => $objgen->check_tag($company_data['status']),
                    'active_jobs' => (int)$active_jobs,
                    'total_applications' => $total_applications,
                    'pending_applications' => $pending_applications
                ],
                'created_at' => date('d-m-Y H:i:s', strtotime($user_data['created_at']))
            ];

            // Generate JWT token
            $jwt_headers = ['typ' => 'JWT', 'alg' => 'HS256'];
            $jwt_payload = [
                'user_id' => $user_id,
                'email' => $user_data['email'],
                'user_type' => 'employer',
                'company_id' => $company_data['company_id'],
                'iat' => time(),
                'exp' => time() + (30 * 24 * 60 * 60) // 30 days
            ];
            $jwt_secret = 'manvue_secret_key_2025';
            $jwt_token = generate_jwt($jwt_headers, $jwt_payload, $jwt_secret);

            error_log("=== EMPLOYER LOGIN SUCCESS ===");

            // Success response
            $response_arr = [
                "data" => $response_data,
                "jwt_token" => $jwt_token,
                "response_code" => 200,
                "status" => "Success",
                "message" => "Login successful",
                "success" => true
            ];

            $rest->response($api->json($response_arr), 200);

        } else {
            // Login failed
            error_log("=== EMPLOYER LOGIN FAILED ===");
            error_log("Errors: " . json_encode($errors));

            $response_arr = [
                "data" => null,
                "errors" => $errors,
                "response_code" => 401,
                "status" => "Authentication Failed",
                "message" => implode(", ", $errors),
                "success" => false
            ];
            $rest->response($api->json($response_arr), 401);
        }

    } catch (Exception $e) {
        error_log("=== EMPLOYER LOGIN FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());

        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Login failed due to server error",
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
