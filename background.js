var HOST = 'com.popenchrome';
var RXURI = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

var logger = function(response) {
    if (response)
        console.log(response.message.trim());
};

function livestreamerCommand(url) {
    var args = [];
    args.push(localStorage['path.livestreamer']);
    args.push(JSON.stringify(url));
    args.push(localStorage[RXURI.exec(url)[4]] || 'best');
    return args.join(' ');
}

function sendNativeMessage(url) {
    var port = chrome.runtime.connectNative(HOST);
    port.onMessage.addListener(logger);
    port.postMessage({ cmd: livestreamerCommand(url) });
}

chrome.contextMenus.create({
    id: 'link',
    title: 'Send to media player',
    contexts: ['link', 'page'],
    documentUrlPatterns: [
        '*://www.twitch.tv/*',
        '*://www.youtube.com/*'
    ],
    targetUrlPatterns: [
        '*://www.twitch.tv/*',
        '*://www.youtube.com/*'
    ]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    sendNativeMessage(info.linkUrl || info.pageUrl);
});

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        localStorage['path.livestreamer'] = 'livestreamer --loglevel info --player "mpv --cache 5120" --hls-segment-threads 3';
        localStorage['www.twitch.tv'] = 'medium,low,best,worst';
        localStorage['www.youtube.com'] = '360p,480p,best,worst,audio_mp4,audio_webm';
    }
});
