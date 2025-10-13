<?php
require_once 'includes/includepath.php';

// Initialize classes
$api = new api();
$rest = new rest();
$objgen = new general();

$authkey = true;

// Validate request method ( changed to POST to match your service )
$api->valide_method( 'POST' );

$c_date = date( 'Y-m-d H:i:s' );

if ( isset( $authkey ) && $authkey == true ) {

    error_reporting( E_ALL ^ ( E_NOTICE | E_WARNING | E_DEPRECATED ) );

    try {
        error_log( '=== HOME DATA REQUEST START ===' );

        // Get user_id from request
        $user_id = isset( $rest->_request[ 'user_id' ] ) ? ( int )$objgen->check_input( $rest->_request[ 'user_id' ] ) : 0;

        error_log( 'User ID: ' . $user_id );

        $errors = [];

        // Validate user_id
        if ( $user_id <= 0 ) {
            $errors[] = 'User ID is required';
        }

        // Verify user exists and is a job seeker
        if ( empty( $errors ) ) {
            $user_check = $objgen->get_Onerow( 'users', 'and user_id=' . ( int )$user_id . " and user_type='jobseeker'" );

            if ( !$user_check ) {
                $errors[] = 'Invalid user or user is not a job seeker';
            }
        }

        if ( empty( $errors ) ) {

            // Initialize response data
            $data = [
                'user_id' => $user_id,
                'first_name' => '',
                'last_name' => '',
                'email' => '',
                'profile_image' => '',
                'profile' => [],
                'statistics' => [],
                'job_recommendations' => [],
                'recent_activity' => []
            ];

            // 1. Get User Basic Information
            error_log( 'Fetching user basic info...' );
            $user_data = $objgen->get_Onerow( 'users', 'and user_id=' . ( int )$user_id );

            if ( $user_data ) {
                $data[ 'first_name' ] = $objgen->check_tag( $user_data[ 'first_name' ] );
                $data[ 'last_name' ] = $objgen->check_tag( $user_data[ 'last_name' ] );
                $data[ 'email' ] = $objgen->check_tag( $user_data[ 'email' ] );
                $data[ 'profile_image' ] = $user_data[ 'profile_image' ] ? IMAGE_PATH . 'medium/' . $user_data[ 'profile_image' ] : '';
            }

            // 2. Get User Profile Data
            error_log( 'Fetching user profile...' );
            $profile_data = $objgen->get_Onerow( 'user_profiles', 'and user_id=' . ( int )$user_id );

            if ( $profile_data ) {
                $data[ 'profile' ] = [
                    'current_job_title' => $profile_data[ 'current_job_title' ] ? $objgen->check_tag( $profile_data[ 'current_job_title' ] ) : '',
                    'current_company' => $profile_data[ 'current_company' ] ? $objgen->check_tag( $profile_data[ 'current_company' ] ) : '',
                    'experience_years' => ( int )$profile_data[ 'experience_years' ],
                    'experience_months' => ( int )$profile_data[ 'experience_months' ],
                    'availability_status' => $objgen->check_tag( $profile_data[ 'availability_status' ] ),
                    'profile_completeness' => ( int )$profile_data[ 'profile_completeness' ]
                ];
            }

            // 3. Calculate Statistics
            error_log( 'Calculating statistics...' );

            // Profile completion
            $profile_completion = $profile_data ? ( int )$profile_data[ 'profile_completeness' ] : 0;

            // Total applications
            $total_applications = $objgen->get_AllRowscnt( 'applications', 'and user_id=' . ( int )$user_id );

            // Applications by status
            $pending_applications = $objgen->get_AllRowscnt( 'applications', 'and user_id=' . ( int )$user_id . " and application_status='submitted'" );
            $shortlisted_applications = $objgen->get_AllRowscnt( 'applications', 'and user_id=' . ( int )$user_id . " and application_status='shortlisted'" );

            // Scheduled interviews
            $scheduled_interviews = $objgen->get_AllRowscnt( 'interviews', 'and jobseeker_id=' . ( int )$user_id . " and interview_status in ('scheduled', 'confirmed') and scheduled_date >= CURDATE()" );

            // Profile views ( from notifications )
            $profile_views = $objgen->get_AllRowscnt( 'notifications', 'and user_id=' . ( int )$user_id . " and notification_type='profile_viewed' and created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)" );

            $data[ 'statistics' ] = [
                'profile_completion' => $profile_completion,
                'total_applications' => ( int )$total_applications,
                'pending_applications' => ( int )$pending_applications,
                'shortlisted_applications' => ( int )$shortlisted_applications,
                'interview_scheduled' => ( int )$scheduled_interviews,
                'profile_views_week' => ( int )$profile_views
            ];

            // 4. Get Job Recommendations ( Jobs from companies that viewed profile or matched )
            error_log( 'Fetching job recommendations...' );

            // Get user's skills for matching
            $user_skills_sql = "SELECT GROUP_CONCAT(skill_id) as skill_ids FROM user_skills WHERE user_id=" . (int)$user_id;
            $skills_result = $objgen->get_AllRows_qry($user_skills_sql);
            $skill_ids = '';
            if ($skills_result && isset($skills_result[0]['skill_ids'])) {
                $skill_ids = $skills_result[0]['skill_ids'];
            }
            
            // Get job recommendations based on:
            // 1. Jobs where employer viewed profile
            // 2. Jobs matching user's skills
            // 3. Active jobs that user hasn't applied to
            $jobs_sql = "SELECT DISTINCT
                j.job_id,
                j.job_title,
                j.employment_type,
                j.work_mode,
                j.location_city,
                j.location_state,
                j.salary_min,
                j.salary_max,
                j.created_at,
                c.company_name,
                c.company_logo,
                c.industry,
                COUNT(DISTINCT js.skill_id) as matching_skills_count,
                (SELECT COUNT(*) FROM job_skills WHERE job_id = j.job_id) as total_skills_count,
                CASE
                    WHEN EXISTS (
                        SELECT 1 FROM notifications
                        WHERE user_id = " . (int)$user_id . "
                        AND notification_type = 'profile_viewed'
                        AND related_type = 'job'
                        AND related_id = j.job_id
                    ) THEN 1
                    ELSE 0
                END as employer_viewed
            FROM jobs j
            INNER JOIN companies c ON j.company_id = c.company_id
            LEFT JOIN job_skills js ON j.job_id = js.job_id AND js.skill_id IN (" . ($skill_ids ?: "0") . ")
            WHERE j.job_status = 'active'
            AND (j.application_deadline IS NULL OR j.application_deadline >= CURDATE())
            AND NOT EXISTS (
                SELECT 1 FROM applications
                WHERE job_id = j.job_id
                AND user_id = " . (int)$user_id . "
            )
            GROUP BY j.job_id
            ORDER BY employer_viewed DESC, matching_skills_count DESC, j.created_at DESC
            LIMIT 20";
            
            $recommended_jobs = $objgen->get_AllRows_qry($jobs_sql);
            
            $job_recommendations = [];
            if ($recommended_jobs) {
                foreach ($recommended_jobs as $job) {
                    // Calculate match percentage based on skills
                    $match_percentage = 0;
                    if ((int)$job['total_skills_count'] > 0) {
                        $match_percentage = round(((int)$job['matching_skills_count'] / (int)$job['total_skills_count']) * 100);
                    }
                    // Minimum 60% for display, cap at 95%
                    $match_percentage = max(60, min(95, $match_percentage));
                    
                    // Get job skills
                    $job_skills_sql = "SELECT s.skill_name
                        FROM job_skills js
                        INNER JOIN skills s ON js.skill_id = s.skill_id
                        WHERE js.job_id = " . (int)$job['job_id'] . "
                        ORDER BY js.is_required DESC
                        LIMIT 5";
                    $job_skills = $objgen->get_AllRows_qry($job_skills_sql);
                    
                    $skills_array = [];
                    if ($job_skills) {
                        foreach ($job_skills as $skill) {
                            $skills_array[] = $objgen->check_tag($skill['skill_name']);
                        }
                    }
                    
                    // Calculate posted time
                    $posted_timestamp = strtotime($job['created_at']);
                    $time_diff = time() - $posted_timestamp;
                    
                    if ($time_diff < 3600) {
                        $posted_time = floor($time_diff / 60) . " minutes ago";
                    } elseif ($time_diff < 86400) {
                        $hours = floor($time_diff / 3600);
                        $posted_time = $hours . " hour" . ($hours > 1 ? "s" : "") . " ago";
                    } elseif ($time_diff < 604800) {
                        $days = floor($time_diff / 86400);
                        $posted_time = $days . " day" . ($days > 1 ? "s" : "") . " ago";
                    } else {
                        $posted_time = date('M d, Y', $posted_timestamp);
                    }
                    
                    // Build location string
                    $location = '';
                    if ($job['location_city']) {
                        $location = $objgen->check_tag($job['location_city']);
                    }
                    if ($job['location_state']) {
                        $location .= ($location ? ', ' : '') . $objgen->check_tag($job['location_state']);
                    }
                    if ($job['work_mode']) {
                        $work_mode_display = ucfirst(str_replace('_', ' ', $job['work_mode']));
                        $location .= ($location ? ', ' : '') . $work_mode_display;
                    }
                    if (!$location) {
                        $location = 'Location not specified';
                    }
                    
                    // Format salary
                    $salary_range = 'Not disclosed';
                    if ($job['salary_min'] && $job['salary_max']) {
                        $min = $job['salary_min'] >= 100000 ? number_format($job['salary_min'] / 100000, 1) . 'L' : number_format($job['salary_min'] / 1000, 0) . 'K';
                        $max = $job['salary_max'] >= 100000 ? number_format($job['salary_max'] / 100000, 1) . 'L' : number_format($job['salary_max'] / 1000, 0) . 'K';
                        $salary_range = "₹" . $min . " - ₹" . $max;
                    } elseif ($job['salary_min']) {
                        $min = $job['salary_min'] >= 100000 ? number_format($job['salary_min'] / 100000, 1) . 'L' : number_format($job['salary_min'] / 1000, 0) . 'K';
                        $salary_range = "₹" . $min . "+";
                    }
                    
                    $job_recommendations[] = [
                        'job_id' => $job['job_id'],
                        'company_name' => $objgen->check_tag($job['company_name']),
                        'company_logo' => $job['company_logo'] ? IMAGE_PATH . "medium/" . $job['company_logo'] : "",
                        'position' => $objgen->check_tag($job['job_title']),
                        'location' => $location,
                        'match_percentage' => $match_percentage,
                        'skills' => $skills_array,
                        'posted_time' => $posted_time,
                        'employment_type' => $objgen->check_tag($job['employment_type']),
                        'salary_range' => $salary_range,
                        'employer_viewed' => (bool)$job['employer_viewed']
                    ];
                }
            }
            
            $data['job_recommendations'] = $job_recommendations;
            
            // 5. Get Recent Activity
            error_log("Fetching recent activity...");
            
            $activity_sql = "
                (SELECT
                    'application' as activity_type,
                    CONCAT('You applied for ', j.job_title, ' at ', c.company_name) as message,
                    a.created_at,
                    a.application_status as status
                FROM applications a
                INNER JOIN jobs j ON a.job_id = j.job_id
                INNER JOIN companies c ON j.company_id = c.company_id
                WHERE a.user_id = " . (int)$user_id . "
                AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                ORDER BY a.created_at DESC
                LIMIT 5)

                UNION ALL

                (SELECT
                    'interview' as activity_type,
                    CONCAT('Interview scheduled with ', c.company_name, ' for ', j.job_title) as message,
                    i.created_at,
                    i.interview_status as status
                FROM interviews i
                INNER JOIN jobs j ON i.job_id = j.job_id
                INNER JOIN companies c ON j.company_id = c.company_id
                WHERE i.jobseeker_id = " . (int)$user_id . "
                AND i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                ORDER BY i.created_at DESC
                LIMIT 5)

                UNION ALL

                (SELECT
                    'profile_view' as activity_type,
                    CONCAT(c.company_name, ' viewed your profile') as message,
                    n.created_at,
                    'viewed' as status
                FROM notifications n
                INNER JOIN users u ON CAST(SUBSTRING_INDEX(n.related_id, '_', 1) AS UNSIGNED) = u.user_id
                INNER JOIN companies c ON u.user_id = c.user_id
                WHERE n.user_id = " . (int)$user_id . "
                AND n.notification_type = 'profile_viewed'
                AND n.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                ORDER BY n.created_at DESC
                LIMIT 5)

                ORDER BY created_at DESC
                LIMIT 15
            ";
            
            $recent_activity_raw = $objgen->get_AllRows_qry($activity_sql);
            
            $recent_activity = [];
            if ($recent_activity_raw) {
                foreach ($recent_activity_raw as $activity) {
                    $recent_activity[] = [
                        'type' => $activity['activity_type'],
                        'message' => $objgen->check_tag($activity['message']),
                        'date' => $activity['created_at'],
                        'status' => $objgen->check_tag($activity['status'])
                    ];
                }
            }
            
            $data['recent_activity'] = $recent_activity;
            
            error_log("=== HOME DATA SUCCESS ===");
            
            // Success response
            $response_arr = [
                "data" => $data,
                "response_code" => 200,
                "status" => "Success",
                "message" => "Home data retrieved successfully",
                "success" => true
            ];
            
            $rest->response($api->json($response_arr), 200);
            
        } else {
            // Validation errors
            error_log("=== HOME DATA VALIDATION FAILED ===");
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
        error_log("=== HOME DATA FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());
        
        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Failed to retrieve home data",
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
        $rest->response( $api->json( $response_arr ), 401 );
    }

    ?>