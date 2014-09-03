define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var lastLeave = {}, handler = TriggerHandler.extend({
        trigger: API.USER_LEAVE,
        handler: function(data) {
            var disconnects = p3Utils.getUserData(data.id, 'disconnects', {
                count: 0
            });
            if ((Settings.notify & enumNotifications.USER_LEAVE) === enumNotifications.USER_LEAVE && (disconnects.time === undefined || Date.now() - disconnects.time < 1000) && (lastLeave[data.id] === undefined || lastLeave[data.id] < Date.now() - 5e3)) {
                var relationship = 0;
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.leave.' + (relationship === 0 ? 'normal' : (relationship > 1 ? 'friend' : 'fan')), p3Utils.cleanTypedString(data.username)), Settings.colors.leave);
            }
            lastLeave[data.id] = Date.now();
        }
    });
    return new handler();
});