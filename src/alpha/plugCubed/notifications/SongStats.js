define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_STATS) === enumNotifications.SONG_STATS && data.lastPlay != null && data.lastPlay.score != null)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.stats', data.lastPlay.score.positive, data.lastPlay.score.negative, data.lastPlay.score.grabs), Settings.colors.stats || Settings.colorInfo.notifications.stats.color, -1);
        }
    });
    return new handler();
});
