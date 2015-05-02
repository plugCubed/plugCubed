define(['plugCubed/handlers/TickerHandler', 'plugCubed/bridges/Context'], function(TickerHandler, _$context) {
    return TickerHandler.extend({
        tickTime: 1E4,
        tick: function() {
            var a = _$context._events['chat:receive'].concat(API._events[API.CHAT]), c = function() {
                API.chatLog('plug³  does not support one or more of the other scripts that are currently running because of potential dangerous behaviour');
                plugCubed.close();
            };
            for (var b in a) {
                if (!a.hasOwnProperty(b)) continue;
                var script = a[b].callback.toString();
                if ((function(words) {
                        for (var i in words) {
                            if (words.hasOwnProperty(i) && script.indexOf(words[i]) > -1)
                                return true;
                        }
                        return false;
                    })(['API.djLeave', 'API.djJoin', 'API.moderateLockWaitList', 'API.moderateForceSkip', '.getScript('])) {
                    c();
                    return;
                }
            }
            if (typeof startWooting === 'function' && startWooting.toString().indexOf('API.sendChat(') > -1)
                c();
        }
    });
});