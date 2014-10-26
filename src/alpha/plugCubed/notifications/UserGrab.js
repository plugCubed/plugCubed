define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.GRAB_UPDATE,
        handler: function(data) {
            var media = API.getMedia();
            if ((Settings.notify & enumNotifications.USER_CURATE) === enumNotifications.USER_CURATE)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.grab', p3Utils.cleanTypedString(data.user.username), media.author, media.title), Settings.colors.grab);
        }
    });
    return new handler();
});