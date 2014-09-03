define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var lastJoin = {}, handler = TriggerHandler.extend({
        trigger: API.USER_JOIN,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.USER_JOIN) === enumNotifications.USER_JOIN && (lastJoin[data.id] === undefined || lastJoin[data.id] < Date.now() - 5e3)) {
                var relationship = 0;
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.join.' + (relationship === 0 || relationship === undefined ? 'normal' : (relationship > 1 ? 'friend' : 'fan')), p3Utils.cleanTypedString(data.username)), Settings.colors.join);
            }
            lastJoin[data.id] = Date.now();
            if (p3Utils.getUserData(data.id, 'joinTime', 0) === 0)
                p3Utils.setUserData(data.id, 'joinTime', Date.now());
        }
    });
    return new handler();
});