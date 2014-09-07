define(['jquery', 'plugCubed/Class', 'plugCubed/Version', 'plugCubed/enums/Notifications', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/RSS', 'plugCubed/Slider', 'plugCubed/dialogs/CustomChatColors', 'plugCubed/dialogs/ControlPanel', 'plugCubed/bridges/Context', 'plugCubed/handlers/ChatHandler', 'lang/Lang'], function($, Class, Version, enumNotifications, Settings, p3Utils, p3Lang, Styles, RSS, Slider, dialogColors, dialogControlPanel, _$context, ChatHandler, Lang) {
    var $menuDiv, Database, PlaybackModel, menuClass, _this, menuButton, streamButton, clearChatButton, _onClick;

    menuButton = $('<div id="plugcubed"><div class="cube-wrap"><div class="cube"><i class="icon icon-plugcubed"></i><i class="icon icon-plugcubed other"></i></div></div></div>');
    streamButton = $('<div>').addClass('chat-header-button p3-s-stream').data('key', 'stream');
    clearChatButton = $('<div>').addClass('chat-header-button p3-s-clear').data('key', 'clear');

    if (!p3Utils.runLite) {
        Database = require('app/store/Database');
        PlaybackModel = require('app/models/PlaybackModel');
    }

    function GUIButton(setting, id, text) {
        return $('<div>').addClass('item p3-s-' + id + (setting ? ' selected' : '')).append($('<i>').addClass('icon icon-check-blue')).append($('<span>').text(text)).data('key', id).click(_onClick);
    }

    function GUILang() {
        $select = $('<select>');
        for (var i in p3Lang.allLangs) {
            var lang = p3Lang.allLangs[i], option = $('<option>').attr('value', lang.file).text(lang.name);
            if (lang.file === p3Lang.curLang)
                option.attr('selected', 'selected');
            $select.append(option);
        }
        $select.change(function() {
            p3Lang.load($(this).find('option:selected').attr('value'), function() {
                _this.createMenu();
            })
        });
        return $('<div>').addClass('item p3-s-language selected').append($('<i>').addClass('icon icon-p3-lang')).append($('<span>').append($select));
    }

    menuClass = Class.extend({
        init: function() {
            _this = this;
            _onClick = $.proxy(this.onClick, this);

            this.shown = false;

            $('#app-menu').after(menuButton);
            menuButton.click(function() {
                _this.toggleMenu();
                dialogControlPanel.toggleControlPanel(false);
            });
            $('#room-bar').css('left', 108).find('.favorite').css('right', 55);

            if (!p3Utils.runLite) {
                $('#chat-header').append(streamButton.click($.proxy(this.onClick, this)).mouseover(function() {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.stream'), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                })).append(clearChatButton.click($.proxy(this.onClick, this)).mouseover(function() {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.clear'), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                }));
                this.setEnabled('stream', Database.settings.streamDisabled);
            }
        },
        close: function() {
            menuButton.remove();
            if ($menuDiv !== undefined)
                $menuDiv.remove();
            $('#room-bar').css('left', 54).find('.favorite').css('right', 0);
            if (!p3Utils.runLite) {
                streamButton.remove();
                clearChatButton.remove();
            }
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
                            if (dj === null || dj.id === API.getUser().id || API.getWaitListPosition() > -1) return;
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
                        if (Settings.awaymsg.trim() === "") Settings.awaymsg = p3Lang.i18n('autorespond.default');
                        $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                        if (API.getUser().status <= 0)
                            API.setStatus(API.STATUS.AFK);
                    } else {
                        $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                        API.setStatus(API.STATUS.AVAILABLE);
                    }
                    break;
                case 'notify-join':
                case 'notify-leave':
                case 'notify-curate':
                case 'notify-meh':
                case 'notify-stats':
                case 'notify-updates':
                case 'notify-history':
                case 'notify-songLength':
                    var elem = $('.p3-s-' + a);
                    if (!elem.data('perm') || (API.hasPermission(undefined, elem.data('perm')) || p3Utils.isPlugCubedDeveloper())) {
                        var bit = elem.data('bit');
                        Settings.notify += (Settings.notify & bit) === bit ? -bit : bit;
                        this.setEnabled(a, (Settings.notify & bit) === bit);
                    }
                    break;
                case 'stream':
                    PlaybackModel.set('streamDisabled', !Database.settings.streamDisabled);
                    this.setEnabled('stream', Database.settings.streamDisabled);
                    return;
                case 'clear':
                    _$context.trigger('ChatFacadeEvent:clear');
                    return;
                case 'roomsettings':
                    var b = Settings.useRoomSettings[window.location.pathname.split('/')[1]];
                    b = !(b === undefined || b === true);
                    Settings.useRoomSettings[window.location.pathname.split('/')[1]] = b;
                    RSS.execute(b);
                    this.setEnabled('roomsettings', b);
                    break;
                case 'afktimers':
                    Settings.moderation.afkTimers = !Settings.moderation.afkTimers;
                    this.setEnabled('afktimers', Settings.moderation.afkTimers);
                    if (Settings.moderation.afkTimers) {
                        Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                    } else {
                        Styles.unset('waitListMove');
                        $('#waitlist').find('.user .afkTimer').remove();
                    }
                    break;
                case 'language':
                    console.log('Language click');
                    break;
                default:
                    API.chatLog(p3Lang.i18n('error.unknownMenuKey', a));
                    return;
            }
            Settings.save();
        },
        /**
         * Create the menu.
         * If the menu already exist, recreates it.
         */
        createMenu: function() {
            if ($menuDiv !== undefined)
                $menuDiv.remove();
            $menuDiv = $('<div>').css('left', this.shown ? 0 : -271).attr('id', 'p3-settings');
            var header = $('<div>').addClass('header'), container = $('<div>').addClass('container');

            // Header
            header.append($('<div>').addClass('back').append($('<i>').addClass('icon icon-arrow-left')).click(function() {
                _this.toggleMenu(false);
            }));
            header.append($('<div>').addClass('title').append($('<i>').addClass('icon icon-settings-white')).append($('<span>plug&#179;</span>')).append($('<span>').addClass('version').text(Version)));

            // Features
            container.append($('<div>').addClass('section').text('Features'));
            if (RSS.rules.allowAutowoot !== false)
                container.append(GUIButton(Settings.autowoot, 'woot', p3Lang.i18n('menu.autowoot')));
            if (RSS.rules.allowAutojoin !== false)
                container.append(GUIButton(Settings.autojoin, 'join', p3Lang.i18n('menu.autojoin')));
            if (RSS.rules.allowAutorespond !== false)
                container.append(GUIButton(Settings.autorespond, 'autorespond', p3Lang.i18n('menu.autorespond')));
            if (RSS.rules.allowAutorespond !== false) {
                container.append($('<div class="item">').addClass('p3-s-autorespond-input').append($('<input>').val(Settings.awaymsg === '' ? p3Lang.i18n('autorespond.default') : Settings.awaymsg).keyup(function() {
                    $(this).val($(this).val().split('@').join(''));
                    Settings.awaymsg = $(this).val().trim();
                    Settings.save();
                })).mouseover(function() {
                    if (!p3Utils.runLite) {
                        _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.afk'), $(this), false);
                    }
                }).mouseout(function() {
                    if (!p3Utils.runLite) {
                        _$context.trigger('tooltip:hide');
                    }
                }));
            }
            if (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER))
                container.append(GUIButton(Settings.moderation.afkTimers, 'afktimers', p3Lang.i18n('menu.afktimers')));
            if (RSS.haveRoomSettings)
                container.append(GUIButton(Settings.useRoomSettings[window.location.pathname.split('/')[1]] !== undefined ? Settings.useRoomSettings[window.location.pathname.split('/')[1]] : true, 'roomsettings', p3Lang.i18n('menu.roomsettings')));
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
            container.append(GUIButton((Settings.notify & enumNotifications.USER_CURATE) === enumNotifications.USER_CURATE, 'notify-curate', p3Lang.i18n('notify.curate')).data('bit', enumNotifications.USER_CURATE));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_MEH) === enumNotifications.USER_MEH, 'notify-meh', p3Lang.i18n('notify.meh')).data('bit', enumNotifications.USER_MEH));
            container.append(GUIButton((Settings.notify & enumNotifications.SONG_STATS) === enumNotifications.SONG_STATS, 'notify-stats', p3Lang.i18n('notify.stats')).data('bit', enumNotifications.SONG_STATS));
            container.append(GUIButton((Settings.notify & enumNotifications.SONG_UPDATE) === enumNotifications.SONG_UPDATE, 'notify-updates', p3Lang.i18n('notify.updates')).data('bit', enumNotifications.SONG_UPDATE));
            if (API.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
                var songLengthSlider = new Slider(5, 30, Settings.notifySongLength, function(v) {
                    Settings.notifySongLength = v;
                    Settings.save();
                    $('.p3-s-notify-songLength').find('span').text(p3Lang.i18n('notify.songLength', v))
                });
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_HISTORY) === enumNotifications.SONG_HISTORY, 'notify-history', p3Lang.i18n('notify.history')).data('bit', enumNotifications.SONG_HISTORY).data('perm', API.ROLE.BOUNCER));
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_LENGTH) === enumNotifications.SONG_LENGTH, 'notify-songLength', p3Lang.i18n('notify.songLength', Settings.notifySongLength)).data('bit', enumNotifications.SONG_LENGTH).data('perm', API.ROLE.BOUNCER));
                container.append(songLengthSlider.$slider.css('left', 40));
            }

            $('body').append($menuDiv.append(header).append(container));
            if (songLengthSlider !== undefined) songLengthSlider.onChange();
        },
        /**
         * Toggle the visibility of the menu
         * @param {Boolean} [shown] Force it to be shown or hidden.
         */
        toggleMenu: function(shown) {
            if ($menuDiv === undefined) {
                this.createMenu();
            }
            this.shown = shown !== undefined ? shown : !this.shown;
            if (!this.shown)
                dialogColors.hide();
            $menuDiv.animate({
                left: this.shown ? 0 : -271
            }, {
                complete: function() {
                    if (!_this.shown) {
                        $menuDiv.detach();
                        $menuDiv = undefined;
                    }
                }
            });
        }
    });
    return new menuClass();
});