# Rate-My-Professor-Extension

This Google Chrome extension uses the Rate My Professor API to request information about each professor on the BYU registration page.  It retrieves the information based on the professor's name.

A rating will be added next to the professor's name that links to that professor's rating page on ratemyprofessor.com.  When the user places his/her mouse over the rating, a tooltip is generated with more information, so that the user does not need to click the link unless they want more details.

The most helpful rating is chosen as the most recent rating with the most net upvotes (regardless of the quality given). (The most helpful rating on Rate My Professors always has an "Awesome" overall quality.) Also, the "Would take again" value won't show up unless there are eight or more ratings and the majority of ratings answer that question. 

To better find professors, this extension will try the first part of a hyphenated last name, removing middle names, the middle name as the first name (common Southern tradition), and the middle name as the last name (maiden name/Spanish surname). It will also try all associated nicknames or diminutive names for first names from [here](https://github.com/carltonnorthern/nickname-and-diminutive-names-lookup).

I used the Tooltipster JQuery Plugin to help generate the tooltips.

<a href="https://chrome.google.com/webstore/detail/rate-my-byu-professors/ghokpcnkghnkfofadiajmmhinooijmaf">Here</a> is the listing on the Chrome Web Store.

![Screenshot](Images/ratemyprofimage.jpeg)