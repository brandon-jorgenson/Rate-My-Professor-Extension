const nicknames = getNicknames();

//Searches for the table of professor options on the BYU registration page
    var myurl = "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=2&wt=json&q=";
    document.arrive('[href*="mailto:"]', function(){
        const fullName = this.textContent;
        const splitName = fullName.split(' ');
        const firstName = splitName[0].toLowerCase().trim();
        const lastName = splitName.slice(-1)[0].toLowerCase().trim();
        let middleName;
        if (splitName.length > 2) {
            middleName = splitName[0];
            middleName = middleName.toLowerCase().trim();
        }
        myurl1 = myurl + firstName + "+" + lastName + "+AND+schoolid_s%3A807";
        var runAgain = true;
        //Query Rate My Professor with the professor's name
        GetProfessorRating(myurl1, this, lastName, firstName, middleName, runAgain, firstName, 0);
});

function GetProfessorRating(myurl1, element, lastName, firstName, middleName, runAgain, originalFirstName, index) {

    chrome.runtime.sendMessage({ url: myurl1, type: "profRating" }, function (response) {
        var resp = response.JSONresponse;
        var numFound = resp.response.numFound;
        //Add professor data if found
        if (numFound > 0) {
            var profID = resp.response.docs[0].pk_id;
            var realFirstName = resp.response.docs[0].teacherfirstname_t;
            var realLastName = resp.response.docs[0].teacherlastname_t;
            var profRating = resp.response.docs[0].averageratingscore_rf;
            if (profRating != undefined) {
                var profURL = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + profID;
                element.textContent += ` (${profRating})`;
                element.setAttribute('href', profURL);
                element.setAttribute('target', '_blank');
                var allprofRatingsURL = "https://www.ratemyprofessors.com/paginate/professors/ratings?tid=" + profID + "&page=0&max=20";
                AddTooltip(element, allprofRatingsURL, realFirstName, realLastName, null);
            } else {
            }
        } else {
            //Try again with professor's middle name if it didn't work the first time
            if (middleName && runAgain) {
                firstName = middleName;
                myurl1 = myurl + firstName + "+" + lastName + "+AND+schoolid_s%3A807";
                GetProfessorRating(myurl1, element, lastName, firstName, middleName, false, null);
            }

            //Try again with nicknames for the professor's first name
            else if (runAgain && nicknames[originalFirstName]) {
                myurl1 = myurl + nicknames[originalFirstName][index] + "+" + lastName + "+AND+schoolid_s%3A807";
                GetProfessorRating(myurl1, element, lastName, nicknames[originalFirstName][index], middleName, index < nicknames[originalFirstName].length, originalFirstName, index+1);
            }

            else {
                element.textContent += " (N/A)";
                element.setAttribute('href', 
                `https://www.ratemyprofessors.com/search.jsp?query=${firstName}+${middleName ? middleName : ''}+${lastName}`);
                element.setAttribute('target', '_blank');
            }
        }        
    });
}

function AddTooltip(element, allprofRatingsURL, realFirstName, realLastName) {
    chrome.runtime.sendMessage({ url: allprofRatingsURL, type: "tooltip" }, function (response) {
        var resp = response.JSONresponse;
        //Build content for professor tooltip
        var easyRating = 0;
        var wouldTakeAgain = 0;
        var wouldTakeAgainNACount = 0;
        let mostHelpfulReview = "";
        for (var i = 0; i < resp.ratings.length; i++) {
            easyRating += resp.ratings[i].rEasy;
            if (resp.ratings[i].rWouldTakeAgain === "Yes") {
                wouldTakeAgain++;
            } else if (resp.ratings[i].rWouldTakeAgain === "N/A") {
                wouldTakeAgainNACount++;
            }
        }
        if(resp.ratings.length > 1) {
            resp.ratings.sort(function(a,b) { return new Date(b.rDate) - new Date(a.rDate) });
            resp.ratings.sort(function(a,b) { return (b.helpCount-b.notHelpCount) - (a.helpCount-a.notHelpCount) });
            mostHelpfulReview = resp.ratings[0];
        }
        easyRating /= resp.ratings.length;
        if (resp.ratings.length >= 8 && wouldTakeAgainNACount < (resp.ratings.length / 2)) {
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
        classText.textContent = "Most Helpful Rating: " + mostHelpfulReview.rClass;
        var commentText = document.createElement("p");
        commentText.textContent = mostHelpfulReview.rComments;
        commentText.classList.add('paragraph');
        div.appendChild(title);
        div.appendChild(professorText);
        div.appendChild(easyRatingText);
        div.appendChild(wouldTakeAgainText);
        div.appendChild(classText);
        div.appendChild(commentText);
        element.class = "tooltip";
        element.addEventListener("mouseenter", function () {
            //Only create tooltip once
            if (!$(element).hasClass('tooltipstered')) {
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
    });
}

// Check if company is already in localstorage
var checkDatabase = function(name) {
    if(localStorage[name]) {
		return true;
    }
    return false;
}

// Save ratings into local storage, and keep track of how old it is
var save = function(name, info) {
	localStorage[name] = info;
	var date = new Date();
	localStorage["gd-retrieval-date"] = date.toDateString();
}

// Load rating
var load = function(name) {
    return localStorage[name];
}