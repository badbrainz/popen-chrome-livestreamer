chrome.contextMenus.create({
    id: 'link',
    title: 'Watch with Livestreamer',
    contexts: ['link', 'page'],
    targetUrlPatterns: [
        '*://www.twitch.tv/*',
        '*://www.youtube.com/*'
    ]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    chrome.runtime.sendNativeMessage('com.livestreamer', {
        broadcast: info.linkUrl || info.pageUrl,
        quality: localStorage.quality || "best,medium,low,worst"
    });
});
