<?php

	class settings{
	
		public $info;
		private $domain;
		private $xml = 'http://phpwebsites.in/sweb/sweb.xml';
		
		
		public function __construct($_domain=null){
			if($_domain != null):
				$this->domain = $_domain;
				$this->loadFile();
			endif;
		}
		
		
		public function loadFile(){
			try{
				$xml = @simplexml_load_file($this->xml);
				if ($xml === false) {
				 	$mbn = "error";
				}
				else
				{
					$this->info = $xml->{$this->domain};
				}
			} catch(Exception $e){
				//$err = $e->getMessage();
			}
		}
	
	}

?>
