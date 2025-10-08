<?php
#####################################################
#                  | Page Info. |                   #
#####################################################
/*	PAGE  : general.class.php
	DESC  : Class contains functions based on 
			insrt,update,select,delete opertions.
*/
#####################################################
include_once "rest.class.php";
#[AllowDynamicProperties]

class api
{
			function __construct()
			{
				$this->now		= date("Y-m-d");
				$this->date		= date("Y-m-d H:i:s");
				$this->rest		= new rest();
			
			}
			
			function __destruct()
			{
				
			}
			
			function processApi(){
				
			$func = strtolower(trim(str_replace("/","",$_REQUEST['rquest'])));
			if((int)method_exists($this->rest,$func) > 0)
				$this->rest->$func();
			else
				$this->rest->response('',404);				// If the method not exist with in this class, response would be "Page not found".
		    }
			
			function json($data){
			if(is_array($data)){
				return json_encode($data);
			}
			
			
		}
		
		function valide_method($m)
			{
				// Cross validation if the request method is POST else it will return "Not Acceptable" status
					if($this->rest->get_request_method() != $m){
						$this->rest->response('',406);
					}
			}
			
		    function valide_key($key)
			{
				
				
				/*if(!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) || $_SERVER['PHP_AUTH_USER'] !== HEAD_USER || $_SERVER['PHP_AUTH_PW'] !== HEAD_PASS) {
 
					header("WWW-Authenticate: Basic realm=\"Secure Page\"");
					header("HTTP\ 1.0 401 Unauthorized");
					//echo '401 Unauthorized';
					return false;
				}*/
			//	echo SECRET_USER;
				//echo SECRET_PWD;exit;
				
				//echo $_SERVER['PHP_AUTH_USER'];
				
				//echo $_SERVER['PHP_AUTH_PW'];
				//exit;
				
				//echo SECRET_KEY;
				//echo $key;
				//exit;
				
					if($_SERVER['PHP_AUTH_USER']==SECRET_USER && $_SERVER['PHP_AUTH_PW']==SECRET_PWD)
					{
					
					   if($key=="" || SECRET_KEY!=$key)
						{
							return false;
						}
						else
						{
						 
							return true;
						}
						
					}
					else
					{
					   return false;
					}

					
			}

}
?>