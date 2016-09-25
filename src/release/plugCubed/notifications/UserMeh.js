define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications', 'plugCubed/RoomSettings'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications, RoomSettings) {
    var CurrentUser = window.plugCubedModules.CurrentUser;
    var Handler = TriggerHandler.extend({
        trigger: API.VOTE_UPDATE,
        handler: function(data) {
            var isStaff = (CurrentUser.hasPermission(API.ROLE.BOUNCER) || CurrentUser.hasPermission(API.ROLE.BOUNCER, true) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador());

            if (data.vote < 0 && (((Settings.notify & enumNotifications.USER_MEH) === enumNotifications.USER_MEH) && (isStaff || (!isStaff && RoomSettings.rules.allowShowingMehs)))) {
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.meh'), Settings.colors.meh || Settings.colorInfo.notifications.meh.color, data.user.id);
            }
        }
    });

    return new Handler();
});
