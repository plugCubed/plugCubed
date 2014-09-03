define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/RSS', 'plugCubed/Utils', 'plugCubed/dialogs/Menu'], function(TriggerHandler, Settings, RSS, p3Utils, Menu) {
    var join, handler;

    join = function() {
        var dj = API.getDJ();
        if (dj === null || dj.id === API.getUser().id || API.getWaitListPosition() > -1) return;
        $('#dj-button').click();
    };

    handler = TriggerHandler.extend({
        trigger: {
            ADVANCE: this.onDjAdvance,
            WAIT_LIST_UPDATE: this.onWaitListUpdate,
            CHAT: this.onChat
        },
        onDjAdvance: function() {
            if (!Settings.autojoin || !RSS.rules.allowAutojoin) return;
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
            // Disable
            Settings.autojoin = false;
        },
        onChat: function(data) {
            var a = data.type == 'mention' && API.hasPermission(data.fromID, API.ROLE.BOUNCER), b = data.message.indexOf('@') < 0 && (API.hasPermission(data.fromID, API.ROLE.MANAGER) || p3Utils.isPlugCubedDeveloper(data.fromID));
            if (a || b) {
                if (data.message.indexOf('!joindisable') > -1 && (typeof RSS.rules.allowAutorespond === 'undefined' || RSS.rules.allowAutorespond !== false)) {
                    if (Settings.autojoin) {
                        Settings.autojoin = false;
                        Menu.setEnabled('autojoin', Settings.autojoin);
                        Settings.save();
                        API.sendChat(p3Lang.i18n('autojoin.commandDisable', '@' + data.from));
                    }
                }
            }
        }
    });
    return new handler();
});