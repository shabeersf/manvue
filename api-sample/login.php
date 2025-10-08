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
        error_log("=== LOGIN REQUEST START ===");
        error_log("POST data: " . json_encode($rest->_request));
        
        // Get request data with null safety
        $email_or_mobile = isset($rest->_request['emailOrMobile']) ? trim($objgen->check_input($rest->_request['emailOrMobile'])) : '';
        $password = isset($rest->_request['password']) ? $rest->_request['password'] : '';
        $user_type = isset($rest->_request['user_type']) ? $objgen->check_input($rest->_request['user_type']) : 'jobseeker';
        
        error_log("Login attempt - Email/Mobile: " . $email_or_mobile . ", User Type: " . $user_type);
        
        $errors = [];
        
        // Basic validation
        if (empty($email_or_mobile)) {
            $errors[] = "Email or mobile number is required";
        }
        
        if (empty($password)) {
            $errors[] = "Password is required";
        }
        
        // Validate user type
        if (!in_array($user_type, ['jobseeker', 'employer'])) {
            $errors[] = "Invalid user type";
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
            
            // Add user type and status to query
            $where_clause .= " AND user_type='" . $user_type . "' AND status='active'";
            
            error_log("Query where clause: " . $where_clause);
            
            // Get user data
            $user_data = $objgen->get_Onerow("users", "and " . $where_clause);
            
            if (!$user_data) {
                error_log("User not found with given credentials");
               $errors[] = "Incorrect email or password. Please try again.";

            } else {
                error_log("User found: " . $user_data['user_id']);
                
                // Verify password
                $stored_password = $user_data['password'];
                $decrypted_password = $objgen->decrypt_pass($stored_password);
                
                error_log("Password verification attempt");
                
                if ($password !== $decrypted_password) {
                    error_log("Password mismatch");
                    $errors[] = "Incorrect email or password. Please try again.";
                } else {
                    error_log("Password verified successfully");
                    
                    // Check if account is verified (optional - remove if not needed)
                    // if (!$user_data['email_verified']) {
                    //     $errors[] = "Please verify your email address before logging in";
                    // }
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
            
            // Get additional profile data based on user type
            $additional_data = [];
            
            if ($user_type === 'jobseeker') {
                // Get jobseeker profile
                $profile_data = $objgen->get_Onerow("user_profiles", "and user_id=" . $user_id);
                
                if ($profile_data) {
                    $additional_data['profile'] = [
                        'current_job_title' => $objgen->check_tag($profile_data['current_job_title']),
                        'experience_years' => (int)$profile_data['experience_years'],
                        'experience_months' => (int)$profile_data['experience_months'],
                        'availability_status' => $objgen->check_tag($profile_data['availability_status']),
                        'profile_completeness' => (int)$profile_data['profile_completeness']
                    ];
                }
                
                // Get user skills count
                $skills_count = $objgen->get_AllRowscnt("user_skills", "and user_id=" . $user_id);
                $additional_data['skills_count'] = (int)$skills_count;
                
            } else if ($user_type === 'employer') {
                // Get employer company data
                $company_data = $objgen->get_Onerow("companies", "and user_id=" . $user_id);
                
                if ($company_data) {
                    $additional_data['company'] = [
                        'company_id' => $company_data['company_id'],
                        'company_name' => $objgen->check_tag($company_data['company_name']),
                        'company_logo' => $company_data['company_logo'] ? IMAGE_PATH . "medium/" . $company_data['company_logo'] : "",
                        'industry' => $objgen->check_tag($company_data['industry']),
                        'status' => $objgen->check_tag($company_data['status'])
                    ];
                }
            }
            
            // Prepare response data
            $response_data = [
                'user_id' => $user_data['user_id'],
                'first_name' => $objgen->check_tag($user_data['first_name']),
                'last_name' => $objgen->check_tag($user_data['last_name']),
                'email' => $objgen->check_tag($user_data['email']),
                'phone' => $objgen->check_tag($user_data['phone']),
                'user_type' => $objgen->check_tag($user_data['user_type']),
                'profile_image' => $user_data['profile_image'] ? IMAGE_PATH . "medium/" . $user_data['profile_image'] : "",
                'status' => $objgen->check_tag($user_data['status']),
                'email_verified' => (bool)$user_data['email_verified'],
                'created_at' => date('d-m-Y H:i:s', strtotime($user_data['created_at']))
            ];
            
            // Merge additional data
            $response_data = array_merge($response_data, $additional_data);
            
            // Generate JWT token
            $jwt_headers = ['typ' => 'JWT', 'alg' => 'HS256'];
            $jwt_payload = [
                'user_id' => $user_id,
                'email' => $user_data['email'],
                'user_type' => $user_type,
                'iat' => time(),
                'exp' => time() + (30 * 24 * 60 * 60) // 30 days
            ];
            $jwt_secret = 'manvue_secret_key_2025';
            $jwt_token = generate_jwt($jwt_headers, $jwt_payload, $jwt_secret);
            
            error_log("=== LOGIN SUCCESS ===");
            
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
            error_log("=== LOGIN FAILED ===");
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
        error_log("=== LOGIN FATAL ERROR ===");
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

$api->processApi();
?>