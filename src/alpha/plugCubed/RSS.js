define(['jquery', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/Settings', 'lang/Lang'], function($, Class, p3Utils, p3Lang, Styles, Settings, Lang) {
    var RoomModel, handler, showMessage, _this, oriLang, langKeys, ranks;

    /**
     * @property {{ background: String, chat: { admin: String, ambassador: String, bouncer: String, cohost: String, residentdj: String, host: String, manager: String }, footer: String, header: String }} colors
     * @property {{ font: Array, import: Array, rule: Array }} css
     * @property {{ background: String, booth: String, icons: { admin: String, ambassador: String, bouncer: String, cohost: String, residentdj: String, host: String, manager: String }, playback: String }} images
     * @property {{ plugCubed: Object, plugDJ: Object }} text
     * @property {{ allowAutorespond: Boolean, allowAutojoin: Boolean, allowAutowoot: Boolean }} rules
     * @property {String|undefined} roomscript
     */
    var roomSettings;

    showMessage = false;
    oriLang = $.extend(true, {}, Lang);
    langKeys = $.map(oriLang, function(v, i) {
        if (typeof v === 'string')
            return i; else
            return $.map(v, function(v2, i2) {
                return i + '.' + i2;
            });
    });
    ranks = ['admin', 'ambassador', 'bouncer', 'cohost', 'residentdj', 'leader', 'host', 'manager', 'volunteer'];

    if (!p3Utils.runLite)
        RoomModel = require('app/models/RoomModel');

    function getPlugDJLang(key, original) {
        if (!key) return '';
        var parts = key.split('.'), last = parts.pop(), partsLen = parts.length, cur = original ? oriLang : Lang;
        for (var i = 0; i < partsLen; i++) {
            var part = parts[i];
            if (cur[part] !== undefined) {
                cur = cur[part];
            } else {
                return '';
            }
            if (cur[last] !== undefined) {
                return cur[last];
            }
        }
        return '';
    }

    function setPlugDJLang(key, value) {
        if (!key || !value) return;
        var parts = key.split('.'), last = parts.pop(), partsLen = parts.length, cur = Lang;
        for (var i = 0; i < partsLen; i++) {
            var part = parts[i];
            if (cur[part] !== undefined)
                cur = cur[part]; else return;
        }
        if (cur[last] !== undefined)
            cur[last] = value;
    }

    handler = Class.extend({
        rules: {
            allowAutowoot: true,
            allowAutorespond: true,
            allowAutojoin: true
        },
        haveRoomSettings: false,
        chatColors: {},
        chatIcons: {},
        init: function() {
            _this = this;
            if (!p3Utils.runLite)
                RoomModel.on('change:description', this.update, this);
        },
        update: function() {
            var a;
            a = p3Utils.cleanHTML($('#room-info').find('.description').find('.value').html().split('<br>').join('\n'), '*');
            if (a.indexOf('@p3=') > -1) {
                a = a.substr(a.indexOf('@p3=') + 4);
                if (a.indexOf('\n') > -1)
                    a = a.substr(0, a.indexOf('\n'));
                $.getJSON(a + '?_' + Date.now(), function(settings) {
                    roomSettings = settings;
                    showMessage = true;
                    _this.execute();
                }).fail(function() {
                    API.chatLog('Error loading Room Settings', true);
                });
                _this.haveRoomSettings = true;
                return true;
            }
            return false;
        },
        execute: function() {
            var i, a, loadEverything;
            loadEverything = Settings.useRoomSettings[document.location.pathname.split('/')[1]] !== undefined ? Settings.useRoomSettings[document.location.pathname.split('/')[1]] : true;
            if (roomSettings !== undefined) {
                this.chatColors = {};
                this.chatIcons = {};

                for (i in langKeys) {
                    if (!langKeys.hasOwnProperty(i)) continue;
                    var key = langKeys[i];
                    setPlugDJLang(key, getPlugDJLang(key, true));
                }

                $('#p3-dj-booth').remove();

                Styles.unset([
                    'rss-background-color', 'rss-background-image', 'rss-booth', 'rss-fonts', 'rss-imports', 'rss-rules', 'rss-maingui'
                ]);

                if (loadEverything) {
                    // colors
                    if (roomSettings.colors !== undefined) {
                        // colors.background
                        if (roomSettings.colors.background !== undefined && typeof roomSettings.colors.background === 'string' && p3Utils.isRGB(roomSettings.colors.background))
                            Styles.set('rss-background-color', 'body { background-color: ' + p3Utils.toRGB(roomSettings.colors.background) + '!important; }');

                        // colors.chat
                        if (roomSettings.colors.chat !== undefined) {
                            a = {};
                            for (i in roomSettings.colors.chat) {
                                if (!roomSettings.colors.chat.hasOwnProperty(i)) continue;
                                if (ranks.indexOf(i) > -1 && typeof roomSettings.colors.chat[i] === 'string' && p3Utils.isRGB(roomSettings.colors.chat[i]))
                                    a[i] = p3Utils.toRGB(roomSettings.colors.chat[i]);
                            }
                            this.chatColors = a;
                        }

                        // colors.header
                        if (roomSettings.colors.header !== undefined && typeof roomSettings.colors.header === 'string' && p3Utils.isRGB(roomSettings.colors.header))
                            Styles.set('rss-header', '#header { background-color: ' + p3Utils.toRGB(roomSettings.colors.header) + '!important; }');

                        // colors.footer
                        if (roomSettings.colors.footer !== undefined && typeof roomSettings.colors.footer === 'string' && p3Utils.isRGB(roomSettings.colors.footer))
                            Styles.set('rss-footer', '.app-header { background-color: ' + p3Utils.toRGB(roomSettings.colors.footer) + '!important; }');
                    }

                    // css
                    if (roomSettings.css !== undefined) {
                        // css.font
                        if (roomSettings.css.font !== undefined && $.isArray(roomSettings.css.font)) {
                            var roomFonts = [];
                            for (i in roomSettings.css.font) {
                                if (!roomSettings.css.font.hasOwnProperty(i)) continue;
                                var font = roomSettings.css.font[i];
                                if (font.name !== undefined && font.url !== undefined) {
                                    font.toString = function() {
                                        var sources = [];
                                        if (typeof this.url === 'string')
                                            sources.push('url("' + this.url + '")'); else {
                                            for (var j in this.url) {
                                                if (!this.url.hasOwnProperty(j)) continue;
                                                if (['woff', 'opentype', 'svg', 'embedded-opentype', 'truetype'].indexOf(j) > -1)
                                                    sources.push('url("' + this.url[j] + '") format("' + j + '")')
                                            }
                                        }
                                        return '@font-face { font-family: "' + this.name + '"; src: ' + sources.join(',') + '; }';
                                    };
                                    roomFonts.push(font.toString());
                                }
                            }
                            Styles.set('rss-fonts', roomFonts.join('\n'));
                        }
                        // css.import
                        if (roomSettings.css.import !== undefined && $.isArray(roomSettings.css.import)) {
                            var roomImports = [];
                            for (i in roomSettings.css.import) {
                                if (roomSettings.css.import.hasOwnProperty(i) && typeof roomSettings.css.import[i] === 'string')
                                    roomImports.push('@import url("' + roomSettings.css.import[i] + '")');
                            }
                            Styles.set('rss-imports', roomImports.join('\n'));
                        }
                        // css.setting
                        if (roomSettings.css.rule !== undefined) {
                            var roomCSSRules = [];
                            for (i in roomSettings.css.rule) {
                                if (!roomSettings.css.rule.hasOwnProperty(i)) continue;
                                var rule = [];
                                for (var j in roomSettings.css.rule[i]) {
                                    if (!roomSettings.css.rule[i].hasOwnProperty(j)) continue;
                                    rule.push(j + ':' + roomSettings.css.rule[i][j]);
                                }
                                roomCSSRules.push(i + ' {' + rule.join(';') + '}');
                            }
                            Styles.set('rss-rules', roomCSSRules.join('\n'));
                        }
                    }

                    // images
                    if (roomSettings.images !== undefined) {
                        // images.background
                        if (roomSettings.images.background)
                            Styles.set('rss-background-image', '.room-background { background-image: url("' + p3Utils.proxifyImage(roomSettings.images.background) + '")!important; }');

                        // images.playback
                        if (!p3Utils.runLite) {
                            var playbackBackground = $('#playback').find('.background img');
                            if (playbackBackground.data('_o') === undefined)
                                playbackBackground.data('_o', playbackBackground.attr('src'));
                            var roomLoader = require('app/views/room/RoomLoader');
                            if (roomSettings.images.playback && typeof roomSettings.images.playback === 'string' && roomSettings.images.playback.indexOf('http') === 0) {
                                var playbackFrame = new Image;
                                playbackFrame.onload = function() {
                                    playbackBackground.attr('src', this.src);
                                    roomLoader.frameHeight = this.height - 10;
                                    roomLoader.frameWidth = this.width - 18;
                                    roomLoader.onVideoResize(require('app/utils/Layout').getSize());
                                };
                                playbackFrame.src = p3Utils.proxifyImage(roomSettings.images.playback);
                            } else {
                                playbackBackground.attr('src', playbackBackground.data('_o'));
                                roomLoader.frameHeight = playbackBackground.height() - 10;
                                roomLoader.frameWidth = playbackBackground.width() - 18;
                                roomLoader.onVideoResize(require('app/utils/Layout').getSize());
                            }
                        }

                        // images.booth
                        if (roomSettings.images.booth !== undefined && typeof roomSettings.images.booth === 'string')
                            $('#dj-booth').append($('<div id="p3-dj-booth">').css('background-image', 'url("' + p3Utils.proxifyImage(roomSettings.images.booth) + '")'));

                        // images.icons
                        if (roomSettings.images.icons !== undefined) {
                            a = {};
                            for (i in roomSettings.images.icons) {
                                if (!roomSettings.images.icons.hasOwnProperty(i)) continue;
                                if (ranks.indexOf(i) > -1 && typeof roomSettings.images.icons[i] === 'string')
                                    a[i] = p3Utils.proxifyImage(roomSettings.images.icons[i]);
                            }
                            this.chatIcons = a;
                        }
                    }

                    // text
                    if (roomSettings.text !== undefined) {
                        // text.plugCubed
                        if (roomSettings.text.plugCubed !== undefined) {

                        }

                        // text.plugDJ
                        if (roomSettings.text.plugDJ !== undefined) {
                            for (i in roomSettings.text.plugDJ) {
                                if (!roomSettings.text.plugDJ.hasOwnProperty(i)) continue;
                                var value = roomSettings.text.plugDJ[i];
                                if (i && value && typeof value == 'string')
                                    setPlugDJLang(i, roomSettings.text.plugDJ[i]);
                            }
                        }
                    }
                }

                // rules
                if (roomSettings.rules !== undefined) {
                    this.rules.allowAutowoot = roomSettings.rules.allowAutowoot === undefined || roomSettings.rules.allowAutowoot === 'true' || roomSettings.rules.allowAutowoot === true;
                    this.rules.allowAutojoin = roomSettings.rules.allowAutojoin === undefined || roomSettings.rules.allowAutojoin === 'true' || roomSettings.rules.allowAutojoin === true;
                    this.rules.allowAutorespond = roomSettings.rules.allowAutorespond === undefined || roomSettings.rules.allowAutorespond === 'true' || roomSettings.rules.allowAutorespond === true;
                } else {
                    this.rules.allowAutowoot = true;
                    this.rules.allowAutojoin = true;
                    this.rules.allowAutorespond = true;
                }

                // roomscript
                if (roomSettings.roomscript !== undefined) {
                    // TODO: Make this
                }

                // Update autorespond
                if (Settings.autorespond) {
                    if (this.rules.allowAutorespond) {
                        $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                        if (API.getUser().status <= 0)
                            API.setStatus(API.STATUS.AFK);
                    } else {
                        $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                        API.setStatus(API.STATUS.AVAILABLE);
                    }
                }

                if (showMessage) {
                    p3Utils.chatLog(undefined, (typeof roomSettings.author === 'string' ? p3Lang.i18n('roomSpecificSettings.infoHeaderCredits', p3Utils.cleanHTML(roomSettings.author, '*')) : p3Lang.i18n('roomSpecificSettings.infoHeader')) + '<br>' + p3Lang.i18n('roomSpecificSettings.infoDisable'), p3Utils.logColors.infoMessage2);
                    showMessage = false;
                }

                require('plugCubed/CustomChatColors').update();

                // Redraw menu
                require('plugCubed/dialogs/Menu').createMenu();
            }
        },
        close: function() {
            if (!p3Utils.runLite)
                RoomModel.off('change:description', this.update, this);

            this.chatColors = {};
            this.chatIcons = {};

            for (var i in langKeys) {
                if (!langKeys.hasOwnProperty(i)) continue;
                var key = langKeys[i];
                setPlugDJLang(key, getPlugDJLang(key, true));
            }

            $('#p3-dj-booth').remove();

            Styles.unset([
                'rss-background-color', 'rss-background-image', 'rss-booth', 'rss-fonts', 'rss-imports', 'rss-rules', 'rss-maingui'
            ]);
        }
    });
    return new handler();
});