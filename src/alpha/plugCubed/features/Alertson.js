define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils'], function(TriggerHandler, Settings, p3Utils) {
    var Handler = TriggerHandler.extend({
        trigger: 'chat',
        handler: function(data) {
            for (var i in Settings.alertson) {
                if (!Settings.alertson.hasOwnProperty(i)) continue;
                if (data.message.indexOf(Settings.alertson[i]) > -1) {
                    p3Utils.playChatSound();
                    return;
                }
            }
        }
    });

    return new Handler();
});
