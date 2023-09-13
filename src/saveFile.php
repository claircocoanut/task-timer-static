<?php
    $data = $_POST['jsonString'];
    $fileName = $_POST['fileName'];
    
    //set mode of file to writable.
    chmod("./data/" . $fileName . ".json",0777);
    $f = fopen("./data/" . $fileName . ".json", "w+") or die("fopen failed");
    fwrite($f, $data);
    fclose($f);
?>