chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", request.url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                console.log(xhr.responseText);
                sendResponse({ JSONresponse: JSON.parse(xhr.responseText) });
            }
        }
        xhr.send();

        return true;
    });