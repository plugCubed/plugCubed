define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var Handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_UPDATE) === enumNotifications.SONG_UPDATE && data.media != null && data.dj != null) {
                if (data.media.format === 1 && Settings.notifyUpdatesLink) {
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.updates', p3Utils.cleanTypedString(data.media.title), p3Utils.cleanTypedString(data.media.author), p3Utils.cleanTypedString(data.dj.username) + ' Link: https://youtu.be/' + API.getMedia().cid), Settings.colors.updates || Settings.colorInfo.notifications.updates.color, -7);
                } else if (data.media.format === 2 && Settings.notifyUpdatesLink) {
                    SC.get('/tracks/' + API.getMedia().cid, function(e) {
                        p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.updates', p3Utils.cleanTypedString(data.media.title), p3Utils.cleanTypedString(data.media.author), p3Utils.cleanTypedString(data.dj.username) + ' Link: ' + e.permalink_url), Settings.colors.updates || Settings.colorInfo.notifications.updates.color, -7);
                    });
                } else {
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.updates', p3Utils.cleanTypedString(data.media.title), p3Utils.cleanTypedString(data.media.author), p3Utils.cleanTypedString(data.dj.username)), Settings.colors.updates || Settings.colorInfo.notifications.updates.color, -7);
                }
            }
        }
    });

    return new Handler();
});
