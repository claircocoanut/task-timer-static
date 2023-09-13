
console.log(Object.keys(localStorage));

function downloadLocalStorage() {
    
    var data = JSON.stringify(localStorage);
    var a = document.createElement("a");
    var file = new Blob([data], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'localStorageBackup.txt';
    a.click();

    return JSON.parse(data);
}


// set backup button details
var localStorageUsage = JSON.stringify(localStorage).length / 1024;

document.getElementById('download-local-storage').innerHTML = 
    "Backup (localStorage = " + String(Math.ceil(localStorageUsage)) + "k)"


// bcakup if localStorage almost full
if (localStorageUsage > 5000) {
    alert("localStorage almost full! Backup to /Download Folder. ");

    var storeKeys = Object.keys(localStorage);

    // download backup to local text file
    data = downloadLocalStorage();

    // clear
    localStorage.clear();

    // restore last 10 day TODO
    for (i = 0; i < storeKeys.length; i++) {
        if (storeKeys[i].startsWith("todo")) 
            var todoDate = storeKeys[i].substring(storeKeys[i].length - 10);
            if ((new Date() - Date.parse(todoDate)) < 1000*60*60*24*10) {
                localStorage.setItem(storeKeys[i], data[storeKeys[i]]);
            }
    }
}
