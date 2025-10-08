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
        error_log("=== SIGNUP REQUEST START ===");
        error_log("POST data: " . json_encode($rest->_request));
        error_log("FILES data: " . json_encode(array_map(function ($file) {
            return ['name' => $file['name'], 'size' => $file['size'], 'type' => $file['type']];
        }, $_FILES)));

        // Get request data with null safety
        $user_type = isset($rest->_request['user_type']) ? $objgen->check_input($rest->_request['user_type']) : '';
        $first_name = isset($rest->_request['first_name']) ? $objgen->check_input($rest->_request['first_name']) : '';
        $last_name = isset($rest->_request['last_name']) ? $objgen->check_input($rest->_request['last_name']) : '';
        $email = isset($rest->_request['email']) ? strtolower($objgen->check_input($rest->_request['email'])) : '';
        $phone = isset($rest->_request['phone']) ? $objgen->check_input($rest->_request['phone']) : '';
        $password = isset($rest->_request['password']) ? $rest->_request['password'] : '';
        $confirm_password = isset($rest->_request['confirm_password']) ? $rest->_request['confirm_password'] : $password;
        $date_of_birth = isset($rest->_request['date_of_birth']) ? $objgen->check_input($rest->_request['date_of_birth']) : '';
        $gender = isset($rest->_request['gender']) ? $objgen->check_input($rest->_request['gender']) : '';
        $location_city = isset($rest->_request['location_city']) ? $objgen->check_input($rest->_request['location_city']) : '';
        $location_state = isset($rest->_request['location_state']) ? $objgen->check_input($rest->_request['location_state']) : '';
        $bio = isset($rest->_request['bio']) ? $objgen->check_input($rest->_request['bio']) : '';

        // Jobseeker fields
        $current_job_title = isset($rest->_request['current_job_title']) ? $objgen->check_input($rest->_request['current_job_title']) : '';
        $current_company = isset($rest->_request['current_company']) ? $objgen->check_input($rest->_request['current_company']) : '';
        $experience_years = isset($rest->_request['experience_years']) ? (int)$rest->_request['experience_years'] : 0;
        $experience_months = isset($rest->_request['experience_months']) ? (int)$rest->_request['experience_months'] : 0;
        $current_salary = isset($rest->_request['current_salary']) ? $rest->_request['current_salary'] : '';
        $expected_salary = isset($rest->_request['expected_salary']) ? $rest->_request['expected_salary'] : '';
        $notice_period = isset($rest->_request['notice_period']) ? $objgen->check_input($rest->_request['notice_period']) : '1_month';
        $job_type_preference = isset($rest->_request['job_type_preference']) ? $rest->_request['job_type_preference'] : 'full_time';
        $work_mode_preference = isset($rest->_request['work_mode_preference']) ? $rest->_request['work_mode_preference'] : 'hybrid';
        $willing_to_relocate = isset($rest->_request['willing_to_relocate']) ? (int)$rest->_request['willing_to_relocate'] : 0;
        $availability_status = isset($rest->_request['availability_status']) ? $objgen->check_input($rest->_request['availability_status']) : 'open_to_work';
        $linkedin_url = isset($rest->_request['linkedin_url']) ? $objgen->check_input($rest->_request['linkedin_url']) : '';
        $github_url = isset($rest->_request['github_url']) ? $objgen->check_input($rest->_request['github_url']) : '';
        $portfolio_url = isset($rest->_request['portfolio_url']) ? $objgen->check_input($rest->_request['portfolio_url']) : '';
        $profile_visibility = isset($rest->_request['profile_visibility']) ? $objgen->check_input($rest->_request['profile_visibility']) : 'public';

        // Skills - handle JSON string
        $skills = [];
        if (isset($rest->_request['skills']) && !empty($rest->_request['skills'])) {
            if (is_string($rest->_request['skills'])) {
                $skills = json_decode($rest->_request['skills'], true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    error_log("Skills JSON decode error: " . json_last_error_msg());
                    $skills = [];
                }
            } elseif (is_array($rest->_request['skills'])) {
                $skills = $rest->_request['skills'];
            }
        }
        error_log("Parsed skills: " . json_encode($skills));

        // Employer fields
        $company_name = isset($rest->_request['company_name']) ? $objgen->check_input($rest->_request['company_name']) : '';
        $company_website = isset($rest->_request['company_website']) ? $objgen->check_input($rest->_request['company_website']) : '';
        $company_size = isset($rest->_request['company_size']) ? $objgen->check_input($rest->_request['company_size']) : '';
        $industry = isset($rest->_request['industry']) ? $objgen->check_input($rest->_request['industry']) : '';
        $company_type = isset($rest->_request['company_type']) ? $objgen->check_input($rest->_request['company_type']) : 'startup';
        $company_description = isset($rest->_request['company_description']) ? $objgen->check_input($rest->_request['company_description']) : '';
        $founded_year = isset($rest->_request['founded_year']) && !empty($rest->_request['founded_year']) ? (int)$rest->_request['founded_year'] : null;
        $headquarters_address = isset($rest->_request['headquarters_address']) ? $objgen->check_input($rest->_request['headquarters_address']) : '';
        $headquarters_city = isset($rest->_request['headquarters_city']) ? $objgen->check_input($rest->_request['headquarters_city']) : '';
        $headquarters_state = isset($rest->_request['headquarters_state']) ? $objgen->check_input($rest->_request['headquarters_state']) : '';

        $errors = [];

        // Basic validation
        if (empty($user_type) || !in_array($user_type, ['jobseeker', 'employer'])) {
            $errors[] = "Valid user type is required (jobseeker or employer)";
        }

        if (empty($first_name)) {
            $errors[] = "First name is required";
        }

        if (empty($last_name)) {
            $errors[] = "Last name is required";
        }

        if (empty($email)) {
            $errors[] = "Email is required";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format";
        }

        if (empty($phone)) {
            $errors[] = "Phone number is required";
        } elseif (!preg_match('/^[0-9]{10}$/', $phone)) {
            $errors[] = "Phone number must be 10 digits";
        }

        if (empty($password)) {
            $errors[] = "Password is required";
        } elseif (strlen($password) < 6) {
            $errors[] = "Password must be at least 6 characters";
        }

        if ($password !== $confirm_password) {
            $errors[] = "Passwords do not match";
        }

        // Check duplicates - validate with user_type to allow dual accounts
        if (!empty($email) && !empty($user_type)) {
            $existing_user = $objgen->chk_Ext("users", "email='$email' and user_type='$user_type'");
            if ($existing_user > 0) {
                $errors[] = "Email already registered as " . $user_type;
            }
        }

        if (!empty($phone) && !empty($user_type)) {
            $existing_phone = $objgen->chk_Ext("users", "phone='$phone' and user_type='$user_type'");
            if ($existing_phone > 0) {
                $errors[] = "Phone number already registered as " . $user_type;
            }
        }

        // User type specific validation
        if ($user_type === 'employer') {
            if (empty($company_name)) {
                $errors[] = "Company name is required for employers";
            }
            if (empty($industry)) {
                $errors[] = "Industry is required for employers";
            }
        }

        if ($user_type === 'jobseeker' && empty($skills)) {
            $errors[] = "At least one skill is required for job seekers";
        }

        error_log("Initial validation errors: " . json_encode($errors));

        // If validation passed, proceed with registration
        if (empty($errors)) {

            // Handle profile image upload
            $profile_image = "";
            if (isset($_FILES['profile_image']) && $_FILES['profile_image']['name'] != "") {
                error_log("Processing profile image upload");
                $upload_result = $objgen->upload_resize(
                    'profile_image',
                    'profile_' . time(),
                    'image',
                    ['l', 'm', 's'],
                    'null',
                    5000000,
                    [800, 800, 'crop', 90],
                    [300, 300, 'crop', 85],
                    [150, 150, 'crop', 80],
                    'photos/orginal'
                );

                if ($upload_result[1] != "") {
                    $errors[] = $upload_result[1];
                    error_log("Image upload error: " . $upload_result[1]);
                } else {
                    $profile_image = $upload_result[0];
                    error_log("Image uploaded successfully: " . $profile_image);
                }
            }

            // Only proceed if no image upload errors
            if (empty($errors)) {

                // Insert user
                error_log("Inserting user record");
                $user_insert = $objgen->ins_Row(
                    'users',
                    'first_name, last_name, email, phone, password, user_type, profile_image, date_of_birth, gender, location_city, location_state, location_country, bio, status, created_at',
                    "'" . $first_name . "', '" . $last_name . "', '" . $email . "', '" . $phone . "', '" . $objgen->encrypt_pass($password) . "', '" . $user_type . "', '" . $profile_image . "', " . ($date_of_birth ? "'" . $objgen->con_date_db($date_of_birth) . "'" : "NULL") . ", " . ($gender ? "'" . $gender . "'" : "NULL") . ", " . ($location_city ? "'" . $location_city . "'" : "NULL") . ", " . ($location_state ? "'" . $location_state . "'" : "NULL") . ", 'India', " . ($bio ? "'" . $bio . "'" : "NULL") . ", 'inactive', '" . $c_date . "'"
                );

                if ($user_insert != "") {
                    $errors[] = "User registration failed: " . $user_insert;
                    error_log("User insert error: " . $user_insert);
                }

                // Check for errors before continuing
                if (empty($errors)) {
                    $user_id = $objgen->get_insetId();
                    error_log("User created with ID: " . $user_id);

                    // Create user preferences
                    error_log("Creating user preferences");
                    $preferences_insert = $objgen->ins_Row(
                        'user_preferences',
                        'user_id, created_at',
                        "'" . $user_id . "', '" . $c_date . "'"
                    );

                    if ($preferences_insert != "") {
                        $errors[] = "User preferences creation failed: " . $preferences_insert;
                        error_log("Preferences insert error: " . $preferences_insert);
                    }
                }

                // Check for errors before continuing with user type specific operations
                if (empty($errors) && $user_type === 'jobseeker') {

                    error_log("Creating jobseeker profile");

                    // Handle SET data types
                    $job_type_pref_str = is_array($job_type_preference) ? implode(',', $job_type_preference) : $job_type_preference;
                    $work_mode_pref_str = is_array($work_mode_preference) ? implode(',', $work_mode_preference) : $work_mode_preference;

                    error_log("Job type pref: " . $job_type_pref_str);
                    error_log("Work mode pref: " . $work_mode_pref_str);

                    // Create user profile
                    $profile_insert = $objgen->ins_Row(
                        'user_profiles',
                        'user_id, current_job_title, current_company, experience_years, experience_months, current_salary, expected_salary, notice_period, job_type_preference, work_mode_preference, willing_to_relocate, linkedin_url, github_url, portfolio_url, availability_status, profile_visibility, profile_completeness, created_at',
                        "'" . $user_id . "', " .
                            ($current_job_title ? "'" . $current_job_title . "'" : "NULL") . ", " .
                            ($current_company ? "'" . $current_company . "'" : "NULL") . ", " .
                            "'" . $experience_years . "', '" . $experience_months . "', " .
                            ($current_salary ? "'" . $current_salary . "'" : "NULL") . ", " .
                            ($expected_salary ? "'" . $expected_salary . "'" : "NULL") . ", " .
                            "'" . $notice_period . "', '" . $job_type_pref_str . "', '" . $work_mode_pref_str . "', " .
                            "'" . $willing_to_relocate . "', " .
                            ($linkedin_url ? "'" . $linkedin_url . "'" : "NULL") . ", " .
                            ($github_url ? "'" . $github_url . "'" : "NULL") . ", " .
                            ($portfolio_url ? "'" . $portfolio_url . "'" : "NULL") . ", " .
                            "'" . $availability_status . "', '" . $profile_visibility . "', 0, '" . $c_date . "'"
                    );

                    if ($profile_insert != "") {
                        $errors[] = "Profile creation failed: " . $profile_insert;
                        error_log("Profile insert error: " . $profile_insert);
                    }

                    // Add skills only if no errors so far
                    if (empty($errors) && !empty($skills) && is_array($skills)) {
                        error_log("Processing " . count($skills) . " skills");

                        foreach ($skills as $index => $skill_data) {
                            if (is_array($skill_data) && isset($skill_data['skill_name'])) {
                                $skill_name = $objgen->check_input($skill_data['skill_name']);
                                $proficiency = isset($skill_data['proficiency']) ? $objgen->check_input($skill_data['proficiency']) : 'intermediate';
                                $years_exp = isset($skill_data['years_of_experience']) ? (float)$skill_data['years_of_experience'] : 0.0;

                                error_log("Processing skill $index: $skill_name, $proficiency, $years_exp years");

                                // Validate proficiency
                                $valid_proficiency = ['beginner', 'intermediate', 'advanced', 'expert'];
                                if (!in_array($proficiency, $valid_proficiency)) {
                                    $errors[] = "Invalid proficiency level for skill: " . $skill_name;
                                    error_log("Invalid proficiency: $proficiency for skill: $skill_name");
                                    break;
                                }

                                // Validate years
                                if ($years_exp < 0 || $years_exp > 99.9) {
                                    $errors[] = "Invalid years of experience for skill: " . $skill_name;
                                    error_log("Invalid years: $years_exp for skill: $skill_name");
                                    break;
                                }

                                // Check if skill exists
                                $skill_exists = $objgen->get_Onerow("skills", "and skill_name='" . $skill_name . "'");

                                if (!$skill_exists || !isset($skill_exists['skill_id'])) {
                                    // Create new skill
                                    error_log("Creating new skill: $skill_name");
                                    $skill_insert = $objgen->ins_Row(
                                        'skills',
                                        'skill_name, created_at',
                                        "'" . $skill_name . "', '" . $c_date . "'"
                                    );

                                    if ($skill_insert != "") {
                                        $errors[] = "Skill creation failed: " . $skill_insert;
                                        error_log("Skill insert error: " . $skill_insert);
                                        break;
                                    }

                                    $skill_id = $objgen->get_insetId();
                                    error_log("New skill created with ID: $skill_id");
                                } else {
                                    $skill_id = $skill_exists['skill_id'];
                                    error_log("Using existing skill ID: $skill_id");
                                }

                                // Add user skill
                                $years_exp_formatted = number_format($years_exp, 1, '.', '');
                                error_log("Inserting user skill with years: $years_exp_formatted");

                                $user_skill_insert = $objgen->ins_Row(
                                    'user_skills',
                                    'user_id, skill_id, proficiency_level, years_of_experience, added_at',
                                    "'" . $user_id . "', '" . $skill_id . "', '" . $proficiency . "', " . $years_exp_formatted . ", '" . $c_date . "'"
                                );

                                if ($user_skill_insert != "") {
                                    $errors[] = "User skill assignment failed: " . $user_skill_insert;
                                    error_log("User skill insert error: " . $user_skill_insert);
                                    break;
                                }

                                error_log("Skill added successfully");
                            }
                        }
                    }
                } elseif (empty($errors) && $user_type === 'employer') {

                    error_log("Creating employer company");

                    // Create company
                    $company_insert = $objgen->ins_Row(
                        'companies',
                        'user_id, company_name, company_website, company_size, industry, company_type, company_description, founded_year, headquarters_address, headquarters_city, headquarters_state, status, created_at',
                        "'" . $user_id . "', '" . $company_name . "', " .
                            ($company_website ? "'" . $company_website . "'" : "NULL") . ", " .
                            ($company_size ? "'" . $company_size . "'" : "NULL") . ", " .
                            "'" . $industry . "', '" . $company_type . "', " .
                            ($company_description ? "'" . $company_description . "'" : "NULL") . ", " .
                            ($founded_year ? $founded_year : "NULL") . ", " .
                            ($headquarters_address ? "'" . $headquarters_address . "'" : "NULL") . ", " .
                            ($headquarters_city ? "'" . $headquarters_city . "'" : "NULL") . ", " .
                            ($headquarters_state ? "'" . $headquarters_state . "'" : "NULL") . ", " .
                            "'pending_verification', '" . $c_date . "'"
                    );

                    if ($company_insert != "") {
                        $errors[] = "Company creation failed: " . $company_insert;
                        error_log("Company insert error: " . $company_insert);
                    }
                }

                // If everything succeeded, prepare success response
                if (empty($errors)) {
                    error_log("Registration successful, preparing response");

                    // Get user data
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

                        // Get skills - CORRECTED VERSION
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

                    // Send notification
                    $welcome_title = $user_type === 'jobseeker' ? 'Welcome to Manvue!' : 'Welcome to Manvue Employer Portal!';
                    $welcome_message = $user_type === 'jobseeker'
                        ? 'Your job seeker account has been created successfully!'
                        : 'Your employer account has been created successfully!';

                    $objgen->ins_Row(
                        'notifications',
                        'user_id, notification_type, title, message, priority, created_at',
                        "'" . $user_id . "', 'system', '" . $welcome_title . "', '" . $welcome_message . "', 'medium', '" . $c_date . "'"
                    );

                    error_log("=== SIGNUP SUCCESS ===");
                    $data['user_id'] = $user_id;
                    // Success response
                    $response_arr = [
                        "data" => $data,
                        "jwt_token" => $jwt_token,
                        "response_code" => 201,
                        "status" => "Success",
                        "message" => "Account created successfully",
                        "success" => true
                    ];

                    $rest->response($api->json($response_arr), 201);
                }
            }
        }

        // If there are errors, return them
        if (!empty($errors)) {
            error_log("=== SIGNUP FAILED ===");
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
        error_log("=== SIGNUP FATAL ERROR ===");
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

$api->processApi();
