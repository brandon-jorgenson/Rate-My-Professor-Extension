const nicknames = getNicknames();

// Add professor ratings
const urlBase = "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=2&wt=json&q=";
document.arrive('.col-xs-2 [href*="mailto:"]', function(){
    const fullName = this.textContent;
    const splitName = fullName.split(' ');
    const firstName = splitName[0].toLowerCase().trim();
    const lastName = splitName.slice(-1)[0].toLowerCase().trim();
    let middleName;
    if (splitName.length > 2) {
        middleName = splitName[0];
        middleName = middleName.toLowerCase().trim();
    }
    url = urlBase + firstName + "+" + lastName + "+AND+schoolid_s%3A807";
    const runAgain = true;
    // Query Rate My Professor with the professor's name
    GetProfessorRating(url, this, lastName, firstName, middleName, runAgain, firstName, 0);
});

function GetProfessorRating(url, element, lastName, firstName, middleName, runAgain, originalFirstName, index) {
    chrome.runtime.sendMessage({ url: url, type: "profRating" }, function (response) {
        const resp = response.JSONresponse;
        const numFound = resp.response.numFound;
        const doc = resp.response.docs[0];
        // Add professor data if found
        if (numFound > 0 && doc) {
            const profID = doc.pk_id;
            const realFirstName = doc.teacherfirstname_t;
            const realLastName = doc.teacherlastname_t;
            const dept = doc.teacherdepartment_s;
            const profRating = doc.averageratingscore_rf && doc.averageratingscore_rf.toFixed(1);
            const numRatings = doc.total_number_of_ratings_i;
            const easyRating = doc.averageeasyscore_rf && doc.averageeasyscore_rf.toFixed(1);

            const profURL = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + profID;
            element.textContent += ` (${profRating ? profRating : 'N/A'})`;
            element.setAttribute('href', profURL);
            element.setAttribute('target', '_blank');

            let allprofRatingsURL = "https://www.ratemyprofessors.com/paginate/professors/ratings?tid=" + profID + "&page=0&max=20";
            AddTooltip(element, allprofRatingsURL, realFirstName, realLastName, profRating, numRatings, easyRating, dept);
        } else {
            // Try again with professor's middle name if it didn't work the first time
            if (middleName && runAgain) {
                firstName = middleName;
                url = urlBase + firstName + "+" + lastName + "+AND+schoolid_s%3A807";
                GetProfessorRating(url, element, lastName, firstName, middleName, false, null);
            }
            // Try again with nicknames for the professor's first name
            else if (runAgain && nicknames[originalFirstName]) {
                url = urlBase + nicknames[originalFirstName][index] + "+" + lastName + "+AND+schoolid_s%3A807";
                GetProfessorRating(url, element, lastName, nicknames[originalFirstName][index], middleName, nicknames[originalFirstName][index+1], originalFirstName, index+1);
            }
            // Set link to search results if not found
            else {
                element.textContent += " (NF)";
                element.setAttribute('href', 
                `https://www.ratemyprofessors.com/search.jsp?query=${originalFirstName}+${middleName ? middleName + '+': ''}${lastName}`);
                element.setAttribute('target', '_blank');
            }
        }        
    });
}

function AddTooltip(element, allprofRatingsURL, realFirstName, realLastName, profRating, numRatings, easyRating, dept) {
    let ratings = [];
    function getRatings(url){
        chrome.runtime.sendMessage({ url: url, type: "tooltip" }, function (response) { 
            ratings = ratings.concat(response.JSONresponse.ratings);
            var remaining = response.JSONresponse.remaining;
            let pageNum = parseInt(new URLSearchParams(url).get('page'));
            if(remaining !== 0) { 
                // Get all ratings by going through all the pages
                getRatings(url.replace(`page=${pageNum}`, `page=${pageNum + 1}`));
            }
            else{
                // Build content for professor tooltip
                let wouldTakeAgain = 0;
                let wouldTakeAgainNACount = 0;
                let mostHelpfulReview;
                let helpCount;
                let notHelpCount;
                let wouldTakeAgainText;
                let easyRatingText;

                const div = document.createElement("div");
                const title = document.createElement("h3");
                title.textContent = "Rate My Professor Details";
                const professorText = document.createElement("p");
                const avgRatingText = document.createElement("p");
                avgRatingText.textContent = `Overall rating: ${profRating ? profRating : 'N/A'}/5`
                const numRatingsText = document.createElement("p");
                numRatingsText.textContent = `Number of Ratings: ${numRatings}`
                professorText.textContent = `${realFirstName} ${realLastName}, Professor in the ${dept} department`;
                div.appendChild(title);
                div.appendChild(professorText);
                div.appendChild(avgRatingText);
                div.appendChild(numRatingsText);

                if (ratings.length > 0) {
                    for (let i = 0; i < ratings.length; i++) {
                        if (ratings[i].rWouldTakeAgain === "Yes") {
                            wouldTakeAgain++;
                        } else if (ratings[i].rWouldTakeAgain === "N/A") {
                            wouldTakeAgainNACount++;
                        }
                    }
                    if(ratings.length > 1) {
                        ratings.sort(function(a,b) { return new Date(b.rDate) - new Date(a.rDate) });
                        ratings.sort(function(a,b) { return (b.helpCount - b.notHelpCount) - (a.helpCount - a.notHelpCount) });
                        mostHelpfulReview = ratings[0];
                        helpCount = mostHelpfulReview.helpCount;
                        notHelpCount = mostHelpfulReview.notHelpCount;
                    }
                    if (ratings.length >= 8 && wouldTakeAgainNACount < (ratings.length / 2)) {
                        wouldTakeAgain = ((wouldTakeAgain / (ratings.length - wouldTakeAgainNACount)) * 100).toFixed(0).toString() + "%";
                    } else {
                        wouldTakeAgain = "N/A";
                    }
                    wouldTakeAgainText = document.createElement("p");
                    wouldTakeAgainText.textContent = "Would take again: " + wouldTakeAgain;
                    easyRatingText = document.createElement("p");
                    easyRatingText.textContent = `Level of Difficulty: ${easyRating}`;
                    div.appendChild(easyRatingText);
                    div.appendChild(wouldTakeAgainText);
                }
                if (mostHelpfulReview) {
                    const classText = document.createElement("p");
                    classText.textContent = "Most Helpful Rating: " + mostHelpfulReview.rClass;
                    const dateText = document.createElement("p");
                    dateText.textContent = mostHelpfulReview.rDate;
                    const commentText = document.createElement("p");
                    commentText.textContent = mostHelpfulReview.rComments;
                    commentText.classList.add('paragraph');
                    const upvotesText = document.createElement("p");
                    upvotesText.textContent = `👍${helpCount} 👎${notHelpCount}`;
                    div.appendChild(classText);
                    div.appendChild(dateText);
                    div.appendChild(commentText);
                    div.appendChild(upvotesText);
                }
                element.class = "tooltip";
                element.addEventListener("mouseenter", function () {
                    // Only create tooltip once
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
            }
        });
    }
    getRatings(allprofRatingsURL)
}