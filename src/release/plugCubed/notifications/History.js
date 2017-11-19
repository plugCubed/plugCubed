define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var history = [];
    var Handler = TriggerHandler.extend({
        trigger: {
            historyUpdate: 'onHistoryUpdate',
            modSkip: 'onSkip',
            userSkip: 'onSkip',
            voteSkip: 'onSkip'
        },
        register: function() {
            this.getHistory();
            this._super();
        },
        isInHistory: function(cid) {
            var info = {
                pos: -1,
                inHistory: false,
                skipped: false,
                length: history.length
            };

            for (var i in history) {
                if (!history.hasOwnProperty(i)) continue;
                var a = history[i];

                if (a.cid === cid && (~~i + 1) < history.length) {
                    info.pos = ~~i + 2;
                    info.inHistory = true;
                    if (!a.wasSkipped) {
                        return info;
                    }
                }
            }
            info.skipped = info.pos > -1;

            return info;
        },
        onHistoryCheck: function(cid) {
            if ((!API.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper()) || (Settings.notify & enumNotifications.SONG_HISTORY) !== enumNotifications.SONG_HISTORY) return;
            var historyData = this.isInHistory(cid);

            if (historyData.inHistory) {
                if (!historyData.skipped) {
                    p3Utils.playMentionSound();
                    p3Utils.chatLog('system', p3Lang.i18n('notify.message.history', historyData.pos, historyData.length) + '<br><span onclick="if (API.getMedia().cid === \'' + cid + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>', undefined, -3);
                } else {
                    p3Utils.chatLog('system', p3Lang.i18n('notify.message.historySkipped', historyData.pos, historyData.length), undefined, -3);
                }
            }
        },
        onHistoryUpdate: function(data) {
            if (data[0] == null || data[0].media == null || data[0].user == null) return;
            this.onHistoryCheck(data[0].media.cid);
            var obj = {
                id: data[0].media.cid,
                author: data[0].media.author,
                title: data[0].media.title,
                wasSkipped: false,
                user: {
                    id: data[0].user.id,
                    username: data[0].user.username
                }
            };

            if (history.unshift(obj) > 50) {
                history.splice(50, history.length - 50);
            }
        },
        onSkip: function() {
            if (history[1]) {
                history[1].wasSkipped = true;
            }
        },
        getHistory: function() {
            history = [];
            var data = API.getHistory();

            for (var i in data) {
                if (!data.hasOwnProperty(i)) continue;
                var a = data[i];
                var obj = {
                    cid: a.media.cid,
                    author: a.media.author,
                    title: a.media.title,
                    wasSkipped: false,
                    user: {
                        id: a.user.id.toString(),
                        username: a.user.username
                    }
                };

                history.push(obj);
            }
        }
    });

    return new Handler();
});
