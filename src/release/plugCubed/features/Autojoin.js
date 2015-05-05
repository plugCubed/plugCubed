define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/RoomSettings', 'plugCubed/Lang', 'plugCubed/Utils', 'plugCubed/dialogs/Menu'], function(TriggerHandler, Settings, RoomSettings, p3Lang, p3Utils, Menu) {
    var join, handler;

    join = function() {
        var dj = API.getDJ();
        if ((dj !== null && dj.id == API.getUser().id) || API.getWaitListPosition() > -1 || API.getWaitList().length == 50) return;
        $('#dj-button').click();
    };

    handler = TriggerHandler.extend({
        trigger: {
            advance: 'onDjAdvance',
            waitListUpdate: 'onWaitListUpdate',
            chat: 'onChat'
        },
        onDjAdvance: function(data) {
            this.lastDJ = data.lastPlay.dj !== null ? data.lastPlay.dj.id : null;
            if (!Settings.autojoin || !RoomSettings.rules.allowAutojoin) return;
            join();
        },
        onWaitListUpdate: function() {
            // If autojoin is not enabled, don't try to disable
            if (!Settings.autojoin) return;
            // If user is DJing, don't try to disable
            var dj = API.getDJ();
            if (dj !== null && dj.id === API.getUser().id) return;
            // If user is in waitlist, don't try to disable
            if (API.getWaitListPosition() > -1) return;
            // If waitlist is full, don't try to disable
            if (API.getWaitList().length == 50) return;
            // If user was last DJ (DJ Cycle Disabled)
            if (this.lastDJ == API.getUser().id) return;
            // Disable
            Settings.autojoin = false;
            Menu.setEnabled('join', Settings.autojoin);
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