define(['jquery', 'plugCubed/Class', 'plugCubed/Version', 'plugCubed/enums/Notifications', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/RoomSettings', 'plugCubed/Slider', 'plugCubed/dialogs/CustomChatColors', 'plugCubed/dialogs/ControlPanel', 'plugCubed/handlers/ChatHandler', 'plugCubed/handlers/FullscreenHandler', 'plugCubed/bridges/context', 'plugCubed/bridges/Database', 'lang/Lang'], function($, Class, Version, enumNotifications, Settings, p3Utils, p3Lang, Styles, RoomSettings, Slider, dialogColors, dialogControlPanel, ChatHandler, FullscreenHandler, Context, Database, Lang) {

    var $wrapper;
    var $menuDiv;
    var menuClass;
    var that;
    var menuButton;
    var streamButton;
    var clearChatButton;
    var _onClick;

    menuButton = $('<div id="plugcubed"><div class="cube-wrap"><div class="cube"><i class="icon icon-plugcubed"></i><i class="icon icon-plugcubed other"></i></div></div></div>');
    streamButton = $('<div>').addClass('chat-header-button p3-s-stream').data('key', 'stream');
    clearChatButton = $('<div>').addClass('chat-header-button p3-s-clear').data('key', 'clear');

    function GUIButton(setting, id, text) {
        return $('<div>').addClass('item p3-s-' + id + (setting ? ' selected' : '')).append($('<i>').addClass('icon icon-check-blue')).append($('<span>').text(text)).data('key', id).click(_onClick);
    }

    menuClass = Class.extend({
        init: function() {
            that = this;
            _onClick = $.proxy(this.onClick, this);

            this.shown = false;

            $('#app-menu').after(menuButton);
            menuButton.click(function() {
                that.toggleMenu();
                dialogControlPanel.toggleControlPanel(false);
            });
            $('#room-bar').css('left', 108).find('.favorite').css('right', 55);
            $('#plugcubed .cube-wrap .cube').bind('webkitAnimationEnd mozAnimationEnd msAnimationEnd animationEnd', function() {
                $('#plugcubed .cube-wrap .cube').removeClass('spin');
            });
            $('#plugcubed').mouseenter(function() {
                $('#plugcubed .cube-wrap .cube').addClass('spin');
            });
            $('#chat-header').append(streamButton.click($.proxy(this.onClick, this)).mouseover(function() {
                Context.trigger('tooltip:show', p3Lang.i18n('tooltip.stream'), $(this), true);
            }).mouseout(function() {
                Context.trigger('tooltip:hide');
            })).append(clearChatButton.click($.proxy(this.onClick, this)).mouseover(function() {
                Context.trigger('tooltip:show', p3Lang.i18n('tooltip.clear'), $(this), true);
            }).mouseout(function() {
                Context.trigger('tooltip:hide');
            }));
            this.onRoomJoin();

            Context.on('room:joined', this.onRoomJoin, this);

            FullscreenHandler.create();
        },
        onRoomJoin: function() {
            this.setEnabled('stream', Database.settings.streamDisabled);
        },
        close: function() {
            menuButton.remove();
            if ($wrapper != null)
                $wrapper.remove();
            $('#room-bar').css('left', 54).find('.favorite').css('right', 0);
            streamButton.remove();
            clearChatButton.remove();

            Context.off('room:joined', this.onRoomJoin, this);
            dialogControlPanel.close();
            FullscreenHandler.close();
        },
        /**
         * Set whether a menu setting is enabled
         * @param {String} id Menu setting ID
         * @param {Boolean} value Is this menu setting enabled?
         */
        setEnabled: function(id, value) {
            var elem = $('.p3-s-' + id).removeClass('selected');
            if (value) elem.addClass('selected');
        },
        /**
         * Handle click event
         * @param {Event} e The click event
         */
        onClick: function(e) {
            var a = $(e.currentTarget).data('key');
            switch (a) {
                case 'woot':
                    Settings.autowoot = !Settings.autowoot;
                    this.setEnabled('woot', Settings.autowoot);
                    if (Settings.autowoot) {
                        (function() {
                            var dj = API.getDJ();
                            if (dj === null || dj.id === API.getUser().id) return;
                            $('#woot').click();
                        })();
                    }
                    break;
                case 'join':
                    Settings.autojoin = !Settings.autojoin;
                    this.setEnabled('join', Settings.autojoin);
                    if (Settings.autojoin) {
                        (function() {
                            var dj = API.getDJ();
                            if (dj != null && dj.id === API.getUser().id || API.getWaitListPosition() > -1) return;
                            $('#dj-button').click();
                        })();
                    }
                    break;
                case 'chatimages':
                    Settings.chatImages = !Settings.chatImages;
                    this.setEnabled('chatimages', Settings.chatImages);
                    break;
                case 'twitchemotes':
                    Settings.twitchEmotes = !Settings.twitchEmotes;
                    if (Settings.twitchEmotes) {
                        ChatHandler.loadTwitchEmotes();
                    } else {
                        ChatHandler.unloadTwitchEmotes();
                    }
                    this.setEnabled('twitchemotes', Settings.twitchEmotes);
                    break;
                case 'colors':
                    dialogColors.render();
                    break;
                case 'controlpanel':
                    dialogControlPanel.toggleControlPanel(true);
                    this.toggleMenu(false);
                    break;
                case 'autorespond':
                    Settings.autorespond = !Settings.autorespond;
                    this.setEnabled('autorespond', Settings.autorespond);
                    if (Settings.autorespond) {
                        if (Settings.awaymsg.trim() === '')
                            Settings.awaymsg = p3Lang.i18n('autorespond.default');
                        $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                    } else {
                        $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                    }
                    break;
                case 'notify-join':
                case 'notify-leave':
                case 'notify-grab':
                case 'notify-meh':
                case 'notify-stats':
                case 'notify-updates':
                case 'notify-history':
                case 'notify-songLength':
                case 'notify-unavailable':
                    var elem = $('.p3-s-' + a);
                    if (!elem.data('perm') || (API.hasPermission(undefined, elem.data('perm')) || p3Utils.isPlugCubedDeveloper())) {
                        var bit = elem.data('bit');
                        Settings.notify += (Settings.notify & bit) === bit ? -bit : bit;
                        this.setEnabled(a, (Settings.notify & bit) === bit);
                    }
                    break;
                case 'stream':
                    Database.settings.streamDisabled = !Database.settings.streamDisabled;
                    Context.trigger('change:streamDisabled');
                    this.setEnabled('stream', Database.settings.streamDisabled);
                    break;
                case 'clear':
                    Context.trigger('ChatFacadeEvent:clear');
                    break;
                case 'roomsettings':
                    var b = Settings.useRoomSettings[window.location.pathname.split('/')[1]];
                    b = !(b == null || b === true);
                    Settings.useRoomSettings[window.location.pathname.split('/')[1]] = b;
                    if (b) RoomSettings.update();
                    RoomSettings.execute(b);
                    this.setEnabled('roomsettings', b);
                    break;
                case 'showdeletedmessages':
                    Settings.moderation.showDeletedMessages = !Settings.moderation.showDeletedMessages;
                    this.setEnabled('showdeletedmessages', Settings.moderation.showDeletedMessages);
                    console.log(Settings.moderation.showDeletedMessages);
                    break;
                case 'afktimers':
                    Settings.moderation.afkTimers = !Settings.moderation.afkTimers;
                    this.setEnabled('afktimers', Settings.moderation.afkTimers);
                    if (Settings.moderation.afkTimers) {
                        //Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                    } else {
                        //Styles.unset('waitListMove');
                        $('#waitlist').find('.user .afkTimer').remove();
                    }
                    break;
                case 'etatimer':
                    Settings.etaTimer = !Settings.etaTimer;
                    this.setEnabled('etatimer', Settings.etaTimer);
                    if (Settings.etaTimer) {
                        Styles.set('etaTimer', '#your-next-media .song { top: 8px!important; }');
                    } else {
                        Styles.unset('etaTimer');
                        var $djButton = $('#dj-button').find('span');
                        var waitListPos = API.getWaitListPosition();

                        if (waitListPos < 0) {
                            $djButton.html(API.getWaitList().length < 50 ? Lang.dj.waitJoin : Lang.dj.waitFull);
                            break;
                        }

                        $djButton.html(Lang.dj.waitLeave);
                    }
                    break;
                default:
                    API.chatLog(p3Lang.i18n('error.unknownMenuKey', a));
                    break;
            }
            Settings.save();
        },
        /**
         * Create the menu.
         * If the menu already exist, recreates it.
         */
        createMenu: function() {
            if ($menuDiv != null)
                $menuDiv.remove();
            $menuDiv = $('<div>').css('left', this.shown ? 0 : -500).attr('id', 'p3-settings');
            var header = $('<div>').addClass('header');
            var container = $('<div>').addClass('container');

            // Header
            header.append($('<div>').addClass('back').append($('<i>').addClass('icon icon-arrow-left')).click(function() {
                that.toggleMenu(false);
            }));
            header.append($('<div>').addClass('title').append($('<i>').addClass('icon icon-settings-white')).append($('<span>plug&#179;</span>')).append($('<span>').addClass('version').text(Version)));

            // Features
            container.append($('<div>').addClass('section').text('Features'));
            if (RoomSettings.rules.allowAutowoot !== false)
                container.append(GUIButton(Settings.autowoot, 'woot', p3Lang.i18n('menu.autowoot')));

            if (RoomSettings.rules.allowAutojoin !== false)
                container.append(GUIButton(Settings.autojoin, 'join', p3Lang.i18n('menu.autojoin')));

            if (RoomSettings.rules.allowAutorespond !== false) {
                container.append(GUIButton(Settings.autorespond, 'autorespond', p3Lang.i18n('menu.autorespond')));
                container.append($('<div class="item">').addClass('p3-s-autorespond-input').append($('<input>').val(Settings.awaymsg === '' ? p3Lang.i18n('autorespond.default') : Settings.awaymsg).keyup(function() {
                    $(this).val($(this).val().split('@').join(''));
                    Settings.awaymsg = $(this).val().trim();
                    Settings.save();
                })).mouseover(function() {
                    Context.trigger('tooltip:show', p3Lang.i18n('tooltip.afk'), $(this), false);
                }).mouseout(function() {
                    Context.trigger('tooltip:hide');
                }));
            }

            if (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                container.append(GUIButton(Settings.moderation.afkTimers, 'afktimers', p3Lang.i18n('menu.afktimers')));
                container.append(GUIButton(Settings.moderation.showDeletedMessages, 'showdeletedmessages', p3Lang.i18n('menu.showdeletedmessages')));
            }

            if (RoomSettings.haveRoomSettings) {
                container.append(GUIButton(Settings.useRoomSettings[window.location.pathname.split('/')[1]] != null ? Settings.useRoomSettings[window.location.pathname.split('/')[1]] : true, 'roomsettings', p3Lang.i18n('menu.roomsettings')));
            }

            container.append(GUIButton(Settings.etaTimer, 'etatimer', p3Lang.i18n('menu.etatimer')));
            container.append(GUIButton(Settings.chatImages, 'chatimages', p3Lang.i18n('menu.chatimages')));
            container.append(GUIButton(Settings.twitchEmotes, 'twitchemotes', p3Lang.i18n('menu.twitchemotes')));
            container.append(GUIButton(false, 'colors', p3Lang.i18n('menu.customchatcolors') + '...'));

            if (p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) {
                container.append(GUIButton(false, 'controlpanel', p3Lang.i18n('menu.controlpanel') + '...'));
            }

            // Divider
            container.append($('<div class="spacer">').append($('<div class="divider">')));

            // Notification
            container.append($('<div class="section">' + p3Lang.i18n('notify.header') + '</div>'));

            container.append(GUIButton((Settings.notify & enumNotifications.USER_JOIN) === enumNotifications.USER_JOIN, 'notify-join', p3Lang.i18n('notify.join')).data('bit', enumNotifications.USER_JOIN));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_LEAVE) === enumNotifications.USER_LEAVE, 'notify-leave', p3Lang.i18n('notify.leave')).data('bit', enumNotifications.USER_LEAVE));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_GRAB) === enumNotifications.USER_GRAB, 'notify-grab', p3Lang.i18n('notify.grab')).data('bit', enumNotifications.USER_GRAB));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_MEH) === enumNotifications.USER_MEH, 'notify-meh', p3Lang.i18n('notify.meh')).data('bit', enumNotifications.USER_MEH));
            container.append(GUIButton((Settings.notify & enumNotifications.SONG_STATS) === enumNotifications.SONG_STATS, 'notify-stats', p3Lang.i18n('notify.stats')).data('bit', enumNotifications.SONG_STATS));
            container.append(GUIButton((Settings.notify & enumNotifications.SONG_UPDATE) === enumNotifications.SONG_UPDATE, 'notify-updates', p3Lang.i18n('notify.updates')).data('bit', enumNotifications.SONG_UPDATE));

            if (API.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
                var songLengthSlider = new Slider(5, 30, Settings.notifySongLength, function(v) {
                    Settings.notifySongLength = v;
                    Settings.save();
                    $('.p3-s-notify-songLength').find('span').text(p3Lang.i18n('notify.songLength', v));
                });
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_HISTORY) === enumNotifications.SONG_HISTORY, 'notify-history', p3Lang.i18n('notify.history')).data('bit', enumNotifications.SONG_HISTORY).data('perm', API.ROLE.BOUNCER));
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_UNAVAILABLE) === enumNotifications.SONG_UNAVAILABLE, 'notify-unavailable', p3Lang.i18n('notify.songUnavailable')).data('bit', enumNotifications.SONG_UNAVAILABLE).data('perm', API.ROLE.BOUNCER));
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_LENGTH) === enumNotifications.SONG_LENGTH, 'notify-songLength', p3Lang.i18n('notify.songLength', Settings.notifySongLength)).data('bit', enumNotifications.SONG_LENGTH).data('perm', API.ROLE.BOUNCER));
                container.append(songLengthSlider.$slider.css('left', 40));
                $wrapper = $('<div>').attr('id', 'p3-settings-wrapper');
                $('body').append($wrapper.append($menuDiv.append(header).append(container)));
                if (songLengthSlider != null) songLengthSlider.onChange();
            }
        },
        /**
         * Toggle the visibility of the menu
         * @param {Boolean} [shown] Force it to be shown or hidden.
         */
        toggleMenu: function(shown) {
            if ($menuDiv == null) {
                this.createMenu();
            }
            this.shown = shown == null ? !this.shown : shown;
            if (!this.shown)
                dialogColors.hide();
            $menuDiv.animate({
                left: this.shown ? 0 : -500
            }, {
                complete: function() {
                    if (!that.shown) {
                        $menuDiv.detach();
                        $menuDiv = undefined;
                    }
                }
            });
        }
    });
    return new menuClass();
});
