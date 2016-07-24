define(['jquery', 'plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function($, TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var Handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {

            // TODO: Fix for new YouTube / SoundCloud APIs
            return;

            // if ((Settings.notify & enumNotifications.SONG_UNAVAILABLE) === enumNotifications.SONG_UNAVAILABLE) {
            // }
        }
    });
    return new Handler();
});
