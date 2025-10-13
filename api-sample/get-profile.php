<?php
require_once 'includes/includepath.php';

// Initialize classes
$api = new api();
$rest = new rest();
$objgen = new general();

$authkey = true;

// Validate request method
$api->valide_method( 'POST' );

$c_date = date( 'Y-m-d H:i:s' );

if ( isset( $authkey ) && $authkey == true ) {

    error_reporting( E_ALL ^ ( E_NOTICE | E_WARNING | E_DEPRECATED ) );

    try {
        error_log( '=== GET PROFILE REQUEST START ===' );

        // Get user_id from request
        $user_id = isset( $rest->_request[ 'user_id' ] ) ? ( int )$objgen->check_input( $rest->_request[ 'user_id' ] ) : 0;

        error_log( 'User ID: ' . $user_id );

        $errors = [];

        // Validate user_id
        if ( $user_id <= 0 ) {
            $errors[] = 'User ID is required';
        }

        // Verify user exists
        if ( empty( $errors ) ) {
            $user_check = $objgen->get_Onerow( 'users', 'and user_id=' . $user_id  );

            if ( !$user_check ) {
                $errors[] = 'Invalid user or user account is not active';
            }
        }

        if ( empty( $errors ) ) {

            error_log( 'Fetching complete profile data...' );

            // Get user basic data
            $user_data = $objgen->get_Onerow( 'users', 'and user_id=' . $user_id );

            // Get user profile data
            $profile_data = $objgen->get_Onerow( 'user_profiles', 'and user_id=' . $user_id );

            // Get primary education
            $education_data = $objgen->get_Onerow( 'education', 'and user_id=' . $user_id . ' ORDER BY is_primary DESC, education_id DESC LIMIT 1' );

            // Get user skills
            $skills_sql = "SELECT s.skill_name 
                FROM user_skills us 
                INNER JOIN skills s ON us.skill_id = s.skill_id 
                WHERE us.user_id = " . $user_id . " 
                ORDER BY us.added_at DESC";
            $skills_data = $objgen->get_AllRows_qry( $skills_sql );

            $skills_array = [];
            if ( $skills_data ) {
                foreach ( $skills_data as $skill ) {
                    $skills_array[] = $objgen->check_tag( $skill[ 'skill_name' ] );
                }
            }

            // Get pending change requests
            $pending_changes_sql = "SELECT 
                    field_name,
                    new_value,
                    submitted_at,
                    request_status
                FROM profile_change_requests 
                WHERE user_id = " . $user_id . " 
                AND request_status = 'pending'
                ORDER BY submitted_at DESC";
            $pending_changes_data = $objgen->get_AllRows_qry( $pending_changes_sql );

            $pending_changes = [];
            if ( $pending_changes_data ) {
                foreach ( $pending_changes_data as $change ) {
                    $pending_changes[ $change[ 'field_name' ] ] = [
                        'value' => $objgen->check_tag( $change[ 'new_value' ] ),
                        'submitted_at' => date( 'Y-m-d', strtotime( $change[ 'submitted_at' ] ) ),
                        'status' => $change[ 'request_status' ]
                    ];
                }
            }

            // Get user preferences for subscription info
            $preferences = $objgen->get_Onerow( 'user_preferences', 'and user_id=' . $user_id );

            // Build complete profile response
            $profile_response = [
                // Basic Info
                'user_id' => $user_data[ 'user_id' ],
                'full_name' => $objgen->check_tag( $user_data[ 'first_name' ] . ' ' . $user_data[ 'last_name' ] ),
                'first_name' => $objgen->check_tag( $user_data[ 'first_name' ] ),
                'last_name' => $objgen->check_tag( $user_data[ 'last_name' ] ),
                'email' => $objgen->check_tag( $user_data[ 'email' ] ),
                'mobile_number' => $user_data[ 'phone' ] ? $objgen->check_tag( $user_data[ 'phone' ] ) : '',
                'full_address' => $user_data[ 'full_address' ] ? $objgen->check_tag( $user_data[ 'full_address' ] ) : '',
                'profile_image' => $user_data[ 'profile_image' ] ? IMAGE_PATH . 'medium/' . $user_data[ 'profile_image' ] : '',

                // Professional Info
                'current_position' => $profile_data[ 'current_job_title' ] ? $objgen->check_tag( $profile_data[ 'current_job_title' ] ) : '',
                'function' => $user_data[ 'function' ] ? $objgen->check_tag( $user_data[ 'function' ] ) : '',
                'years_of_experience' => $profile_data[ 'experience_years' ] ? ( string )$profile_data[ 'experience_years' ] : '0',
                'education' => $education_data[ 'degree_name' ] ? $objgen->check_tag( $education_data[ 'degree_name' ] ) : '',
                'institution' => $education_data[ 'institution_name' ] ? $objgen->check_tag( $education_data[ 'institution_name' ] ) : '',
                'location' => $profile_data[ 'current_company' ] ? $objgen->check_tag( $profile_data[ 'current_company' ] ) : '',
                'industry_nature' => $user_data[ 'industry_nature' ] ? $objgen->check_tag( $user_data[ 'industry_nature' ] ) : '',
                'work_type' => $profile_data[ 'work_type' ] ? ucfirst( str_replace( '_', '-', $profile_data[ 'work_type' ] ) ) : 'Full-time',
                'area_of_interest' => $profile_data[ 'area_of_interest' ] ? $objgen->check_tag( $profile_data[ 'area_of_interest' ] ) : '',

                // Skills
                'skills' => $skills_array,

                // Profile Stats
                'profile_completion' => ( int )$profile_data[ 'profile_completeness' ],
                'join_date' => date( 'Y-m-d', strtotime( $user_data[ 'created_at' ] ) ),
                'last_active' => date( 'Y-m-d', strtotime( $user_data[ 'updated_at' ] ) ),
                'subscription_status' => 'Active', // You can add subscription logic here
                'subscription_expiry' => date( 'Y-m-d', strtotime( '+6 months' ) ), // Example

                // Account Status
                'account_status' => ucfirst( $user_data[ 'status' ] ),
                'is_verified' => ( bool )$user_data[ 'email_verified' ],

                // Pending Changes
                'pending_changes' => $pending_changes
            ];

            error_log( '=== GET PROFILE SUCCESS ===' );

            // Success response
            $response_arr = [
                'data' => $profile_response,
                'response_code' => 200,
                'status' => 'Success',
                'message' => 'Profile data retrieved successfully',
                'success' => true
            ];

            $rest->response( $api->json( $response_arr ), 200 );

        } else {
            // Validation errors
            error_log( '=== GET PROFILE VALIDATION FAILED ===' );
            error_log( 'Errors: ' . json_encode( $errors ) );

            $response_arr = [
                'data' => null,
                'errors' => $errors,
                'response_code' => 422,
                'status' => 'Validation Error',
                'message' => implode( ', ', $errors ),
                'success' => false
            ];
            $rest->response( $api->json( $response_arr ), 422 );
        }

    } catch ( Exception $e ) {
        error_log( '=== GET PROFILE FATAL ERROR ===' );
        error_log( 'Exception: ' . $e->getMessage() );
        error_log( 'Trace: ' . $e->getTraceAsString() );

        $response_arr = [
            'data' => null,
            'errors' => [ 'Internal server error: ' . $e->getMessage() ],
            'response_code' => 500,
            'status' => 'Error',
            'message' => 'Failed to retrieve profile data',
            'success' => false
        ];
        $rest->response( $api->json( $response_arr ), 500 );
    }

} else {
    // Unauthorized
    $response_arr = [
        'data' => null,
        'errors' => [ 'Unauthorized access' ],
        'response_code' => 401,
        'status' => 'Error',
        'message' => 'Unauthorized access',
        'success' => false
    ];
    $rest->response( $api->json( $response_arr ), 401 );
}

$api->processApi();
?>