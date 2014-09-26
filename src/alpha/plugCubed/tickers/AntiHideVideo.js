var tastyPlugShutDown;
define(['jquery', 'plugCubed/handlers/TickerHandler'], function($, TickerHandler) {
    return TickerHandler.extend({
        tickTime: 1E4,
        tick: function() {
            var $ytFrame = $('#yt-frame');
            var a, b, c;

            a = $ytFrame.height() === null || $ytFrame.height() > 230;
            b = $ytFrame.width() === null || $ytFrame.width() > 412;
            c = $('#plug-btn-hidevideo, #plugbot-btn-hidevideo, #hideVideoButton, #plug_pro_chrome_extension_id').length === 0;

            if (a && b && c) {
                if (typeof tastyPlugShutDown != 'undefined') {
                    API.chatLog('plugCubed does not support TastyPlug, since they are allowing to hide video (Against YouTube\'s Terms of Service)', true);
                    tastyPlugShutDown();
                    tastyPlugShutDown = undefined;
                }
                return;
            }

            API.chatLog('plugCubed does not support hiding video or scripts supporting hiding of the video', true);
            plugCubed.close();
        }
    });
});