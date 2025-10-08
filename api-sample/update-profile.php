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
        error_log("=== UPDATE PROFILE REQUEST START ===");
        
        // Get request data
        $user_id = isset($rest->_request['user_id']) ? (int)$objgen->check_input($rest->_request['user_id']) : 0;
        $field_name = isset($rest->_request['field_name']) ? $objgen->check_input($rest->_request['field_name']) : '';
        $field_value = isset($rest->_request['field_value']) ? $objgen->check_input($rest->_request['field_value']) : '';
        
        error_log("User ID: " . $user_id);
        error_log("Field: " . $field_name);
        error_log("Value: " . $field_value);
        
        $errors = [];
        
        // Define critical fields that require admin approval
        $critical_fields = [
            'full_name',
            'first_name',
            'last_name',
            'email',
            'mobile_number',
            'education',
            'institution',
            'current_position',
            'years_of_experience',
            'area_of_interest'
        ];
        
        // Validate inputs
        if (empty($user_id)) {
            $errors[] = "User ID is required";
        }
        
        if (empty($field_name)) {
            $errors[] = "Field name is required";
        }
        
        if (empty($field_value)) {
            $errors[] = "Field value is required";
        }
        
        // Verify user exists
        if (empty($errors)) {
            $user_check = $objgen->get_Onerow("users", "and user_id=" . $user_id . " and status='active'");
            
            if (!$user_check) {
                $errors[] = "Invalid user or user account is not active";
            }
        }
        
        if (empty($errors)) {
            
            $is_critical = in_array($field_name, $critical_fields);
            
            if ($is_critical) {
                // Handle critical field - create change request
                error_log("Critical field detected - creating change request");
                
                // Get current value
                $current_value = '';
                switch ($field_name) {
                    case 'full_name':
                    case 'first_name':
                    case 'last_name':
                    case 'email':
                    case 'full_address':
                    case 'function':
                    case 'industry_nature':
                        $user_data = $objgen->get_Onerow("users", "and user_id=" . $user_id);
                        if ($field_name == 'full_name') {
                            $current_value = $user_data['first_name'] . ' ' . $user_data['last_name'];
                        } elseif ($field_name == 'mobile_number') {
                            $current_value = $user_data['phone'];
                        } else {
                            $current_value = $user_data[$field_name];
                        }
                        break;
                    case 'current_position':
                    case 'years_of_experience':
                    case 'area_of_interest':
                        $profile_data = $objgen->get_Onerow("user_profiles", "and user_id=" . $user_id);
                        if ($field_name == 'current_position') {
                            $current_value = $profile_data['current_job_title'];
                        } elseif ($field_name == 'years_of_experience') {
                            $current_value = $profile_data['experience_years'];
                        } else {
                            $current_value = $profile_data[$field_name];
                        }
                        break;
                    case 'education':
                    case 'institution':
                        $education_data = $objgen->get_Onerow("education", "and user_id=" . $user_id . " ORDER BY is_primary DESC LIMIT 1");
                        if ($education_data) {
                            $current_value = $field_name == 'education' ? $education_data['degree_name'] : $education_data['institution_name'];
                        }
                        break;
                }
                
                // Check if there's already a pending request for this field
                $existing_request = $objgen->get_Onerow("profile_change_requests", 
                    "and user_id=" . $user_id . " and field_name='" . $field_name . "' and request_status='pending'");
                
                if ($existing_request) {
                    // Update existing request
                    $update_result = $objgen->upd_Row(
                        "profile_change_requests",
                        "new_value='" . $field_value . "', submitted_at='" . $c_date . "'",
                        "request_id=" . $existing_request['request_id']
                    );
                    
                    if ($update_result != "") {
                        $errors[] = "Failed to update change request: " . $update_result;
                    }
                } else {
                    // Create new change request
                    $insert_result = $objgen->ins_Row(
                        "profile_change_requests",
                        "user_id, field_name, current_value, new_value, request_status, submitted_at",
                        "'" . $user_id . "', '" . $field_name . "', '" . $current_value . "', '" . $field_value . "', 'pending', '" . $c_date . "'"
                    );
                    
                    if ($insert_result != "") {
                        $errors[] = "Failed to create change request: " . $insert_result;
                    }
                }
                
                if (empty($errors)) {
                    error_log("=== UPDATE PROFILE - SUBMITTED FOR APPROVAL ===");
                    
                    $response_arr = [
                        "data" => [
                            'field_name' => $field_name,
                            'status' => 'pending_approval',
                            'message' => 'Your change has been submitted for admin approval'
                        ],
                        "response_code" => 200,
                        "status" => "Success",
                        "message" => "Change submitted for admin approval",
                        "success" => true,
                        "requires_approval" => true
                    ];
                    
                    $rest->response($api->json($response_arr), 200);
                }
                
            } else {
                // Handle non-critical field - update directly
                error_log("Non-critical field - updating directly");
                
                $update_result = "";
                
                switch ($field_name) {
                    case 'full_address':
                    case 'function':
                    case 'industry_nature':
                        $update_result = $objgen->upd_Row(
                            "users",
                            $field_name . "='" . $field_value . "', updated_at='" . $c_date . "'",
                            "user_id=" . $user_id
                        );
                        break;
                        
                    case 'location':
                        $update_result = $objgen->upd_Row(
                            "user_profiles",
                            "current_company='" . $field_value . "', updated_at='" . $c_date . "'",
                            "user_id=" . $user_id
                        );
                        break;
                        
                    case 'work_type':
                        // Normalize work_type value
                        $work_type_value = strtolower(str_replace('-', '_', $field_value));
                        $update_result = $objgen->upd_Row(
                            "user_profiles",
                            "work_type='" . $work_type_value . "', updated_at='" . $c_date . "'",
                            "user_id=" . $user_id
                        );
                        break;
                        
                    case 'skills':
                        // Handle skills update
                        $skills_array = array_map('trim', explode(',', $field_value));
                        
                        // Delete existing user skills
                        $objgen->del_Row("user_skills", "user_id=" . $user_id);
                        
                        // Add new skills
                        foreach ($skills_array as $skill_name) {
                            if (empty($skill_name)) continue;
                            
                            // Check if skill exists
                            $skill_exists = $objgen->get_Onerow("skills", "and skill_name='" . $skill_name . "'");
                            
                            if (!$skill_exists) {
                                // Create new skill
                                $objgen->ins_Row(
                                    "skills",
                                    "skill_name, created_at",
                                    "'" . $skill_name . "', '" . $c_date . "'"
                                );
                                $skill_id = $objgen->get_insetId();
                            } else {
                                $skill_id = $skill_exists['skill_id'];
                            }
                            
                            // Add user skill
                            $objgen->ins_Row(
                                "user_skills",
                                "user_id, skill_id, proficiency_level, added_at",
                                "'" . $user_id . "', '" . $skill_id . "', 'intermediate', '" . $c_date . "'"
                            );
                        }
                        break;
                        
                    default:
                        $errors[] = "Invalid field name for update";
                }
                
                if ($update_result != "") {
                    $errors[] = "Failed to update profile: " . $update_result;
                }
                
                if (empty($errors)) {
                    error_log("=== UPDATE PROFILE - IMMEDIATE UPDATE SUCCESS ===");
                    
                    $response_arr = [
                        "data" => [
                            'field_name' => $field_name,
                            'field_value' => $field_value,
                            'status' => 'updated'
                        ],
                        "response_code" => 200,
                        "status" => "Success",
                        "message" => "Profile updated successfully",
                        "success" => true,
                        "requires_approval" => false
                    ];
                    
                    $rest->response($api->json($response_arr), 200);
                }
            }
            
        }
        
        // If there are errors, return them
        if (!empty($errors)) {
            error_log("=== UPDATE PROFILE VALIDATION FAILED ===");
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
        error_log("=== UPDATE PROFILE FATAL ERROR ===");
        error_log("Exception: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());
        
        $response_arr = [
            "data" => null,
            "errors" => ["Internal server error: " . $e->getMessage()],
            "response_code" => 500,
            "status" => "Error",
            "message" => "Failed to update profile",
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