//Searches for the table of professor options on the BYU registration page
var table = document.getElementById("sectionStartHeader");
var className = "";
if (table != null) {
    var myurl = "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=2&wt=json&q=";
    var newCell;
    var columnValue = 0;
    var found = false;
    var classDiv = document.getElementsByClassName("tableTabBody");
    var classDescription = classDiv[0].children[0].innerText;
    className = classDescription.substr(0, classDescription.indexOf('-')); 
    className = className.replace(/\s+/g, '');
    for (var i = 0, row; row = table.rows[i]; i++) {
        if (i == 0) {
            var ratingCell = row.insertCell(row.length);
            ratingCell.innerHTML = "Rating";
            ratingCell.style.fontWeight = "300";
            ratingCell.style.fontSize = "12px";
            ratingCell.style.backgroundColor = "#eff6fc";
        } else {
            var newCell = row.insertCell(row.length);
        }
        for (var j = 0, col; col = row.cells[j]; j++) {
            if (found && j == columnValue) {
                var professor = col.innerText;
                if (professor.indexOf(',') >= 0) {
                    var fullName = col.innerText;
                    var splitName = fullName.split(/, | /);
                    var lastName = splitName[0];
                    var firstName = splitName[1];
                    if (splitName.length > 2) {
                        var middleName = splitName[2];
                        middleName = middleName.toLowerCase();
                    }
                    lastName = lastName.toLowerCase();
                    lastName = lastName.trim();
                    firstName = firstName.toLowerCase();
                    myurl1 = myurl + firstName + "+" + lastName + "+AND+schoolid_s%3A135";
                    var runAgain = true;
                    //Query Rate My Professor with the professor's name
                    GetProfessorRating(myurl1, newCell, splitName, firstName, middleName, runAgain);
                }
            }
            if (col.innerHTML == "Instructor") {
                columnValue = j;
                found = true;
            }
        }
    }
}

function GetProfessorRating(myurl1, newCell, splitName, firstName, middleName, runAgain) {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", myurl1, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            console.log(xhr.responseText);
            var resp = JSON.parse(xhr.responseText);
            
            var numFound = resp.response.numFound;
            //Add professor data if found
            if (numFound > 0) {
                var profID = resp.response.docs[0].pk_id;
                var realFirstName = resp.response.docs[0].teacherfirstname_t;
                var realLastName = resp.response.docs[0].teacherlastname_t;
                var profRating = resp.response.docs[0].averageratingscore_rf;
                if(profRating != undefined) {
                var profURL = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + profID;
                var link = "<a href=\"" + profURL + "\" target=\"_blank\">" + profRating + "</a>";
                newCell.innerHTML = link;
                var allprofRatingsURL = "https://www.ratemyprofessors.com/paginate/professors/ratings?tid=" + profID + "&page=0&max=20";
                AddTooltip(newCell, allprofRatingsURL, realFirstName, realLastName);
            } else {
                newCell.innerHTML = "N/A";
            }
            } else {
                newCell.innerHTML = "N/A";
            }
            //Try again with professor's middle name if it didn't work the first time
            if (newCell.innerHTML == "N/A" && splitName.length > 2 && runAgain) {
                firstName = middleName;
                myurl1 = myurl + firstName + "+" + lastName + "+AND+schoolid_s%3A135";
                runAgain = false;
                GetProfessorRating(myurl1, newCell, splitName, firstName, middleName, runAgain);
            }
        }

    }
    xhr.send();
}

function AddTooltip(newCell, allprofRatingsURL, realFirstName, realLastName) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", allprofRatingsURL, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);
            //Build content for professor tooltip
            var easyRating = 0;
            var wouldTakeAgain = 0;
            var wouldTakeAgainNACount = 0;
            var foundFirstReview = false;
            var firstReview = "";
            for(var i = 0; i < resp.ratings.length; i++) {
                easyRating += resp.ratings[i].rEasy;
                if(resp.ratings[i].rWouldTakeAgain === "Yes") {
                    wouldTakeAgain++;
                } else if (resp.ratings[i].rWouldTakeAgain === "N/A") {
                    wouldTakeAgainNACount++;
                }
                if(resp.ratings[i].rClass === className && !foundFirstReview) {
                    firstReview = resp.ratings[i].rComments;
                    foundFirstReview = true;
                }
            }
            if(!foundFirstReview) {
                firstReview = "N/A";
            }
            easyRating /= resp.ratings.length;
            if(resp.ratings.length >= 8 && wouldTakeAgainNACount < (resp.ratings.length / 2) ) {
            wouldTakeAgain = ((wouldTakeAgain / (resp.ratings.length - wouldTakeAgainNACount)) * 100).toFixed(0).toString() + "%";
            } else {
                wouldTakeAgain = "N/A";
            }
            var div = document.createElement("div");
            var title = document.createElement("h3");
            title.textContent = "Rate My Professor Details";
            var professorText = document.createElement("p");
            professorText.textContent = "Professor Name: " + realFirstName + " " + realLastName;
            var easyRatingText = document.createElement("p");
            easyRatingText.textContent = "Level of Difficulty" + ": " + easyRating.toFixed(1).toString() + "/5.0";
            var wouldTakeAgainText = document.createElement("p");
            wouldTakeAgainText.textContent = "Would take again: " + wouldTakeAgain;
            var classText = document.createElement("p");
            classText.textContent = "Most recent review for " + className + ":";
            var commentText = document.createElement("p");
            commentText.textContent = firstReview;
            commentText.classList.add('paragraph');
            div.appendChild(title);
            div.appendChild(professorText);
            div.appendChild(easyRatingText);
            div.appendChild(wouldTakeAgainText);
            div.appendChild(classText);
            div.appendChild(commentText);
            newCell.class = "tooltip";
            newCell.addEventListener("mouseenter", function () {
                //Only create tooltip once
                if (!$(newCell).hasClass('tooltipstered')) {
                    $(this)
                        .tooltipster({
                            animation: 'grow',
                            theme: 'tooltipster-default',
                            side: 'left',
                            content: div,
                            contentAsHTML: true,
                            delay: 100
                        })
                        .tooltipster('show');
                }
            });
        }

    }
    xhr.send();
}