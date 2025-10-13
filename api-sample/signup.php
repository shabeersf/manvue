<?php
require_once "includes/includepath.php";
require_once 'PHPMailer/mailconfig.php';

// JWT Functions (kept for future use in verify-email.php)
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
        error_log("=== SIGNUP REQUEST START (VERIFICATION-FIRST FLOW) ===");
        error_log("POST data: " . json_encode($rest->_request));

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

        // If validation passed, proceed with storing signup data temporarily
        if (empty($errors)) {

            // Handle profile image upload (if provided)
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

                // Prepare signup data to store temporarily in email_verifications table
                $signup_data = [
                    'user_type' => $user_type,
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'email' => $email,
                    'phone' => $phone,
                    'password' => $password, // Will be encrypted when creating user
                    'date_of_birth' => $date_of_birth,
                    'gender' => $gender,
                    'location_city' => $location_city,
                    'location_state' => $location_state,
                    'bio' => $bio,
                    'profile_image' => $profile_image
                ];

                // Add jobseeker-specific data
                if ($user_type === 'jobseeker') {
                    $signup_data['jobseeker_data'] = [
                        'current_job_title' => $current_job_title,
                        'current_company' => $current_company,
                        'experience_years' => $experience_years,
                        'experience_months' => $experience_months,
                        'current_salary' => $current_salary,
                        'expected_salary' => $expected_salary,
                        'notice_period' => $notice_period,
                        'job_type_preference' => $job_type_preference,
                        'work_mode_preference' => $work_mode_preference,
                        'willing_to_relocate' => $willing_to_relocate,
                        'availability_status' => $availability_status,
                        'linkedin_url' => $linkedin_url,
                        'github_url' => $github_url,
                        'portfolio_url' => $portfolio_url,
                        'profile_visibility' => $profile_visibility,
                        'skills' => $skills
                    ];
                }

                // Add employer-specific data
                if ($user_type === 'employer') {
                    $signup_data['employer_data'] = [
                        'company_name' => $company_name,
                        'company_website' => $company_website,
                        'company_size' => $company_size,
                        'industry' => $industry,
                        'company_type' => $company_type,
                        'company_description' => $company_description,
                        'founded_year' => $founded_year,
                        'headquarters_address' => $headquarters_address,
                        'headquarters_city' => $headquarters_city,
                        'headquarters_state' => $headquarters_state
                    ];
                }

                // Convert signup data to JSON
                $signup_data_json = json_encode($signup_data);
                error_log("Signup data prepared, length: " . strlen($signup_data_json) . " bytes");

                // Generate 6-digit verification code
                $verification_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

                // Set expiration time (15 minutes from now)
                $expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));

                // Check if there's already a pending verification for this email and user_type
                $existing_verification = $objgen->get_Onerow(
                    "email_verifications",
                    "and email='$email' and user_type='$user_type' and is_verified=0"
                );

                if ($existing_verification) {
                    // Update existing verification record
                    error_log("Updating existing verification record for: $email");
                    $verification_update = $objgen->upd_Row(
                        "email_verifications",
                        "verification_code='$verification_code', expires_at='$expires_at', signup_data='$signup_data_json', created_at='$c_date'",
                        "verification_id=" . $existing_verification['verification_id']
                    );

                    if ($verification_update != "") {
                        $errors[] = "Failed to update verification record: " . $verification_update;
                        error_log("Verification update error: " . $verification_update);
                    }
                } else {
                    // Insert new verification record with signup data
                    error_log("Creating new verification record for: $email");
                    $verification_insert = $objgen->ins_Row(
                        'email_verifications',
                        'email, user_type, verification_code, signup_data, expires_at, created_at',
                        "'$email', '$user_type', '$verification_code', '$signup_data_json', '$expires_at', '$c_date'"
                    );

                    if ($verification_insert != "") {
                        $errors[] = "Failed to create verification record: " . $verification_insert;
                        error_log("Verification insert error: " . $verification_insert);
                    }
                }

                // Only send email if no errors
                if (empty($errors)) {
                    // Send verification email
                    try {
                        require_once 'PHPMailer/mailconfig.php';

                        $mail->clearAllRecipients();
                        $mail->addAddress($email, $first_name . ' ' . $last_name);
                        $mail->Subject = 'Verify Your Email - Manvue';

                        $email_message = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1BA3A3 0%, #0D7A7A 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Manvue!</h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hi ' . $first_name . ',</h2>
                            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                Thank you for signing up! To complete your registration and activate your account, please verify your email address.
                            </p>
                            <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                Your verification code is:
                            </p>

                            <!-- Verification Code Box -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 2px dashed #1BA3A3;">
                                        <span style="font-size: 36px; font-weight: bold; color: #1BA3A3; letter-spacing: 8px;">' . $verification_code . '</span>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #999999; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px; text-align: center;">
                                This code will expire in 15 minutes.
                            </p>

                            <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                <p style="color: #856404; margin: 0; font-size: 14px;">
                                    <strong>Security Note:</strong> If you did not create an account, please ignore this email.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:support@manvue.com" style="color: #1BA3A3; text-decoration: none;">support@manvue.com</a>
                            </p>
                            <p style="color: #999999; margin: 0; font-size: 12px;">
                                &copy; ' . date('Y') . ' Manvue. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>';

                        $mail->msgHTML($email_message);

                        if (!$mail->send()) {
                            error_log("Failed to send verification email: " . $mail->ErrorInfo);
                            $errors[] = "Failed to send verification email: " . $mail->ErrorInfo;
                        } else {
                            error_log("Verification email sent successfully to: " . $email);
                        }

                        if (empty($errors)) {
                            error_log("=== SIGNUP VERIFICATION EMAIL SENT ===");

                            // Success response - NO JWT token, NO user data, just confirmation
                            $response_arr = [
                                "data" => [
                                    "email" => $email,
                                    "user_type" => $user_type,
                                    "verification_required" => true
                                ],
                                "response_code" => 200,
                                "status" => "Success",
                                "message" => "Verification code sent successfully! Please check your email to verify your account.",
                                "success" => true,
                                "requires_verification" => true
                            ];

                            $rest->response($api->json($response_arr), 200);
                        }

                    } catch (Exception $e) {
                        error_log("Exception while sending email: " . $e->getMessage());
                        $errors[] = "Failed to send verification email: " . $e->getMessage();
                    }
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
