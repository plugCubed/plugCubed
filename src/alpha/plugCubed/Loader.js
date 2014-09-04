define(['module', 'plugCubed/Class', 'plugCubed/Notifications', 'plugCubed/Version', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Socket', 'plugCubed/RSS', 'plugCubed/dialogs/Menu', 'plugCubed/CustomChatColors', 'plugCubed/handlers/ChatHandler', 'plugCubed/handlers/CommandHandler', 'plugCubed/Features', 'plugCubed/Tickers', 'plugCubed/dialogs/panels/Panels'], function(module, Class, Notifications, Version, Styles, Settings, p3Utils, p3Lang, Socket, RSS, Menu, CustomChatColors, ChatHandler, CommandHandler, Features, Tickers, Panels) {
    var RoomUserListView, Loader, loaded = false;

    var p3RoomUserListRow, p3UserRolloverView;

    if (!p3Utils.runLite) {
        RoomUserListView = require('app/views/room/user/RoomUserListView');
        require(['plugCubed/RoomUserListRow', 'plugCubed/UserRolloverView'], function(a, b) {
            p3RoomUserListRow = a;
            p3UserRolloverView = b;
        });
    } else {
        RoomUserListView = function() {
        };
    }

    function __init() {
        p3Utils.chatLog(undefined, p3Lang.i18n('running', Version) + '</span><br><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('commandsHelp'), Settings.colors.infoMessage1);
        if (p3Utils.runLite) {
            p3Utils.chatLog(undefined, p3Lang.i18n('runningLite') + '</span><br><span class="chat-text" style="color:#FFFFFF">' + p3Lang.i18n('runningLiteInfo'), Settings.colors.warningMessage);
        }

        window.addEventListener('pushState', onRoomJoin);
        $('head').append('<link rel="stylesheet" type="text/css" id="plugcubed-css" href="https://d1rfegul30378.cloudfront.net/alpha/plugCubed.css" />');

        var users = API.getUsers();
        for (var i in users) {
            if (users.hasOwnProperty(i) && p3Utils.getUserData(users[i].id, 'joinTime', -1) < 0)
                p3Utils.setUserData(users[i].id, 'joinTime', Date.now());
        }

        if (!p3Utils.runLite) {
            RoomUserListView.prototype.RowClass = p3RoomUserListRow;
            p3UserRolloverView.override();
        }

        initBody();

        Features.register();
        Notifications.register();
        Tickers.register();
        CommandHandler.register();
        ChatHandler.register();

        RSS.update();

        Socket.connect();
        Settings.load();

        require('plugCubed/dialogs/ControlPanel').addTab("Test Tab").addToTab("Test Tab", $('<div>').text('This is my testing content, how does it work?!'));
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
        } else if (p3Utils.hasPermission(undefined, API.ROLE.RESIDENTDJ)) {
            rank = 'residentdj';
        }
        $('body').addClass('rank-' + rank).addClass('id-' + API.getUser().id);
    }

    function onRoomJoin() {
        if (typeof plugCubed !== 'undefined') {
            setTimeout(function() {
                if (API.enabled) {
                    $.getScript('https://d1rfegul30378.cloudfront.net/alpha/plugCubed.' + (version.minified ? 'min.' : '') + 'js');
                } else {
                    plugCubed.onRoomJoin();
                }
            }, 500);
        }
    }

    Loader = Class.extend({
        init: function() {
            if (loaded) return;

            // Define UserData in case it's not already defined (reloaded p3 without refresh)
            if (typeof plugCubedUserData === 'undefined') plugCubedUserData = {};

            // Load language and begin script after language loaded
            p3Lang.load($.proxy(__init, this));
        },
        close: function() {
            if (!loaded) return;

            Menu.close();
            RSS.close();
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
            }

            var mainClass = module.id.split('/')[0], modules = require.s.contexts._.defined;
            for (var i in modules) {
                if (!modules.hasOwnProperty(i)) continue;
                if (p3Utils.startsWith(i, mainClass))
                    requirejs.undef(i);
            }

            $('#plugcubed-css,#plugcubed-tracker').remove();

            delete plugCubed;
        }
    });
    return Loader;
});