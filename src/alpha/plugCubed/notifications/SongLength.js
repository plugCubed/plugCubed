define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_LENGTH) === enumNotifications.SONG_LENGTH && data.media.duration > Settings.notifySongLength * 60) {
                p3Utils.playMentionSound();
                setTimeout(p3Utils.playMentionSound, 50);
                p3Utils.chatLog('system', p3Lang.i18n('notify.message.songLength', Settings.notifySongLength) + '<br><span onclick="if (API.getMedia().id === \'' + data.id + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>', Settings.colors.songLength || Settings.colorInfo.notifications.songLength.color, -1);
            }
        }
    });
    return new handler();
});
