function getQuality() {
    if (code == 98) return 'best,medium,worst';
    if (code == 108) return 'worstmedium,best';
    return 'medium,best,worst';
}

relayEvent(
    document.body,
    'click',
    '.item .thumb a.cap',
    sendToBG,
    true
);

var code;

document.addEventListener('keyup', function(e) {
    if (e.altKey && e.ctrlKey)
        code = e.keyCode;
});