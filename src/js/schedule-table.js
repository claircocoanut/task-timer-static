sessionStorage.clear();

var tableSchedule = document.getElementById("todoTable")

$(document).ready(function () {

    var isMouseDown = false;
    var lastTr = -1;

    // background colors
    var $selection = null;

    // remove selection highlight if click elsewhere
    $('*:not(#todoTable)').mousedown(function() {
        $('td').removeClass('highlight-selection');
    })    

    // highlight if select as range
    $('#todoTable').on("mousedown", ".statusCell", function(){
        isMouseDown = true;
        lastTr = $(this).closest('tr').index();
    });

    $('body').on("mouseup", function(){
        isMouseDown = false;
    });

    $("#todoTable").on("mouseover", ".statusCell", function(){
        var ctr = $(this).closest('tr').index();
        lastTr = lastTr === -1 ? ctr : lastTr;
        
        if (isMouseDown)
            if (lastTr === ctr)
                $(this).addClass("highlight-selection");
            
        // lastTr = $(this).closest('tr').index();
    });

    // highlight-selection if click
    $("#todoTable").on("click", ".statusCell", function() {
        $(this).toggleClass('highlight-selection');
        calcTimeSpend(this);
    });

    // add comments if double click
    $("#todoTable").on("dblclick", ".statusCell", function() {
        if ($(this)[0].innerHTML == 1) {
            var comment=prompt('Enter comment here');
            $(this).attr("title", comment);
            if (comment.length > 0)
                $(this).addClass("with-comment");
            else
                $(this).removeClass("with-comment");
            saveTodoStatue();
        }
    });

    // add comments if double click
    $("#todoTable").on("dblclick", ".timePlan", function() {
        var timePlanHour=prompt('Hours planned on task?');
        if (!isNaN(parseFloat(timePlanHour))) {
            $(this)[0].innerHTML = parseFloat(timePlanHour);
            saveTodoStatue();
        }
    });

    // convert highlight-selection -> highlight if press enter
    $('body:not(#newTodoInput)').keypress(function (e) {
        var key = e.which;
        if ($('table td.highlight-selection').length > 0) {
            $selection = $('table td.highlight-selection');
        }

        if (key == 13) {
            if ($selection !== null) {
                // console.log("Change Highlight!")
                $selection.removeClass("highlight-selection");
                var i = $selection[0].innerHTML;
                $selection.each(function() {
                    $(this)[0].innerHTML = 1 - i;
                })
                $selection.css("opacity", 1 - i);
                saveTodoStatue();
                calcTimeSpend($selection[0]);
                $selection = null;
            }
         }
    }); 
    
    // press key and add ToDo
    $('#newTodoInput, #newCategoryInput').keyup(function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            // console.log("ADD TODO!")
            addTodo();
        }
    }); 
});


function addRowTable(newVal) {
    var newRow = tableSchedule.insertRow(tableSchedule.rows.length);
    var delButton = document.createElement("button");

    // C0: button to delete row
    delButton.innerText = "✕";
    delButton.onclick = function(e) {
        if (confirm('Remove "' + newVal.name + '"?')) {
            $(this).closest('tr').remove();
            saveTodoStatue();
        }
    };
    newRow.insertCell(0).append(delButton);

    // C1: Task row
    var taskCell = newRow.insertCell(1);
    taskCell.innerHTML = newVal.name;
    taskCell.setAttribute("title", newVal.category);
    taskCell.style.backgroundColor = taskType[newVal.category].replace(')', ', 0.1)');
    taskCell.className = "taskCell";

    // C2,3: Schedule Hour
    var timePlan = newRow.insertCell(2);
    timePlan.className = "timePlan";
    timePlan.style.textAlign = "center";
    if ("timePlan" in newVal) 
        timePlan.innerHTML = newVal.timePlan;
    else 
        timePlan.innerHTML = 0;
    var timeSpend = newRow.insertCell(3);
    timeSpend.className = "timeSpend";
    timeSpend.style.textAlign = "center";

    // C4+: Progress bar
    for (var col = 0; col < nSection; col++) {
        var cells = newRow.insertCell(col + 4);
        cells.innerHTML = newVal.progress[col];

        // add cell comments
        if (col in newVal.comments) {
            cells.setAttribute("title", newVal.comments[col]);
            cells.style.border = "2px solid";
            cells.style.borderColor = "blue";
        }

        cells.style.opacity = newVal.progress[col];
        cells.style.backgroundColor = taskType[newVal.category];
        cells.className = "statusCell";
    }
    calcTimeSpend(newRow);
}

function calcTimeSpend(e) {
    var rowSelect = e.closest("tr");
    var countTime = 0;
    for (var i = 0; i < nSection; i++) {
        countTime += parseInt(rowSelect.cells[i+4].innerHTML);
    }
    rowSelect.cells[3].innerHTML = countTime / nSectionPerHour;

    // If timePlan > timeSpend = red 
    var nTiemPlan = parseFloat(rowSelect.cells[2].innerHTML)
    if (nTiemPlan > countTime / nSectionPerHour)
        rowSelect.cells[3].style.color = "red"
    else if ((0 < nTiemPlan) & (nTiemPlan < (countTime / nSectionPerHour - 1)))
        rowSelect.cells[3].style.color = "blue"  
}


function createTable(todo) {

    $("#todoTable tr").remove(); 
    var todo = JSON.parse(sessionStorage.getItem("todo-" + dateSpan.textContent));

    for(var i = 0; i < todo.length; i++) {
        addRowTable(todo[i]);
    }

    var header = tableSchedule.createTHead();
    var headerRow = header.insertRow(0);
    
    headerRow.insertCell(0).style.width = '25px';

    // C1: Task Header
    var taskHeader = headerRow.insertCell(1);
    taskHeader.innerHTML = "Task";
    taskHeader.style.width = '300px';
    taskHeader.style.fontWeight = '900';
    taskHeader.className = "taskCell";

    // C2,3: Time Countdown Header
    var timePlan = headerRow.insertCell(2);
    timePlan.innerHTML = "Plan";
    timePlan.style.textAlign = "center";
    timePlan.style.width = '50px';

    var timeSpend = headerRow.insertCell(3);
    timeSpend.innerHTML = "Actual";
    timeSpend.style.textAlign = "center";
    timeSpend.style.width = '50px';

    // C4+: Progress Header 
    for (var col = 0; col < nSection; col++) {
        if (col % nSectionPerHour == 0) {
            var cells = headerRow.insertCell(col / nSectionPerHour + 4);
            cells.style.width = '45px';
            cells.style.fontWeight = '900';
            cells.innerHTML = String(col / nSectionPerHour + startHour);
            cells.colSpan = nSectionPerHour;
            cells.className = "statusHeader";
        }
    }
    setCurrentTimeMargin();
}

function addTodo() {
    var newTodoItem = document.getElementById('newTodoInput').value;
    var newTodoCat = document.getElementById('newCategoryInput').value;
    var todo = JSON.parse(sessionStorage.getItem("todo-" + dateSpan.textContent));

    // console.log("addTodo - before add");
    // console.log(todo);

    if (newTodoItem.length > 0) 
        if (newTodoCat.length > 0)
            if (newTodoCat in taskType) {
                    var newTodoObj = {
                        "name": newTodoItem,
                        "category": newTodoCat,
                        "progress": Array(nSection).fill(0),
                        "comments": {}
                    };
                    todo.push(newTodoObj);  
                    addRowTable(newTodoObj);

                    // console.log("saveTodo - after add");
                    // console.log(todo);
                    saveTodoFile(todo);
                }
            else {alert("Can't find [" + newTodoCat + "] from category.json!");}
        else {alert("Must input Category!");}
    else {alert("Must input new todo item!");}
}

// save status to sesssionStorage & JSON
function saveTodoStatue() {

    var allTodo = []

    if (tableSchedule.rows.length > 1) {
        for (var r = 1; r < tableSchedule.rows.length; r++) {
            var thisTodo = {}
            thisTodo.name = tableSchedule.rows[r].cells[1].innerHTML;
            thisTodo.category = tableSchedule.rows[r].cells[1].getAttribute("title");
            thisTodo.timePlan = tableSchedule.rows[r].cells[2].innerHTML;

            var thisProgress = [];
            var thisComment = {};
            for (var c = 0; c < nSection; c++) {
                thisProgress.push(tableSchedule.rows[r].cells[c+4].innerHTML);
                var thisTitle = tableSchedule.rows[r].cells[c+4].getAttribute("title");
                if (thisTitle) {
                    // console.log(thisTitle);
                    thisComment[c] = thisTitle;
                }
            }
            thisTodo.progress = thisProgress;
            thisTodo.comments = thisComment;
            allTodo.push(thisTodo);
        }
        // console.log("saveTodoStatue");
        // console.log(allTodo);
        saveTodoFile(allTodo);
    }
    else {
        saveTodoFile();
    }
}

// setInterval(saveTodoStatue, 600000);

function loadLocalTodo() {

    // if (!(("todo-" + dateSpan.textContent) in sessionStorage)) {
    $.getJSON("../data/todo-"  + dateSpan.textContent + ".json")
    .done(function(json) {
        sessionStorage.setItem("todo-" + dateSpan.textContent, JSON.stringify(json));
        createTable();
    })
    .fail(function() {
        saveTodoFile();
        createTable();
    });
    // }
}


// Switch to last/next date for review
function switchDate(step) {
    var toDate = Date.parse(dateSpan.textContent) + step*1000*60*60*24;
    dateSpan.textContent = new Date(toDate).toISOString().substring(0, 10);
    setDateLabel();
    loadLocalTodo();
}

switchDate(0);
  

// save todo to local JSON
function saveTodoFile(data){

    var fileName = "todo-" + dateSpan.textContent

    // console.log("saveTodoFile");
    // console.log(data);

    if (data != null)
        jsonString = JSON.stringify(data);
    else {
        jsonString = "[]"
        alert("Overwrite with []");
    }

    sessionStorage.setItem(fileName, jsonString);

    $.ajax({
      url: '../saveFile.php',
      data : {'fileName': fileName,
              'jsonString': jsonString},
      type: 'POST'
    });
}

// setInterval(saveTodoFile, 1000);
