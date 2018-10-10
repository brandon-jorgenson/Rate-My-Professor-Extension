
var myurl = "https://search.mtvnservices.com/typeahead/suggest/?solrformat=true&rows=20&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s&fq=&q=";
var table = document.getElementById("sectionStartHeader");
var columnValue = 0;
var found = false;
if (table != null) {
    for (var i = 0, row; row = table.rows[i]; i++) {
        if (i == 0) {
            var ratingCell = row.insertCell(row.length);
            ratingCell.innerHTML = "Rating";
            ratingCell.style.backgroundColor = "#eff6fc";
        }
        for (var j = 0, col; col = row.cells[j]; j++) {
            if (found && j == columnValue) {
                var newCell = row.insertCell(row.length);
                if(col.innerText.length > 6) {
                var fullName = col.innerText;
                console.log(fullName);
                var splitName = fullName.split(/, | /);
                var lastName = splitName[0];
                var firstName = splitName[1];
                var middleName = splitName[2];
                lastName = lastName.toLowerCase();
                lastName = lastName.trim();
                firstName = firstName.toLowerCase();
                middleName = middleName.toLowerCase();
                console.log(fullName);
                console.log(firstName);
                console.log(lastName);
                console.log(middleName);
                myurl1 = myurl + firstName + "+" + lastName + "+AND+schoolid_s%3A135";
                
                XMLRequest(myurl1,newCell);
                if(newCell.innerHTML == "") {
                    firstName = middleName;
                    console.log(firstName);
                    myurl1 = myurl + firstName + "+" + lastName + "+AND+schoolid_s%3A135";
                    console.log(myurl1);
                    XMLRequest(myurl1,newCell);
                }

            }
        }

            if (col.innerHTML == "Instructor") {
                columnValue = j;
                found = true;
            }

        }
    }
    console.log(columnValue);
}

function XMLRequest(myurl1, newCell) {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", myurl1, false);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            var resp = JSON.parse(xhr.responseText);
            console.log(resp);
            // console.log(resp.response.docs);
            var numFound = resp.response.numFound;
            var profID = resp.response.docs[0].pk_id;
            var profRating = resp.response.docs[0].averageratingscore_rf;
            var profURL = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + profID;
            console.log(numFound);
            console.log(profID);
            console.log(profURL);
            console.log(profRating);
            var link = profRating.toString().link(profURL);
            newCell.innerHTML = link;
            //console.log(resp.response.numFound);
            //return numFound;

        }

    }
    xhr.send();

}
