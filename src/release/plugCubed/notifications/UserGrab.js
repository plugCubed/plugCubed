define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var Handler = TriggerHandler.extend({
        trigger: API.GRAB_UPDATE,
        handler: function(data) {
            var media = API.getMedia();

            if ((Settings.notify & enumNotifications.USER_GRAB) === enumNotifications.USER_GRAB && media != null) {
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.grab', media.author, media.title), Settings.colors.grab || Settings.colorInfo.notifications.grab.color, data.user.id);
            }
        }
    });

    return new Handler();
});
