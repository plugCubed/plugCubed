define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var lastLeave = {};
    var Handler = TriggerHandler.extend({
        trigger: API.USER_LEAVE,
        handler: function(data) {
            var disconnects = p3Utils.getUserData(data.id, 'disconnects', {
                count: 0
            });

            if ((Settings.notify & enumNotifications.USER_LEAVE) === enumNotifications.USER_LEAVE && (disconnects.time == null || Date.now() - disconnects.time < 1000) && (lastLeave[data.id] == null || lastLeave[data.id] < Date.now() - 5e3)) {

                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.leave'), Settings.colors.leave || Settings.colorInfo.notifications.leave.color, data.id, (data.friend ? data.username + ' (friend)' : data.username));
            }
            lastLeave[data.id] = Date.now();

            p3Utils.setUserData(data.id, 'inRoom', false);
        }
    });

    return new Handler();
});
