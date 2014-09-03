define(['jquery', 'plugCubed/handlers/TickerHandler'], function($, TickerHandler) {
    return TickerHandler.extend({
        tickTime: 1E4,
        tick: function() {
            var a = $('#yt-frame').height() === null || $('#yt-frame').height() > 230, b = $('#yt-frame').width() === null || $('#yt-frame').width() > 412, c = $('#plug-btn-hidevideo,#hideVideoButton').length === 0;
            if (a && b && c) return;
            API.chatLog('plugCubed does not support hiding video', true);
            plugCubed.close();
        }
    });
});