# RIT-Rate-My-Professor-Extension

[**Chrome** extension](https://chrome.google.com/webstore/detail/rate-my-professors-for-ri/lcionigofpcbfpmnipnioapimoggnbda?hl=en&authuser=0) [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/lcionigofpcbfpmnipnioapimoggnbda.svg?label=%20">](https://chrome.google.com/webstore/detail/rate-my-professors-for-ri/lcionigofpcbfpmnipnioapimoggnbda?hl=en&authuser=0)

[**Firefox** addon](https://github.com/CalvinWu4/RIT-Rate-My-Professor-Extension/releases)

[Click here for the Multi-College version](https://github.com/CalvinWu4/Multi-College-Rate-My-Professor-Extension)

This extension shows the [Rate My Professors](https://www.ratemyprofessors.com/) rating of professors while searching classes on [Tiger Center](https://tigercenter.rit.edu/tigerCenterApp/api/class-search).

Professors' names will now link to their Rate My Professors page (or the search results if not found) instead of to their email. The most helpful rating is chosen as the most recent rating with the most net upvotes (regardless of the quality given). (The most helpful rating on Rate My Professors always has an "Awesome" overall quality.) Also, the "Would take again" value won't show up unless there are eight or more ratings and the majority of ratings answer that question. 

To better find professors, this extension will try removing middle names, the middle name as the first name (common Southern tradition), the middle name as the last name (maiden name and Spanish surname), and first part of a hyphenated last name. It will also try all associated nicknames or diminutive names for first names from [here](https://github.com/carltonnorthern/nickname-and-diminutive-names-lookup). For example, Thomas Reichlmayr on Tiger Center is found as Tom Reichlmayr on Rate My Professors. Finally, there is the [`addedNicknames.js`](https://github.com/CalvinWu4/Rate-My-Professor-Extension/blob/master/addedNicknames.js) file for custom nicknames (e.g. Thiagarajah Arujunan should refer to Al Arujunan).

![Screenshot](images/screenshot.png)
