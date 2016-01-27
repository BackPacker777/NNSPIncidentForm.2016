/*  AUTHOR: hbates@northmen.org
 *  VERSION: 10.06.2015.3.0
 *  CREATED: 12.2012
 *  TODO:
 */

"use strict";

var $day, $month, $year, $weekDay;
var $witnessCounter = -1;
var $cityStateData = [];
var $cityState = [];
var $names = setNames();
var $scenePatrollersSave, $transportingPatrollersSave, $aidRoomPatrollersSave;

function readZipCodes() {
     var $zipCodes = [];
     $.ajax({
          url: 'data/ZipCodeDatabase.csv',
          contentType: "text/csv",
          async: false,
          success: function (text) {
               $zipCodes = text.split("\n");
          }
     });
     return $zipCodes;
}

function setLifts() {
     var $lifts = [];
     $.ajax({
          url: 'data/lifts.csv',
          contentType: "text/csv",
          async: false,
          success: function (text) {
               $lifts = text.split(/\n/);
          }
     });
     return $lifts;
}

function setHills() {
     var $hills = [];
     $.ajax({
          url: 'data/hills.csv',
          contentType: "text/csv",
          async: false,
          success: function (text) {
               $hills = text.split(/\n/);
          }
     });
     $hills.toString();
     return $hills;
}

function setNames() {
     var $lines = [];
     $.ajax({
          url: 'data/patrollers.csv',
          contentType: "text/csv",
          async: false,
          success: function (text) {
               $lines = text.split(/\n/);
          }
     });
     return $lines;
}

function createCityStateData() {
     var $zipCodeData = readZipCodes();
     for (var $i = 0; $i < $zipCodeData.length; $i++) {
          $cityStateData[$i] = $zipCodeData[$i].split(",");
     }
}

function populateCityState($zipCode) {
     var $zipCodeLower = $zipCode.toLowerCase();
     for (var $i = 0; $i < $cityStateData.length; $i++) {
          if ($zipCodeLower === $cityStateData[$i][0]) {
               $cityState[0] = $cityStateData[$i][1];
               $cityState[1] = $cityStateData[$i][2];
          }
     }
}

function loadCityStates($zip) {
     var $actualZip = ($zip + "Zip");
     var $city = ($zip + "City");
     var $state = ($zip + "State");
     document.getElementById($actualZip).onchange = function () {
          populateCityState(document.getElementById($actualZip).value);
          document.getElementById($city).value = $cityState[0];
          document.getElementById($state).value = $cityState[1];
     }
}

function setDate() {
     var $date = new Date();
     $month = $date.getMonth() + 1;
     $day = $date.getDate();
     $year = $date.getFullYear();
     $weekDay = $date.getDay();
     var $fullDate = ($month + "/" + $day + "/" + $year);
     return $fullDate;
}

function setWeekDayString() {
     var $days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
     var $weekDayString = $days[$weekDay];
     return $weekDayString;
}

function removeElement($element) {
     var $div = document.getElementById($element);
     if ($div.firstElementChild) {
          var $removeDiv = $div.firstElementChild;
          $div.removeChild($removeDiv);
     }
}

function setDifficulty($value) {
     var $difficultyList = ["Easier", "More Difficult", "Most Difficult", "Experts Only"];
     document.getElementById("difficulty").value = $difficultyList[$value - 1];
}

function setAge() {
     var $dob = document.getElementById("dob");
     $dob.onchange = function () {
          var $dobString = document.getElementById("dob").value;
          var $birthDate = new Date($dobString);
          var $age = $year - $birthDate.getFullYear();
          var $birthMonth = ($month - $birthDate.getMonth());
          if ($birthMonth < 0 || ($birthMonth === 0 && $day < $birthDate.getDate())) {
               $age--;
          }
          document.getElementById("age").value = $age;
     }
}

function setLocation() {
     var $locations = document.forms[0].elements["location"];
     $locations[0].onclick = function () {
          if ($("#whichLift").length == 0) {
               $("#whichHill").remove();
               loadLifts();
          }
          $("input[name=numTimes][value=lift]", $("#history")).prop("checked", true);
     };
     $locations[1].onclick = function () {
          if ($("#whichHill").length == 0) {
               $("#whichLift").remove();
               loadHills();
          }
          $("input[name=numTimes][value=hill]", $("#history")).prop("checked", true);
     };
     $locations[2].onclick = function () {
          $("#whichHill").remove();
          $("#whichLift").remove();
     };
}

function loadLifts() {
     var $lifts = setLifts();
     var $select = $('<select size="1" class="select" name="whichLift" id="whichLift">').appendTo('#hillLift');
     $select.append('<option value="" disabled selected>CHOOSE LIFT</option>');
     for (var $i = 0; $i < $lifts.length; $i++) {
          $select.append('<option value="' + $lifts[$i] + '">' + $lifts[$i] + '</option>');
     }
     $("#hillLift").append("</select>");
     $("#whichLift").change(liftChangeEvt);
}

function liftChangeEvt(e) {
     var $liftText = $("select[name='whichLift']").find('option:selected').text();
     document.getElementById("liftName").removeAttribute('none');
     document.getElementById("liftName").value = $liftText;
}

function loadHills() {
     var $hills = setHills();
     var $select = $('<select size="1" class="select" name="whichHill" id="whichHill">').appendTo('#hillLift');
     $select.append('<option value="" disabled selected>CHOOSE HILL</option>');
     for (var $i = 0; $i < $hills.length; $i++) {
          var $hillData = $hills[$i].split(',');
          $select.append('<option value="' + $hillData[1] + '">' + $hillData[0] + '</option>');
     }
     $("#hillLift").append("</select>");
     $("#whichHill").change(hillsChangeEvt);
}

function hillsChangeEvt(e) {
     var $hill = $(e.target).val();
     var $hillText = $("select[name='whichHill']").find('option:selected').text();
     document.getElementById("hillName").value = $hillText;
     setDifficulty($hill);
}

function setHelmet() {
     var $helmets = document.forms[0].elements["helmet"];
     var $counter = 0;
     $helmets[0].onclick = function () {
          var $div = document.createElement("div");
          $div.id = "hadHelmet";
          $div.innerHTML = '<span class="label">Helmet area rental?</span><br>' +
               '<input type="radio" class="radio" name="helmetRental" id="helmetRentalYes" value="Yes"><label for="rentalYes">Yes</label>' +
               '<input type="radio" class="radio" name="helmetRental" id="helmetRentalNo" value="No"><label for="rentalNo">No</label>';
          if ($counter < 1) {
               document.getElementById("helmetYes").appendChild($div);
               $counter = 1;
               setHelmetRental();
          }
     };
     $helmets[1].onclick = function () {
          removeElement("helmetYes");
          $counter = 0;
     };
}

function setHelmetRental() {
     var $helmetRent = document.forms[0].elements["helmetRental"];
     var $counter2 = 0;
     $helmetRent[0].onclick = function() {
		 alert("Remember: You must fill out a helmet rental form.");
          var $div2 = document.createElement("div");
          $div2.id = "helmetRental";
          $div2.innerHTML = '<span class="label">Helmet rental number:</span><br>' +
               '<input name="helmetRentalNum" id="helmetRentalNum" type="number" placeholder="Helmet #">';
          if ($counter2 < 1) {
               document.getElementById("helmetRentalYep").appendChild($div2);
               $counter2 = 1;
          }
     };
     $helmetRent[1].onclick = function () {
          removeElement("helmetRentalYep");
          $counter2 = 0;
     };
}

function setVideoYes() {
     var $videoYes = document.forms[0].elements["video"];
     var $counter3 = 0;
     $videoYes[0].onclick = function () {
          var $div2 = document.createElement("div");
          $div2.id = "videoYep";
          $div2.innerHTML = '<span class="label">Name of person with photos:</span><br>' +
               '<input name="videoName" id="videoName" type="text" placeholder="Name">';
          if ($counter3 < 1) {
               document.getElementById("videoYes").appendChild($div2);
               $counter3 = 1;
          }
     };
     $videoYes[1].onclick = function () {
          removeElement("videoYes");
          $counter3 = 0;
     };
}

function setInstructor() {
     var $inst = document.forms[0].elements["inLesson"];
     var $counter = 0;
     $inst[0].onclick = function() {
		  alert("Remember: You must fill out an instructor witness statement form.");
          var $div = document.createElement("div");
          $div.id = "nameInst";
          $div.innerHTML = '<span class="label">Instructor</span><br>' +
               '<input name="instructor" id="instructor" type="text" autofocus placeholder="Instructor">';
          if ($counter < 1) {
               document.getElementById("instYes").appendChild($div);
               $counter = 1;
          }
     };
     $inst[1].onclick = function () {
          removeElement("instYes");
          $counter = 0;
     };
}

function setOther() {
     var $other = document.forms[0].elements["numTimes"];
     var $counter = 0;
     $other[2].onclick = function () {
          var $div = document.createElement("div");
          $div.id = "setOther";
          $div.innerHTML = '<input name="numOther" id="numOther" placeholder="Other Location?" type="text">';
          if ($counter < 1) {
               document.getElementById("otherYes").appendChild($div);
               $counter = 1;
          }
     };
     $other[0].onclick = function () {
          removeElement("otherYes");
          $counter = 0;
     };
     $other[1].onclick = function () {
          removeElement("otherYes");
          $counter = 0;
     };
}

function setEquipOther() {
     document.getElementById("otherEquipYes").style.visibility = "hidden";
     var other = document.forms[0].elements["equipmentType"];
     other[3].onclick = function() {
          document.getElementById("otherEquipYes").style.visibility = "visible";
     };
     other[0].onclick = function() {
          document.getElementById("otherEquipYes").style.visibility = "hidden";
     };
     other[1].onclick = function() {
          document.getElementById("otherEquipYes").style.visibility = "hidden";
     };
     other[2].onclick = function() {
          document.getElementById("otherEquipYes").style.visibility = "hidden";
     };
}

function setDins() {
     document.getElementById("leftToeDin").style.display = "none";
     document.getElementById("leftHeelDin").style.display = "none";
     document.getElementById("rightToeDin").style.display = "none";
     document.getElementById("rightHeelDin").style.display = "none";
     document.getElementById("equipAlpine").addEventListener("click", function() {
          document.getElementById("leftToeDin").style.display = "block";
          document.getElementById("leftHeelDin").style.display = "block";
          document.getElementById("rightToeDin").style.display = "block";
          document.getElementById("rightHeelDin").style.display = "block";
     });
     document.getElementById("equipNordic").addEventListener("click", function() {
          document.getElementById("leftToeDin").style.display = "none";
          document.getElementById("leftHeelDin").style.display = "none";
          document.getElementById("rightToeDin").style.display = "none";
          document.getElementById("rightHeelDin").style.display = "none";
     });
     document.getElementById("equipSnowboard").addEventListener("click", function() {
          document.getElementById("leftToeDin").style.display = "none";
          document.getElementById("leftHeelDin").style.display = "none";
          document.getElementById("rightToeDin").style.display = "none";
          document.getElementById("rightHeelDin").style.display = "none";
     });
     document.getElementById("equipOther").addEventListener("click", function() {
          document.getElementById("leftToeDin").style.display = "none";
          document.getElementById("leftHeelDin").style.display = "none";
          document.getElementById("rightToeDin").style.display = "none";
          document.getElementById("rightHeelDin").style.display = "none";
     });
}

function populateRental($place) {
     if ($place == "nubs") {
          document.getElementById("rentalEquip").innerHTML = '<input id="skiNum" name="skiNum" type="number" placeholder="Ski/Board Number">' +
               '<input id="bootNum" name="bootNum" type="number" placeholder="Boot Number">';
          sessionStorage.setItem('shopName', "Nub's Nob");
          sessionStorage.setItem('shopStreet', "500 Nubs Nob Road");
          sessionStorage.setItem('shopCity', "Harbor Springs");
          sessionStorage.setItem('shopState', "MI");
          sessionStorage.setItem('shopZip', "49740");
     } else {
          document.getElementById("rentalEquip").innerHTML = '<input id="shopName" name="shopName" type="text" placeholder="If rented, shop name">' +
               '<input id="shopStreet" name="shopStreet" type="text" placeholder="Street number">' +
               '<input id="shopZip" name="shopZip" type="number" placeholder="Zip code">' +
               '<input id="skiNum" name="skiNum" type="number" placeholder="Ski/Board Number">' +
               '<input id="bootNum" name="bootNum" type="number" placeholder="Boot Number">';
     }
}

function clearRentalAddress() {
     var $rentalPlaceWrapper = $("#rentalPlace");
     $("input[name=shopName]", $rentalPlaceWrapper).val("");
     $("input[name=shopStreet]", $rentalPlaceWrapper).val("");
     $("input[name=shopCity]", $rentalPlaceWrapper).val("");
     $("input[name=shopZipCode]", $rentalPlaceWrapper).val("");
     $("select[name=shopState]", $rentalPlaceWrapper).val("");
}

function setRental() {
     var $rental = document.forms[0].elements["owner"];
     // Owned
     $rental[0].onclick = function () {
          document.getElementById("rentalEquip").style.display = "none";
     };
     // Area Rental
     $rental[1].onclick = function () {
          document.getElementById("rentalEquip").style.display = "block";
          populateRental("nubs");
          clearRentalAddress();
     };
     // Other Rental
     $rental[2].onclick = function () {
          document.getElementById("rentalEquip").style.display = "block";
          populateRental("other");
          clearRentalAddress();
          loadCityStates("shop");
     };
     // Borrowed
     $rental[3].onclick = function () {
          document.getElementById("rentalEquip").style.display = "none";
     };
     // Demo
     $rental[4].onclick = function() {
          document.getElementById("rentalEquip").style.display = "block";
          populateRental("nubs");
          clearRentalAddress();
     };
}

function loadPatrollers($placePatroller, $counter) {
     var $patrollerLocation = $placePatroller + $counter;
     var $select = $('<select size="1" name="' + $patrollerLocation + '" id="' + $patrollerLocation + '">');
     $select.append('<option value="" disabled selected>CHOOSE PATROLLER</option>');
     for (var $i = 0; $i < $names.length; $i++) {
          $select.append('<option value="' + $names[$i] + '">' + $names[$i] + '</option>');
     }
     if ($placePatroller == "reportCompleter" || $placePatroller == "statementTaker") {
          $select.appendTo('#' + $placePatroller);
     } else {
          $select.appendTo('#' + $placePatroller);
          var $chosePatroller = document.forms[0].elements[$patrollerLocation];
          $chosePatroller.onchange = function(e) {
               if ($placePatroller === "scenePatrollers") {
                    if (undefined != $scenePatrollersSave) {
                         if (document.getElementById("scenePatrollers" + $counter).value === "OTHER") {
                              var otherPatroller1 = prompt("Please enter other patroller name: ");
                              $scenePatrollersSave += otherPatroller1 + "; ";
                              $scenePatrollersSave = $scenePatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         } else {
                              $scenePatrollersSave += document.getElementById("scenePatrollers" + $counter).value + "; ";
                              $scenePatrollersSave = $scenePatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         }
                    } else {
                         if (document.getElementById("scenePatrollers" + $counter).value === "OTHER") {
                             var otherPatroller2 = prompt("Please enter other patroller name: ");
                              $scenePatrollersSave = otherPatroller2 + "; ";
                              $scenePatrollersSave = $scenePatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         } else {
                              $scenePatrollersSave = document.getElementById("scenePatrollers" + $counter).value + "; ";
                              $scenePatrollersSave = $scenePatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         }
                    }
               } else if ($placePatroller === "transportingPatrollers") {
                    if (undefined != $transportingPatrollersSave) {
                         if (document.getElementById("transportingPatrollers" + $counter).value === "OTHER") {
                              var otherPatroller3 = prompt("Please enter other patroller name: ");
                              $transportingPatrollersSave += otherPatroller3 + "; ";
                              $transportingPatrollersSave = $transportingPatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         } else {
                              $transportingPatrollersSave += document.getElementById("transportingPatrollers" + $counter).value + "; ";
                              $transportingPatrollersSave = $transportingPatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         }
                    } else {
                         if (document.getElementById("transportingPatrollers" + $counter).value === "OTHER") {
                              var otherPatroller4 = prompt("Please enter other patroller name: ");
                              $transportingPatrollersSave = otherPatroller4 + "; ";
                              $transportingPatrollersSave = $transportingPatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         } else {
                              $transportingPatrollersSave = document.getElementById("transportingPatrollers" + $counter).value + "; ";
                              $transportingPatrollersSave = $transportingPatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         }
                    }
               } else if ($placePatroller === "aidRoomPatrollers") {
                    if (undefined != $aidRoomPatrollersSave) {
                         if (document.getElementById("aidRoomPatrollers" + $counter).value === "OTHER") {
                              var otherPatroller5 = prompt("Please enter other patroller name: ");
                              $aidRoomPatrollersSave += otherPatroller5 + "; ";
                              $aidRoomPatrollersSave = $aidRoomPatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         } else {
                              $aidRoomPatrollersSave += document.getElementById("aidRoomPatrollers" + $counter).value + "; ";
                              $aidRoomPatrollersSave = $aidRoomPatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         }
                    } else {
                         if (document.getElementById("aidRoomPatrollers" + $counter).value === "OTHER") {
                              var otherPatroller6 = prompt("Please enter other patroller name: ");
                              $aidRoomPatrollersSave = otherPatroller6 + "; ";
                              $aidRoomPatrollersSave = $aidRoomPatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         } else {
                              $aidRoomPatrollersSave = document.getElementById("aidRoomPatrollers" + $counter).value + "; ";
                              $aidRoomPatrollersSave = $aidRoomPatrollersSave.replace(/(\r\n|\n|\r)/gm, "");
                         }
                    }
               }
               $counter++;
               e.target.onchange = function() { };
               $('#' + $placePatroller).append("<input type='none' id='" + $patrollerLocation + "Names' name='" + $placePatroller + "Names' value='" + $(e.target).val() + "' hidden>");
               loadPatrollers($placePatroller, $counter);
          }
     }
}

function handleWitnesses() {
     $witnessCounter++;
     var $div = document.createElement("div");
     $div.className = 'row';
     $div.id = ("witness" + $witnessCounter);
     var $witnessNum = "Witness " + ($witnessCounter + 1);
     $div.innerHTML = '<div class="small-2 columns">'
          + '<label class="radius secondary label">' + $witnessNum + '</label>'
          + '<input name="w' + $witnessCounter + 'LastName" id="w' + $witnessCounter + 'LastName" type="text" placeholder="Last Name">'
          + '</div>'
          + '<div class="small-2 columns">'
          + '<br>'
          + '<input name="w' + $witnessCounter + 'FirstName" id="w' + $witnessCounter + 'FirstName" type="text" placeholder="First Name">'
          + '</div>'
          + '<div class="small-2 columns">'
          + '<br>'
          + '<input name="w' + $witnessCounter + 'HomePhoneNum" id="w' + $witnessCounter + 'HomePhoneNum" type="tel" placeholder="Phone number">'
          + '</div>'
          + '<div class="small-2 columns">'
          + '<br>'
          + '<input name="w' + $witnessCounter + 'CellPhoneNum" id="w' + $witnessCounter + 'CellPhoneNum" type="tel" placeholder="Cell number">'
          + '</div>'
          + '<div class="small-3 columns">'
          + '<br>'
          + '<input name="w' + $witnessCounter + 'Street" id="w' + $witnessCounter + 'Street" type="text" placeholder="Street number">'
          + '</div>'
          + '<div class="small-1 columns">'
          + '<br>'
          + '<input name="w' + $witnessCounter + 'Zip" id="w' + $witnessCounter + 'Zip" type="text" placeholder="Zip" required>'
          + '</div>'
          + '<input name="w' + $witnessCounter + 'City" id="w' + $witnessCounter + 'City" type="none" hidden>'
          + '<input name="w' + $witnessCounter + 'State" id="w' + $witnessCounter + 'State" type="none" hidden>';
     document.getElementById('witness').appendChild($div);
     sessionStorage.setItem('witnessNum', $witnessCounter);
     var $witnessZip = ("w" + $witnessCounter + "Zip");
     var $city = ("w" + $witnessCounter + "City");
     var $state = ("w" + $witnessCounter + "State");

//WITNESSES-------------------------------------------------------------------------------------------------------------
     document.getElementById($witnessZip).onchange = function() {
          populateCityState(document.getElementById($witnessZip).value);
          document.getElementById($city).value = $cityState[0];
          var state = $cityState[1].replace(/(\r\n|\n|\r)/gm, "");
          document.getElementById($state).value = state;
          sessionStorage.setItem("w" + $witnessCounter + "Name", document.getElementById("w" + $witnessCounter + "LastName").value + ", " + document.getElementById("w" + $witnessCounter + "FirstName").value);
          sessionStorage.setItem("w" + $witnessCounter + "Street", document.getElementById("w" + $witnessCounter + "Street").value);
          sessionStorage.setItem("w" + $witnessCounter + "HomePhoneNum", document.getElementById("w" + $witnessCounter + "HomePhoneNum").value);
          sessionStorage.setItem("w" + $witnessCounter + "CellPhoneNum", document.getElementById("w" + $witnessCounter + "CellPhoneNum").value);
          sessionStorage.setItem("w" + $witnessCounter + "CityStateZip", document.getElementById("w" + $witnessCounter + "City").value + ", " + document.getElementById("w" + $witnessCounter + "State").value + " " + document.getElementById("w" + $witnessCounter + "Zip").value);
          sessionStorage.setItem('numWitness', ($witnessCounter + 1));
     };
}

function saveData(event) {
     event.preventDefault();
     //DATE & TIME------------------------------------------------------------------------------------------------------
     sessionStorage.setItem('day', document.getElementById('day').value);
     sessionStorage.setItem('date', document.getElementById('date').value);
     sessionStorage.setItem('incidentTime', document.getElementById('incidentTime').value);

     //INJURED PERSON---------------------------------------------------------------------------------------------------
     sessionStorage.setItem('lastName', document.getElementById('lastName').value);
     sessionStorage.setItem('firstName', document.getElementById('firstName').value);
     if (document.getElementById('genderF').checked) {
          sessionStorage.setItem('gender', document.getElementById('genderF').value);
     } else if (document.getElementById('genderM').checked) {
          sessionStorage.setItem('gender', document.getElementById('genderM').value);
     }
     sessionStorage.setItem('dob', document.getElementById('dob').value);
     sessionStorage.setItem('age', document.getElementById('age').value);
     sessionStorage.setItem('height', document.getElementById('height').value);
     sessionStorage.setItem('weight', document.getElementById('weight').value);
     sessionStorage.setItem('patientStreet', document.getElementById('patientStreet').value);
     sessionStorage.setItem('patientCity', document.getElementById('patientCity').value);
     sessionStorage.setItem('patientState', document.getElementById('patientState').value);
     sessionStorage.setItem('patientZip', document.getElementById('patientZip').value);
     sessionStorage.setItem('email', document.getElementById('email').value);
     sessionStorage.setItem('occupation', document.getElementById('occupation').value);
     sessionStorage.setItem('homePhoneNum', document.getElementById('homePhoneNum').value);
     sessionStorage.setItem('cellPhoneNum', document.getElementById('cellPhoneNum').value);

     //PATIENT HISTORY--------------------------------------------------------------------------------------------------
     sessionStorage.setItem('priorInjury', document.getElementById('priorInjury').value);
     sessionStorage.setItem('yearInjured', document.getElementById('yearInjured').value);
     if (document.getElementById('hiYes').checked) {
          sessionStorage.setItem('hi', document.getElementById('hiYes').value);
     } else if (document.getElementById('hiNo').checked) {
          sessionStorage.setItem('hi', document.getElementById('hiNo').value);
     }
     sessionStorage.setItem('meds', document.getElementById('meds').value);
     sessionStorage.setItem('ticketType', document.getElementById('ticketType').value);
     sessionStorage.setItem('group', document.getElementById('group').value);

     //LOCATION---------------------------------------------------------------------------------------------------------
     if (document.getElementById('locationLift').checked) {
          sessionStorage.setItem('location', document.getElementById('locationLift').value);
          sessionStorage.setItem('locationLift', document.getElementById('locationLift').value);
          sessionStorage.setItem('whichLift', document.getElementById('whichLift').value);
     } else if (document.getElementById('locationHill').checked) {
          sessionStorage.setItem('location', document.getElementById('locationHill').value);
          sessionStorage.setItem('locationHill', document.getElementById('locationHill').value);
          sessionStorage.setItem('whichHill', document.getElementById('hillName').value);
          sessionStorage.setItem('difficulty', document.getElementById('difficulty').value);
     } else if (document.getElementById('locationPremise').checked) {
          sessionStorage.setItem('location', document.getElementById('locationPremise').value);
     }
     sessionStorage.setItem('specificLocation', document.getElementById('specificLocation').value);

     //SKIING HISTORY---------------------------------------------------------------------------------------------------
     if (document.getElementById('abilityBeginner').checked) {
          sessionStorage.setItem('ability', document.getElementById('abilityBeginner').value);
     } else if (document.getElementById('abilityIntermediate').checked) {
          sessionStorage.setItem('ability', document.getElementById('abilityIntermediate').value);
     } else if (document.getElementById('abilityExpert').checked) {
          sessionStorage.setItem('ability', document.getElementById('abilityExpert').value);
     } else {
          sessionStorage.setItem('ability', document.getElementById('abilityNA').value);
     }
     if (document.getElementById('lessonYes').checked) {
          sessionStorage.setItem('inLesson', document.getElementById('lessonYes').value);
          sessionStorage.setItem('instructor', document.getElementById('instructor').value);
     } else if (document.getElementById('lessonNo').checked) {
          sessionStorage.setItem('inLesson', document.getElementById('lessonNo').value);
     }
     if (document.getElementById('timesLift').checked) {
          sessionStorage.setItem('timesWhere', document.getElementById('timesLift').value);
     } else if (document.getElementById('timesHill').checked) {
          sessionStorage.setItem('timesWhere', document.getElementById('timesHill').value);
     } else if (document.getElementById('timesOther').checked) {
          sessionStorage.setItem('timesWhere', document.getElementById('timesOther').value);
          sessionStorage.setItem('setOther', document.getElementById('numOther').value);
     }
     sessionStorage.setItem('numTimesToday', document.getElementById('numTimesToday').value);
     sessionStorage.setItem('numTimesPrior', document.getElementById('numTimesPrior').value);
     if (document.getElementById('removeFall').checked) {
          sessionStorage.setItem('removedBy', document.getElementById('removeFall').value);
     } else if (document.getElementById('removeInjured').checked) {
          sessionStorage.setItem('removedBy', document.getElementById('removeInjured').value);
     } else if (document.getElementById('removePatrol').checked) {
          sessionStorage.setItem('removedBy', document.getElementById('removePatrol').value);
     } else if (document.getElementById('removeOther').checked) {
          sessionStorage.setItem('removedBy', document.getElementById('removeOther').value);
     }

     //EQUIPMENT--------------------------------------------------------------------------------------------------------
     if (document.getElementById('equipAlpine').checked) {
          sessionStorage.setItem('equipType', document.getElementById('equipAlpine').value);
     } else if (document.getElementById('equipNordic').checked) {
          sessionStorage.setItem('equipType', document.getElementById('equipNordic').value);
     } else if (document.getElementById('equipSnowboard').checked) {
          sessionStorage.setItem('equipType', document.getElementById('equipSnowboard').value);
     } else if (document.getElementById('equipOther').checked) {
          sessionStorage.setItem('equipType', document.getElementById('equipOther').value);
          sessionStorage.setItem('otherEquip', document.getElementById('otherEquip').value);
     }
     if (document.getElementById('ownerOwn').checked) {
          sessionStorage.setItem('owner', document.getElementById('ownerOwn').value);
     } else if (document.getElementById('ownerRent').checked) {
          sessionStorage.setItem('owner', document.getElementById('ownerRent').value);
          sessionStorage.setItem('skiNum', document.getElementById('skiNum').value);
          sessionStorage.setItem('bootNum', document.getElementById('bootNum').value);
     } else if (document.getElementById('ownerOther').checked) {
          sessionStorage.setItem('owner', document.getElementById('ownerOther').value);
          sessionStorage.setItem('skiNum', document.getElementById('skiNum').value);
          sessionStorage.setItem('bootNum', document.getElementById('bootNum').value);
          sessionStorage.setItem('shopName', document.getElementById('shopName').value);
          sessionStorage.setItem('shopStreet', document.getElementById('shopStreet').value);
          sessionStorage.setItem('shopCity', document.getElementById('shopCity').value);
          sessionStorage.setItem('shopState', document.getElementById('shopState').value);
          sessionStorage.setItem('shopZip', document.getElementById('shopZip').value);
     } else if (document.getElementById('ownerBorrowed').checked) {
          sessionStorage.setItem('owner', document.getElementById('ownerBorrowed').value);
     } else if (document.getElementById('ownerDemo').checked) {
          sessionStorage.setItem('owner', document.getElementById('ownerDemo').value);
          sessionStorage.setItem('skiNum', document.getElementById('skiNum').value);
          sessionStorage.setItem('bootNum', document.getElementById('bootNum').value);
     }
     sessionStorage.setItem('bindingMake', document.getElementById('bindingMake').value);
     sessionStorage.setItem('bindingModel', document.getElementById('bindingModel').value);
     sessionStorage.setItem('leftDinToe', document.getElementById('leftDinToe').value);
     sessionStorage.setItem('leftDinHeel', document.getElementById('leftDinHeel').value);
     sessionStorage.setItem('rightDinToe', document.getElementById('rightDinToe').value);
     sessionStorage.setItem('rightDinHeel', document.getElementById('rightDinHeel').value);
     if (document.getElementById('helmetY').checked) {
          sessionStorage.setItem('helmet', document.getElementById('helmetY').value);
          if (document.getElementById('helmetRentalYes').checked) {
               sessionStorage.setItem('helmetRental', document.getElementById('helmetRentalYes').value);
               sessionStorage.setItem('helmetNum', document.getElementById('helmetRentalNum').value);
          } else if (document.getElementById('helmetRentalNo').checked) {
               sessionStorage.setItem('helmetRental', document.getElementById('helmetRentalNo').value);
          }
     } else if (document.getElementById('helmetN').checked) {
          sessionStorage.setItem('helmet', document.getElementById('helmetN').value);
     }
     if (document.getElementById('videoY').checked) {
          sessionStorage.setItem('video', document.getElementById('videoY').value);
          sessionStorage.setItem('videoName', document.getElementById('videoName').value);
     } else if (document.getElementById('videoN').checked) {
          sessionStorage.setItem('video', document.getElementById('videoN').value);
     }

     //INCIDENT DESCRIPTION---------------------------------------------------------------------------------------------
     sessionStorage.setItem('incidentDescription', document.getElementById('incidentDescription').value);
     sessionStorage.setItem('statementTaker', document.getElementById('statementTaker0').value);

     //PROBABLE INJURY--------------------------------------------------------------------------------------------------
     var injuryTypeBoxes = "";
     var injuries = document.getElementsByName('injury');
     for (var i = 0; i < injuries.length; i++) {
          if (injuries[i].checked) {
               injuryTypeBoxes += injuries[i].value + ", ";
          }
     }
     sessionStorage.setItem('injuryType', injuryTypeBoxes);
     if (document.getElementById('injuryTypeOther')) {
          sessionStorage.setItem('injuryTypeOther', document.getElementById('injuryTypeOther').value);
     }

     var injuryLocBoxes = "";
     var injuries2 = document.getElementsByName('injuryLoc');
     for (var j = 0; j < injuries2.length; j++) {
          if (injuries2[j].checked) {
               injuryLocBoxes += injuries2[j].value + ", ";
          }
     }
     sessionStorage.setItem('injuryZone', injuryLocBoxes);
     if (document.getElementById('injuryZoneOther')) {
          sessionStorage.setItem('injuryZoneOther', document.getElementById('injuryZoneOther').value);
     }

     //SITE CONDITIONS--------------------------------------------------------------------------------------------------
     var conditionBoxes = "";
     var sceneSurface = document.getElementsByName('sceneSurface');
     for (var k = 0; k < sceneSurface.length; k++) {
          if (sceneSurface[k].checked) {
               conditionBoxes += sceneSurface[k].value + ", ";
          }
     }
     sessionStorage.setItem('sceneSurface', conditionBoxes);
     var visBoxes = "";
     var sceneVis = document.getElementsByName('visibility');
     for (var l = 0; l < sceneVis.length; l++) {
          if (sceneVis[l].checked) {
               visBoxes += sceneVis[l].value + ", ";
          }
     }
     if (document.getElementById('sceneSurfaceOther')) {
          sessionStorage.setItem('sceneSurfaceOther', document.getElementById('sceneSurfaceOther').value);
     }

     sessionStorage.setItem('sceneVisibility', visBoxes);
     if (document.getElementById('temperatureCold').checked) {
          sessionStorage.setItem('temp', document.getElementById('temperatureCold').value);
     } else if (document.getElementById('temperatureMild').checked) {
          sessionStorage.setItem('temp', document.getElementById('temperatureMild').value);
     } else if (document.getElementById('temperatureWarm').checked) {
          sessionStorage.setItem('temp', document.getElementById('temperatureWarm').value);
     }
     if (document.getElementById('windCalm').checked) {
          sessionStorage.setItem('wind', document.getElementById('windCalm').value);
     } else if (document.getElementById('windMod').checked) {
          sessionStorage.setItem('wind', document.getElementById('windMod').value);
     } else if (document.getElementById('windHigh').checked) {
          sessionStorage.setItem('wind', document.getElementById('windHigh').value);
     }

     //FIRST AID RENDERED-----------------------------------------------------------------------------------------------
     sessionStorage.setItem('hillFirstAid', document.getElementById('hillFirstAid').value);
     sessionStorage.setItem('patrolRoomAid', document.getElementById('patrolRoomAid').value);

     if ($scenePatrollersSave) {
          sessionStorage.setItem('scenePatrollers', $scenePatrollersSave);
     }
     if ($transportingPatrollersSave) {
          sessionStorage.setItem('transportingPatrollers', $transportingPatrollersSave);
     }
     if ($aidRoomPatrollersSave) {
          sessionStorage.setItem('aidPatrollers', $aidRoomPatrollersSave);
     }

     //TRANSPORTATION & DESTINATION-------------------------------------------------------------------------------------
     var howArrive = document.getElementsByName('arrival');
     for (var i = 0; i < howArrive.length; i++) {
          if (howArrive[i].checked) {
               sessionStorage.setItem('arrive', howArrive[i].value);
               if (document.getElementById('arrivalOther').checked) {
                    sessionStorage.setItem('arriveOther', document.getElementById('arriveOther').value);
               }
          }
     }
     var howLeave = document.getElementsByName('leave');
     for (var i = 0; i < howLeave.length; i++) {
          if (howLeave[i].checked) {
               sessionStorage.setItem('leave', howLeave[i].value);
          }
     }
     var dest = document.getElementsByName('dest');
     for (var i = 0; i < dest.length; i++) {
          if (dest[i].checked) {
               sessionStorage.setItem('dest', dest[i].value);
               if (document.getElementById('destOther').checked) {
                    sessionStorage.setItem('otherDest', document.getElementById('otherDest').value);
               }
          }
     }

     //REPORT COMPLETER-------------------------------------------------------------------------------------------------
     sessionStorage.setItem('reportCompleter', document.getElementById('reportCompleter0').value);
     sessionStorage.setItem('dateComplete', document.getElementById('dateComplete').value);

     //SUBMIT FORM TO RESULTS-------------------------------------------------------------------------------------------
     window.open('pages/results2016.html', '_self', false);
     //noinspection Eslint
     if (document.getElementById('ownerRent').checked || document.getElementById('ownerDemo').checked) {
          window.open('pages/skiRental.html', '_blank', false);
     }
     return false;

}

function reloadForm() {
	 sessionStorage.clear();
     window.location.reload();
}

window.onload = function () {
     createCityStateData();
     loadCityStates("patient");
     setLocation();
     setAge();
     document.getElementById("dateComplete").value = setDate();
     setHelmet();
     setDins();
     setVideoYes();
     setLocation();
     setInstructor();
     setOther();
     setEquipOther();
     setRental();
     loadPatrollers('scenePatrollers', 0);
     loadPatrollers('transportingPatrollers', 0);
     loadPatrollers('aidRoomPatrollers', 0);
     loadPatrollers('reportCompleter', 0);
     loadPatrollers('statementTaker', 0);
     document.getElementById('addWitness').addEventListener('click', function() {handleWitnesses(0)}, false);
     document.getElementById("date").value = setDate();
     document.getElementById("day").value = setWeekDayString();
     $(document).load().scrollTop(0); //ensure page starts at top
     document.getElementById('form').addEventListener("submit", saveData, false);
     document.getElementById('reset').addEventListener("click", reloadForm, false);
	 document.getElementById('reset1').addEventListener("click", reloadForm, false);
};


/*
 *Helpful URLs:
 *
 *http://stackoverflow.com/questions/6601952/programmatically-create-select-list
 *
 *http://stackoverflow.com/questions/5805059/select-placeholder/5859221#5859221 - 2nd answer!
 *
 *http://stackoverflow.com/questions/3664381/html-force-page-scroll-position-to-top-at-page-refresh/3664406#3664406 - 2nd answer
 *
 *http://stackoverflow.com/questions/629614/how-to-get-the-child-node-in-div-using-javascript
 *
 *http://stackoverflow.com/questions/4641962/getting-an-option-text-value-with-javascript
 *
 *http://www.randomsnippets.com/2008/05/15/how-to-loop-through-checkboxes-or-radio-button-groups-via-javascript
 *
 * http://stackoverflow.com/questions/13298744/looping-through-a-checkbox-array-that-has-one-element
 *
 *
 */
