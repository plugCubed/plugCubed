define([
    'module', 'plugCubed/Class', 'plugCubed/Notifications', 'plugCubed/Version', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/Lang', 'plugCubed/Utils',
    'plugCubed/RoomSettings', 'plugCubed/dialogs/Menu', 'plugCubed/CustomChatColors', 'plugCubed/handlers/ChatHandler', 'plugCubed/handlers/CommandHandler', 'plugCubed/handlers/DialogHandler', 'plugCubed/handlers/FullscreenHandler', 'plugCubed/handlers/HideVideoHandler', 'plugCubed/handlers/VolumeSliderHandler', 'plugCubed/Features', 'plugCubed/Tickers', 'plugCubed/dialogs/panels/Panels', 'plugCubed/overrides/RoomUserListRow', 'plugCubed/Overrides', 'plugCubed/Socket'
], function(module, Class, Notifications, Version, Styles, Settings, p3Lang, p3Utils, RoomSettings, Menu, CustomChatColors, ChatHandler, CommandHandler, DialogHandler, FullscreenHandler, HideVideoHandler, VolumeSliderHandler, Features, Tickers, Panels, p3RoomUserListRow, Overrides, Socket) {
    var Loader;
    var loaded = false;
    var RoomUsersListView = window.plugCubedModules.RoomUsersListView;
    var original = RoomUsersListView.prototype.RowClass;

    function __init() {
        p3Utils.chatLog(undefined, p3Lang.i18n('running', Version) + '</span><br><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('commandsHelp'), Settings.colors.infoMessage1, -10);

        $('head').append('<link rel="stylesheet" type="text/css" id="plugcubed-css" href="https://plugcubed.net/scripts/alpha/plugCubed.css?v=' + Version.getSemver() + '"/>');

        /*
         * Fix user data consistency. As plug.dj only grabs users at first with /_/rooms/state.
         * /_/rooms/state is not in line with /_/users/bulk, /_/users/me and /_/users/:id in that it is missing the user's slug, language, last_seen, and various other properties.
         */
        var requireUsers = window.plugCubedModules.users;

        if (requireUsers && requireUsers._byId) {
            var ids = Object.keys(requireUsers._byId).filter(function(item) {
                return _.isFinite(item);
            });

            $.ajax({
                dataType: 'json',
                contentType: 'application/json',
                type: 'POST',
                url: '/_/users/bulk',
                data: JSON.stringify({
                    ids: ids
                })
            }).then(function(data) {
                if (data.status === 'ok' && data.data.length > 0) {
                    var userData = data.data;

                    for (var i = 0; i < userData.length; i++) {
                        var userDataItem = userData[i];

                        if (requireUsers.get(userDataItem.id) != null) {
                            requireUsers.get(userDataItem.id).set(userDataItem);
                        }
                    }
                }
            });
        }

        var users = API.getUsers();

        for (var i = 0; i < users.length; i++) {
            if (p3Utils.getUserData(users[i].id, 'joinTime', -1) < 0) {
                p3Utils.setUserData(users[i].id, 'inRoom', true);
                p3Utils.setUserData(users[i].id, 'joinTime', Date.now());
            }
        }
        RoomUsersListView.prototype.RowClass = p3RoomUserListRow;
        Overrides.override();

        initBody();
        window.plugCubed.version = Version.getSemver();
        window.plugCubed.chatHistory = [];
        window.plugCubed.emotes = {
            twitchEmotes: {},
            twitchSubEmotes: {},
            tastyEmotes: {},
            bttvEmotes: {},
            customEmotes: {},
            emoteHash: {},
            ffzEmotes: {},
            rcsEmotes: {}
        };
        window.thedark1337 = window.plugCubed.thedark1337 =
            '\n▄▄▄█████▓ ██░ ██ ▓█████ ▓█████▄  ▄▄▄       ██▀███   ██ ▄█▀   ██ ▓▀████▄ ▓▀████▄ ▒▀████▄' +
            '\n▓  ██▒ ▓▒▓██░ ██▒▓█   ▀ ▒██▀ ██▌▒████▄    ▓██ ▒ ██▒ ██▄█▒    ██ ░  ▒░ █ ░  ▒░ █    ░▒▓██' +
            '\n▒ ▓██░ ▒░▒██▀▀██░▒███   ░██   █▌▒██  ▀█▄  ▓██ ░▄█ ▒▓███▄░    ██   ▄▄▄█    ▄▄▄█       ██' +
            '\n░ ▓██▓ ░ ░▓█ ░██ ▒▓█  ▄ ░▓█▄   ▌░██▄▄▄▄██ ▒██▀▀█▄  ▓██ █▄    ██       █       █     ██' +
            '\n  ▒██▒ ░ ░▓█▒░██▓░▒████▒░▒████▓  ▓█   ▓██▒░██▓ ▒██▒▒██▒ █▄   ██  ▄████▀  ▄████▀    ██' +
            '\n  ▒ ░░    ▒ ░░▒░▒░░ ▒░ ░ ▒▒▓  ▒  ▒▒   ▓▒█░░ ▒▓ ░▒▓░▒ ▒▒ ▓▒   ▓▒   ░▓ ▒    ░▓ ▒     ░░ ' +
            '\n    ░     ▒ ░▒░ ░ ░ ░  ░ ░ ▒  ▒   ▒   ▒▒ ░  ░▒ ░ ▒░░ ░▒ ▒░   ▒░   ░▒ ░    ░▒ ░     ░' +
            '\n  ░       ░  ░░ ░   ░    ░ ░  ░   ░   ▒     ░░   ░ ░ ░░ ░    ░     ░ ░     ░ ░' +
            '\n          ░  ░  ░   ░  ░   ░          ░  ░   ░     ░  ░            ░       ░  ' +
            '\n                         ░                                           ░       ░ ' +
            '\n                                                                                       ';
        Features.register();
        Notifications.register();
        Tickers.register();
        CommandHandler.register();
        ChatHandler.register();
        FullscreenHandler.create();
        HideVideoHandler.create();
        VolumeSliderHandler.register();

        Settings.load();

        RoomSettings.update();

        Socket.connect();

        if (p3Utils.getRoomID() === 'tastycat') RoomSettings.rules.allowShowingMehs = false;

        Panels.register();
        DialogHandler.register();

        loaded = true;

        if (typeof console.timeEnd === 'function') console.timeEnd('[plug³] Loaded');
    }

    function initBody() {
        var rank = p3Utils.getRank();

        if (rank === 'dj') rank = 'residentdj';
        $('body').addClass('rank-' + rank + ' id-' + API.getUser().id);
    }

    Loader = Class.extend({
        init: function() {
            if (loaded) return;

            // Define UserData in case it's not already defined (reloaded p3 without refresh)
            if (typeof window.plugCubedUserData === 'undefined') {
                window.plugCubedUserData = {};
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
            FullscreenHandler.close();
            HideVideoHandler.close();
            CommandHandler.close();
            DialogHandler.close();
            VolumeSliderHandler.close();

            RoomUsersListView.prototype.RowClass = original;
            Overrides.revert();

            var mainClass = module.id.split('/')[0];
            var modules = Object.keys(require.s.contexts._.defined);

            for (var i = 0, j = modules.length; i < j; i++) {
                if (modules[i] && p3Utils.startsWith(modules[i], mainClass)) {
                    requirejs.undef(modules[i]);
                }
            }

            $('#plugcubed-css,#p3-settings-wrapper').remove();

            plugCubed = undefined;
        }
    });

    return Loader;
});
