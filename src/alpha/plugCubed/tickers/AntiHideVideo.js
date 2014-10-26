var tastyPlugShutDown;
define(['jquery', 'plugCubed/handlers/TickerHandler'], function($, TickerHandler) {
    return TickerHandler.extend({
        tickTime: 1E4,
        tick: function() {
            var $ytFrame = $('#yt-frame');
            var a, b, c, d;

            a = $ytFrame.height() === null || $ytFrame.height() > 230;
            b = $ytFrame.width() === null || $ytFrame.width() > 412;
            c = $('#plug-btn-hidevideo, #plugbot-btn-hidevideo, #hideVideoButton, #plug_pro_chrome_extension_id').length === 0;
            d = $ytFrame.width() !== null && (($ytFrame.offsetLeft + $ytFrame.offsetWidth) < 0 || ($ytFrame.offsetTop + $ytFrame.offsetHeight) < 0 || ($ytFrame.offsetLeft > window.innerWidth || $ytFrame.offsetTop > window.innerHeight));

            if (a && b && c && !d) {
                return;
            }

            API.chatLog('plugCubed does not support hiding video or scripts supporting hiding of the video', true);
            plugCubed.close();
        }
    });
});