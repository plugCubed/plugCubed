define(['jquery', 'plugCubed/handlers/TickerHandler'], function($, TickerHandler) {
    return TickerHandler.extend({
        tickTime: 1E4,
        tick: function() {
            var $ytFrame = $('#yt-frame');
            var a;
            var b = true;
            var c = true;
            var d;

            a = $ytFrame.height() == null || $ytFrame.height() > 230;
            if ($ytFrame.width() != null) {
                b = $ytFrame.width() > 412;
                c = $ytFrame[0].offsetLeft + $ytFrame[0].offsetWidth >= 0 && $ytFrame[0].offsetTop + $ytFrame[0].offsetHeight >= 0 && $ytFrame[0].offsetLeft < window.innerWidth && $ytFrame[0].offsetTop < window.innerHeight;
            }
            d = $ytFrame.length === 0 || parseFloat($ytFrame.css('opacity')) === 1;

            if (a && b && c && d) {
                return;
            }

            API.chatLog('plug³ does not support hiding video or scripts supporting hiding the video player');
            plugCubed.close();
        }
    });
});
