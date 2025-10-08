<?php
#####################################################
#                  | Page Info. |                   #
#####################################################
/*	CREATOR : SUMESH T G
	DATE  : 06/07/2008
	PAGE  : database.class.php
	DESC  : Database Abstraction Layer class.
*/
#####################################################

//require_once "db.php";
class database
{
	private 		$mysqli; 
	private 		$HostName;
	private			$UserName;
	private			$Password;
	private			$DatabaseName;
	public			$ErrorInfo;
		 		
	function __construct()
	{
		$this->HostName			=	DB_HOST;
		$this->UserName			=	DB_USER;
		$this->Password			=	DB_PASSWORD;
		$this->DatabaseName		=	DB_NAME;
	}
		
		
	#	The following method establish a connection with the database server and on success return TRUE, on failure return FALSE
	#	On failure ErrorInfo property contains the error information.
	function dbConnect()
	{
		$this->mysqli 	= 	new mysqli($this->HostName, $this->UserName, $this->Password, $this->DatabaseName);
		if(!$this->mysqli) { 
			$this->ErrorInfo	=	mysqli_connect_error();
			return FALSE;
		} else {
			return $this->mysqli;
		}
	} # Close method dbConnect
	
	function dbClose()
	{
		
		$this->mysqli->close();
				
	} # Close method dbClose
	
	# On insert, update it returns TRUE,  and on select it returns result set object
	function setQuery($Query)
	{
		$ExecStatus		=	$this->mysqli->query($Query);
		if($ExecStatus	===	FALSE) {
			$this->ErrorInfo	=	$this->mysqli->error;
			return FALSE;
		} else {
			return $ExecStatus;
		} 
	} # Close method setQuery			
		
		
		
	
	# On Success returns number of records corresponding to the query, else return 0	
	function numberOfRecords($Query)
	{
		$RowCount	=	0;
		$ResultSet	=	$this->mysqli->query($Query);
		if($ResultSet) {
			$RowCount	=	 $ResultSet->num_rows;
			$ResultSet	->	free();
			return $RowCount;
		} else {
			$this->ErrorInfo	=	$this->mysqli->error;
			return $RowCount;
		}
	} # Close numberOfRecords method
	
	
	# Returns an array of rows in the result set
	function readValues($Query)
	{
		$ResultData		=	array();
		$ResultSet		=	$this->mysqli->query($Query);
		
		if($ResultSet) {
			$RowCount		=	$ResultSet->num_rows;
			for($i=0; $i<$RowCount; $i++)
				$ResultData[$i]	=	$ResultSet->fetch_array(); 	
			$ResultSet	->	free();
			return $ResultData;
		} else {
			$this->ErrorInfo	=	$this->mysqli->error;
			return $ResultData;
		}	
	} # Close method readValues
	
	# Return a single row 
	function readValue($Query)
	{
		$ResultData		=	array();
		$ResultSet		=	$this->mysqli->query($Query);
		
		if($ResultSet) {
			$ResultData[0]	=	$ResultSet->fetch_array(); 	
			$ResultSet	->	free();
		
			return $ResultData[0];
			
		} else {
			$this->ErrorInfo	=	$this->mysqli->error;
			return $ResultData;
		}		
	} # Close method readValue

	# Method returns the last insert Id of this connection	
	function getInsertId()
	{
		return $this->mysqli->insert_id;
	}
	
	
	function readField($Query)
	{
		$ResultData		=	array();
		$ResultSet		=	$this->mysqli->query($Query);
		
		if($ResultSet) {
			$ResultData[0]	=	$ResultSet->fetch_array(); 	
			$ResultSet	->	free();
			return $ResultData[0];
		} else {
			$this->ErrorInfo	=	$this->mysqli->error;
			return $ResultData;
		}		
	} # Close method readValue

	# Method to execute Stored Procedures with return value
	function execProc($qry)
	{
		$result	= array();
		$result = $this->mysqli->query($qry);
		if($result) {
			$row = $result->fetch_array();
			return $row;
			$result->free();
		} else { 
			$this->ErrorInfo	=	$this->mysqli->error;
			return $result;
		}
	}
	
	function execProcOne($qry)
	{
		$result	= array();
		$res	= array();
		$result = $this->mysqli->query($qry);
		if($result) {
			while ($row = $result->fetch_array())
			{
				$res[]	= $row;
			}
			return $res;
			$result->free();
		} else { 
			$this->ErrorInfo	=	$this->mysqli->error;
			return $result;
		}
	}
	
	function setProc($Query)
	{
		$ExecStatus		=	$this->mysqli->query($Query);
		if($ExecStatus	===	FALSE) {
			$this->ErrorInfo	=	$this->mysqli->error;
			return FALSE;
		} else {
			return $ExecStatus;
		} 
	}
		
} # Close class definition
?>