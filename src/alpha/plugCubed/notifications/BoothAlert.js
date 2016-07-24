define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var Handler = TriggerHandler.extend({
        trigger: {
            advance: 'boothAlert',
            waitListUpdate: 'boothAlert'
        },
        hasNotified: false,
        boothAlert: function(data) {
            if ((Settings.notify & enumNotifications.BOOTH_ALERT) === enumNotifications.BOOTH_ALERT && API.getWaitListPosition() + 1 === Settings.boothAlert) {
                if (!this.hasNotified) {
                    this.hasNotified = true;
                    setTimeout(function() {
                        var pos = API.getWaitListPosition() + 1;

                        p3Utils.playMentionSound();
                        p3Utils.chatLog(undefined, p3Lang.i18n((pos === 1 ? 'notify.message.boothAlertNext' : 'notify.message.boothAlertPos'), p3Utils.getOrdinal(Settings.boothAlert)), Settings.colors.boothAlert || Settings.colorInfo.notifications.boothAlert.color, -4);
                    }, 3000);
                } else {
                    this.hasNotified = false;
                }
            }
        }
    });

    return new Handler();
});
