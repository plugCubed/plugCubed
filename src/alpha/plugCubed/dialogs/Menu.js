define(['jquery', 'plugCubed/Class', 'plugCubed/Version', 'plugCubed/enums/Notifications', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/RoomSettings', 'plugCubed/Slider', 'plugCubed/dialogs/CustomChatColors', 'plugCubed/dialogs/ControlPanel', 'plugCubed/handlers/ChatHandler'], function($, Class, Version, enumNotifications, Settings, p3Utils, p3Lang, Styles, RoomSettings, Slider, dialogColors, dialogControlPanel, ChatHandler) {

    var $wrapper, $menuDiv, MenuClass, that, menuButton, streamButton, clearChatButton, _onClick, Context, Database, Lang;

    Context = window.plugCubedModules.context;
    Database = window.plugCubedModules.database;
    Lang = window.plugCubedModules.Lang;
    menuButton = $('<div id="plugcubed"><div class="cube-wrap"><div class="cube"><i class="icon icon-plugcubed"></i><i class="icon icon-plugcubed other"></i></div></div></div>');
    streamButton = $('<div>').addClass('chat-header-button p3-s-stream').data('key', 'stream');
    clearChatButton = $('<div>').addClass('chat-header-button p3-s-clear').data('key', 'clear');

    function guiButton(setting, id, text) {
        return $('<div>').addClass('item p3-s-' + id + (setting ? ' selected' : '')).append($('<i>').addClass('icon icon-check-blue')).append($('<span>').text(text)).data('key', id).click(_onClick);
    }

    function toggleEmotes(toggle) {
        window.plugCubedModules.database.settings.emoji = toggle;
        window.plugCubedModules.context.trigger('ChatFacadeEvent:emoji', window.plugCubedModules.database.settings.emoji);
    }
    MenuClass = Class.extend({
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
            Context.on('show:user show:history show:dashboard dashboard:disable', this.onPlugMenuOpen, this);
            Context.on('room:joined', this.onRoomJoin, this);
        },
        onRoomJoin: function() {
            this.setEnabled('stream', Database.settings.streamDisabled);
        },
        onPlugMenuOpen: function(isShowing) {
            if ((typeof isShowing === 'boolean' && isShowing) || typeof isShowing === 'undefined') {
                this.toggleMenu(false);
                dialogControlPanel.toggleControlPanel(false);
            }
        },
        close: function() {
            menuButton.remove();
            if ($wrapper != null) {
                $wrapper.remove();
            }
            $('#room-bar').css('left', 54).find('.favorite').css('right', 0);
            streamButton.remove();
            clearChatButton.remove();
            Context.off('show:user show:history show:dashboard dashboard:disable', this.onPlugMenuOpen, this);
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

                            if ((dj != null && dj.id === API.getUser().id) || API.getWaitListPosition() > -1) return;
                            $('#dj-button').click();
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
                    dialogControlPanel.openTab('About');
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
                case 'notifyUpdatesLink':
                    Settings.notifyUpdatesLink = !Settings.notifyUpdatesLink;
                    this.setEnabled('notifyUpdatesLink', Settings.notifyUpdatesLink);
                    break;
                case 'hidevideo':
                    Settings.hideVideo = !Settings.hideVideo;
                    this.setEnabled('hidevideo', Settings.hideVideo);
                    $('div.p3-hideplayback').find('.box').text(Settings.hideVideo ? p3Lang.i18n('video.show') : p3Lang.i18n('video.hide'));
                    if (Settings.hideVideo) {
                        $('#playback-container').hide();
                    } else {
                        $('#playback-container').show();
                    }
                    break;
                case 'lowLagMode':
                    Settings.lowLagMode = !Settings.lowLagMode;
                    this.setEnabled('lowLagMode', Settings.lowLagMode);
                    if (Settings.lowLagMode) {
                        Database.settings.videoOnly = !Database.settings.videoOnly;
                        Database.save();
                        Context.trigger('change:videoOnly').trigger('audience:pause', Database.settings.videoOnly);
                        Styles.set('hide-badges', '#chat .msg { padding: 5px 8px 6px 8px; } #chat-messages .badge-box { display: none; }');
                        Settings.badges = false;
                        toggleEmotes(false);
                    } else {
                        Database.settings.videoOnly = !Database.settings.videoOnly;
                        Database.save();
                        Context.trigger('change:videoOnly').trigger('audience:pause', Database.settings.videoOnly);
                        Styles.unset('hide-badges');
                        Settings.badges = true;
                        toggleEmotes(true);
                    }
                    break;
                case 'workMode':
                    Settings.workMode = !Settings.workMode;
                    this.setEnabled('workMode', Settings.workMode);
                    if (Settings.workMode) {
                        Styles.set('workMode', '#user-rollover .meta .user-id { left: 15px !important; }\n#avatars-container { display: none; }\n#playback .background {display: none; }\n#chat .emote, #chat .mention, #chat .message, #chat .moderation, #chat .skip, #chat .system, #chat .update, #chat .welcome { min-height: 0px !important; }\n#chat .badge-box { display: none; }\n#chat .msg { padding: 5px 8px 6px 16px !important; }\n#footer-user .image { display: none !important; }\n#footer-user .meta { display: none !important }\n#footer-user .points { display: none !important }\n#footer-user .info .name { top: 8px !important; font-size: 26px !important; text-align: center !important; left: -60px !important; width: 100% !important; left: 0px !important; }\n#footer-user .info .icon {display: none !important }\n#user-rollover .meta .thumb { display: none !important }\n#user-rollover .meta .username { left: 15px !important }\n#user-rollover .meta .status { left: 15px !important }\n#user-rollover .meta .joined { left: 15px !important }\n#user-rollover .meta .p3UserID { left: 15px !important }\n#user-rollover .meta .p3Role { left: 15px !important}\n#waitlist .list .user .image { display: none!important }\n#footer-user .buttons .inventory.button { display: none !important; }\n#footer-user .buttons .badge.button { display: none !important; }\n#footer-user .buttons .store.button { display: none !important; }\n#footer-user .buttons .profile.button { display: none !important; }\n#footer-user .buttons .settings.button { float: right !important; width: 54px !important; }\n#footer #footer-user .info { display: block !important; z-index: -1 !important; width: 290px !important; top: 0px !important; background: none; }\n#footer-user .info .name { width: 100% !important; }\n#footer-user .info .meta { width: 170px !important; }\n#footer-user .info .meta div.bar { width: 100px !important; }\ndiv.room-background { background-image: url("https://plugcubed.net/scripts/alpha/images/p3WorkMode.png") !important; background-size: cover !important; }\n.app-right .friends .list .row .image { display: none!important }\n.social-menu { display: none !important; }');
                        $('#playback').hide();
                        toggleEmotes(false);
                    } else {
                        Styles.unset('workMode');
                        $('#playback').show();
                        toggleEmotes(true);
                    }
                    break;
                case 'about':
                    dialogControlPanel.toggleControlPanel(true);
                    dialogControlPanel.openTab(p3Lang.i18n('menu.about'));
                    this.toggleMenu(false);
                    break;
                case 'background':
                    dialogControlPanel.toggleControlPanel(true);
                    dialogControlPanel.openTab(p3Lang.i18n('menu.background'));
                    this.toggleMenu(false);
                    break;
                case 'chatcustomizations':
                    dialogControlPanel.toggleControlPanel(true);
                    dialogControlPanel.openTab(p3Lang.i18n('menu.chatcustomizations'));
                    this.toggleMenu(false);
                    break;
                case 'commands':
                    dialogControlPanel.toggleControlPanel(true);
                    dialogControlPanel.openTab(p3Lang.i18n('menu.commands'));
                    this.toggleMenu(false);
                    break;
                case 'customcss':
                    dialogControlPanel.toggleControlPanel(true);
                    dialogControlPanel.openTab(p3Lang.i18n('menu.customcss'));
                    this.toggleMenu(false);
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
            $menuDiv = $('<div>').css('left', this.shown ? 0 : -500).attr('id', 'p3-settings');
            var header = $('<div>').addClass('header');
            var container = $('<div>').addClass('container');

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
            container.append(guiButton(Settings.hideVideo, 'hidevideo', p3Lang.i18n('video.menuhide')));
            container.append(guiButton(Settings.lowLagMode, 'lowLagMode', p3Lang.i18n('menu.lowlagMode')));
            container.append(guiButton(Settings.workMode, 'workMode', p3Lang.i18n('menu.workMode')));
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
                $('#playlist-button .icon-arrow-down, #footer-user.showing .back').click();
                if (window.plugCubedModules && window.plugCubedModules.app && window.plugCubedModules.app.room && window.plugCubedModules.app.room.history) {
                    window.plugCubedModules.app.room.history.hide();
                }
            }

            $menuDiv.animate({
                left: this.shown ? 0 : -500
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
