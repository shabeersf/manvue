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
        error_log("=== GET COMPANY REQUEST START ===");
        error_log("POST data: " . json_encode($rest->_request));

        // Get user_id and company_id from request
        $user_id = isset($rest->_request['userId']) ? (int)$rest->_request['userId'] : null;
        $company_id = isset($rest->_request['companyId']) ? (int)$rest->_request['companyId'] : null;

        error_log("Received user_id: $user_id, company_id: $company_id");

        $errors = [];

        // At least one ID is required
        if (!$user_id && !$company_id) {
            $errors[] = "User ID or Company ID is required";
        }

        if (empty($errors)) {

            // Build query based on available parameters
            $where_clause = "";
            if ($company_id) {
                $where_clause = "company_id=" . $company_id;
            } else if ($user_id) {
                $where_clause = "user_id=" . $user_id;
            }

            error_log("Query where clause: " . $where_clause);

            // Get company data
            $company_data = $objgen->get_Onerow("companies", "and " . $where_clause);

            if (!$company_data) {
                error_log("Company not found");
                $errors[] = "Company not found";
            } else {
                error_log("Company found: " . $company_data['company_id']);

                // Get user data for this company
                $user_data = $objgen->get_Onerow("users", "and user_id=" . $company_data['user_id']);

                if (!$user_data) {
                    error_log("User not found for company");
                    $errors[] = "User data not found";
                }
            }
        }

        // If validation passed, prepare response
        if (empty($errors)) {

            // Get job statistics
            $total_jobs_posted = $objgen->get_AllRowscnt(
                "jobs",
                "and company_id=" . $company_data['company_id']
            );

            $total_hires = $objgen->get_AllRowscnt(
                "applications",
                "and company_id=" . $company_data['company_id'] . " AND application_status='hired'"
            );

            $active_jobs = $objgen->get_AllRowscnt(
                "jobs",
                "and company_id=" . $company_data['company_id'] . " AND job_status='active'"
            );

            // Prepare response data
            $response_data = [
                // Basic Company Info
                'company_id' => $company_data['company_id'],
                'user_id' => $company_data['user_id'],
                'company_name' => $objgen->check_tag($company_data['company_name']),
                'company_logo' => $company_data['company_logo'] ? IMAGE_PATH . "medium/" . $company_data['company_logo'] : "",
                'company_website' => $objgen->check_tag($company_data['company_website']),
                'company_size' => $objgen->check_tag($company_data['company_size']),
                'industry' => $objgen->check_tag($company_data['industry']),
                'company_type' => $objgen->check_tag($company_data['company_type']),
                'founded_year' => $company_data['founded_year'] ? (int)$company_data['founded_year'] : null,

                // Company Details
                'company_description' => $objgen->check_tag($company_data['company_description']),
                'gst_number' => $objgen->check_tag($company_data['gst_number']),
                'gst_verified' => (bool)$company_data['gst_verified'],

                // Location
                'headquarters_address' => $objgen->check_tag($company_data['headquarters_address']),
                'location_city' => $objgen->check_tag($user_data['location_city']),
                'location_state' => $objgen->check_tag($user_data['location_state']),
                'headquarters_country' => $objgen->check_tag($company_data['headquarters_country']),
                'headquarters' => implode(', ', array_filter([
                    $objgen->check_tag($user_data['location_city']),
                    $objgen->check_tag($user_data['location_state']),
                    $objgen->check_tag($company_data['headquarters_country'])
                ], function($val) { return !empty($val); })),

                // Status
                'status' => $objgen->check_tag($company_data['status']),
                'created_at' => date('Y-m-d', strtotime($company_data['created_at'])),
                'updated_at' => date('Y-m-d H:i:s', strtotime($company_data['updated_at'])),

                // User/Contact Info from users table
                'email' => $objgen->check_tag($user_data['email']),
                'phone' => $objgen->check_tag($user_data['phone']),
                'first_name' => $objgen->check_tag($user_data['first_name']),
                'last_name' => $objgen->check_tag($user_data['last_name']),
                'location_city' => $objgen->check_tag($user_data['location_city']),
                'location_state' => $objgen->check_tag($user_data['location_state']),

                // Statistics
                'statistics' => [
                    'total_jobs_posted' => (int)$total_jobs_posted,
                    'total_hires' => (int)$total_hires,
                    'active_jobs' => (int)$active_jobs,
                ],
            ];

            error_log("=== GET COMPANY SUCCESS ===");

            // Success response
            $response_arr = [
                "data" => $response_data,
                "response_code" => 200,
                "status" => "Success",
                "message" => "Company data retrieved successfully",
                "success" => true
            ];

            $rest->response($api->json($response_arr), 200);

        } else {
            // Failed
            error_log("=== GET COMPANY FAILED ===");
            error_log("Errors: " . json_encode($errors));

            $response_arr = [
                "data" => null,
                "errors" => $errors,
                "response_code" => 404,
                "status" => "Not Found",
                "message" => implode(", ", $errors),
                "success" => false
            ];
            $rest->response($api->json($response_arr), 404);
        }

    } catch (Exception $e) {
        error_log("=== GET COMPANY FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());

        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Failed to retrieve company data",
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
