function getQuality() {
    if (window.quality === 'High') return 'best,medium,worst';
    if (window.quality === 'Medium') return 'medium,worst,best';
    if (window.quality === 'Low') return 'worst,medium,best';
    return 'medium,best,worst';
}

relayEvent(
    document.body,
    'click',
    '.item .thumb a.cap',
    sendToBG,
    true
);
