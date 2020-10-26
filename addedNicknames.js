const customNames = {
    "Thiagarajah Arujunan": "Al Arujunan"
}

function replaceCustomNicknames(fullName){
    if (customNames[fullName]) {
        return customNames[fullName];
    }

    return fullName;
}