<?php
#####################################################
#                  | Page Info. |                   #
#####################################################
/*	PAGE  : general.class.php
	DESC  : Class contains functions based on 
			insrt,update,select,delete opertions.
*/
#####################################################

include_once "database.class.php";
include_once "resize.class.php";

class general
		{
			function __construct()
			{
				$this->now		= date("Y-m-d");
				$this->date		= date("Y-m-d H:i:s");
				$this->db		= new database();
				$this->dbvr = $this->db->dbConnect();
				if(!$this->dbvr)
				 die("Error Connection".$this->db->ErrorInfo);
			}
			
			function __destruct()
			{
				$this->db->dbClose();
			}
			
			function get_insetId()
			{
				return $this->db->getInsertId();
			}
			
			function clear_cache($folder="cache/",$file="")
			{
			  if($file!="")
			  {
			    unlink($folder.md5('http://'.$_SERVER['HTTP_HOST'].FOLDER_PATH.'/'.$file).'.html');
			  }
			  else
			  {
			    $files = glob($folder.'*'); // get all file names
				foreach($files as $unlk){ // iterate files
				  if(is_file($unlk))
					unlink($unlk); // delete file
				}
			  }
			}
		    function extfind($filename) 
			{ 
				$exts = @preg_split("[/\\.]", $filename) ; 
				$n = count($exts)-1;
				$end = $exts[$n];
				//$exts = strtolower($this->seoUrl(substr($exts[$n-1],0,20)));
				$extsnew = date("YmdHis")."_".substr(str_replace(' ', '_',$end),-70);
				return $extsnew; 
			}
			
			  function file_safe($filename) 
				{ 
					return preg_replace('/[^0-9a-z\.\_\-]/i','',$filename);
				}
	
			# Fetch One Row
			function get_Onerow($table,$where,$col='*',$html=false)
			{
				$sql	= "SELECT $col FROM `$table` WHERE 1=1 $where";
				//echo $sql;
			    $res	= $this->db->readValue($sql);
	    	   	return $res;
			}
			function get_MAxVal($table,$col,$as,$where="")
			{
				$sql	= "SELECT max($col) AS $as  FROM `$table`";
				if($where!="")
				{
					$sql	.= " WHERE $where";
				}
				//echo $sql;
			    $res	= $this->db->readValue($sql);
				return $res;
			}
			function get_MinVal($table,$col,$as,$col2,$where="")
			{
				$sql	= "SELECT min($col) AS $as, $col2 FROM `$table`";
				if($where!="")
				{
					$sql	.= " WHERE $where";
				}
				//echo $sql;
			    $res	= $this->db->readValue($sql);
				return $res;
			}
			function get_MAxVal2($table,$col,$where="")
			{
				$sql	= "SELECT $col FROM `$table`";
				if($where!="")
				{
					$sql	.= " WHERE $where";
				}
				//echo $sql;
			    $res	= $this->db->readValue($sql);
				return $res;
			}

			# Fetch One Rows Count
			function get_AllRowscnt($table,$where="",$group_by="",$col='*')
			{
				$sql	= "SELECT $col FROM `$table` WHERE 1=1";
				if($where!="")
					$sql	.= " $where";
				if($group_by!="")
					$sql	.= " GROUP BY $group_by";
				//echo $sql;
			    $res	= $this->db->numberOfRecords($sql);
	    	   	return $res;
			}
			# Fetch One Rows 
			function get_AllRows($table,$limit=0,$count=10,$order="",$where="",$group_by="",$col='*',$html=false)
			{
				$sql	= "SELECT $col FROM `$table` WHERE 1=1";
				if($where!="")
					$sql	.= " $where";
				if($group_by!="")
					$sql	.= " GROUP BY $group_by";
				if($order!="")
					$sql	.= " ORDER BY $order";
				
				$sql	.=	" LIMIT $limit,$count";
				//echo $sql;
			    $res	= $this->db->readValues($sql);
		/*		$new_res = array();
				foreach($res as $ky=>$val)
				{
					foreach($val as $ky1=>$val1)
					{
						if($html==false)
						 $new_res[$ky][$ky1] = htmlentities(stripslashes($val1));
						else
						 $new_res[$ky][$ky1] = stripslashes($val1);
					}
				}
		
	    	   	return $new_res;*/
				return $res;
			}
			
			# Fetch One Rows Count
			function get_AllRowscnt_qry($sql)
			{
				//echo $sql;
			    $res	= $this->db->numberOfRecords($sql);
	    	   	return $res;
			}
			# Fetch One Rows 
			function get_AllRows_qry($sql)
			{
			   // echo $sql;
			    $res	= $this->db->readValues($sql);
				return $res;
			}
			
			# Delete Row
			function del_Row($table,$where="")
			{
				$sql	=  "DELETE FROM `$table`";
				if($where!="")
					$sql	.= " WHERE $where";
				//echo $sql;
				$res	=  $this->db->setQuery($sql);
				if($res)
					{ 
					  
						return ""; 
				}
				else
				 return "Sorry !.Error occured .Please try Again!.<br />".$this->db->ErrorInfo."<br />$sql";
			}
			# Insert Row
			function ins_Row($table,$colums,$values)
			{
			
				$sql	=  "INSERT INTO `$table` ($colums) VALUES ($values)";
				$res	=  $this->db->setQuery($sql);
				//echo $sql;exit;
				if($res)
					{
					 
						return "";
					}
				else
					 return "Sorry !.Error occured .Please try Again!.<br />".$this->db->ErrorInfo."<br />$sql";
			}
			# Update Row
			function upd_Row($table,$set,$where)
			{
				$sql	=  "UPDATE `$table` SET $set WHERE $where";
				$res	=  $this->db->setQuery($sql);
				//echo $sql;exit;
				if($res)
					{
					
						return "";
					}
				else
					 return "Sorry !.Error occured .Please try Again!.<br />".$this->db->ErrorInfo."<br />$sql";
			}
			# Check Exist
			function chk_Ext($table,$where,$col='*')
			{
				$sql	= "SELECT $col FROM `$table` WHERE $where";
				//echo $sql;
			    $res	= $this->db->numberOfRecords($sql);
				 
	    	   	return $res;
			}
			
			function chk_morethan($username,$password)
			{
				$sql2	= "SELECT email FROM ma_users WHERE email='".addslashes($username)."' and password='".addslashes($password)."'";
			    $res2	= $this->db->numberOfRecords($sql2);
				
	    	   	return $res2;
			}
			
			function encrypt_pass_old($password)
			{
			
			   $key = 'swebin';
			   $string = $password; 
			   $encrypted = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($key), $string, MCRYPT_MODE_CBC, md5(md5($key))));
			   return $encrypted;
			}
			
			function decrypt_pass_old($password)
			{
				$key = 'swebin';
			    $encrypted = $password;
			    $decrypted = rtrim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, md5($key), base64_decode($encrypted), MCRYPT_MODE_CBC, md5(md5($key))), "\0");
			    return $decrypted;
			}
			
			//$objgen->change_pass_old('admin','password','admin_id');
			//$objgen->change_pass_old('users','password','id');
			
			function change_pass_old($table,$field,$id="admin_id",$where="")
			{
				
				$row_count = $this->get_AllRowscnt($table,$where);
				if($row_count>0)
				{
				  $res_arr = $this->get_AllRows($table,0,$row_count,$id." asc",$where);
				  foreach($res_arr as $key=>$val)
				  {
					  $password = $this->decrypt_pass_old($val[$field]);
					  
					    $this->upd_Row($table,"$field='".$this->encrypt_pass($password)."'","$id=".$val[$id]);
				
				  }
				}
			}
			function encrypt_pass($password)
			{
			
			   $key  = 'swebin';
			   $key2 = 'sosp@$%Ck';
			   $string = $password; 
					   
			    $output = false;
				$encrypt_method = "AES-256-CBC";
				$key = hash( 'sha256', $key );
				$iv = substr( hash( 'sha256', $key2 ), 0, 16 );
				$output = base64_encode( openssl_encrypt( $string, $encrypt_method, $key, 0, $iv ) );
				return $output;
			}
			
			function decrypt_pass($password)
			{
				 $key  = 'swebin';
			     $key2 = 'sosp@$%Ck';
			     $string = $password; 
					   
			    $output = false;
				$encrypt_method = "AES-256-CBC";
				$key = hash( 'sha256', $key );
				$iv = substr( hash( 'sha256', $key2 ), 0, 16 );
				$output = openssl_decrypt( base64_decode( $string ), $encrypt_method, $key, 0, $iv );
				return $output;
			}
			
			
			
			# Check Login
			function chk_Login($table,$username,$password,$page,$ses_id='user_id',$ses_name='username',$ses_pass="password",$status="",$admin=0,$col='*',$remember_me='no',$st_coln='status')
			{

			    $encrypted = $this->encrypt_pass($password);
			   
				$sql	= "SELECT $col FROM `$table` WHERE $ses_name='".$this->check_input($username)."' and $ses_pass='".$encrypted."'";
				
				if($status!="")
				  $sql	.= " AND $st_coln='$status'";
				  
				 // echo $sql;exit;
			    $res	= $this->db->readValue($sql);
	    	   	if($res)
				{
					session_start();
					
					if($admin==0)
					{
						$_SESSION['ma_log_id']		=  $res[$ses_id];
						$_SESSION['ma_usr_name']	=  $res[$ses_name];
						$_SESSION['ma_name']	    =  $res['name'];
						$_SESSION['user_type']	    =  $res['user_type'];
						
							if($remember_me=='yes')
							{
								$expire=time()+10*365*60*60*24; //10 years, 60 sec * 60 min * 24 hours * 365 days
								setcookie("swebin_user", $username, $expire);
								setcookie("swebin_sec", $encrypted, $expire);
							}
							else
							{
							
								// set the expiration date to one hour ago
								setcookie("swebin_user", "", time()-3600);
								setcookie("swebin_sec", "", time()-3600);
							}
					}
					else
					{
						$_SESSION['MYPR_adm_id']	     =  $res[$ses_id];
						$_SESSION['MYPR_adm_username']	 =  $res[$ses_name];
						$_SESSION['MYPR_adm_type']	     =  $res['user_type'];
						
							if($remember_me=='yes')
							{
								$expire=time()+10*365*60*60*24; //10 years, 60 sec * 60 min * 24 hours * 365 days
								setcookie("swebin_user_ad", $username, $expire);
								setcookie("swebin_sec_ad", $encrypted, $expire);
							}
							else
							{
							
								// set the expiration date to one hour ago
								setcookie("swebin_user_ad", "", time()-3600);
								setcookie("swebin_sec_ad", "", time()-3600);
							}
					}
				
					return "";
				
				}
				else if($res && $status!="" && $res['status']!=$status)
				{
					
					  
					 return "Sorry!.Your Account is Inactive Now.";
				}
				else
				{
					
					return "Invalid Username/Password";
				}

			}
			
			function chk_Login2($table,$username,$email,$password,$remember_me)
			{

			    $encrypted = $this->encrypt_pass($password);
			   
				$sql	= "SELECT * FROM `$table` WHERE (username='".$username."' or email='".$username."') and password='".$encrypted."'";
        		$sql	.= " and status='active' and activation='yes'";
				  
				  //echo $sql;exit;
			    $res	= $this->db->readValue($sql);
	    	   	if($res)
				{
					     session_start();
					
						$_SESSION['ma_log_id']		=  $res['id'];
						$_SESSION['ma_usr_name']	=  $username;
						$_SESSION['ma_name']	    =  $res['first_name'].' '.$res['last_name'];
					
						
					     if($remember_me=='yes')
							{
								$expire=time()+10*365*60*60*24; //10 years, 60 sec * 60 min * 24 hours * 365 days
								setcookie("swebin_user", $username, $expire);
								setcookie("swebin_sec", $encrypted, $expire);
							}
							else
							{
							
								// set the expiration date to one hour ago
								setcookie("swebin_user", "", time()-3600);
								setcookie("swebin_sec", "", time()-3600);
							}
					
					
					return "";
				
				}
				else if($res && $status!="" && $res['status']!=$status)
				{
				
					return "Sorry!.Your Account is Inactive Now.";
				}
				else
				{
				
					return "Invalid Username/Password";
				}

			}
			
			function chng_password($table,$col_pass,$POST,$col_id,$id)
			{
				
				$password	    =	$this->encrypt_pass(trim($POST['new_pwd']));
				$old_password	=	$this->encrypt_pass(trim($POST['old_pwd']));
				$sql1	= "SELECT $col_pass FROM `$table` WHERE $col_pass='$old_password' AND $col_id=$id";
				$res1	=  $this->db->numberOfRecords($sql1);
				if($res1==0)
				{
					
					return "Invalid Old Password.";
				}
				else
				{
					$sql	=	"Update `$table` SET $col_pass='$password' where $col_id=$id";
					$res	=  $this->db->setQuery($sql);
					if($res)
						{

							return "";
						}
					else
						  return "Sorry !.Error occured .Please try Again!.<br />$sql";
				}
			}
			# Check Password
			function match_Pass($pass,$conf_pass,$min="",$max="")
			{
			  if($pass!=$conf_pass)
			  {
				 
				 return "Confirm password Didn't Match";
			  }
			  else if($min!="" && $max!="")
			  {
			  	if($pass>$max || $pass<$min)
				  return "Password Must Contains $min - $max char.";
				else
					return	"";
			  }
			  else if($min!="")
			  {
			  	if($pass<$min)
					return "Password Must Contains Min. $min char.";
				else
					return	"";
			  }
			  else if($min!="")
			  {
			  	if($pass>$max)
				  return "Password Must Contains Min. $min char.";
				else
					return	"";
			  }
			  else
			  {
				return	"";
			  }
			}
			# Make Date Time
			function make_DateTime($date)
			{
				$date	 =	explode(" ",$date);
				$time_exp	=	explode(":",$date[1]);
				$date_exp	=	explode("-",$date[0]);
				if($date[0]==$this->now)
				{
					$date	=	"<font color='blue'><b>Today</b></font>".date(" g:i A", mktime($time_exp[0],$time_exp[1],$time_exp[2],$date_exp[1],$date_exp[2],$date_exp[0]));
				}
				else
				{
					$date	=	date("jS, M Y g:i A", mktime($time_exp[0],$time_exp[1],$time_exp[2],$date_exp[1],$date_exp[2],$date_exp[0]));
				}
				return $date;
			}
			
			# Make Date Time
			function make_Date($date)
			{
				$date_exp	 =	explode("-",$date);
				$date	=	date("jS, M Y [ l ]", mktime(0,0,0,$date_exp[1],$date_exp[2],$date_exp[0]));
				return $date;
			}
			
			function con_date($date)
			{
			  return date("d-m-Y",strtotime($date)); 
			}
			
			function con_date_db($date)
			{
			  return date("Y-m-d",strtotime($date)); 
			}
			
	# Remove Stripslashes Array
	

			function DetermineAgeFromDOB ($YYYYMMDD_In)
			{
			  // Parse Birthday Input Into Local Variables
			  // Assumes Input In Form: YYYYMMDD
			  $yIn=substr($YYYYMMDD_In, 0, 4);
			  $mIn=substr($YYYYMMDD_In, 4, 2);
			  $dIn=substr($YYYYMMDD_In, 6, 2);
			
			  // Calculate Differences Between Birthday And Now
			  // By Subtracting Birthday From Current Date
			  $ddiff = date("d") - $dIn;
			  $mdiff = date("m") - $mIn;
			  $ydiff = date("Y") - $yIn;
			
			  // Check If Birthday Month Has Been Reached
			  if ($mdiff < 0)
			  {
				// Birthday Month Not Reached
				// Subtract 1 Year From Age
				$ydiff--;
			  } elseif ($mdiff==0)
			  {
				// Birthday Month Currently
				// Check If BirthdayDay Passed
				if ($ddiff < 0)
				{
				  //Birthday Not Reached
				  // Subtract 1 Year From Age
				  $ydiff--;
				}
			  }
			  return $ydiff;
			}
			
	   
		function get_time_difference( $start, $end )
		{
			$uts['start']      =    strtotime( $start );
			$uts['end']        =    strtotime( $end );
			if( $uts['start']!==-1 && $uts['end']!==-1 )
			{
				if( $uts['end'] >= $uts['start'] )
				{
					$diff    =    $uts['end'] - $uts['start'];
					if( $days=intval((floor($diff/86400))) )
						$diff = $diff % 86400;
					if( $hours=intval((floor($diff/3600))) )
						$diff = $diff % 3600;
					if( $minutes=intval((floor($diff/60))) )
						$diff = $diff % 60;
					$diff    =    intval( $diff );            
					return( array('days'=>$days, 'hours'=>$hours, 'minutes'=>$minutes, 'seconds'=>$diff) );
				}
				else
				{
					trigger_error( "Ending date/time is earlier than the start date/time", E_USER_WARNING );
				}
			}
			else
			{
				trigger_error( "Invalid date/time data detected", E_USER_WARNING );
			}
			return( false );
		}
		function currnt_page()
		{
		  	$currentFile = $_SERVER['REQUEST_URI'];
			$parts = Explode('/', $currentFile);
			return $parts[count($parts) - 1];
		}
		
		//Simple mail function with HTML header
		function sendmail($to, $subject, $message, $from) {
			$headers = "MIME-Version: 1.0" . "\r\n";
			$headers .= "Content-type:text/html;charset=iso-8859-1" . "\r\n";
			$headers .= 'From: ' . $from . "\r\n";
			
			$result = mail($to,$subject,$message,$headers);
			
			if ($result) return 1;
			else return 0;
		}
		function check_input($value)
		{
		  	$value2 = @stripslashes(strip_tags(trim($value)));
			// Quote if not a number
			if($value2!="")
			$value3 =  @mysqli_real_escape_string($this->dbvr,$value2);
			return $value3;
		}
		function check_input1($value)
		{
		  	$value2 = @addslashes(trim($value));
			return $value2;
		}
		
		function check_input3($value)
		{
		  	$value = @addslashes(strip_tags(trim($value)));
			return $value;
		}
		function check_input4($value)
		{
		  	$value2 = stripslashes(trim($value));
			// Quote if not a number
			if($value2!="")
			$value3 =  @mysqli_real_escape_string($this->dbvr,$value2);
			return $value3;
		}
		
		function baseencode($value)
		{
		  	if($value!="")
			$value2 = @mysqli_real_escape_string($this->dbvr,base64_encode(trim($value)));
			return $value2;
		}
		
		function basedecode($value,$wrap=0)
		{
		  	$value2 = @stripslashes(base64_decode(trim($value)));
			
			if($wrap!=0)
			{
				$value2 = @wordwrap($value2,$wrap,'<br />',true);
			}
			
			
		    return $value2;
		}
		
	    function check_strip($value,$wrap=0)
		{
		  	$value2 = @stripslashes($value);
			
			if($wrap!=0)
			{
				$value2 = @wordwrap($value2,$wrap,'<br />',true);
			}
			
			return $value2;
		}
		
	    function check_tag($value,$wrap=0)
		{
		  	$value2 = @stripslashes(@strip_tags($value));
			
			if($wrap!=0)
			{
				$value2 = @wordwrap($value2,$wrap,'<br />',true);
			}
			return $value2;
		}
		function upload_file($filed_name,$pref='swebin',$file_type='null',$folder="photos/orginal")
		{
		     // Example
			// $upload = $objgen->upload_file("banner_name","banner_2");
			 //if($upload[1]!="")
				//$errors[] = $upload[1];
			// else
				//$banner_name = $upload[0];
			
			$error = "";
			$file = strtolower(basename($_FILES[$filed_name]["name"]));
			if($file!=NULL)
			{
				$exp_file = explode(".",$file);
				$extn		  =	end($exp_file);
				$new_extn 	  = ".".strtoupper($extn);
              if($file_type=='image')
				{
					if($new_extn!=".JPEG"	&&	$new_extn!=".JPG"	&&	$new_extn!=".PNG"	&&	$new_extn!=".GIF")
					{
						$error = "File Type is Not Supported.";
					}
				}
				
				if($file_type=='doc')
				{
					if($new_extn!=".PDF" && $new_extn!=".DOCS" && $new_extn!=".DOCX" && $new_extn!=".CSV" && $new_extn!=".XLS" && $new_extn!=".TXT" && $new_extn!=".XLSX")
					{
						$error = "File Type is Not Supported.";
					}
				}
				
			   if($file_type=='zip')
				{
					if($new_extn!=".zip")
					{
						$error = "File Type is Not Supported.";
					}
				}
				
					
				if($error=="")
				{
					$ext = $this->extfind($file);
					$ext2 = $this->file_safe($ext);
					$file_name  = $pref."_".$ext2;
					move_uploaded_file($_FILES[$filed_name]["tmp_name"],ROOT_SITE."/".$folder."/".$file_name);
				}
					
					
			}
			return array($file_name,$error);
		}
		
		
		function openImagegen($file)
			{
				// *** Get extension
				$extension = strtolower(strrchr($file, '.'));

				switch($extension)
				{
					case '.jpg':
					case '.jpeg':
						$img = @imagecreatefromjpeg($file);
						break;
					case '.gif':
						$img = @imagecreatefromgif($file);
						break;
					case '.png':
						$img = @imagecreatefrompng($file);
						break;
					default:
						$img = false;
						break;
				}
				return $img;
			}
			
	    function upload_resize($filed_name,$pref='swebin',$file_type='image',$rez=array(),$unlink="null",$file_size="",$l=array(600,400,'crop',100),$m=array(200,130,'crop',100),$s=array(100,75,'auto',100),$folder="photos/orginal")
		{
		     // Example
			// $upload = $objgen->upload_file("banner_name","banner_2");
			 //if($upload[1]!="")
				//$errors[] = $upload[1];
			// else
				//$banner_name = $upload[0];
			
			//$rez=array('l','m','s');
			
			/*    Resize by exact width/height. (exact)
    Resize by width - exact width will be set, height will be adjusted according to aspect ratio. (landscape)
    Resize by height - like Resize by Width, but the height will be set and width adjusted dynamically. (portrait)
    Auto determine options 2 and 3. If you're looping through a folder with different size photos, let the script determine how to handle this. (auto)
    Resize, then crop. This is my favourite. Exact size, no distortion. (crop)*/
	
			
			$error = "";
			$file = strtolower(basename($_FILES[$filed_name]["name"]));
			if($file!=NULL)
			{
				$exp_file = explode(".",$file);
				$extn		  =	end($exp_file);
				$new_extn 	  = ".".strtoupper($extn);
				
              if($file_type=='image')
				{
					if($new_extn!=".JPEG"	&&	$new_extn!=".JPG"	&&	$new_extn!=".PNG"	&&	$new_extn!=".GIF")
					{
						$error = "File Type is Not Supported.";
					}
				}
				
				if($file_type=='doc')
				{
					if($new_extn!=".PDF" && $new_extn!=".DOCS" && $new_extn!=".DOCX" && $new_extn!=".CSV" && $new_extn!=".XLS" && $new_extn!=".TXT" && $new_extn!=".XLSX")
					{
						$error = "File Type is Not Supported.";
					}
				}
				
			   if($file_type=='zip')
				{
					if($new_extn!=".zip")
					{
						$error = "File Type is Not Supported.";
					}
				}
				
				if($file_size!="")
				{
					if($_FILES[$filed_name]["size"] > $file_size)
					{
					  $error = "File Size is greater than $file_size kb.";
					}
				}
				
					
				if($error=="")
				{
					
					if($unlink!="null")
					{
					
					      if(file_exists(ROOT_SITE."/".$folder."/".$unlink))
	 						unlink(ROOT_SITE."/".$folder."/".$unlink);
							
						 if(file_exists(ROOT_SITE."/photos/large/".$unlink))
	 						unlink(ROOT_SITE."/photos/large/".$unlink);
							
							
						 if(file_exists(ROOT_SITE."/photos/medium/".$unlink))
	 						unlink(ROOT_SITE."/photos/medium/".$unlink);
							
							
						 if(file_exists(ROOT_SITE."/photos/small/".$unlink))
	 						unlink(ROOT_SITE."/photos/small/".$unlink);

					}
					
					//print_r($rez);exit;
					
					$ext = $this->extfind($file);
					//$ext2 = $this->file_safe($ext);
					//$file_name  = $pref."_".$ext2;
					$file_name  = $pref."_".$ext;
					$mov_file = move_uploaded_file($_FILES[$filed_name]["tmp_name"],ROOT_SITE."/".$folder."/".$file_name);
					
				
					 if(count($rez)>0 && $mov_file)
					 {
					 
					     $testimage = $this->openImagegen(ROOT_SITE."/".$folder."/".$file_name);
						 
					
						   
					       $width_chk  = imagesx($testimage);
	  				       $height_chk = imagesy($testimage);
						   
						    $image 		= new resize(ROOT_SITE."/".$folder."/".$file_name);
						   
					   if(in_array('l',$rez))
					   {
			
						   if($width_chk>$l[0] ||  $height_chk>$l[1])
						   {
	   
						
						   $image->resizeImage($l[0],$l[1],$l[2]);
						   $image->saveImage(ROOT_SITE."/photos/large/".$file_name,$l[3]);

						   }
						   else
						   {
						     copy(ROOT_SITE."/".$folder."/".$file_name,ROOT_SITE."/photos/large/".$file_name);
						   }
					   }
					   if(in_array('m',$rez))
					   {
					   
					    $testimage = $this->openImagegen(ROOT_SITE."/".$folder."/".$file_name);
						   
					
						   if($width_chk>$m[0] ||  $height_chk>$m[1])
						   {
						 //  $image 		= new resize(ROOT_SITE."/".$folder."/".$file_name);
						   $image->resizeImage($m[0],$m[1],$m[2]);
						   $image->saveImage(ROOT_SITE."/photos/medium/".$file_name,$l[3]);
						   
						    }
						   else
						   {
						     copy(ROOT_SITE."/".$folder."/".$file_name,ROOT_SITE."/photos/medium/".$file_name);
						   }
					   }
					   if(in_array('s',$rez))
					   {
					     
						   
						   if($width_chk>$s[0] ||  $height_chk>$s[1])
						   {
						  // $image 		= new resize(ROOT_SITE."/".$folder."/".$file_name);
						   $image->resizeImage($s[0],$s[1],$s[2]);
						   $image->saveImage(ROOT_SITE."/photos/small/".$file_name,$l[3]);
						   
						    }
						   else
						   {
						     copy(ROOT_SITE."/".$folder."/".$file_name,ROOT_SITE."/photos/small/".$file_name);
						   }
					   }
					 
					 }
					 else
					 {
					    $error = "Image Upload Failed. Brows an image and check again.";
					 }
				 
				}
					
					
			}
			return array($file_name,$error);
		}
		
		function del_Images($table,$column,$where)
		{
		
           $result     = $this->get_Onerow($table,$where);
           $unlink   	    = stripslashes($result[$column]);

	  	  if(file_exists(ROOT_SITE."/photos/orginal/".$unlink))
	 		unlink(ROOT_SITE."/photos/orginal/".$unlink);
							
		  if(file_exists(ROOT_SITE."/photos/large/".$unlink))
	 		unlink(ROOT_SITE."/photos/large/".$unlink);
							
							
		  if(file_exists(ROOT_SITE."/photos/medium/".$unlink))
	 		unlink(ROOT_SITE."/photos/medium/".$unlink);
							
							
		  if(file_exists(ROOT_SITE."/photos/small/".$unlink))
	 		unlink(ROOT_SITE."/photos/small/".$unlink);

		}
		
		function dashboard_count($table,$title,$color,$image,$file,$where="")
		{
		
		      if($table!="")
			  {
		      $count = $this->get_AllRowscnt($table,$where);
			  }			 
			  
			  $output = '<div class="col-6 col-md-6 col-lg-3">
							<a href="'.URLAD.$file.'"  class="col-span-12  text-white sm:col-span-6 xl:col-span-3 intro-y">
								<div class="report-box zoom-in" >
									<div class="box p-3" style="background:'.$color.'">
										<div class="d-flex">
											<i class="fa fa-'.$image.'"></i>                
										</div>
										<div class="fs-2 font-medium leading-8 mt-3">'.$count.'</div>
										<div class="fs-6  mt-1">'.$title.'</div>
									</div>
								</div>
							</a>
						 </div>';
						 					
			  return $output;
		}
		
		
		function truncate_str($str, $maxlen) {
			if ( strlen($str) <= $maxlen ) return $str;
			
			$newstr = substr($str, 0, $maxlen);
			if ( substr($newstr,-1,1) != ' ' ) $newstr = substr($newstr, 0, strrpos($newstr, " "));
			
			return $newstr;
			}
			
		function paginate_function($item_per_page, $current_page, $total_records, $total_pages)
		{
			$pagination = '';
			if($total_pages > 0 && $total_pages != 1 && $current_page <= $total_pages){ //verify total pages and current page number
				$pagination .= '<ul class="pagination">';
			   
				$right_links    = $current_page + 3;
				$previous       = $current_page - 3; //previous link
				$next           = $current_page + 1; //next link
				$first_link     = true; //boolean var to decide our first link
			   
				if($current_page > 1){
					$previous_link = ($previous==0)?1:$previous;
					$pagination .= '<li class="first"><a href="#" data-page="1" title="First">&laquo;</a></li>'; //first link
					$pagination .= '<li><a href="#" data-page="'.$previous_link.'" title="Previous">&lt;</a></li>'; //previous link
						for($i = ($current_page-2); $i < $current_page; $i++){ //Create left-hand side links
							if($i > 0){
								$pagination .= '<li><a href="#" data-page="'.$i.'" title="Page'.$i.'">'.$i.'</a></li>';
							}
						}  
					$first_link = false; //set first link to false
				}
			   
				if($first_link){ //if current active page is first link
					$pagination .= '<li class="first active">'.$current_page.'</li>';
				}elseif($current_page == $total_pages){ //if it's the last active link
					$pagination .= '<li class="last active">'.$current_page.'</li>';
				}else{ //regular current link
					$pagination .= '<li class="active">'.$current_page.'</li>';
				}
					   
				for($i = $current_page+1; $i < $right_links ; $i++){ //create right-hand side links
					if($i<=$total_pages){
						$pagination .= '<li><a href="#" data-page="'.$i.'" title="Page '.$i.'">'.$i.'</a></li>';
					}
				}
				if($current_page < $total_pages){
						$next_link = ($i > $total_pages)? $total_pages : $i;
						$pagination .= '<li><a href="#" data-page="'.$next_link.'" title="Next">&gt;</a></li>'; //next link
						$pagination .= '<li class="last"><a href="#" data-page="'.$total_pages.'" title="Last">&raquo;</a></li>'; //last link
				}
			   
				$pagination .= '</ul>';
			}
			return $pagination; //return pagination links
		}
		
		function convertDigit($digit)
		{
			switch ($digit)
			{
				case "0":
					return "zero";
				case "1":
					return "one";
				case "2":
					return "two";
				case "3":
					return "three";
				case "4":
					return "four";
				case "5":
					return "five";
				case "6":
					return "six";
				case "7":
					return "seven";
				case "8":
					return "eight";
				case "9":
					return "nine";
			}
		}
		
		function time_elapsed_string($datetime, $full = false) {
    $now = new DateTime;
    $ago = new DateTime($datetime);
    $diff = $now->diff($ago);

    $diff->w = floor($diff->d / 7);
    $diff->d -= $diff->w * 7;

    $string = array(
        'y' => 'year',
        'm' => 'month',
        'w' => 'week',
        'd' => 'day',
        'h' => 'hour',
        'i' => 'minute',
        's' => 'second',
    );
    foreach ($string as $k => &$v) {
        if ($diff->$k) {
            $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? 's' : '');
        } else {
            unset($string[$k]);
        }
    }

    if (!$full) $string = array_slice($string, 0, 1);
    return $string ? implode(', ', $string) . ' ago' : 'just now';
}
function makeComma($input){ 
     if(strlen($input)<=2)
     { return $input; }
     $length=substr($input,0,strlen($input)-2);
     $formatted_input = $this->makeComma($length).",".substr($input,-2);
     return $formatted_input;
 }


function moneyFormatIndia($num){
     $pos = strpos((string)$num, ".");
     if ($pos === false) {
        $decimalpart="00";
     }
     if (!($pos === false)) {
        $decimalpart= substr($num, $pos+1, 2); $num = substr($num,0,$pos);
     }

     if(strlen($num)>3 & strlen($num) <= 12){
         $last3digits = substr($num, -3 );
         $numexceptlastdigits = substr($num, 0, -3 );
         $formatted = $this->makeComma($numexceptlastdigits);
         $stringtoreturn = $formatted.",".$last3digits.".".$decimalpart ;
     }elseif(strlen($num)<=3){
        $stringtoreturn = $num.".".$decimalpart ;
     }elseif(strlen($num)>12){
        $stringtoreturn = number_format($num, 2);
     }

     if(substr($stringtoreturn,0,2)=="-,"){
        $stringtoreturn = "-".substr($stringtoreturn,2 );
     }

     return $stringtoreturn;
 }

 
function seoUrl($string) {
    //Unwanted:  {UPPERCASE} ; / ? : @ & = + $ , . ! ~ * ' ( )
    $string = strtolower($string);
    //Strip any unwanted characters
    $string = preg_replace("/[^a-z0-9_\s-]/", "", $string);
    //Clean multiple dashes or whitespaces
    $string = preg_replace("/[\s-]+/", " ", $string);
    //Convert whitespaces and underscore to dash
    $string = preg_replace("/[\s_]/", "-", $string);
    return $string;
}
// Function to validate against any email injection attempts
function IsInjected($str)
{
  $injections = array('(\n+)',
              '(\r+)',
              '(\t+)',
              '(%0A+)',
              '(%0D+)',
              '(%08+)',
              '(%09+)'
              );
  $inject = join('|', $injections);
  $inject = "/$inject/i";
  if(preg_match($inject,$str))
    {
    return true;
  }
  else
    {
    return false;
  }
}
// $word = product-detail/"
function CleanUrlParam($word)
{
	$cururl = strstr($_SERVER['REQUEST_URI'],$word);
	if($cururl)
	{
		$newurl = str_replace($word,"",$cururl);
		return  substr($newurl,0,strpos($newurl,"/"));
	}
	else
	{
	   return  "";
	}
}

function findParam($param)
{
	
	$actual_link = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
	$newurl = str_replace(WEBLINK, "", $actual_link);
	$par_arr     = explode("/", ltrim($newurl,'/'));
	//print_r($par_arr);exit;
	return  $par_arr[$param];
}
function format_date($fdate)
{
  if($fdate!="")
  {
     $fdate    = "'".date("Y-m-d",strtotime(str_replace("-","/",$this->check_input($fdate))))."'";
  }
  else
  {
    $fdate   = "Null";
  }
  return $fdate;
   
}

}
?>