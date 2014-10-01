var RXURI = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

function Livestreamer(args) {
    var argv = [args], hostname = RXURI.exec(args)[4];
    if (hostname === 'www.youtube.com')
        argv.push(localStorage.youtubeQuality);
    else if (hostname === 'www.twitch.tv')
        argv.push(localStorage.twitchQuality);
    return Object.create(null, {
        toJSON: {
            value: function() {
                return { cmd: ['livestreamer'].concat(argv).join(' ') };
            }
        }
    });
}
