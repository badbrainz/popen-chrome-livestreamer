(function(ns) {

var HOST = 'com.popenchrome';
var RXURI = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

var default_args = {
    'loglevel': 'info',
    'hls-segment-threads': 3
};

function getQuality(url) {
    var site = RXURI.exec(url)[4];
    if (site === 'www.twitch.tv')
        return 'medium,low,best,worst';
    if (site === 'www.youtube.com')
        return '360p,480p,best,worst,audio_mp4,audio_webm';
    return 'best';
}

var plugins_registry = {
    livestreamer: function(url, params, quality) {
        var args = [];
        var argsv = Object.create(default_args);
        
        for (var k in params)
            argsv[k] = params[k];

        args.push('livestreamer');
        for (var k in argsv)
            args.push('--' + k, JSON.stringify(argsv[k]));
        args.push('--player-no-close');
        args.push(JSON.stringify(url));
        args.push(JSON.stringify(quality));

        return args.join(' ');
    },

    json: function(url) {
        var args = [];
        args.push('livestreamer');
        args.push('--stream-url');
        args.push(JSON.stringify(url));
        args.push(JSON.stringify('best'));
        return args.join(' ');
    },
};

function openPort(message, listener) {
    var port = chrome.runtime.connectNative(HOST);
    port.onMessage.addListener(listener);
    port.postMessage(message);
}

function displayNotification(title, message) {
    chrome.notifications.create('', {
        type: 'basic',
        title: title,
        iconUrl: 'icon-48.png',
        message: message
    }, function(id) {
        setTimeout(function() {
            chrome.notifications.clear(id, function() {});
        }, 6000);
    });
}

function printMessage(response) {
    if (response) {
        var message = response.message.trim();
        console.log(message);
        if (/error/.test(message.split(' ', 1)))
            displayNotification('Error', message);
    }
}

ns.plugins = {
    playVLC: function(url, quality) {
        var command = plugins_registry.livestreamer(url, {
            'player': 'vlc'
        }, quality || getQuality(url));
        console.debug(command);
        openPort({ cmd: command }, printMessage);
    },
    
    playMPV: function(url, quality) {
        var command = plugins_registry.livestreamer(url, {
            'player': 'mpv'
        }, quality || getQuality(url));
        console.debug(command);
        openPort({ cmd: command }, printMessage);
    },
    
    play: function(url, quality) {
        this.playMPV(url, quality);
    },
    
    getURL: function(url, callback) {
        var command = plugins_registry.json(url);
        console.debug(command);
        openPort({ cmd: command }, function(response) {
            var url = response ? response.message.trim() : '';
            callback(url);
        });
    }
};

})(window);
chrome.contextMenus.create({
    id: 'vlc',
    title: 'Play VLC',
    contexts: ['link', 'page', 'selection'],
    documentUrlPatterns: [
        '*://*/*'
    ],
    targetUrlPatterns: [
        '*://www.twitch.tv/*',
        '*://www.youtube.com/*'
    ]
});

chrome.contextMenus.create({
    id: 'mpv',
    title: 'Play MPV',
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
    var id = info.menuItemId;
    var url = info.linkUrl || info.selectionText || info.pageUrl;
    if (id === 'vlc') plugins.playVLC(url);
    if (id === 'mpv') plugins.playMPV(url);
});

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {}
});

chrome.runtime.onMessage.addListener(function(request) {
    plugins.play(request.url, request.quality);
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, response) {
    if (request.command === 'GetStreamURL') {
        plugins.getURL(request.url, response);
        return true;// keep alive
    }
    if (request.command === 'PlayStreamURL') {
        plugins.play(request.url, request.quality);
    }
});

chrome.omnibox.onInputEntered.addListener(function(input, disposition) {
    plugins.play(input);
});

chrome.commands.onCommand.addListener(function(command) {
	switch (command) {
		case 'High':
		case 'Medium':
		case 'Low':
			chrome.tabs.executeScript({
				code: 'setQuality("' + command + '")'
			});
			break;
	}
    onContextMenu({menuItemId: command});
});
