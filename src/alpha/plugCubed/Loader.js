define(['module', 'plugCubed/Class', 'plugCubed/Notifications', 'plugCubed/Version', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Socket', 'plugCubed/RoomSettings', 'plugCubed/dialogs/Menu', 'plugCubed/CustomChatColors', 'plugCubed/handlers/ChatHandler', 'plugCubed/handlers/CommandHandler', 'plugCubed/Features', 'plugCubed/Tickers', 'plugCubed/dialogs/panels/Panels', 'plugCubed/overrides/RoomUserListRow', 'plugCubed/overrides/UserRolloverView', 'plugCubed/overrides/WaitListRow'], function(module, Class, Notifications, Version, Styles, Settings, p3Utils, p3Lang, Socket, RoomSettings, Menu, CustomChatColors, ChatHandler, CommandHandler, Features, Tickers, Panels, p3RoomUserListRow, p3UserRolloverView, p3WaitListRow) {
    var Loader, loaded = false;

    var RoomUserListView;

    function __init() {
        p3Utils.chatLog(undefined, p3Lang.i18n('running', Version) + '</span><br><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('commandsHelp'), Settings.colors.infoMessage1, -1, 'plug&#179;');
        if (p3Utils.runLite) {
            p3Utils.chatLog(undefined, p3Lang.i18n('runningLite') + '</span><br><span class="chat-text" style="color:#FFFFFF">' + p3Lang.i18n('runningLiteInfo'), Settings.colors.warningMessage, -1, 'plug&#179;');
        }

        $('head').append('<link rel="stylesheet" type="text/css" id="plugcubed-css" href="https://d1rfegul30378.cloudfront.net/alpha/plugCubed.css" />');

        var users = API.getUsers();
        for (var i in users) {
            if (users.hasOwnProperty(i) && p3Utils.getUserData(users[i].id, 'joinTime', -1) < 0)
                p3Utils.setUserData(users[i].id, 'joinTime', Date.now());
        }

        if (!p3Utils.runLite) {
            RoomUserListView = require('app/views/room/user/RoomUserListView');
            RoomUserListView.prototype.RowClass = p3RoomUserListRow;
            p3UserRolloverView.override();
            p3WaitListRow.override();
        }

        initBody();

        Features.register();
        Notifications.register();
        Tickers.register();
        CommandHandler.register();
        ChatHandler.register();

        RoomSettings.update();

        Socket.connect();
        Settings.load();

        Panels.register();

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
            Socket.disconnect();
            Features.unregister();
            Notifications.unregister();
            Tickers.unregister();
            Panels.unregister();
            Styles.destroy();
            ChatHandler.close();
            CommandHandler.close();

            if (!p3Utils.runLite) {
                RoomUserListView.prototype.RowClass = require('app/views/room/user/RoomUserListRow');
                p3UserRolloverView.revert();
                p3WaitListRow.revert();
            }

            var mainClass = module.id.split('/')[0], modules = require.s.contexts._.defined;
            for (var i in modules) {
                if (!modules.hasOwnProperty(i)) continue;
                if (p3Utils.startsWith(i, mainClass))
                    requirejs.undef(i);
            }

            $('#plugcubed-css,#p3-settings-wrapper').remove();

            delete plugCubed;
        }
    });
    return Loader;
});