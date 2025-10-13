<?php
require_once "includes/includepath.php";
require_once 'PHPMailer/mailconfig.php';

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
        error_log("=== RESEND VERIFICATION REQUEST START (EMAIL-BASED LOOKUP) ===");
        error_log("POST data: " . json_encode($rest->_request));

        // Get request data
        $email = isset($rest->_request['email']) ? strtolower($objgen->check_input($rest->_request['email'])) : '';
        $user_type = isset($rest->_request['user_type']) ? $objgen->check_input($rest->_request['user_type']) : '';

        $errors = [];

        // Basic validation
        if (empty($email)) {
            $errors[] = "Email is required";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format";
        }

        if (empty($user_type) || !in_array($user_type, ['jobseeker', 'employer'])) {
            $errors[] = "Valid user type is required";
        }

        // If validation passed, resend verification code
        if (empty($errors)) {

            // Get pending verification record by email and user_type (not user_id)
            $verification = $objgen->get_Onerow(
                "email_verifications",
                "and email='$email' and user_type='$user_type' and is_verified=0"
            );

            if (!$verification || !isset($verification['verification_id'])) {
                $errors[] = "No pending verification found for this email. Please sign up again.";
                error_log("No pending verification found for email: $email");
            } else {
                // Get signup data to extract first name for email
                $signup_data_json = $verification['signup_data'];

                if (empty($signup_data_json)) {
                    $errors[] = "Verification data not found. Please sign up again.";
                    error_log("No signup data found for email: $email");
                } else {
                    $signup_data = json_decode($signup_data_json, true);

                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $errors[] = "Invalid verification data. Please sign up again.";
                        error_log("JSON decode error: " . json_last_error_msg());
                    } else {
                        $first_name = isset($signup_data['first_name']) ? $signup_data['first_name'] : 'User';
                        $last_name = isset($signup_data['last_name']) ? $signup_data['last_name'] : '';

                        // Generate new 6-digit verification code
                        $verification_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

                        // Set new expiration time (15 minutes from now)
                        $expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));

                        // Update verification record with new code and expiration
                        error_log("Updating verification code for: $email");
                        $update_verification = $objgen->upd_Row(
                            "email_verifications",
                            "verification_code='$verification_code', expires_at='$expires_at', created_at='$c_date'",
                            "verification_id=" . $verification['verification_id']
                        );

                        if ($update_verification != "") {
                            $errors[] = "Failed to update verification code: " . $update_verification;
                            error_log("Verification update error: " . $update_verification);
                        } else {
                            // Send verification email
                            try {
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
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Verify Your Email</h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hi ' . $first_name . ',</h2>
                            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                You requested a new verification code for your Manvue account.
                            </p>
                            <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                Your new verification code is:
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
                                    <strong>Security Note:</strong> If you did not request this code, please ignore this email.
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
                                $mail->send();

                                error_log("Verification email resent successfully to: " . $email);
                                error_log("=== RESEND VERIFICATION SUCCESS ===");

                                // Success response
                                $response_arr = [
                                    "data" => [
                                        "email" => $email,
                                        "user_type" => $user_type,
                                        "code_resent" => true
                                    ],
                                    "response_code" => 200,
                                    "status" => "Success",
                                    "message" => "Verification code sent successfully! Please check your email.",
                                    "success" => true
                                ];

                                $rest->response($api->json($response_arr), 200);

                            } catch (Exception $e) {
                                error_log("Failed to send verification email: " . $mail->ErrorInfo);
                                $errors[] = "Failed to send verification email. Please try again.";
                            }
                        }
                    }
                }
            }
        }

        // If there are errors, return them
        if (!empty($errors)) {
            error_log("=== RESEND VERIFICATION FAILED ===");
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
        error_log("=== RESEND VERIFICATION FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());

        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Failed to resend verification code",
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
