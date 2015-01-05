define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Lang', 'plugCubed/bridges/PlaybackModel'], function(TriggerHandler, Settings, p3Lang, PlaybackModel) {
    var handler = TriggerHandler.extend({
        trigger: 'advance',
        handler: function(data) {
            if (data && data.media && Settings.registeredSongs.indexOf(data.media.id) > -1) {
                setTimeout(function() {
                    PlaybackModel.muteOnce();
                }, 800);
                API.chatLog(p3Lang.i18n('commands.responses.automute.automuted', data.media.title));
            }
        }
    });
    return new handler();
});