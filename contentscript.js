const nicknames = getNicknames();

//Searches for the table of professor options on the BYU registration page
    const myurl = "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=2&wt=json&q=";
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
        const runAgain = true;
        //Query Rate My Professor with the professor's name
        GetProfessorRating(myurl1, this, lastName, firstName, middleName, runAgain, firstName, 0);
});

function GetProfessorRating(myurl1, element, lastName, firstName, middleName, runAgain, originalFirstName, index) {

    chrome.runtime.sendMessage({ url: myurl1, type: "profRating" }, function (response) {
        const resp = response.JSONresponse;
        const numFound = resp.response.numFound;
        const doc = resp.response.docs[0];
        //Add professor data if found
        if (numFound > 0) {
            const profID = doc.pk_id;
            const realFirstName = doc.teacherfirstname_t;
            const realLastName = doc.teacherlastname_t;
            const profRating = doc.averageratingscore_rf;
            const numRatings = doc.total_number_of_ratings_i;
            const easyRating = doc.averageeasyscore_rf;

            const profURL = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + profID;
            element.textContent += ` (${profRating ? profRating : 'N/A'})`;
            element.setAttribute('href', profURL);
            element.setAttribute('target', '_blank');

            if (profRating != undefined) {
                const allprofRatingsURL = "https://www.ratemyprofessors.com/paginate/professors/ratings?tid=" + profID + "&page=0&max=20";
                AddTooltip(element, allprofRatingsURL, realFirstName, realLastName, profRating, numRatings, easyRating);
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
                element.textContent += " (NF)";
                element.setAttribute('href', 
                `https://www.ratemyprofessors.com/search.jsp?query=${firstName}+${middleName ? middleName : ''}+${lastName}`);
                element.setAttribute('target', '_blank');
            }
        }        
    });
}

function AddTooltip(element, allprofRatingsURL, realFirstName, realLastName, profRating, numRatings, easyRating) {
    chrome.runtime.sendMessage({ url: allprofRatingsURL, type: "tooltip" }, function (response) {
        const resp = response.JSONresponse;
        //Build content for professor tooltip
        let wouldTakeAgain = 0;
        let wouldTakeAgainNACount = 0;
        let mostHelpfulReview = "";
        for (let i = 0; i < resp.ratings.length; i++) {
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
        if (resp.ratings.length >= 8 && wouldTakeAgainNACount < (resp.ratings.length / 2)) {
            wouldTakeAgain = ((wouldTakeAgain / (resp.ratings.length - wouldTakeAgainNACount)) * 100).toFixed(0).toString() + "%";
        } else {
            wouldTakeAgain = "N/A";
        }
        const div = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = "Rate My Professor Details";
        const professorText = document.createElement("p");
        professorText.textContent = "Professor Name: " + realFirstName + " " + realLastName;
        const avgRatingText = document.createElement("p");
        avgRatingText.textContent = `Overall rating: ${profRating}/5`
        const numRatingsText = document.createElement("p");
        numRatingsText.textContent = `Number of Ratings: ${numRatings}`
        const wouldTakeAgainText = document.createElement("p");
        wouldTakeAgainText.textContent = "Would take again: " + wouldTakeAgain;
        const easyRatingText = document.createElement("p");
        easyRatingText.textContent = `Level of Difficulty: ${easyRating}`;
        const classText = document.createElement("p");
        classText.textContent = "Most Helpful Rating: " + mostHelpfulReview.rClass;
        const commentText = document.createElement("p");
        commentText.textContent = mostHelpfulReview.rComments;
        commentText.classList.add('paragraph');
        div.appendChild(title);
        div.appendChild(professorText);
        div.appendChild(avgRatingText);
        div.appendChild(numRatingsText);
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