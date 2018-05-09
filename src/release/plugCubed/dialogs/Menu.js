define(['jquery', 'plugCubed/Class', 'plugCubed/Version', 'plugCubed/enums/Notifications', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/RoomSettings', 'plugCubed/Slider', 'plugCubed/dialogs/CustomChatColors', 'plugCubed/dialogs/ControlPanel', 'plugCubed/handlers/ChatHandler'], function($, Class, Version, enumNotifications, Settings, p3Utils, p3Lang, Styles, RoomSettings, Slider, dialogColors, dialogControlPanel, ChatHandler) {

    var $wrapper, $menuDiv, MenuClass, that, menuButton, streamButton, clearChatButton, _onClick, Context, Database, Lang;

    Context = window.plugCubedModules.context;
    Database = window.plugCubedModules.database;
    Lang = window.plugCubedModules.Lang;
    menuButton = $('<li id="plugcubed"><div class="cube-wrap"><div class="cube"><i class="icon icon-plugcubed"></i><i class="icon icon-plugcubed other"></i></div></div></li>');
    streamButton = $('<div>').addClass('chat-header-button p3-s-stream').data('key', 'stream');
    clearChatButton = $('<div>').addClass('chat-header-button p3-s-clear').data('key', 'clear');

    function guiButton(setting, id, text) {
        return $('<div>').addClass('item p3-s-' + id + (setting ? ' selected' : '')).append($('<i>').addClass('icon icon-check-blue')).append($('<span>').text(text)).data('key', id).click(_onClick);
    }

    MenuClass = Class.extend({
        init: function() {
            that = this;
            _onClick = $.proxy(this.onClick, this);

            this.shown = false;

            $('.community__left-nav ul.extension').append(menuButton);
            menuButton.click(function() {
                that.toggleMenu();
                dialogControlPanel.toggleControlPanel(false);
            });
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
            Context.on('leftNavigation:open history:toggle playlist:toggle settings:toggle show:user show:history show:dashboard dashboard:disable', this.onPlugMenuOpen, this);
            Context.on('room:joined', this.onRoomJoin, this);
        },
        onRoomJoin: function() {
            this.setEnabled('stream', Database.settings.streamDisabled);
        },
        onPlugMenuOpen: function(isShowing) {
            if ((typeof isShowing === 'boolean' && isShowing) || typeof isShowing === 'undefined' || (typeof isShowing === 'string' && isShowing === 'store')) {
                this.toggleMenu(false);
                dialogControlPanel.toggleControlPanel(false);
            }
        },
        close: function() {
            menuButton.remove();
            if ($wrapper != null) {
                $wrapper.remove();
            }
            streamButton.remove();
            clearChatButton.remove();
            Context.off('leftNavigation:open history:toggle playlist:toggle settings:toggle show:user show:history show:dashboard dashboard:disable', this.onPlugMenuOpen, this);
            Context.off('room:joined', this.onRoomJoin, this);
            dialogControlPanel.close();
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

                            if (dj == null || dj.id === API.getUser().id) return;
                            $('.btn-like').click();
                        })();
                    }
                    break;
                case 'join':
                    Settings.autojoin = !Settings.autojoin;
                    this.setEnabled('join', Settings.autojoin);
                    if (Settings.autojoin) {
                        (function() {
                            var dj = API.getDJ();

                            if ((dj != null && dj.id === API.getUser().id) || API.getWaitListPosition() > -1) return;
                            $('.room-controls__bottom-item.dj-button').click();
                        })();
                    }
                    break;
                case 'chatimages':
                    Settings.chatImages = !Settings.chatImages;
                    this.setEnabled('chatimages', Settings.chatImages);
                    break;
                case 'twitchemotes':
                    Settings.emotes.twitchEmotes = !Settings.emotes.twitchEmotes;
                    if (Settings.emotes.twitchEmotes) {
                        ChatHandler.loadTwitchEmotes();
                    } else {
                        p3Utils.generateEmoteHash();
                    }
                    this.setEnabled('twitchemotes', Settings.emotes.twitchEmotes);
                    if (Settings.emotes.twitchEmotes) {
                        dialogControlPanel.openTab(p3Lang.i18n('menu.chatcustomizations'));
                        $('.p3-control-left div.p3-item.twitch-emotes').addClass('selected');
                        $('div#p3-control-panel-close').click();
                    } else {
                        dialogControlPanel.openTab(p3Lang.i18n('menu.chatcustomizations'));
                        $('.p3-control-left div.p3-item.twitch-emotes').removeClass('selected');
                        $('div#p3-control-panel-close').click();
                    }
                    break;
                case 'colors':
                    dialogColors.render();
                    break;
                case 'controlpanel':
                    dialogControlPanel.toggleControlPanel(true);
                    dialogControlPanel.openTab(p3Lang.i18n('menu.about'));
                    this.toggleMenu(false);
                    break;
                case 'autorespond':
                    Settings.autorespond = !Settings.autorespond;
                    this.setEnabled('autorespond', Settings.autorespond);
                    if (Settings.autorespond) {
                        if (Settings.awaymsg.trim() === '') {
                            Settings.awaymsg = p3Lang.i18n('autorespond.default');
                        }
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
                case 'notify-boothAlert':
                    var elem = $('.p3-s-' + a);

                    if (!elem.data('perm') || (API.hasPermission(undefined, elem.data('perm')) || p3Utils.isPlugCubedDeveloper())) {
                        var bit = elem.data('bit');

                        Settings.notify += (Settings.notify & bit) === bit ? -bit : bit;
                        this.setEnabled(a, (Settings.notify & bit) === bit);
                    }
                    break;
                case 'stream':
                    Database.settings.streamDisabled = !Database.settings.streamDisabled;
                    Database.save();
                    Context.trigger('change:streamDisabled');
                    this.setEnabled('stream', Database.settings.streamDisabled);
                    break;
                case 'clear':
                    Context.trigger('ChatFacadeEvent:clear');
                    break;
                case 'roomsettings':
                    var b = Settings.useRoomSettings[p3Utils.getRoomID()];

                    b = !(b == null || b === true);
                    Settings.useRoomSettings[p3Utils.getRoomID()] = b;
                    if (b) RoomSettings.update();
                    RoomSettings.execute(b);
                    this.setEnabled('roomsettings', b);
                    break;
                case 'inlineuserinfo':
                    Settings.moderation.inlineUserInfo = !Settings.moderation.inlineUserInfo;
                    this.setEnabled('inlineuserinfo', Settings.moderation.inlineUserInfo);
                    break;
                case 'showdeletedmessages':
                    Settings.moderation.showDeletedMessages = !Settings.moderation.showDeletedMessages;
                    this.setEnabled('showdeletedmessages', Settings.moderation.showDeletedMessages);
                    break;
                case 'chatlog':
                    Settings.chatLog = !Settings.chatLog;
                    this.setEnabled('chatlog', Settings.chatLog);
                    break;
                case 'afktimers':
                    Settings.moderation.afkTimers = !Settings.moderation.afkTimers;
                    this.setEnabled('afktimers', Settings.moderation.afkTimers);
                    if (Settings.moderation.afkTimers) {

                        // Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                    } else {

                        // Styles.unset('waitListMove');
                        $('#waitlist').find('.user .afkTimer').remove();
                    }
                    break;
                case 'etatimer':
                    Settings.etaTimer = !Settings.etaTimer;
                    this.setEnabled('etatimer', Settings.etaTimer);
                    if (!Settings.etaTimer) {
                        $('.p3-eta-timer,.p3-eta-span').remove();
                    }
                    break;
                case 'notifyUpdatesLink':
                    Settings.notifyUpdatesLink = !Settings.notifyUpdatesLink;
                    this.setEnabled('notifyUpdatesLink', Settings.notifyUpdatesLink);
                    break;
                case 'hidevideo':
                    Settings.hideVideo = !Settings.hideVideo;
                    this.setEnabled('hidevideo', Settings.hideVideo);
                    $('div.p3-hideplayback').find('.box').text(Settings.hideVideo ? p3Lang.i18n('video.show') : p3Lang.i18n('video.hide'));
                    $('.item.p3-s-hidevideo').find('span').text(Settings.hideVideo ? p3Lang.i18n('video.menushow') : p3Lang.i18n('video.menuhide'));
                    if (Settings.hideVideo) {
                        $('.community__playing').hide();
                        $('.left-side-wrapper-inner').css('background-size', '0 0');
                        p3Utils.toggleVideoOverlay(true, 'video.hidden');

                    } else {
                        $('.community__playing').show();
                        $('.left-side-wrapper-inner').css('background-size', '');
                        p3Utils.toggleVideoOverlay(false, 'video.hidden');
                    }
                    break;
                case 'lowLagMode':
                    p3Utils.toggleLowLagMode();
                    this.setEnabled('lowLagMode', Settings.lowLagMode);
                    break;
                case 'workMode':
                    p3Utils.toggleWorkMode();
                    this.setEnabled('workMode', Settings.workMode);
                    break;
                case 'about':
                case 'background':
                case 'chatcustomizations':
                case 'commands':
                case 'customcss':
                    dialogControlPanel.toggleControlPanel(true);
                    dialogControlPanel.openTab(p3Lang.i18n('menu.' + a));
                    this.toggleMenu(false);
                    break;
                case 'desktopNotifs':
                    Settings.desktopNotifs = !Settings.desktopNotifs;
                    if (!Settings.autorespond) this.setEnabled('desktopNotifs', Settings.desktopNotifs);
                    break;
                default:
                    API.chatLog(p3Lang.i18n('error.unknownMenuKey', a));
                    break;
            }
            Settings.save();
        },

        /**
         * Create the menu.
         * If the menu already exists, it will recreate it.
         */
        createMenu: function() {
            if ($menuDiv != null) {
                $menuDiv.remove();
            }
            $menuDiv = $('<div>').css({
                left: this.shown ? 50 : -500,
                'z-index': this.shown ? 1500 : 0
            }).attr('id', 'p3-settings');
            var header = $('<div>').addClass('header');
            var container = $('<div>').addClass('p3-container');

            // Header
            header.append($('<div>').addClass('back').append($('<i>').addClass('icon icon-arrow-left')).click(function() {
                that.toggleMenu(false);
            }));
            header.append($('<div>').addClass('title').append($('<i>').addClass('icon icon-settings-white')).append($('<span>plug&#179;</span>')).append($('<span>').addClass('version').text(Version)));

            // Features
            container.append($('<div>').addClass('section').text(p3Lang.i18n('menuHeaders.features')));
            if (RoomSettings.rules.allowAutowoot !== false) {
                container.append(guiButton(Settings.autowoot, 'woot', p3Lang.i18n('menu.autowoot')));
            }

            if (RoomSettings.rules.allowAutojoin !== false) {
                container.append(guiButton(Settings.autojoin, 'join', p3Lang.i18n('menu.autojoin')));
            }

            if (RoomSettings.rules.allowAutorespond !== false) {
                container.append(guiButton(Settings.autorespond, 'autorespond', p3Lang.i18n('menu.autorespond')));
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
                container.append(guiButton(Settings.moderation.afkTimers, 'afktimers', p3Lang.i18n('menu.afktimers')));
                container.append(guiButton(Settings.moderation.showDeletedMessages, 'showdeletedmessages', p3Lang.i18n('menu.showdeletedmessages')));
                container.append(guiButton(Settings.moderation.inlineUserInfo, 'inlineuserinfo', p3Lang.i18n('menu.inlineuserinfo')));
            }

            if (RoomSettings.haveRoomSettings) {
                container.append(guiButton(Settings.useRoomSettings[p3Utils.getRoomID()] != null ? Settings.useRoomSettings[p3Utils.getRoomID()] : true, 'roomsettings', p3Lang.i18n('menu.roomsettings')));
            }
            container.append(guiButton(Settings.chatLog, 'chatlog', p3Lang.i18n('menu.chatlog')));
            container.append(guiButton(Settings.etaTimer, 'etatimer', p3Lang.i18n('menu.etatimer')));
            container.append(guiButton(Settings.chatImages, 'chatimages', p3Lang.i18n('menu.chatimages')));
            if (RoomSettings.rules.allowEmotes !== false) {
                container.append(guiButton(Settings.emotes.twitchEmotes, 'twitchemotes', p3Lang.i18n('menu.twitchemotes')));
            }
            container.append(guiButton(Settings.hideVideo, 'hidevideo', Settings.hideVideo ? p3Lang.i18n('video.menushow') : p3Lang.i18n('video.menuhide')));
            container.append(guiButton(Settings.lowLagMode, 'lowLagMode', p3Lang.i18n('menu.lowlagMode')));
            container.append(guiButton(Settings.workMode, 'workMode', p3Lang.i18n('menu.workMode')));
            container.append(guiButton(Settings.desktopNotifs, 'desktopNotifs', p3Lang.i18n('menu.desktopNotifs')));
            container.append(guiButton(false, 'colors', p3Lang.i18n('menu.customchatcolors') + '...'));
            container.append(guiButton(false, 'controlpanel', p3Lang.i18n('menu.controlpanel') + '...'));

            // Divider
            container.append($('<div class="spacer">').append($('<div class="divider">')));

            // Notification
            container.append($('<div class="section">' + p3Lang.i18n('menuHeaders.chatnotifs') + '</div>'));

            container.append(guiButton((Settings.notify & enumNotifications.USER_JOIN) === enumNotifications.USER_JOIN, 'notify-join', p3Lang.i18n('notify.join')).data('bit', enumNotifications.USER_JOIN));
            container.append(guiButton((Settings.notify & enumNotifications.USER_LEAVE) === enumNotifications.USER_LEAVE, 'notify-leave', p3Lang.i18n('notify.leave')).data('bit', enumNotifications.USER_LEAVE));
            container.append(guiButton((Settings.notify & enumNotifications.USER_GRAB) === enumNotifications.USER_GRAB, 'notify-grab', p3Lang.i18n('notify.grab')).data('bit', enumNotifications.USER_GRAB));
            container.append(guiButton((Settings.notify & enumNotifications.USER_MEH) === enumNotifications.USER_MEH, 'notify-meh', p3Lang.i18n('notify.meh')).data('bit', enumNotifications.USER_MEH));
            container.append(guiButton((Settings.notify & enumNotifications.SONG_STATS) === enumNotifications.SONG_STATS, 'notify-stats', p3Lang.i18n('notify.stats')).data('bit', enumNotifications.SONG_STATS));
            container.append(guiButton((Settings.notify & enumNotifications.SONG_UPDATE) === enumNotifications.SONG_UPDATE, 'notify-updates', p3Lang.i18n('notify.updates')).data('bit', enumNotifications.SONG_UPDATE));
            container.append(guiButton(Settings.notifyUpdatesLink, 'notifyUpdatesLink', p3Lang.i18n('notify.updatesLink')));
            var boothAlertSlider = new Slider(1, 50, Settings.boothAlert, function(v) {
                Settings.boothAlert = v;
                Settings.save();
                $('.p3-s-notify-boothAlert').find('span').text(p3Lang.i18n('notify.boothAlert', v));
            });

            container.append(guiButton((Settings.notify & enumNotifications.BOOTH_ALERT) === enumNotifications.BOOTH_ALERT, 'notify-boothAlert', p3Lang.i18n('notify.boothAlert', Settings.boothAlert)).data('bit', enumNotifications.BOOTH_ALERT));
            container.append(boothAlertSlider.$slider.css('left', 40));
            if (boothAlertSlider != null) {
                boothAlertSlider.onChange();
            }
            if (API.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
                var songLengthSlider = new Slider(5, 30, Settings.notifySongLength, function(v) {
                    Settings.notifySongLength = v;
                    Settings.save();
                    $('.p3-s-notify-songLength').find('span').text(p3Lang.i18n('notify.songLength', v));
                });

                container.append(guiButton((Settings.notify & enumNotifications.SONG_HISTORY) === enumNotifications.SONG_HISTORY, 'notify-history', p3Lang.i18n('notify.history')).data('bit', enumNotifications.SONG_HISTORY).data('perm', API.ROLE.BOUNCER));
                container.append(guiButton((Settings.notify & enumNotifications.SONG_UNAVAILABLE) === enumNotifications.SONG_UNAVAILABLE, 'notify-unavailable', p3Lang.i18n('notify.songUnavailable')).data('bit', enumNotifications.SONG_UNAVAILABLE).data('perm', API.ROLE.BOUNCER));
                container.append(guiButton((Settings.notify & enumNotifications.SONG_LENGTH) === enumNotifications.SONG_LENGTH, 'notify-songLength', p3Lang.i18n('notify.songLength', Settings.notifySongLength)).data('bit', enumNotifications.SONG_LENGTH).data('perm', API.ROLE.BOUNCER));
                container.append(songLengthSlider.$slider.css('left', 40));
                if (songLengthSlider != null) {
                    songLengthSlider.onChange();
                }

            }

            // Divider
            container.append($('<div class="spacer">').append($('<div class="divider">')));

            // ControlPanel
            container.append($('<div>').addClass('section').text(p3Lang.i18n('menuHeaders.controlpanel')));

            // Tabs
            container.append(guiButton(false, 'about', p3Lang.i18n('menu.about')));
            container.append(guiButton(false, 'background', p3Lang.i18n('menu.background')));
            container.append(guiButton(false, 'chatcustomizations', p3Lang.i18n('menu.chatcustomizations')));
            container.append(guiButton(false, 'commands', p3Lang.i18n('menu.commands')));
            container.append(guiButton(false, 'customcss', p3Lang.i18n('menu.customcss')));

            if ($wrapper == null) {
                $wrapper = $('<div>').attr('id', 'p3-settings-wrapper');
                $('body').append($wrapper);
            }
            $wrapper.append($menuDiv.append(header).append(container));
        },

        /**
         * Toggle the visibility of the menu
         * @param {Boolean} [shown] Force it to be shown or hidden.
         */
        toggleMenu: function(shown) {
            if ($menuDiv == null) {
                if (typeof shown === 'boolean' && !shown) return;

                this.createMenu();
            }
            this.shown = typeof shown === 'boolean' ? shown : !this.shown;

            if (!this.shown) {
                dialogColors.hide();
            }
            if (this.shown) {
                p3Utils.closePlugMenus();
            }

            $menuDiv.animate({
                left: this.shown ? 50 : -500,
                'z-index': this.shown ? 1500 : 0
            }, {
                complete: function() {
                    if (!that.shown && $menuDiv) {
                        $menuDiv.detach();
                        $menuDiv = undefined;
                    }
                }
            });
        }
    });

    return new MenuClass();
});
