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
$objval = new validate();
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
        // Debug: Log incoming request data
        error_log("=== EMAIL VERIFICATION REQUEST START (CREATE USER FLOW) ===");
        error_log("POST data: " . json_encode($rest->_request));

        // Get request data
        $email = isset($rest->_request['email']) ? strtolower($objgen->check_input($rest->_request['email'])) : '';
        $verification_code = isset($rest->_request['verification_code']) ? $objgen->check_input($rest->_request['verification_code']) : '';
        $user_type = isset($rest->_request['user_type']) ? $objgen->check_input($rest->_request['user_type']) : '';

        $errors = [];

        // Basic validation
        if (empty($email)) {
            $errors[] = "Email is required";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format";
        }

        if (empty($verification_code)) {
            $errors[] = "Verification code is required";
        } elseif (!preg_match('/^[0-9]{6}$/', $verification_code)) {
            $errors[] = "Verification code must be 6 digits";
        }

        if (empty($user_type) || !in_array($user_type, ['jobseeker', 'employer'])) {
            $errors[] = "Valid user type is required";
        }

        // If validation passed, verify the code and create user
        if (empty($errors)) {

            // Get verification record by email, user_type, and verification_code
            $verification = $objgen->get_Onerow(
                "email_verifications",
                "and email='$email' and user_type='$user_type' and verification_code='$verification_code' and is_verified=0"
            );

            if (!$verification || !isset($verification['verification_id'])) {
                $errors[] = "Invalid verification code";
                error_log("Verification record not found for email: $email, code: $verification_code");
            } else {
                // Check if code is expired
                $expires_at = strtotime($verification['expires_at']);
                $current_time = time();

                if ($current_time > $expires_at) {
                    $errors[] = "Verification code has expired. Please request a new code.";
                    error_log("Verification code expired at: " . $verification['expires_at']);
                } else {
                    // Code is valid, retrieve signup data and create user
                    $signup_data_json = $verification['signup_data'];

                    if (empty($signup_data_json)) {
                        $errors[] = "Signup data not found. Please sign up again.";
                        error_log("No signup data found in verification record");
                    } else {
                        $signup_data = json_decode($signup_data_json, true);

                        if (json_last_error() !== JSON_ERROR_NONE) {
                            $errors[] = "Invalid signup data format. Please sign up again.";
                            error_log("JSON decode error: " . json_last_error_msg());
                        } else {
                            error_log("Signup data retrieved successfully");
                            error_log("Creating user from signup data...");

                            // Extract common fields
                            $first_name = $signup_data['first_name'];
                            $last_name = $signup_data['last_name'];
                            $phone = $signup_data['phone'];
                            $password = $signup_data['password'];
                            $date_of_birth = isset($signup_data['date_of_birth']) ? $signup_data['date_of_birth'] : '';
                            $gender = isset($signup_data['gender']) ? $signup_data['gender'] : '';
                            $location_city = isset($signup_data['location_city']) ? $signup_data['location_city'] : '';
                            $location_state = isset($signup_data['location_state']) ? $signup_data['location_state'] : '';
                            $bio = isset($signup_data['bio']) ? $signup_data['bio'] : '';
                            $profile_image = isset($signup_data['profile_image']) ? $signup_data['profile_image'] : '';

                            // Check if user already exists (double-check)
                            $existing_user = $objgen->chk_Ext("users", "email='$email' and user_type='$user_type'");
                            if ($existing_user > 0) {
                                $errors[] = "User already exists. Please login.";
                                error_log("User already exists for email: $email");
                            } else {
                                // Insert user with status='inactive' as per requirement
                                error_log("Inserting user record with status='inactive'");
                                $user_insert = $objgen->ins_Row(
                                    'users',
                                    'first_name, last_name, email, phone, password, user_type, profile_image, date_of_birth, gender, location_city, location_state, location_country, bio, email_verified, status, created_at',
                                    "'" . $first_name . "', '" . $last_name . "', '" . $email . "', '" . $phone . "', '" . $objgen->encrypt_pass($password) . "', '" . $user_type . "', '" . $profile_image . "', " . ($date_of_birth ? "'" . $objgen->con_date_db($date_of_birth) . "'" : "NULL") . ", " . ($gender ? "'" . $gender . "'" : "NULL") . ", " . ($location_city ? "'" . $location_city . "'" : "NULL") . ", " . ($location_state ? "'" . $location_state . "'" : "NULL") . ", 'India', " . ($bio ? "'" . $bio . "'" : "NULL") . ", 1, 'inactive', '" . $c_date . "'"
                                );

                                if ($user_insert != "") {
                                    $errors[] = "User registration failed: " . $user_insert;
                                    error_log("User insert error: " . $user_insert);
                                } else {
                                    $user_id = $objgen->get_insetId();
                                    error_log("User created with ID: $user_id, status: inactive");

                                    // Create user preferences
                                    error_log("Creating user preferences");
                                    $preferences_insert = $objgen->ins_Row(
                                        'user_preferences',
                                        'user_id, created_at',
                                        "'" . $user_id . "', '" . $c_date . "'"
                                    );

                                    if ($preferences_insert != "") {
                                        error_log("Preferences insert error: " . $preferences_insert);
                                        // Don't fail, just log
                                    }

                                    // Create user type specific records
                                    if ($user_type === 'jobseeker' && isset($signup_data['jobseeker_data'])) {
                                        error_log("Creating jobseeker profile");
                                        $js_data = $signup_data['jobseeker_data'];

                                        // Handle SET data types
                                        $job_type_pref_str = isset($js_data['job_type_preference']) ? (is_array($js_data['job_type_preference']) ? implode(',', $js_data['job_type_preference']) : $js_data['job_type_preference']) : 'full_time';
                                        $work_mode_pref_str = isset($js_data['work_mode_preference']) ? (is_array($js_data['work_mode_preference']) ? implode(',', $js_data['work_mode_preference']) : $js_data['work_mode_preference']) : 'hybrid';

                                        // Create user profile
                                        $profile_insert = $objgen->ins_Row(
                                            'user_profiles',
                                            'user_id, current_job_title, current_company, experience_years, experience_months, current_salary, expected_salary, notice_period, job_type_preference, work_mode_preference, willing_to_relocate, linkedin_url, github_url, portfolio_url, availability_status, profile_visibility, profile_completeness, created_at',
                                            "'" . $user_id . "', " .
                                                (isset($js_data['current_job_title']) && $js_data['current_job_title'] ? "'" . $js_data['current_job_title'] . "'" : "NULL") . ", " .
                                                (isset($js_data['current_company']) && $js_data['current_company'] ? "'" . $js_data['current_company'] . "'" : "NULL") . ", " .
                                                "'" . (isset($js_data['experience_years']) ? $js_data['experience_years'] : 0) . "', '" . (isset($js_data['experience_months']) ? $js_data['experience_months'] : 0) . "', " .
                                                (isset($js_data['current_salary']) && $js_data['current_salary'] ? "'" . $js_data['current_salary'] . "'" : "NULL") . ", " .
                                                (isset($js_data['expected_salary']) && $js_data['expected_salary'] ? "'" . $js_data['expected_salary'] . "'" : "NULL") . ", " .
                                                "'" . (isset($js_data['notice_period']) ? $js_data['notice_period'] : '1_month') . "', '" . $job_type_pref_str . "', '" . $work_mode_pref_str . "', " .
                                                "'" . (isset($js_data['willing_to_relocate']) ? $js_data['willing_to_relocate'] : 0) . "', " .
                                                (isset($js_data['linkedin_url']) && $js_data['linkedin_url'] ? "'" . $js_data['linkedin_url'] . "'" : "NULL") . ", " .
                                                (isset($js_data['github_url']) && $js_data['github_url'] ? "'" . $js_data['github_url'] . "'" : "NULL") . ", " .
                                                (isset($js_data['portfolio_url']) && $js_data['portfolio_url'] ? "'" . $js_data['portfolio_url'] . "'" : "NULL") . ", " .
                                                "'" . (isset($js_data['availability_status']) ? $js_data['availability_status'] : 'open_to_work') . "', '" . (isset($js_data['profile_visibility']) ? $js_data['profile_visibility'] : 'public') . "', 0, '" . $c_date . "'"
                                        );

                                        if ($profile_insert != "") {
                                            error_log("Profile insert error: " . $profile_insert);
                                            // Don't fail, just log
                                        }

                                        // Add skills
                                        if (isset($js_data['skills']) && is_array($js_data['skills']) && !empty($js_data['skills'])) {
                                            error_log("Processing " . count($js_data['skills']) . " skills");

                                            foreach ($js_data['skills'] as $index => $skill_data) {
                                                if (is_array($skill_data) && isset($skill_data['skill_name'])) {
                                                    $skill_name = $objgen->check_input($skill_data['skill_name']);
                                                    $proficiency = isset($skill_data['proficiency']) ? $objgen->check_input($skill_data['proficiency']) : 'intermediate';
                                                    $years_exp = isset($skill_data['years_of_experience']) ? (float)$skill_data['years_of_experience'] : 0.0;

                                                    // Validate proficiency
                                                    $valid_proficiency = ['beginner', 'intermediate', 'advanced', 'expert'];
                                                    if (!in_array($proficiency, $valid_proficiency)) {
                                                        $proficiency = 'intermediate';
                                                    }

                                                    // Check if skill exists
                                                    $skill_exists = $objgen->get_Onerow("skills", "and skill_name='" . $skill_name . "'");

                                                    if (!$skill_exists || !isset($skill_exists['skill_id'])) {
                                                        // Create new skill
                                                        $skill_insert = $objgen->ins_Row(
                                                            'skills',
                                                            'skill_name, created_at',
                                                            "'" . $skill_name . "', '" . $c_date . "'"
                                                        );

                                                        if ($skill_insert == "") {
                                                            $skill_id = $objgen->get_insetId();
                                                        } else {
                                                            error_log("Skill insert error: " . $skill_insert);
                                                            continue;
                                                        }
                                                    } else {
                                                        $skill_id = $skill_exists['skill_id'];
                                                    }

                                                    // Add user skill
                                                    $years_exp_formatted = number_format($years_exp, 1, '.', '');
                                                    $user_skill_insert = $objgen->ins_Row(
                                                        'user_skills',
                                                        'user_id, skill_id, proficiency_level, years_of_experience, added_at',
                                                        "'" . $user_id . "', '" . $skill_id . "', '" . $proficiency . "', " . $years_exp_formatted . ", '" . $c_date . "'"
                                                    );

                                                    if ($user_skill_insert != "") {
                                                        error_log("User skill insert error: " . $user_skill_insert);
                                                    }
                                                }
                                            }
                                        }

                                    } elseif ($user_type === 'employer' && isset($signup_data['employer_data'])) {
                                        error_log("Creating employer company");
                                        $emp_data = $signup_data['employer_data'];

                                        // Create company
                                        $company_insert = $objgen->ins_Row(
                                            'companies',
                                            'user_id, company_name, company_website, company_size, industry, company_type, company_description,gst_number, founded_year, headquarters_address, headquarters_city, headquarters_state, status, created_at',
                                            "'" . $user_id . "', '" . $emp_data['company_name'] . "', " .
                                                (isset($emp_data['company_website']) && $emp_data['company_website'] ? "'" . $emp_data['company_website'] . "'" : "NULL") . ", " .
                                                (isset($emp_data['company_size']) && $emp_data['company_size'] ? "'" . $emp_data['company_size'] . "'" : "NULL") . ", " .
                                                "'" . $emp_data['industry'] . "', '" . (isset($emp_data['company_type']) ? $emp_data['company_type'] : 'startup') . "', " .
                                                (isset($emp_data['company_description']) && $emp_data['company_description'] ? "'" . $emp_data['company_description'] . "'" : "NULL") . ", " .
                                                (isset($emp_data['gst_number']) && $emp_data['gst_number'] ? "'" . $emp_data['gst_number'] . "'" : "NULL") . "," .
                                                (isset($emp_data['founded_year']) && $emp_data['founded_year'] ? $emp_data['founded_year'] : "NULL") . ", " .
                                                (isset($emp_data['headquarters_address']) && $emp_data['headquarters_address'] ? "'" . $emp_data['headquarters_address'] . "'" : "NULL") . ", " .
                                                (isset($emp_data['headquarters_city']) && $emp_data['headquarters_city'] ? "'" . $emp_data['headquarters_city'] . "'" : "NULL") . ", " .
                                                (isset($emp_data['headquarters_state']) && $emp_data['headquarters_state'] ? "'" . $emp_data['headquarters_state'] . "'" : "NULL") . ", " .
                                                "'pending_verification', '" . $c_date . "'"
                                        );

                                        if ($company_insert != "") {
                                            error_log("Company insert error: " . $company_insert);
                                            // Don't fail, just log
                                        }
                                    }

                                    // Mark verification as complete
                                    $update_verification = $objgen->upd_Row(
                                        'email_verifications',
                                        "is_verified=1, verified_at='$c_date'",
                                        "verification_id=" . $verification['verification_id']
                                    );

                                    if ($update_verification != "") {
                                        error_log("Failed to update verification record: " . $update_verification);
                                    }

                                    // Send welcome notification
                                    $welcome_title = $user_type === 'jobseeker' ? 'Welcome to Manvue!' : 'Welcome to Manvue Employer Portal!';
                                    $welcome_message = $user_type === 'jobseeker'
                                        ? 'Your job seeker account has been created successfully! Admin will review and approve your account shortly.'
                                        : 'Your employer account has been created successfully! Admin will review and approve your account shortly.';

                                    $objgen->ins_Row(
                                        'notifications',
                                        'user_id, notification_type, title, message, priority, created_at',
                                        "'" . $user_id . "', 'system', '" . $welcome_title . "', '" . $welcome_message . "', 'medium', '" . $c_date . "'"
                                    );

                                    // Get user data for response
                                    $user_details = $objgen->get_Onerow("users", "and user_id=" . $user_id);

                                    $data = [
                                        'user_id' => $user_details['user_id'],
                                        'first_name' => $objgen->check_tag($user_details['first_name']),
                                        'last_name' => $objgen->check_tag($user_details['last_name']),
                                        'email' => $objgen->check_tag($user_details['email']),
                                        'phone' => $objgen->check_tag($user_details['phone']),
                                        'user_type' => $objgen->check_tag($user_details['user_type']),
                                        'profile_image' => $user_details['profile_image'] ? IMAGE_PATH . "medium/" . $user_details['profile_image'] : "",
                                        'status' => $objgen->check_tag($user_details['status']),
                                        'email_verified' => (int)$user_details['email_verified'],
                                        'created_at' => date('d-m-Y H:i:s', strtotime($user_details['created_at']))
                                    ];

                                    // Add profile data for jobseekers
                                    if ($user_type === 'jobseeker') {
                                        $profile_details = $objgen->get_Onerow("user_profiles", "and user_id=" . $user_id);
                                        if ($profile_details) {
                                            $data['profile'] = [
                                                'current_job_title' => $objgen->check_tag($profile_details['current_job_title']),
                                                'experience_years' => (int)$profile_details['experience_years'],
                                                'experience_months' => (int)$profile_details['experience_months'],
                                                'availability_status' => $objgen->check_tag($profile_details['availability_status'])
                                            ];
                                        }

                                        // Get skills
                                        $sql = "SELECT s.skill_name, us.proficiency_level, us.years_of_experience
                                                FROM user_skills us
                                                JOIN skills s ON us.skill_id = s.skill_id
                                                WHERE us.user_id=" . $user_id . "
                                                ORDER BY us.added_at DESC
                                                LIMIT 50";
                                        $user_skills = $objgen->get_AllRows_qry($sql);
                                        $data['skills'] = $user_skills ? $user_skills : [];
                                    }

                                    // Add company data for employers
                                    if ($user_type === 'employer') {
                                        $company_details = $objgen->get_Onerow("companies", "and user_id=" . $user_id);
                                        if ($company_details) {
                                            $data['company'] = [
                                                'company_id' => $company_details['company_id'],
                                                'company_name' => $objgen->check_tag($company_details['company_name']),
                                                'industry' => $objgen->check_tag($company_details['industry']),
                                                'status' => $objgen->check_tag($company_details['status'])
                                            ];
                                        }
                                    }

                                    // Generate JWT
                                    $jwt_headers = ['typ' => 'JWT', 'alg' => 'HS256'];
                                    $jwt_payload = [
                                        'user_id' => $user_id,
                                        'email' => $email,
                                        'user_type' => $user_type,
                                        'iat' => time(),
                                        'exp' => time() + (24 * 60 * 60)
                                    ];
                                    $jwt_secret = 'manvue_secret_key_2025';
                                    $jwt_token = generate_jwt($jwt_headers, $jwt_payload, $jwt_secret);

                                    error_log("=== EMAIL VERIFICATION SUCCESS - USER CREATED ===");
                                    error_log("User ID: $user_id, Status: inactive");

                                    // Success response with JWT and user data
                                    $response_arr = [
                                        "data" => $data,
                                        "token" => $jwt_token,
                                        "jwt_token" => $jwt_token,
                                        "response_code" => 201,
                                        "status" => "Success",
                                        "message" => "Account created successfully! Your account is pending admin approval.",
                                        "success" => true
                                    ];

                                    $rest->response($api->json($response_arr), 201);
                                }
                            }
                        }
                    }
                }
            }
        }

        // If there are errors, return them
        if (!empty($errors)) {
            error_log("=== EMAIL VERIFICATION FAILED ===");
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
        error_log("=== EMAIL VERIFICATION FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());

        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Verification failed due to server error",
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
