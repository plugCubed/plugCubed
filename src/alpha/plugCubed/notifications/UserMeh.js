define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.VOTE_UPDATE,
        handler: function(data) {
            if (data.vote < 0 && (Settings.notify & enumNotifications.USER_MEH) === enumNotifications.USER_MEH)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.meh', p3Utils.cleanTypedString(data.user.username)), Settings.colors.meh);
        }
    });
    return new handler();
});