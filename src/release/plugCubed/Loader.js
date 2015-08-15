define(['module', 'plugCubed/Class', 'plugCubed/Notifications', 'plugCubed/Version', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/RoomSettings', 'plugCubed/dialogs/Menu', 'plugCubed/CustomChatColors', 'plugCubed/handlers/ChatHandler', 'plugCubed/handlers/CommandHandler', 'plugCubed/handlers/DialogHandler', 'plugCubed/Features', 'plugCubed/Tickers', 'plugCubed/dialogs/panels/Panels', 'plugCubed/Overrides/RoomUserListRow', 'plugCubed/Overrides', 'plugCubed/bridges/RoomUserListView'], function(module, Class, Notifications, Version, Styles, Settings, p3Utils, p3Lang, RoomSettings, Menu, CustomChatColors, ChatHandler, CommandHandler, DialogHandler, Features, Tickers, Panels, p3RoomUserListRow, Overrides, RoomUserListView) {
    var Loader, loaded = false;

    var original = RoomUserListView.prototype.RowClass;

    function __init() {
        p3Utils.chatLog(undefined, p3Lang.i18n('running', Version) + '</span><br><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('commandsHelp'), Settings.colors.infoMessage1, -1, 'plug&#179;');
        if (p3Utils.runLite) {
            p3Utils.chatLog(undefined, p3Lang.i18n('runningLite') + '</span><br><span class="chat-text" style="color:#FFFFFF">' + p3Lang.i18n('runningLiteInfo'), Settings.colors.warningMessage, -1, 'plug&#179;');
        }

        $('head').append('<link rel="stylesheet" type="text/css" id="plugcubed-css" href="https://d1rfegul30378.cloudfront.net/files/plugCubed.css" />');

        var users = API.getUsers();
        for (var i in users) {
            if (users.hasOwnProperty(i) && p3Utils.getUserData(users[i].id, 'joinTime', -1) < 0)
                p3Utils.setUserData(users[i].id, 'joinTime', Date.now());
        }
        RoomUserListView.prototype.RowClass = p3RoomUserListRow;
        Overrides.override();

        initBody();

        Features.register();
        Notifications.register();
        Tickers.register();
        CommandHandler.register();
        ChatHandler.register();

        Settings.load();

        RoomSettings.update();

        Panels.register();
        DialogHandler.register();

        loaded = true;
    }

    function initBody() {
        var rank = 'regular';
        if (p3Utils.hasPermission(undefined, API.ROLE.HOST, true)) {
            rank = 'admin';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER, true)) {
            rank = 'ambassador';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.HOST)) {
            rank = 'host';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.COHOST)) {
            rank = 'cohost';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.MANAGER)) {
            rank = 'manager';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER)) {
            rank = 'bouncer';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.DJ)) {
            rank = 'residentdj';
        }
        $('body').addClass('rank-' + rank).addClass('id-' + API.getUser().id);
    }

    Loader = Class.extend({
        init: function() {
            if (loaded) return;

            // Define UserData in case it's not already defined (reloaded p3 without refresh)
            if (typeof plugCubedUserData === 'undefined') {
                //noinspection JSUndeclaredVariable
                plugCubedUserData = {};
            }

            // Load language and begin script after language loaded
            p3Lang.load($.proxy(__init, this));
        },
        close: function() {
            if (!loaded) return;

            Menu.close();
            RoomSettings.close();
            Features.unregister();
            Notifications.unregister();
            Tickers.unregister();
            Panels.unregister();
            Styles.destroy();
            ChatHandler.close();
            CommandHandler.close();
            DialogHandler.close();

            RoomUserListView.prototype.RowClass = original;
            Overrides.revert();

            var mainClass = module.id.split('/')[0],
                modules = require.s.contexts._.defined;
            for (var i in modules) {
                if (!modules.hasOwnProperty(i)) continue;
                if (p3Utils.startsWith(i, mainClass))
                    requirejs.undef(i);
            }

            $('#plugcubed-css,#p3-settings-wrapper').remove();

            plugCubed = undefined;
        }
    });
    return Loader;
});
