
 var sectionsRow = $(".sectionsRow");
 for(var i=0; i < sectionsRow.length; i++) {
     var myurl = "https://search.mtvnservices.com/typeahead/suggest/?solrformat=true&rows=20&callback=noCB&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s&fq=&q=";
     var element = sectionsRow.eq(i);
     element.find("td").eq(17).css({"color": "red", "border": "2px solid red"});
     var fullName = element.find("td").eq(17).text()
     var splitName = fullName.split(/, | /);
     var lastName = splitName[0];
     var firstName = splitName[1];
     lastName = lastName.toLowerCase();
     lastName = lastName.trim();
     firstName = firstName.toLowerCase();
     myurl1 = myurl + firstName + "+" + lastName + "+AND+schoolid_s%3A135";
     var xhr = new XMLHttpRequest();
     xhr.open("GET", myurl1, true);
     xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        // JSON.parse does not evaluate the attacker's scripts.
       // var resp = JSON.parse(xhr.responseText);
        console.log("success");
  }
}
xhr.send();
     console.log(fullName);
     console.log(firstName);
     console.log(lastName);
     console.log(myurl);
 }
var name = "swag";
console.log(name);