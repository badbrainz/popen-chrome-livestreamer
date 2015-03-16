function getQuality() {
    if (code == 98) return 'best480p,360p,,worst';
    if (code == 108) return '240p,360p,480p,best,worst';
    return '360p,240p,480p,best,worst';
}

relayEvent(
    document.body,
    'click',
    '.yt-lockup-thumbnail a',
    sendToBG,
    true
);

var code;

document.addEventListener('keyup', function(e) {
    if (e.altKey && e.ctrlKey)
        code = e.keyCode;
});