var dateSpan = document.getElementById('current-date');
var dateSpanLabel = document.getElementById('current-date-label');
var timeSpan = document.getElementById('current-time');


function setTime() {
    var d = new Date();
    timeSpan.textContent = d.toLocaleTimeString();
    setPlanTime();
}


// update value in "countdown-table"
var planTime = document.getElementById("plan-time");
var planTimeSpend = document.getElementById("plan-time-spend");
var planTimeLeft = document.getElementById("plan-time-left");

var freeTime = document.getElementById("free-time");
var freeTimeSpend = document.getElementById("free-time-spend");
var freeTimeLeft = document.getElementById("free-time-left");

function setPlanTime() {
    var sumTimePlan = 0;
    $('#todoTable .timePlan').each(function () {
        sumTimePlan += parseFloat(this.innerText);
    });
    planTime.textContent = sumTimePlan;
    
    var sumPlanTimeSpend = 0;
    var sumFreeTimeSpend = 0;
    $('#todoTable .timeSpend').each(function () {
        if (this.closest("tr").cells[2] > 0)
            sumPlanTimeSpend += parseFloat(this.innerText);
        else
            sumFreeTimeSpend += parseFloat(this.innerText);
    });
    planTimeSpend.textContent = sumPlanTimeSpend;
    freeTimeSpend.textContent = sumFreeTimeSpend;
    planTimeLeft.textContent = parseFloat(planTime.textContent) - parseFloat(planTimeSpend.textContent)

    freeTime.textContent = (24 - startHour - parseFloat(planTime.textContent))

    var t = new Date(2000, 0, 1, 24, 0, 0) - new Date("2000-01-01T" + timeSpan.textContent);
    freeTimeLeft.textContent = Math.floor((t / 1000 / 60 / 60 - sumTimePlan + sumPlanTimeSpend) * 100) / 100;
    if (freeTimeLeft.textContent < 0)
        freeTimeLeft.style.color = "red"
    else
        freeTimeLeft.style.color = "black"
}
 
function getLocalDateToday() {
    var d = new Date();
    var dStr = d.toLocaleDateString();
    return dStr.substring(6) + "-" + dStr.substring(3, 5) + "-" + dStr.substring(0, 2);

}

setTime();
dateSpan.textContent = getLocalDateToday()


function setDateLabel() {
    dateSpanLabel.textContent =  "(T" + 
        (Math.floor((Date.parse(dateSpan.textContent) - Date.parse(getLocalDateToday())) / (1000*60*60*24))) + ")";
}

setInterval(setTime, 1000);
// setInterval(setDateLabel, 1000);

function setCurrentTimeMargin() {
    var t = new Date("2000-01-01T" + timeSpan.textContent) - 
            new Date(2000, 0, 1, startHour, 0, 0)
    tSection = Math.ceil(t / 1000 / 60 / 60 * nSectionPerHour)

    $("*:not(table tr td:nth-child(" + String(tSection + 2) + "))")
        .removeClass('current-time-selection');

    $("table tr td:nth-child(" + String(tSection + 2) + ")")
        .addClass('current-time-selection');

    $(".statusHeader").removeClass('current-time-selection');

}

setInterval(setCurrentTimeMargin, 1000);