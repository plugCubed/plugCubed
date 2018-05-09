define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Lang'], function(TriggerHandler, Settings, p3Lang) {
    var Handler = TriggerHandler.extend({
        trigger: 'advance',
        handler: function(data) {
            if (data && data.media && Settings.registeredSongs.indexOf(data.media.id) > -1) {
                setTimeout(function() {
                    API.setVolume(0);
                }, 800);
                API.chatLog(p3Lang.i18n('commands.responses.automute.automuted', data.media.title));
            }
        }
    });

    return new Handler();
});
