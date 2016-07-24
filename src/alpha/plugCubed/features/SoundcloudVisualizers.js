define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils'], function(TriggerHandler, Settings, p3Utils) {
    var Handler = TriggerHandler.extend({
        trigger: 'advance',
        handler: function(data) {
            if (!Settings.visualizers || !data.media || (data.media && data.media.format !== 2)) return;

            p3Utils.setSoundCloudVisualizer();
        }
    });

    return new Handler();
});
