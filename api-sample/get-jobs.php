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
        error_log("=== GET JOBS REQUEST START ===");
        error_log("POST data: " . json_encode($rest->_request));

        // Get parameters from request
        $company_id = isset($rest->_request['companyId']) ? (int)$rest->_request['companyId'] : null;
        $user_id = isset($rest->_request['userId']) ? (int)$rest->_request['userId'] : null;
        $status_filter = isset($rest->_request['status']) ? trim($objgen->check_input($rest->_request['status'])) : 'all';
        $search_query = isset($rest->_request['searchQuery']) ? trim($objgen->check_input($rest->_request['searchQuery'])) : '';
        $limit = isset($rest->_request['limit']) ? (int)$rest->_request['limit'] : 100;
        $offset = isset($rest->_request['offset']) ? (int)$rest->_request['offset'] : 0;

        error_log("Company ID: $company_id, User ID: $user_id, Status: $status_filter, Search: $search_query");

        $errors = [];

        // Validation - need at least company_id or user_id
        if (!$company_id && !$user_id) {
            $errors[] = "Company ID or User ID is required";
        }

        if (empty($errors)) {

            // If only user_id provided, get company_id
            if ($user_id && !$company_id) {
                $company_data = $objgen->get_Onerow("companies", "and user_id=" . $user_id);
                if ($company_data) {
                    $company_id = $company_data['company_id'];
                } else {
                    $errors[] = "Company not found for this user";
                }
            }
        }

        if (empty($errors)) {

            // Build WHERE clause for SQL query
            $where_conditions = ["company_id=" . $company_id];

            // Add status filter
            if ($status_filter !== 'all') {
                $where_conditions[] = "job_status='" . $status_filter . "'";
            }

            // Add search filter if provided
            if (!empty($search_query)) {
                $search_condition = "(job_title LIKE '%" . $search_query . "%' OR " .
                                  "job_description LIKE '%" . $search_query . "%' OR " .
                                  "location_city LIKE '%" . $search_query . "%' OR " .
                                  "location_state LIKE '%" . $search_query . "%' OR " .
                                  "department LIKE '%" . $search_query . "%')";
                $where_conditions[] = $search_condition;
            }

            $where_clause = implode(" AND ", $where_conditions);

            error_log("WHERE clause: " . $where_clause);

            // Get total count
            $total_jobs_sql = "SELECT COUNT(*) as total FROM jobs WHERE " . $where_clause;
            $total_result = $objgen->get_AllRows_qry($total_jobs_sql);
            $total_jobs = $total_result ? (int)$total_result[0]['total'] : 0;

            // Get jobs with pagination
            $jobs_sql = "SELECT * FROM jobs WHERE " . $where_clause . " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
            error_log("Jobs SQL: " . $jobs_sql);

            $jobs_data = $objgen->get_AllRows_qry($jobs_sql);

            $jobs_list = [];

            if ($jobs_data) {
                foreach ($jobs_data as $job) {
                    // Get job skills
                    $job_skills_sql = "
                        SELECT s.skill_id, s.skill_name, js.is_required, js.proficiency_required, js.priority
                        FROM job_skills js
                        INNER JOIN skills s ON js.skill_id = s.skill_id
                        WHERE js.job_id = " . $job['job_id'] . "
                        ORDER BY js.is_required DESC, js.priority ASC";

                    $job_skills = $objgen->get_AllRows_qry($job_skills_sql);

                    $skills_array = [];
                    if ($job_skills) {
                        foreach ($job_skills as $skill) {
                            $skills_array[] = [
                                'skill_id' => (int)$skill['skill_id'],
                                'skill_name' => $objgen->check_tag($skill['skill_name']),
                                'is_required' => (bool)$skill['is_required'],
                                'proficiency_required' => $objgen->check_tag($skill['proficiency_required']),
                                'priority' => $objgen->check_tag($skill['priority']),
                            ];
                        }
                    }

                    // Get application counts
                    $applications_sql = "
                        SELECT
                            COUNT(*) as total,
                            SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_count
                        FROM applications
                        WHERE job_id = " . $job['job_id'];

                    $applications_result = $objgen->get_AllRows_qry($applications_sql);

                    $total_applications = $applications_result ? (int)$applications_result[0]['total'] : 0;
                    $new_applications = $applications_result ? (int)$applications_result[0]['new_count'] : 0;

                    // Calculate days until expiry
                    $today = new DateTime();
                    $expiry_date = new DateTime($job['application_deadline']);
                    $days_until_expiry = $today->diff($expiry_date)->days;
                    $is_expired = $today > $expiry_date;

                    // Determine if urgent (expires in 7 days or less and still active)
                    $is_urgent = (!$is_expired && $days_until_expiry <= 7 && $job['job_status'] === 'active');

                    // Determine priority/urgency level
                    $urgency = 'low';
                    if ($is_urgent || $job['priority_level'] === 'urgent') {
                        $urgency = 'high';
                    } else if ($days_until_expiry <= 14 || $job['priority_level'] === 'high') {
                        $urgency = 'medium';
                    }

                    // Format salary
                    $salary_display = '';
                    if ($job['salary_min'] && $job['salary_max']) {
                        $salary_display = '₹' . number_format($job['salary_min'] / 100000, 1) . 'L - ₹' .
                                        number_format($job['salary_max'] / 100000, 1) . 'L';
                    } else if ($job['salary_min']) {
                        $salary_display = '₹' . number_format($job['salary_min'] / 100000, 1) . 'L+';
                    }

                    // Format location
                    $location_display = '';
                    if ($job['location_city']) {
                        $location_display = $objgen->check_tag($job['location_city']);
                        if ($job['location_state']) {
                            $location_display .= ', ' . $objgen->check_tag($job['location_state']);
                        }
                        if ($job['work_mode']) {
                            $location_display .= ', ' . ucfirst($objgen->check_tag($job['work_mode']));
                        }
                    } else {
                        $location_display = $job['work_mode'] ? ucfirst($objgen->check_tag($job['work_mode'])) : 'Not specified';
                    }

                    // Format experience
                    $experience_display = '';
                    if ($job['experience_min'] && $job['experience_max']) {
                        $experience_display = $job['experience_min'] . '-' . $job['experience_max'] . ' years';
                    } else if ($job['experience_min']) {
                        $experience_display = $job['experience_min'] . '+ years';
                    } else {
                        $experience_display = 'Not specified';
                    }

                    // Format dates
                    $posted_date = date('M d, Y', strtotime($job['created_at']));
                    $expiry_date_formatted = date('M d, Y', strtotime($job['application_deadline']));

                    // Build job object
                    $jobs_list[] = [
                        'id' => (int)$job['job_id'],
                        'title' => $objgen->check_tag($job['job_title']),
                        'location' => $location_display,
                        'employmentType' => ucfirst($objgen->check_tag($job['employment_type'])),
                        'experience' => $experience_display,
                        'salary' => $salary_display,
                        'postedDate' => $posted_date,
                        'expiryDate' => $expiry_date_formatted,
                        'status' => $is_expired ? 'expired' : $objgen->check_tag($job['job_status']),
                        'applicationsCount' => (int)$total_applications,
                        'viewsCount' => (int)$job['view_count'],
                        'urgency' => $urgency,
                        'skills' => array_column($skills_array, 'skill_name'),
                        'description' => $objgen->check_tag($job['job_description']),
                        'isUrgent' => $is_urgent,
                        'newApplications' => (int)$new_applications,
                        'department' => $objgen->check_tag($job['department']),
                        'workMode' => $objgen->check_tag($job['work_mode']),
                        'positionsAvailable' => (int)$job['positions_available'],
                        'isFeatured' => (bool)$job['is_featured'],
                    ];
                }
            }

            // Get statistics for filter counts
            $stats_sql = "
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN job_status = 'active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN job_status = 'paused' THEN 1 ELSE 0 END) as paused,
                    SUM(CASE WHEN job_status = 'draft' THEN 1 ELSE 0 END) as draft,
                    SUM(CASE WHEN job_status = 'closed' THEN 1 ELSE 0 END) as closed,
                    SUM(CASE WHEN application_deadline < NOW() AND job_status = 'active' THEN 1 ELSE 0 END) as expired
                FROM jobs
                WHERE company_id = " . $company_id;

            $stats_result = $objgen->get_AllRows_qry($stats_sql);

            $stats = [
                'total' => $stats_result ? (int)$stats_result[0]['total'] : 0,
                'active' => $stats_result ? (int)$stats_result[0]['active'] : 0,
                'paused' => $stats_result ? (int)$stats_result[0]['paused'] : 0,
                'draft' => $stats_result ? (int)$stats_result[0]['draft'] : 0,
                'closed' => $stats_result ? (int)$stats_result[0]['closed'] : 0,
                'expired' => $stats_result ? (int)$stats_result[0]['expired'] : 0,
            ];

            error_log("=== GET JOBS SUCCESS ===");
            error_log("Total jobs found: " . count($jobs_list));

            // Success response
            $response_arr = [
                "data" => [
                    'jobs' => $jobs_list,
                    'stats' => $stats,
                    'pagination' => [
                        'total' => (int)$total_jobs,
                        'limit' => (int)$limit,
                        'offset' => (int)$offset,
                        'hasMore' => ($offset + $limit) < $total_jobs,
                    ]
                ],
                "response_code" => 200,
                "status" => "Success",
                "message" => "Jobs retrieved successfully",
                "success" => true
            ];

            $rest->response($api->json($response_arr), 200);

        } else {
            // Validation errors
            error_log("=== GET JOBS VALIDATION FAILED ===");
            error_log("Errors: " . json_encode($errors));

            $response_arr = [
                "data" => null,
                "errors" => $errors,
                "response_code" => 400,
                "status" => "Bad Request",
                "message" => implode(", ", $errors),
                "success" => false
            ];
            $rest->response($api->json($response_arr), 400);
        }

    } catch (Exception $e) {
        error_log("=== GET JOBS FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());

        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Failed to retrieve jobs",
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
