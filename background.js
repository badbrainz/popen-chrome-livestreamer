chrome.contextMenus.create({
    id: 'link',
    title: 'Watch with Livestreamer',
    contexts: ['link', 'page'],
    targetUrlPatterns: [
        '*://www.twitch.tv/*',
        '*://www.youtube.com/*'
    ]
});

function closeNotification(id) {
    setTimeout(function() {
        chrome.notifications.clear(id, function() {})
    }, 5000);
}

function debug(msg) {
    if (/^error:/.test(msg)) {
        chrome.notifications.create('', {
            type: 'basic',
            title: 'Error',
            iconUrl: 'icon-48.png',
            message: msg.replace(/^error:/, '').trim()
        }, closeNotification);
    }
}

function getStreamOpts() {
    var opts = {};
    for (var k in localStorage)
        opts[k] = localStorage[k];
    return opts;
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var host = 'com.livestreamer';
    var opts = getStreamOpts();
    opts.broadcast = info.linkUrl || info.pageUrl;
    chrome.runtime.sendNativeMessage(host, opts, debug);
});
