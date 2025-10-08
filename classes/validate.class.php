<?php
#####################################################
#                  | Page Info. |                   #
#####################################################
/*	CREATOR : SUMESH T G
	DATE  : 06/07/2008
	PAGE  : validate.class.php
	DESC  : Common validation class for all pages.
*/
#####################################################

/*--------------------------------------------------------------------------------------------*\
  Function: validateFields()
  Purpose:  generic form field validation.
  Parameters: field - the POST / GET fields from a form which need to be validated.
              rules - an array of the validation rules. Each rule is a string of the form:

   "[if:FIELDNAME=VALUE,]REQUIREMENT,fieldname[,fieldname2 [,fieldname3, date_flag]],error message"
  
              if:FIELDNAME=VALUE,   This allows us to only validate a field 
                          only if a fieldname FIELDNAME has a value VALUE. This 
                          option allows for nesting; i.e. you can have multiple 
                          if clauses, separated by a comma. They will be examined
                          in the order in which they appear in the line.

              Valid REQUIREMENT strings are: 
                "required"     - field must be filled in
                "digits_only"  - field must contain digits only
                "letters_only" - field must only contains letters (a-Z)
                "is_alpha"     - field must only contain alphanumeric characters (0-9, a-Z)

                "length=X"     - field has to be X characters long
                "length=X-Y"   - field has to be between X and Y (inclusive) characters long
                "length>X"     - field has to be greater than X characters long
                "length>=X"    - field has to be greater than or equal to X characters long
                "length<X"     - field has to be less than X characters long
                "length<=X"    - field has to be less than or equal to X characters long

                "valid_email"  - field has to be valid email address
                "valid_date"   - field has to be a valid date
                      fieldname:  MONTH 
                      fieldname2: DAY 
                      fieldname3: YEAR
                      date_flag:  "later_date" / "any_date"
                "same_as"     - fieldname is the same as fieldname2 (for password comparison)

                "range=X-Y"    - field must be a number between the range of X and Y inclusive
                "range>X"      - field must be a number greater than X
                "range>=X"     - field must be a number greater than or equal to X
                "range<X"      - field must be a number less than X
                "range<=X"     - field must be a number less than or equal to X

  
  Comments:   With both digits_only, valid_email and is_alpha options, if the empty string is passed 
              in it won't generate an error, thus allowing validation of non-required fields. So,
              for example, if you want a field to be a valid email address, provide validation for 
              both "required" and "valid_email".
\*--------------------------------------------------------------------------------------------*/
class validate 
{
	function validateFields($fields, $rules)
	{ 
	//print_r($fields);
	  $errors = array();
	  
	  // loop through rules
	  for ($i=0; $i<count($rules); $i++)
	  {
		// split row into component parts 
		$row = @explode(",", $rules[$i]);
		
		// while the row begins with "if:..." test the condition. If true, strip the if:..., part and 
		// continue evaluating the rest of the line. Keep repeating this while the line begins with an 
		// if-condition. If it fails any of the conditions, don't bother validating the rest of the line
		$satisfies_if_conditions = true;
		while (preg_match("/^if:/", $row[0]))
		{
		  $condition = preg_replace("/^if:/", "", $row[0]);
	
		  // check if it's a = or != test
		  $comparison = "equal";
		  $parts = array();
		  if (preg_match("/!=/", $condition))
		  {
			$parts = split("!=", $condition);
			$comparison = "not_equal";
		  }
		  else 
			$parts = split("=", $condition);
	
		  $field_to_check = $parts[0];
		  $value_to_check = $parts[1];
		  
		  // if the VALUE is NOT the same, we don't need to validate this field. Return.
		  if ($comparison == "equal" && $fields[$field_to_check] != $value_to_check)
		  {
			$satisfies_if_conditions = false;
			break;
		  }
		  else if ($comparison == "not_equal" && $fields[$field_to_check] == $value_to_check)
		  {
			$satisfies_if_conditions = false;
			break;      
		  }
		  else 
			array_shift($row);    // remove this if-condition from line, and continue validating line
		}
	
		if (!$satisfies_if_conditions)
		  continue;
	
	
		$requirement = $row[0];
		$field_name  = $row[1];
	
		// depending on the validation test, store the incoming strings for use later...
		if (count($row) == 6)        // valid_date
		{
		  $field_name2   = $row[2];
		  $field_name3   = $row[3];
		  $date_flag     = $row[4];
		  $error_message = $row[5];
		}
		else if (count($row) == 4)     // same_as
		{
		  $field_name2   = $row[2];
		  $error_message = $row[3];
		}
		else
		  $error_message = $row[2];    // everything else!
	
	
		// if the requirement is "length=...", rename requirement to "length" for switch statement
		if (preg_match("/^length/", $requirement))
		{
		  $length_requirements = $requirement;
		  $requirement         = "length";
		}
	
		// if the requirement is "range=...", rename requirement to "range" for switch statement
		if (preg_match("/^range/", $requirement))
		{
		  $range_requirements = $requirement;
		  $requirement        = "range";
		}
	
	
		// now, validate whatever is required of the field
		switch ($requirement)
		{
		  case "required":
			if (!isset($fields[$field_name]) || trim($fields[$field_name]) == "")
			  $errors[] = $error_message;
			break;
			
		case "splcharchk":
			
			if(strpos($fields[$field_name],"<")!='')
			 	 $errors[] = $error_message;
			if(strpos($fields[$field_name],">")!='')
				 $errors[] = $error_message;			
			break;
			
		 case "decimal_chk":
			if (isset($fields[$field_name]) || trim($fields[$field_name])!= "")
			 $pos = strpos($fields[$field_name],".");
			 if($pos!='') {
				$strchk =  substr($fields[$field_name],($pos+1),strlen($fields[$field_name]));
				if(strlen($strchk) > 2) 
					$errors[] = $error_message;
				}			  
			break;

		  case "digits_only":       
			if (isset($fields[$field_name]) && preg_match("/\D/", $fields[$field_name]))
			  $errors[] = $error_message;
			break;
			
		  case "decimals_only":
			 if (! preg_match('/^-?\d*\.?\d+$/',$fields[$field_name]))  
				 $errors[] = $error_message ;
			 break;
			 
		  case "letters_only": 
			if (isset($fields[$field_name]) && preg_match("/[^a-zA-Z]/", $fields[$field_name]))
			  $errors[] = $error_message;
			break;
			
			 case "url":
				if (!preg_match('|^http(s)?://[a-z0-9-]+(\.[a-z0-9-]+)*(:[0-9]+)?(/.*)?$|i', $fields[$field_name]))
					  $errors[] = $error_message;
				break;
			 case "url_new":
				if (!preg_match('|^[a-z0-9-]+(\.[a-z0-9-])+(:[0-9]+)?(/.*)?$|i', $fields[$field_name]))
					  $errors[] = $error_message;
				break;
	
		  // doesn't fail if field is empty
		  case "valid_email":
			$regexp="/^[a-z0-9]+([_\\.-][a-z0-9]+)*@([a-z0-9]+([\.-][a-z0-9]+)*)+\\.[a-z]{2,}$/i";     
			if (isset($fields[$field_name]) && !empty($fields[$field_name]) && !preg_match($regexp, $fields[$field_name]))
			  $errors[] = $error_message;
			break;
	
		  case "length":
			$comparison_rule = "";
			$rule_string     = "";
	
			if      (preg_match("/length=/", $length_requirements))
			{
			  $comparison_rule = "equal";
			  $rule_string = preg_replace("/length=/", "", $length_requirements);
			}
			else if (preg_match("/length>=/", $length_requirements))
			{
			  $comparison_rule = "greater_than_or_equal";
			  $rule_string = preg_replace("/length>=/", "", $length_requirements);
			}
			else if (preg_match("/length<=/", $length_requirements))
			{
			  $comparison_rule = "less_than_or_equal";
			  $rule_string = preg_replace("/length<=/", "", $length_requirements);
			}
			else if (preg_match("/length>/", $length_requirements))
			{
			  $comparison_rule = "greater_than";
			  $rule_string = preg_replace("/length>/", "", $length_requirements);
			}
			else if (preg_match("/length</", $length_requirements))
			{
			  $comparison_rule = "less_than";
			  $rule_string = preg_replace("/length</", "", $length_requirements);
			}
	
			switch ($comparison_rule)
			{
			  case "greater_than_or_equal":
				if (!(strlen($fields[$field_name]) >= $rule_string))
				  $errors[] = $error_message;
				break;
			  case "less_than_or_equal":
				if (!(strlen($fields[$field_name]) <= $rule_string))
				  $errors[] = $error_message;
				break;
			  case "greater_than":
				if (!(strlen($fields[$field_name]) > $rule_string))
				  $errors[] = $error_message;
				break;
			  case "less_than":
				if (!(strlen($fields[$field_name]) < $rule_string))
				  $errors[] = $error_message;
				break;
				
			
			
			  case "equal":
				// if the user supplied two length fields, make sure the field is within that range
				if (preg_match("/-/", $rule_string))
				{
				  list($start, $end) = split("-", $rule_string);
				  if (strlen($fields[$field_name]) < $start || strlen($fields[$field_name]) > $end)
					$errors[] = $error_message;
				}
				// otherwise, check it's EXACTLY the size the user specified 
				else
				{
				  if (strlen($fields[$field_name]) != $rule_string)
					$errors[] = $error_message;
				}     
				break;       
			}
			break;
	
		  case "range":
			$comparison_rule = "";
			$rule_string     = "";
	
			if      (preg_match("/range=/", $range_requirements))
			{
			  $comparison_rule = "equal";
			  $rule_string = preg_replace("/range=/", "", $range_requirements);
			}
			else if (preg_match("/range>=/", $range_requirements))
			{
			  $comparison_rule = "greater_than_or_equal";
			  $rule_string = preg_replace("/range>=/", "", $range_requirements);
			}
			else if (preg_match("/range<=/", $range_requirements))
			{
			  $comparison_rule = "less_than_or_equal";
			  $rule_string = preg_replace("/range<=/", "", $range_requirements);
			}
			else if (preg_match("/range>/", $range_requirements))
			{
			  $comparison_rule = "greater_than";
			  $rule_string = preg_replace("/range>/", "", $range_requirements);
			}
			else if (preg_match("/range</", $range_requirements))
			{
			  $comparison_rule = "less_than";
			  $rule_string = preg_replace("/range</", "", $range_requirements);
			}
			
			switch ($comparison_rule)
			{
			  case "greater_than":
				if (!($fields[$field_name] > $rule_string))
				  $errors[] = $error_message;
				break;
			  case "less_than":
				if (!($fields[$field_name] < $rule_string))
				  $errors[] = $error_message;
				break;
			  case "greater_than_or_equal":
				if (!($fields[$field_name] >= $rule_string))
				  $errors[] = $error_message;
				break;
			  case "less_than_or_equal":
				if (!($fields[$field_name] <= $rule_string))
				  $errors[] = $error_message;
				break;
			  case "equal":
				list($start, $end) = split("-", $rule_string);
	
				if (($fields[$field_name] < $start) || ($fields[$field_name] > $end))
				  $errors[] = $error_message;
				break;
			}
			break;
			
		  case "same_as":
			if ($fields[$field_name] != $fields[$field_name2])
			  $errors[] = $error_message;
			break;
	
		  case "valid_date":
			// this is written for future extensibility of isValidDate function to allow 
			// checking for dates BEFORE today, AFTER today, IS today and ANY day.
			$is_later_date = false;
			if    ($date_flag == "later_date")
			  $is_later_date = true;
			else if ($date_flag == "any_date")
			  $is_later_date = false;
	
			if (!is_valid_date($fields[$field_name], $fields[$field_name2], $fields[$field_name3], $is_later_date))
			  $errors[] = $error_message;
			break;
	
		case "date_validate":
			// this is written for future extensibility of isValidDate function to allow 
			// checking for dates BEFORE today, AFTER today, IS today and ANY day.
			$is_later_date = false;
			if    ($date_flag == "later_date")
			  $is_later_date = true;
			else if ($date_flag == "any_date")
			  $is_later_date = false;
			$dt_array	= explode('-',$fields[$field_name]);
			if (!is_valid_date($dt_array[0],$dt_array[1], $dt_array[2], $is_later_date))
			  $errors[] = $error_message;
			break;
			
		case "is_alpha":
			if (preg_match('/[^A-Za-z0-9]/', $fields[$field_name]))
			  $errors[] = $error_message; 
			break;
		 case "password":	
				if(strstr($fields[$field_name],' '))
					 $errors[] = "could not allow space in password";
				else if(strlen($fields[$field_name])<4)
					  $errors[] = $error_message;
				break;    
		  default:
			die("Unknown requirement flag in validateFields(): $requirement");
			break;
		}
	  }
	  
	  return $errors;
	}
	
	
	/*------------------------------------------------------------------------------------------------*\
	  Function:   is_valid_date
	  Purpose:    checks a date is valid / is later than current date
	  Parameters: $month       - an integer between 1 and 12
				  $day         - an integer between 1 and 31 (depending on month)
				  $year        - a 4-digit integer value
				  $is_later_date - a boolean value. If true, the function verifies the date being passed 
								   in is LATER than the current date.
	\*------------------------------------------------------------------------------------------------*/
	function is_valid_date($month, $day, $year, $is_later_date)
	{
	  // depending on the year, calculate the number of days in the month
	  if ($year % 4 == 0)      // LEAP YEAR 
		$days_in_month = array(31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	  else
		$days_in_month = array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	
	
	  // first, check the incoming month and year are valid. 
	  if (!$month || !$day || !$year) return false;
	  if (1 > $month || $month > 12)  return false;
	  if ($year < 0)                  return false;
	  if (1 > $day || $day > $days_in_month[$month-1]) return false;
	
	
	  // if required, verify the incoming date is LATER than the current date.
	  if ($is_later_date)
	  {    
		// get current date
		$today = date("U");
		$date = mktime(0, 0, 0, $month, $day, $year);
		if ($date < $today)
		  return false;
	  }
	
	  return true;
	}
	
	function imageValidation($source,$vtype,$title) // vtype for validation needed or not Vtype=1 must else not compulsary 
		{
		
			$msg	=	'';
			if ( ($source != 'none') && ($source != '' )) {
	
			$imagesize = @getimagesize($source);
			
			if($imagesize[2]=='')
			{
				
				$imagesize[2] = 5;
			}
			
			switch ( $imagesize[2] ) {
	
				case 0:
	
					$msg	= $title.' type is Unknown';
					break;
					
				case 5:
					
					$msg	= 'Upload a valid '.$title;
					break;
	
				case 1:
					
					break;
				
				case 2:
					break;
				
				case 3:
					break;
	
			}
	
		} else if($vtype==1) {
	
		   $msg	= $title.' File not supplied, or file too big.';
	
		} 
		return  $msg;
	}
	function uploadFileValidate($source,$vtype,$title) // vtype for validation needed or not Vtype=1 must else not compulsary 
		{

			$msg	=	'';
			if ( ($source != 'none') && ($source != '' )) {
			   $fileNames	=	explode(".",$source);
			  $ext     =".".$fileNames[1];  
			   if((strtolower($ext)==".exe" or strtolower($ext)==".php" or strtolower($ext)==".php" or strtolower($ext)==".jsp"or strtolower($ext)==".asp" or strtolower($ext)==".dll" or strtolower($ext)==".aspx" or strtolower($ext)==".cf"))
				  $msg	=	"Uploaded File Type is not Valid ";
			}
			else if($vtype==1) 
		   		$msg	= $title.' File not supplied, or file too big.';
			return  $msg;
	 }// End of File Validate 
	 
	//function to compare date & time
	function comp_datetime($date1,$date2,$name)
	{
		$split 		= split(" ",$date1);
		$split_date = split("-",$split[0]);
		$split_time = split(":",$split[1]);
		
		if($split_date[2]=='')
			$split_date[2] ='0000';
			
		if($split_date[1]=='')
			$split_date[1] ='00';
			
		if($split_date[0]=='')
			$split_date[0] ='00';
			
		$starttime	=	mktime($split_time[0],$split_time[1],$split_time[2],$split_date[2],$split_date[1],$split_date[0]);

		$split 		= split(" ",$date2);
		$split_date = split("-",$split[0]);
		$split_time = split(":",$split[1]);
		
		if($split_date[2]=='')
			$split_date[2] ='0000';
			
		if($split_date[1]=='')
			$split_date[1] ='00';
			
		if($split_date[0]=='')
			$split_date[0] ='00';
		
		$endtime	=	mktime($split_time[0],$split_time[1],$split_time[2],$split_date[2],$split_date[1],$split_date[0]);
		
		$msg	=	'';
		
		if($starttime >= $endtime)
		{
			$msg = $name." end date & time must be greater than  start date and time";
		}
		return $msg;
	}
	//function to compare date & time
	function comp_currdatetime($date,$name)
	{
	
		$split 		= split(" ",$date);
		$split_date = split("-",$split[0]);
		$split_time = split(":",$split[1]);
		
		if($split_date[2]=='')
			$split_date[2] ='0000';
			
		if($split_date[1]=='')
			$split_date[1] ='00';
			
		if($split_date[0]=='')
			$split_date[0] ='00';
			
		$starttime	=	mktime($split_time[0],$split_time[1],$split_time[2],$split_date[2],$split_date[1],$split_date[0]);
		
		$currdate	= date("Y-m-d H:i:s");
		$split 		= split(" ",$currdate);
		$split_date = split("-",$split[0]);
		$split_time = split(":",$split[1]);
			
		$currtime   = mktime($split_time[0],$split_time[1],$split_time[2],$split_date[2],$split_date[1],$split_date[0]);
		
		
		$msg	=	'';
		
		if($starttime < $currtime)
		{
			$msg = $name." start date & time must be greater than or equal to current date and time";
		}
		return $msg;
	}
	
	###### --|| EMAIL CHECK ||--######
	
	//check gmail,hotmail,rediff,yahoo mail accounts
	
	function check_Emailhigh($str)
	{
		if($str=="")
			$errors[] = "Enter the Email";
		$str	=	strtolower($str);
		$chk	=	explode("@",$str);
		if(!($chk[1]=="gmail.com" || $chk[1]=="hotmail.com" || $chk[1]=="rediff.com" || $chk[1]=="yahoo.com" || $chk[1]=="rediffmail.com" || $chk[1]=="yahoomail.com"))
		 $errors[] =  "Please enter gmail.com <br>or hotmail.com <br>or rediff.com <br>or yahoo.com mail id.";
		return $errors;
	}
	
	
} // End of Class

?>
