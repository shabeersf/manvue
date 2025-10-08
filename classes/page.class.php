<?php
define("PG_DEFAULT",    0);
define("PG_NUMBERED",   1);

class page {

    var $pageSize;
    var $pageVar;
    var $count;
    var $noOfPages;
    var $currPage;
    var $dispString;
    var $dispType;
    var $pageLink;
	var	$aclass;
	var $pclass;
	var $nolinkclass;
	var $Isfunction;
	var $functionName;

    function __construct($count, $pageSize = '2', $noOfPages = '15', $currPage = '1',
                    $dispType = '1', $pageVar = "page") {

        $this->pageSize         = $pageSize;
        $this->noOfPages        = $noOfPages;
        $this->count            = $count;
        $this->currPage         = $currPage;
        $this->dispType         = $dispType;
        $this->pageVar          = $pageVar;
        $this->dispString       = "";
		$this->aclass			= "";
		$this->pclass			= "";
		$this->nolinkclass  	= "class=base_text";
		$this->Isfunction = false;
		$this->functionName = "";
    }

    function setCount($count){
        $this->count    = $count;
    }

    function setNoOfPages($noOfPages){
        $this->noOfPages    = $noOfPages;
    }

    function pageSize($pageSize){
        $this->pageSize    = $pageSize;
    }

    function setCurrPage($currPage){
        $this->currPage    = $currPage;
    }

    function setPageVar($pageVar){
        $this->pageVar    = $pageVar;
    }

    function setDispType($dispType) {
        $this->dispType     = $dispType;
    }

	function setDispString()
	{
        $this->dispString       = "";
	}
	
    function setPageLink($array, $level = 1, $URL = "", $aclass="", $pclass="",$nolinkclass="")
    {
		if ($aclass <> "")
			$this->aclass	= " class=$aclass";
		if ($pclass <> "")			
			$this->pclass	= " class=$pclass";
		if ($nolinkclass <> "")	
			$this->nolinkclass  = "class=$nolinkclass";
        $index      = '0';
        if ($URL <> "") {
            if (count($array) >= 1 AND !is_null($array))
                $this->pageLink     = $URL. "?";
            else
                $this->pageLink     = $URL. "?1";
        }

        foreach ($array as $key => $value) {

            if ($key <> $this->pageVar) {

                if (is_array($value)) {
                    foreach ($value as $keys => $values) {
                        if ($index > '0')
                            $this->pageLink     .= "&";
    //                    $this -> makePageLink ($value, 1);
                        if ($level == 2) {
                            $this->pageLink     .= $key."[]=" . $values;
                        } else {
                            $this->pageLink     .= $key."=" . $values;
                        }
                    }

                } else {

                    if ($index > '0')
                        $this->pageLink     .= "&";
//                    if ($level == 2)
//                        $this->pageLink     .= $key."[]=" . $value;
//                    else
                        $this->pageLink     .= $key."=" . $value;
                }

            } else {
                $this->pageLink     .= "[>page<]";
            }
            $index++;
        }
    }

    function setPageNo()
    {
        $maxPages  = ceil($this->count/$this->pageSize);
        $start     = ($this->currPage - $this->noOfPages) <= 0          ?   "1"           :
                             ($this->currPage - $this->noOfPages);
        $end       = ($this->currPage + $this->noOfPages) >= $maxPages  ?   $maxPages     :
                             ($this->currPage + $this->noOfPages);
        $prev      = ($this->currPage - 1) <= 0                         ?   "0"           :
                             ($this->currPage - 1);
        $next      = ($this->currPage + 1) > $maxPages                  ?   $maxPages + 1 :
                             ($this->currPage + 1);

        if ($this->dispType == 'PG_NUMBERED') {

            If ($prev >= 1)
                $this->dispString = $this->dispString.
       				"<a href = '$this->pageLink&$this->pageVar=$start' $this->pclass> &laquo;</a> <a href = '$this->pageLink&$this->pageVar=$prev' $this->pclass> Prev </a>";
            Else
                $this->dispString = $this->dispString."  ";
            For ($indexNo=$start; $indexNo <= $end; $indexNo++) 
                If ($indexNo <> $this->currPage)
                    $this->dispString = $this->dispString.
                        " <a href = '$this->pageLink&$this->pageVar=$indexNo' $this->aclass>$indexNo</a> ";
                Else
                    $this->dispString = $this->dispString." <a href=# $this->pclass style='cursor:text' title='Current Page'>$indexNo</a> ";
            If ($next > $maxPages)
                $this->dispString = $this->dispString."  ";
            Else
                $this->dispString = $this->dispString.
                    " <a href = '$this->pageLink&$this->pageVar=$next' $this->pclass>Next</a> <a href = '$this->pageLink&$this->pageVar=$maxPages' $this->pclass>&raquo;</a> ";

        } 
		 elseif ($this->dispType == 'PG_BOOSTRAP') {
             
			$this->dispString = $this->dispString."<ul class='pagination'>";
            If ($prev >= 1)
                $this->dispString = $this->dispString.
       				"<li><a href = '$this->pageLink&$this->pageVar=$start' $this->pclass> &laquo;</a> <a href = '$this->pageLink&$this->pageVar=$prev' $this->pclass> Prev </a></li>";
            Else
                $this->dispString = $this->dispString."  ";
            For ($indexNo=$start; $indexNo <= $end; $indexNo++) 
                If ($indexNo <> $this->currPage)
                    $this->dispString = $this->dispString.
                        "<li $this->aclass ><a href = '$this->pageLink&$this->pageVar=$indexNo' $this->aclass>$indexNo</a></li>";
                Else
                    $this->dispString = $this->dispString."<li $this->pclass  ><a href=# $this->pclass style='cursor:text' title='Current Page'>$indexNo</a></li>";
            If ($next > $maxPages)
                $this->dispString = $this->dispString."  ";
            Else
                $this->dispString = $this->dispString.
                    "<li><a href = '$this->pageLink&$this->pageVar=$next' $this->pclass>Next</a> <a href = '$this->pageLink&$this->pageVar=$maxPages' $this->pclass>&raquo;</a></li>";
            
			$this->dispString = $this->dispString."</ul>";
			
        } 
		else {

            if ($this->currPage > 1)
                $this->dispString = $this->dispString.
                    " <a href = '$this->pageLink&$this->pageVar=$start' $this->pclass>First</a> "." ||";
            else
                $this->dispString = $this->dispString." <a href=# $this->nolinkclass style='cursor:text' title='First Page'>First</a> || ";

            If ($prev >= 1)
                $this->dispString = $this->dispString.
                    " <a href = '$this->pageLink&$this->pageVar=$prev' $this->pclass>Prev</a> "." ||";
            Else
                $this->dispString = $this->dispString."  || ";

            If ($next > $maxPages)
                $this->dispString = $this->dispString."  || ";
            Else
                $this->dispString = $this->dispString.
                    " <a href = '$this->pageLink&$this->pageVar=$next' $this->pclass>Next</a> "." ||";

            if ($this->currPage < $maxPages)
                $this->dispString = $this->dispString.
                    " <a href = '$this->pageLink&$this->pageVar=$maxPages' $this->pclass>Last</a> ";
            else
                $this->dispString = $this->dispString." <a href=# $this->nolinkclass style='cursor:text' title='Last Page'>Last</a> ";

        }
        return $this->dispString;
    }
    function setFunctionPageNo()
    {
        $maxPages  = ceil($this->count/$this->pageSize);
        $start     = ($this->currPage - $this->noOfPages) <= 0          ?   "1"           :
                             ($this->currPage - $this->noOfPages);
        $end       = ($this->currPage + $this->noOfPages) >= $maxPages  ?   $maxPages     :
                             ($this->currPage + $this->noOfPages);
        $prev      = ($this->currPage - 1) <= 0                         ?   "0"           :
                             ($this->currPage - 1);
        $next      = ($this->currPage + 1) > $maxPages                  ?   $maxPages + 1 :
                             ($this->currPage + 1);

        if ($this->dispType == PG_NUMBERED) {

            If ($prev >= 1)
                $this->dispString = $this->dispString." <a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$start\")' $this->pclass title='First'>&laquo;</a>&nbsp;<a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$prev\")' $this->pclass> Prev </a>";
            Else
                $this->dispString = $this->dispString."  ";
            For ($indexNo=$start; $indexNo <= $end; $indexNo++) 
                If ($indexNo <> $this->currPage)
                    $this->dispString = $this->dispString.
                        " <a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$indexNo\")' $this->aclass>$indexNo</a> ";
				Else
                    $this->dispString = $this->dispString." <a href=# $this->pclass style='cursor:text' title='Current Page'>$indexNo</a> ";
            If ($next > $maxPages)
                $this->dispString = $this->dispString."  ";
            Else
                $this->dispString = $this->dispString.
                    " <a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$next\")' $this->pclass>Next</a>&nbsp; <a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$maxPages\")' $this->pclass title='Last'>&raquo;</a>  ";

        } 
		elseif ($this->dispType == PG_BOOSTRAP) {
		
		$this->dispString = $this->dispString."<ul class='pagination'>";
     		If ($prev >= 1)
                $this->dispString = $this->dispString."<li><a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$start\")' $this->pclass title='First'>&laquo;</a>&nbsp;<a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$prev\")' $this->pclass> Prev </a></li>";
            Else
                $this->dispString = $this->dispString."  ";
            For ($indexNo=$start; $indexNo <= $end; $indexNo++) 
                If ($indexNo <> $this->currPage)
                    $this->dispString = $this->dispString.
                        "<li $this->aclass><a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$indexNo\")' $this->aclass>$indexNo</a></li>";
				Else
                    $this->dispString = $this->dispString."<li $this->pclass><a href=# $this->pclass style='cursor:text' title='Current Page'>$indexNo</a></li>";
            If ($next > $maxPages)
                $this->dispString = $this->dispString."  ";
            Else
                $this->dispString = $this->dispString.
                    "<li><a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$next\")' $this->pclass>Next</a>&nbsp; <a href = 'javascript:$this->functionName(\"$this->pageLink&$this->pageVar=$maxPages\")' $this->pclass title='Last'>&raquo;</a></li>";
		$this->dispString = $this->dispString."</ul>";
		}
		else {

            if ($this->currPage > 1)
                $this->dispString = $this->dispString.
                    " <a href = '$this->pageLink&$this->pageVar=$start' $this->pclass>First</a> "." ||";
            else
                $this->dispString = $this->dispString." <a href=# $this->nolinkclass style='cursor:text' title='First Page'>First</a> || ";

            If ($prev >= 1)
                $this->dispString = $this->dispString.
                    " <a href = '$this->pageLink&$this->pageVar=$prev' $this->pclass>Prev</a> "." ||";
            Else
                $this->dispString = $this->dispString."  || ";

            If ($next > $maxPages)
                $this->dispString = $this->dispString."  || ";
            Else
                $this->dispString = $this->dispString.
                    " <a href = '$this->pageLink&$this->pageVar=$next' $this->pclass>Next</a> "." ||";

            if ($this->currPage <$maxPages)
                $this->dispString = $this->dispString.
                    " <a href = '$this->pageLink&$this->pageVar=$maxPages' $this->pclass>Last</a> ";
            else
                $this->dispString = $this->dispString." <a href=# $this->nolinkclass style='cursor:text' title='Last Page'>Last</a> ";

        }
        return $this->dispString;
    }
	function make($array, $level, $URL, $aclass, $pclass)
    {
        $this->setPageLink($array, $level, $URL, $aclass, $pclass);
		if($this->Isfunction==true)
			$this->setFunctionPageNo();
		else
	        $this->setPageNo();
        return '<div>'.$this->dispString.'</div>';
    }

    function show($array, $level = 1, $URL = "", $aclass="", $pclass="")
    {
        echo $this->make($array, $level, $URL, $aclass, $pclass);
    }

    function get($array, $level = 1, $URL = "", $aclass="", $pclass="")
    {
        return $this->make($array, $level, $URL, $aclass, $pclass);
    }

}
?>