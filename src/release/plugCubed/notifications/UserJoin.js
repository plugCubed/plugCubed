define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var lastJoin = {};
    var handler = TriggerHandler.extend({
        trigger: API.USER_JOIN,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.USER_JOIN) === enumNotifications.USER_JOIN && (lastJoin[data.id] == null || lastJoin[data.id] < Date.now() - 5e3)) {
                // TODO: Add check if friend
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.join'), Settings.colors.join || Settings.colorInfo.notifications.join.color, data.id, data.username);
            }

            lastJoin[data.id] = Date.now();

            if (p3Utils.getUserData(data.id, 'joinTime', 0) === 0)
                p3Utils.setUserData(data.id, 'joinTime', Date.now());
        }
    });
    return new handler();
});