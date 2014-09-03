define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils'], function(TriggerHandler, Settings, p3Utils) {
    var handler = TriggerHandler.extend({
        trigger: API.CHAT,
        handler: function(data) {
            for (var i in Settings.alertson) {
                if (Settings.alertson.hasOwnProperty(i) && data.message.indexOf(Settings.alertson[i]) > -1) {
                    p3Utils.playChatSound();
                    return;
                }
            }
        }
    });
    
    return new handler();
});