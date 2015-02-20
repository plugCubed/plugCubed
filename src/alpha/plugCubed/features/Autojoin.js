define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/RoomSettings', 'plugCubed/Lang', 'plugCubed/Utils', 'plugCubed/dialogs/Menu'], function(TriggerHandler, Settings, RoomSettings, p3Lang, p3Utils, Menu) {
    var join, handler;

    join = function() {
        var dj = API.getDJ();
        var userId = API.getUser().id;
        if ((dj !== null && dj.id == userId) || API.getWaitListPosition() > -1 ||
          API.getWaitList().length == 50 || this.lastDJ == userId) return;
        $('#dj-button').click();
    };

    handler = TriggerHandler.extend({
        trigger: {
            advance: 'onDjAdvance',
            chat: 'onChat'
        },
        onDjAdvance: function(data) {
            this.lastDJ = data.lastPlay.dj != null ? data.lastPlay.dj.id : null;
            if (!Settings.autojoin || !RoomSettings.rules.allowAutojoin) return;
            join();
        },
        onChat: function(data) {
            if (!(RoomSettings.rules.allowAutojoin !== false && Settings.autojoin))
                return;

            var a, b;
            a = data.type == 'mention' && API.hasPermission(data.fromID, API.ROLE.BOUNCER);
            b = data.message.indexOf('@') < 0 && (API.hasPermission(data.fromID, API.ROLE.MANAGER) || p3Utils.isPlugCubedDeveloper(data.fromID));
            if (a || b) {
                if (data.message.indexOf('!joindisable') > -1) {
                    Settings.autojoin = false;
                    Menu.setEnabled('join', Settings.autojoin);
                    Settings.save();
                    API.sendChat(p3Lang.i18n('autojoin.commandDisable', '@' + data.un));
                }
            }
        }
    });

    return new handler();
});
