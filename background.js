var HOST = 'com.popenchrome';
var RXURI = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

function livestreamer(url) {
    var ls = JSON.parse(localStorage.getItem('livestreamer'));
    var args = [];
    
    args.push(ls.cmd);
    
    var site = RXURI.exec(url)[4];
    var default_args = ls['default_args'];
    var default_quality = ls['default_quality'][site] || 'best';
    
    if (site === 'www.youtube.com')
        default_args.player = 'vlc';
    
    for (var k in default_args)
        args.push('--' + k, JSON.stringify(default_args[k]));
    
    args.push(JSON.stringify(url));
    args.push(JSON.stringify(default_quality));
    
    return args.join(' ');
}

function printMessage(response) {
    if (response) {
        var message = response.message.trim();
        console.log(message);
        if (/^error:/.test(message)) {
            chrome.notifications.create('', {
                type: 'basic',
                title: 'Error',
                iconUrl: 'icon-48.png',
                message: message
            }, function(id) {
                setTimeout(function() {
                    chrome.notifications.clear(id, function() {});
                }, 6000);
            });
        }
    }
}

function sendNativeMessage(url) {
    var port = chrome.runtime.connectNative(HOST);
    port.onMessage.addListener(printMessage);
    port.postMessage({ cmd: livestreamer(url) });
}

chrome.contextMenus.create({
    id: 'link',
    title: 'Send to media player',
    contexts: ['link', 'page', 'selection'],
    documentUrlPatterns: [
        '*://*/*'
    ],
    targetUrlPatterns: [
        '*://www.twitch.tv/*',
        '*://www.youtube.com/*'
    ]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    sendNativeMessage(info.linkUrl || info.selectionText || info.pageUrl);
});

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        localStorage.setItem('livestreamer', JSON.stringify({
            'cmd': 'livestreamer',
            'default_args': {
                'loglevel': 'info',
                'hls-segment-threads': 3,
                'player': 'mpv --cache 5120'
            },
            'default_quality': {
                'www.twitch.tv': 'medium,low,best,worst',
                'www.youtube.com': '360p,480p,best,worst,audio_mp4,audio_webm'
            }
        }));
    }
});
