function getQuality() {
    if (window.quality === 'High') return 'best,480p,360p,240p,worst';
    if (window.quality === 'Medium') return '480p,360p,240p,worst';
    if (window.quality === 'Low') return 'worst,240p,360p,480p,best';
    return '360p,240p,480p,best,worst';
}

relayEvent(
    document.body,
    'click',
    '.yt-lockup-thumbnail a',
    sendToBG,
    true
);
