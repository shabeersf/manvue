<?php
require_once "includes/includepath.php";
require_once 'PHPMailer/mailconfig.php';

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
        error_log("=== EMPLOYER SIGNUP REQUEST START (VERIFICATION-FIRST FLOW) ===");
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
        $email = isset($rest->_request['email']) ? strtolower(trim($objgen->check_input($rest->_request['email']))) : '';
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
            $errors[] = "Invalid email format";
        }

        if (empty($password)) {
            $errors[] = "Password is required";
        } elseif (strlen($password) < 6) {
            $errors[] = "Password must be at least 6 characters";
        }

        // Check if email already exists as employer - allow dual accounts
        if (!empty($email) && empty($errors)) {
            $email_check = $objgen->chk_Ext("users", "email='" . $email . "' and user_type='employer'");
            if ($email_check > 0) {
                $errors[] = "Email already registered as employer";
            }
        }

        // Check if mobile already exists as employer - allow dual accounts
        if (!empty($mobile_number) && empty($errors)) {
            $mobile_check = $objgen->chk_Ext("users", "phone='" . $mobile_number . "' and user_type='employer'");
            if ($mobile_check > 0) {
                $errors[] = "Mobile number already registered as employer";
            }
        }

        // Check if GST number already exists
        if (!empty($gst_number) && empty($errors)) {
            $gst_check = $objgen->chk_Ext("companies", "gst_number='" . $gst_number . "'");
            if ($gst_check > 0) {
                $errors[] = "GST number already registered";
            }
        }

        // If validation passed, proceed with storing signup data temporarily
        if (empty($errors)) {

            // Prepare signup data to store temporarily in email_verifications table
            $signup_data = [
                'user_type' => 'employer',
                'first_name' => $first_name,
                'last_name' => $last_name,
                'email' => $email,
                'phone' => $mobile_number,
                'password' => $password, // Will be encrypted when creating user
                'gender' => $gender,
                'location_city' => $city,
                'location_state' => $state,
                'employer_data' => [
                    'company_name' => $company_name,
                    'full_address' => $full_address,
                    'city' => $city,
                    'state' => $state,
                    'gst_number' => $gst_number,
                    'industry' => $industry,
                    'company_website' => $company_website,
                    'company_size' => $company_size,
                    'company_type' => $company_type,
                    'founded_year' => $founded_year,
                    'company_description' => $company_description
                ]
            ];

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
                "and email='$email' and user_type='employer' and is_verified=0"
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
                    "'$email', 'employer', '$verification_code', '$signup_data_json', '$expires_at', '$c_date'"
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
                    $mail->Subject = 'Verify Your Email - Manvue Employer Registration';

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
                        <td style="background: linear-gradient(135deg, #1E4A72 0%, #0D2945 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Manvue!</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Employer Registration</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hi ' . $first_name . ',</h2>
                            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                Thank you for registering <strong>' . $company_name . '</strong> on Manvue! To complete your registration and activate your employer account, please verify your email address.
                            </p>
                            <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                Your verification code is:
                            </p>

                            <!-- Verification Code Box -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 2px dashed #1E4A72;">
                                        <span style="font-size: 36px; font-weight: bold; color: #1E4A72; letter-spacing: 8px;">' . $verification_code . '</span>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #999999; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px; text-align: center;">
                                This code will expire in 15 minutes.
                            </p>

                            <div style="margin: 30px 0; padding: 20px; background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
                                <p style="color: #1565c0; margin: 0; font-size: 14px;">
                                    <strong>Next Steps:</strong> After verification, your company will be reviewed by our admin team for approval. You\'ll receive a notification once approved.
                                </p>
                            </div>

                            <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                <p style="color: #856404; margin: 0; font-size: 14px;">
                                    <strong>Security Note:</strong> If you did not create an employer account, please ignore this email.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:support@manvue.com" style="color: #1E4A72; text-decoration: none;">support@manvue.com</a>
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
                        error_log("=== EMPLOYER SIGNUP VERIFICATION EMAIL SENT ===");

                        // Success response - NO user data, NO JWT token, just confirmation
                        $response_arr = [
                            "data" => [
                                "email" => $email,
                                "user_type" => "employer",
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

        // If there are errors, return them
        if (!empty($errors)) {
            error_log("=== EMPLOYER SIGNUP FAILED ===");
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

$api->processApi();
?>
