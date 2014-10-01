var DEBUG = 0;
var HOST = 'com.cheeky';
var logLevel = localStorage.loglevel;

function hideAlertWindow(id) {
    setTimeout(function() {
        chrome.notifications.clear(id, function() {});
    }, 5000);
}

function showAlertWindow(title, content) {
    chrome.notifications.create('', {
        type: 'basic',
        title: title,
        iconUrl: 'icon-48.png',
        message: content
    }, hideAlertWindow);
}

function debugReturnVal(command) {
    return function(response) {
        var errno = -1, value = '';
        if (response) {
            errno = response.errno;
            value = response.message;
        }
        else if (chrome.runtime.lastError)
            value = chrome.runtime.lastError.message;

        if (DEBUG) {
            console.log(value);
            showAlertWindow('DEBUG: ' + errno, value);
            return;
        }

        if (logLevel == 0 || (logLevel == 1 && errno != 0)) {
            if (errno > 0)
                showAlertWindow(command.bin + ' error: ' + errno, value);
            console.log(value);
        }
    }
}

chrome.contextMenus.create({
    id: 'link',
    title: 'Send to local media player',
    contexts: ['link', 'page'],
    targetUrlPatterns: [
        '*://www.twitch.tv/*',
        '*://www.youtube.com/*'
    ]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var command = Livestreamer(info.linkUrl || info.pageUrl);
    chrome.runtime.sendNativeMessage(HOST, command, debugReturnVal(command));
});
