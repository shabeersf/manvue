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
        error_log("=== POST JOB REQUEST START ===");
        error_log("POST data: " . json_encode($rest->_request));

        // Get user_id and company_id from request (no JWT needed for internal APIs)
        $user_id = isset($rest->_request['userId']) ? (int)$rest->_request['userId'] : null;
        $company_id = isset($rest->_request['companyId']) ? (int)$rest->_request['companyId'] : null;

        error_log("Received user_id: $user_id, company_id: $company_id");

        if (!$user_id || !$company_id) {
            error_log("Missing user_id or company_id in request");
            $response_arr = [
                "data" => null,
                "errors" => ["User ID and Company ID are required"],
                "response_code" => 400,
                "status" => "Bad Request",
                "message" => "User ID and Company ID are required",
                "success" => false
            ];
            $rest->response($api->json($response_arr), 400);
            exit;
        }

        // Get job data from request
        $job_title = isset($rest->_request['jobTitle']) ? trim($objgen->check_input($rest->_request['jobTitle'])) : '';
        $department = isset($rest->_request['department']) ? trim($objgen->check_input($rest->_request['department'])) : '';
        $location_city = isset($rest->_request['locationCity']) ? trim($objgen->check_input($rest->_request['locationCity'])) : '';
        $location_state = isset($rest->_request['locationState']) ? trim($objgen->check_input($rest->_request['locationState'])) : '';
        $employment_type = isset($rest->_request['employmentType']) ? trim($objgen->check_input($rest->_request['employmentType'])) : '';
        $work_mode = isset($rest->_request['workMode']) ? trim($objgen->check_input($rest->_request['workMode'])) : '';
        $experience_min = isset($rest->_request['experienceMin']) ? (int)$rest->_request['experienceMin'] : 0;
        $experience_max = isset($rest->_request['experienceMax']) ? (int)$rest->_request['experienceMax'] : null;
        $salary_min = isset($rest->_request['salaryMin']) ? floatval($rest->_request['salaryMin']) : null;
        $salary_max = isset($rest->_request['salaryMax']) ? floatval($rest->_request['salaryMax']) : null;
        $salary_type = isset($rest->_request['salaryType']) ? trim($objgen->check_input($rest->_request['salaryType'])) : 'annual';
        $job_description = isset($rest->_request['jobDescription']) ? trim($objgen->check_input($rest->_request['jobDescription'])) : '';
        $job_responsibilities = isset($rest->_request['jobResponsibilities']) ? trim($objgen->check_input($rest->_request['jobResponsibilities'])) : '';
        $job_requirements = isset($rest->_request['jobRequirements']) ? trim($objgen->check_input($rest->_request['jobRequirements'])) : '';
        $benefits = isset($rest->_request['benefits']) ? trim($objgen->check_input($rest->_request['benefits'])) : '';
        $education_requirement = isset($rest->_request['educationRequirement']) ? trim($objgen->check_input($rest->_request['educationRequirement'])) : '';
        $positions_available = isset($rest->_request['positionsAvailable']) ? (int)$rest->_request['positionsAvailable'] : 1;
        $priority_level = isset($rest->_request['priorityLevel']) ? trim($objgen->check_input($rest->_request['priorityLevel'])) : 'medium';
        $application_deadline = isset($rest->_request['applicationDeadline']) ? trim($rest->_request['applicationDeadline']) : null;
        $job_category = isset($rest->_request['jobCategory']) ? trim($objgen->check_input($rest->_request['jobCategory'])) : '';
        $job_status = isset($rest->_request['jobStatus']) ? trim($objgen->check_input($rest->_request['jobStatus'])) : 'active';
        $skills = isset($rest->_request['skills']) ? $rest->_request['skills'] : [];

        error_log("Job: $job_title, Company ID: $company_id, Status: $job_status");

        $errors = [];

        // Validation - only for active jobs (not drafts)
        if ($job_status !== 'draft') {
            if (empty($job_title)) {
                $errors[] = "Job title is required";
            }

            if (empty($location_city)) {
                $errors[] = "City is required";
            }

            if (empty($employment_type)) {
                $errors[] = "Employment type is required";
            }

            if (empty($work_mode)) {
                $errors[] = "Work mode is required";
            }

            if (empty($job_description)) {
                $errors[] = "Job description is required";
            }

            if (empty($job_responsibilities)) {
                $errors[] = "Job responsibilities are required";
            }

            if (empty($job_requirements)) {
                $errors[] = "Job requirements are required";
            }

            if (empty($skills) || !is_array($skills) || count($skills) === 0) {
                $errors[] = "At least one skill is required";
            }

            // Salary validation
            if ($salary_min && $salary_max && $salary_min >= $salary_max) {
                $errors[] = "Maximum salary should be higher than minimum";
            }

            // Experience validation
            if ($experience_max && $experience_min > $experience_max) {
                $errors[] = "Maximum experience should be higher than minimum";
            }

            if ($positions_available < 1) {
                $errors[] = "At least 1 position is required";
            }
        }

        // Verify company exists and is active
        if (empty($errors)) {
            $company = $objgen->get_Onerow("companies", "and company_id=" . $company_id);
            if (!$company) {
                $errors[] = "Company not found";
            } elseif ($company['status'] !== 'active') {
                $errors[] = "Your company account is currently under verification. You will be able to post jobs once the verification process is complete.";

            }
        }

        // If validation passed, create job
        if (empty($errors)) {

            error_log("Creating job record...");

            // Build job insert query
            $job_columns = "company_id, posted_by, job_title, employment_type, work_mode, experience_min, job_description, job_responsibilities, job_requirements, job_status, priority_level, positions_available, salary_type, created_at, updated_at";
            $job_values = "'" . $company_id . "', '" . $user_id . "', '" . $job_title . "', '" . $employment_type . "', '" . $work_mode . "', " . $experience_min . ", '" . $job_description . "', '" . $job_responsibilities . "', '" . $job_requirements . "', '" . $job_status . "', '" . $priority_level . "', " . $positions_available . ", '" . $salary_type . "', '" . $c_date . "', '" . $c_date . "'";

            // Add optional fields
            if ($department) {
                $job_columns .= ", department";
                $job_values .= ", '" . $department . "'";
            }

            if ($location_city) {
                $job_columns .= ", location_city";
                $job_values .= ", '" . $location_city . "'";
            }

            if ($location_state) {
                $job_columns .= ", location_state";
                $job_values .= ", '" . $location_state . "'";
            }

            if ($experience_max) {
                $job_columns .= ", experience_max";
                $job_values .= ", " . $experience_max;
            }

            if ($salary_min) {
                $job_columns .= ", salary_min";
                $job_values .= ", " . $salary_min;
            }

            if ($salary_max) {
                $job_columns .= ", salary_max";
                $job_values .= ", " . $salary_max;
            }

            if ($benefits) {
                $job_columns .= ", benefits";
                $job_values .= ", '" . $benefits . "'";
            }

            if ($education_requirement) {
                $job_columns .= ", education_requirement";
                $job_values .= ", '" . $education_requirement . "'";
            }

            if ($job_category) {
                $job_columns .= ", job_category";
                $job_values .= ", '" . $job_category . "'";
            }

            if ($application_deadline) {
                // Validate date format
                if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $application_deadline)) {
                    $job_columns .= ", application_deadline";
                    $job_values .= ", '" . $application_deadline . "'";
                }
            }

            // Insert job
            $job_insert = $objgen->ins_Row("jobs", $job_columns, $job_values);

            if ($job_insert != "") {
                $errors[] = "Failed to create job: " . $job_insert;
                error_log("Job insert failed: " . $job_insert);
            } else {
                $job_id = $objgen->get_insetId();
                error_log("Job created with ID: " . $job_id);

                // Insert job skills
                if (!empty($skills) && is_array($skills)) {
                    error_log("Inserting " . count($skills) . " skills for job...");

                    foreach ($skills as $skill) {
                        if (isset($skill['skill_id'])) {
                            $skill_id = (int)$skill['skill_id'];
                            $is_required = isset($skill['is_required']) ? (int)$skill['is_required'] : 1;
                            $proficiency_required = isset($skill['proficiency_required']) ? trim($skill['proficiency_required']) : 'intermediate';
                            $priority = isset($skill['priority']) ? trim($skill['priority']) : 'must_have';

                            $skill_insert = $objgen->ins_Row(
                                "job_skills",
                                "job_id, skill_id, is_required, proficiency_required, priority, created_at",
                                "'" . $job_id . "', '" . $skill_id . "', " . $is_required . ", '" . $proficiency_required . "', '" . $priority . "', '" . $c_date . "'"
                            );

                            if ($skill_insert != "") {
                                error_log("Warning: Failed to insert skill $skill_id: " . $skill_insert);
                            }
                        }
                    }
                }

                error_log("=== JOB POST SUCCESS ===");

                // Success response
                $response_arr = [
                    "data" => [
                        "job_id" => $job_id,
                        "job_title" => $job_title,
                        "company_id" => $company_id,
                        "job_status" => $job_status,
                        "employment_type" => $employment_type,
                        "work_mode" => $work_mode,
                        "location_city" => $location_city,
                        "skills_count" => count($skills),
                        "created_at" => date('d-m-Y H:i:s', strtotime($c_date))
                    ],
                    "response_code" => 201,
                    "status" => "Success",
                    "message" => $job_status === 'draft' ? "Job saved as draft successfully" : "Job posted successfully",
                    "success" => true
                ];

                $rest->response($api->json($response_arr), 201);
            }
        }

        // If there are errors, return them
        if (!empty($errors)) {
            error_log("=== JOB POST VALIDATION FAILED ===");
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
        error_log("=== JOB POST FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());

        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Failed to post job due to server error",
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
