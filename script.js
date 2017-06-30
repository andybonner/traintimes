// specify globals for the benefit of ESLint
/* global $, firebase, moment */

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBypclwUAe-PreKQtB2qekbgsF6km5Xfvg",
  authDomain: "traintimes-71265.firebaseapp.com",
  databaseURL: "https://traintimes-71265.firebaseio.com",
  projectId: "traintimes-71265",
  storageBucket: "",
  messagingSenderId: "219479184128"
};
firebase.initializeApp(config);

var database = firebase.database();

var backgroundCount = 0;
var backgrounds = ["#efebe9", 
"#efebe9 url('images/golden_rail.jpg') no-repeat center/cover", 
"#efebe9 url('images/misty_rail.jpg') no-repeat center/cover"];

var trainArray = [
  {
    name: "Hogwarts Express",
    destination: "Hogsmeade",
    frequency: 87658,
    firstDay: "09 01 2017",
    firstTime: "1100"
  },
  {
    name: "Polar Express",
    destination: "N. Pole",
    frequency: 525600,
    firstDay: "12 24 2017",
    firstTime: "2355"
  },
  {
    name: "Orient Express",
    destination: "Istanbul",
    frequency: 525600,
    firstDay: "",
    firstTime: "2355"
  },
];


/*
pseudocode for calculating times

take user input and convert to 24-hr
get current time
calculate all the departure times for the day (store in local array--or in Firebase array?)
check for first departure time which is after current time
*/

function buildRow(obj) {
  console.log("object received as", obj)
  var newRow = $("<tr>");
  function addTd(key) {
    var newTd = $("<td>");
    newTd.text(obj[key]);
    newRow.append(newTd);
  }
  addTd("name");
  addTd("destination");
  addTd("frequency");
  var start;
  if (obj.firstDay !== "") {
    start = moment(obj.firstDay, "D MMM, YYYY");
  } else {
    start = moment(obj.firstTime, "HH:mm");
  }
  // if first departure is in future, name it in Next Arrival and simply subtract for Min Away
  // if in past, add multiples of frequency until we reach a time later than present;
  // then name and subtract
  addTd("firstTime"); //IMPORTANT: remove; for testing only
  // delete below
  var testTd = $("<td>");
  testTd.text("4");
  newRow.append(testTd);
  $("#table-body").append(newRow);
}

$("#background").click(function (e) { 
  e.preventDefault();
  // iterate repeatedly
  if (backgroundCount < backgrounds.length - 1) {
   backgroundCount++; 
  } else {
    backgroundCount = 0;
  }
  // card background to white on solid body background; otherwise rgba
  if (backgroundCount === 0) {
    $(".card").css("background-color", "");
  } else {
    $(".card").css("background-color", "rgba(255, 255, 255, 0.8)");
  }
  // set body background from array
  $("body").css("background", backgrounds[backgroundCount]);
});

// initialize Material's dropdown selector
$(document).ready(function() {
    $('select').material_select();
});

$("#daily").on("change", function () {
  $("#datePick").toggle(200);
  if ($(this).is(':checked')) {
    $("#optionDay").attr("disabled", "");
    $(".lessThanDay").removeAttr("disabled");
    $("#timeVal").material_select();
  } else {
    $("#optionDay").removeAttr("disabled");
    $(".lessThanDay").attr("disabled", "");
    $("#timeVal").material_select();
  }
});

// initialize datepicker
$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 2 // Creates a dropdown of 2 years to control year
});

// initialize timepicker
$('.timepicker').pickatime({
    default: 'now', // Set default time
    fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
    twelvehour: false, // Use AM/PM or 24-hour format
    donetext: 'OK', // text for done-button
    cleartext: 'Clear', // text for clear-button
    canceltext: 'Cancel', // Text for cancel-button
    autoclose: false, // automatic close timepicker
    ampmclickable: true, // make AM PM clickable
    aftershow: function(){} //Function for after opening timepicker  
  });


$("#add-form").submit(function (e) {
  e.preventDefault();
  var dataObj = {};
  dataObj.name = $("#name").val();
  dataObj.destination = $("#destination").val();
  var frequencyVal = $("#frequency").val();
  switch ($("#timeVal").val()) {
    case "min":
      dataObj.frequency = frequencyVal;
      break;
    case "hr":
      dataObj.frequency = frequencyVal * 60;
      break;
    case "day":
      dataObj.frequency = frequencyVal * 60 * 24;
      break;
    default:
      break;
  }
  dataObj.firstDay = $("#firstDay").val();
  dataObj.firstTime = $("#firstTime").val();
  database.ref().push(dataObj);
});

database.ref().on("child_added", function(snapshot){
  console.log(snapshot.key, snapshot.val());
  buildRow(snapshot.val());
});