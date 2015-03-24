function relayEvent(elm, evt, sel, fn, capt) {
    function callback(e) {
        var i = 0;
        var el;
        var target = e.target;
        var children = e.currentTarget.querySelectorAll(sel);
        while ((el = children[i++])) {
            if (el === target || el.contains(target)) {
                var ret = fn.call(el, {
                    targets: {
                        source: target,
                        relay: el,
                        current: e.currentTarget,
                    },
                    originalEvent: e
                });
                if (!ret)
                    e.preventDefault();
                return ret;
            }
        }
    }
    var elms = typeof elm === 'string' ? document.querySelectorAll(elm) : [elm];
    for (var i = 0; i < elms.length; i++)
        elms[i].addEventListener(evt, callback, !!capt);
}

function setQuality(lvl) {
	window.quality = lvl;
}

function getQuality() {
    return 'best,worst';
}

function sendToBG(e) {
    var event = e.originalEvent;
    if (event.ctrlKey || event.shiftKey || event.button !== 0) return true;
    var quality = getQuality();
    var href = e.targets.relay.href;
    chrome.runtime.sendMessage({ url: href, quality: quality });
    e.originalEvent.stopPropagation();
}
