//Searches for the table of professor options on the BYU registration page
    var myurl = "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=2&wt=json&q=";
    var newCell;

    document.arrive('a[href*="mailto:"]', function(){
        const fullName = this.textContent;
        const splitName = fullName.split(' ');
        const firstName = splitName[0].toLowerCase().trim();
        const lastName = splitName.slice(-1)[0].toLowerCase().trim();
        let middleName;
        if (splitName.length > 2) {
            middleName = splitName[2];
            middleName = middleName.toLowerCase().trim();
        }
        myurl1 = myurl + firstName + "+" + lastName + "+AND+schoolid_s%3A807";
        var runAgain = true;
        //Query Rate My Professor with the professor's name
        GetProfessorRating(myurl1, this, lastName, firstName, middleName, runAgain);
});

function GetProfessorRating(myurl1, newCell, lastName, firstName, middleName, runAgain) {

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
                newCell.setAttribute('href', profURL);
                newCell.setAttribute('target', '_blank');
                var allprofRatingsURL = "https://www.ratemyprofessors.com/paginate/professors/ratings?tid=" + profID + "&page=0&max=20";
                AddTooltip(newCell, allprofRatingsURL, realFirstName, realLastName);
            } else {
            }
        } else {
            newCell.textContent += " (N/A)";
            newCell.setAttribute('href', 
            `https://www.ratemyprofessors.com/search.jsp?query=${firstName}+${middleName ? middleName : ''}+${lastName}`);
            newCell.setAttribute('target', '_blank');
        }
        //Try again with professor's middle name if it didn't work the first time
        if (newCell.innerHTML == "N/A" && splitName.length > 2 && runAgain) {
            firstName = middleName;
            myurl1 = myurl + firstName + "+" + lastName + "+AND+schoolid_s%3A807";
            runAgain = false;
            GetProfessorRating(myurl1, newCell, splitName, firstName, middleName, runAgain);
        }
    });
}

function AddTooltip(newCell, allprofRatingsURL, realFirstName, realLastName) {
    chrome.runtime.sendMessage({ url: allprofRatingsURL, type: "tooltip" }, function (response) {
        var resp = response.JSONresponse;
        //Build content for professor tooltip
        var easyRating = 0;
        var wouldTakeAgain = 0;
        var wouldTakeAgainNACount = 0;
        var foundFirstReview = false;
        var firstReview = "";
        for (var i = 0; i < resp.ratings.length; i++) {
            easyRating += resp.ratings[i].rEasy;
            if (resp.ratings[i].rWouldTakeAgain === "Yes") {
                wouldTakeAgain++;
            } else if (resp.ratings[i].rWouldTakeAgain === "N/A") {
                wouldTakeAgainNACount++;
            }
            if (resp.ratings[i].rClass === className && !foundFirstReview) {
                firstReview = resp.ratings[i].rComments;
                foundFirstReview = true;
            }
        }
        if (!foundFirstReview) {
            firstReview = "N/A";
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
    });
}