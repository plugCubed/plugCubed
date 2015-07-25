define(['jquery', 'underscore', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/bridges/Context', 'plugCubed/bridges/Layout', 'plugCubed/ModuleLoader', 'lang/Lang'], function($, _, Class, p3Utils, p3Lang, Styles, Settings, Context, Layout, ModuleLoader, Lang) {
    var RoomModel, RoomLoader, handler, showMessage, oriLang, langKeys, ranks, that;

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
        if (typeof v === 'string') {
            return i;
        } else {
            return $.map(v, function(v2, i2) {
                return i + '.' + i2;
            });
        }
    });
    ranks = ['admin', 'ambassador', 'bouncer', 'cohost', 'residentdj', 'leader', 'host', 'manager', 'volunteer'];
    RoomLoader = ModuleLoader.getView({
        isBackbone: true,
        className: 'loading-box'
    });
    RoomModel = ModuleLoader.getView({
        isBackbone: true,
        isModel: true
    });

    function getPlugDJLang(key, original) {
        if (!key) return '';
        var parts = key.split('.'),
            last = parts.pop(),
            partsLen = parts.length,
            cur = original ? oriLang : Lang;
        for (var i = 0; i < partsLen; i++) {
            var part = parts[i];
            if (cur[part] != null) {
                cur = cur[part];
            } else {
                return '';
            }
            if (cur[last] != null) {
                return cur[last];
            }
        }
        return '';
    }

    function setPlugDJLang(key, value) {
        if (!key || !value) return;
        var parts = key.split('.'),
            last = parts.pop(),
            partsLen = parts.length,
            cur = Lang;
        for (var i = 0; i < partsLen; i++) {
            var part = parts[i];
            if (cur[part] != null)
                cur = cur[part];
            else return;
        }
        if (cur[last] != null)
            cur[last] = value;
    }

    function parseDescription(description) {
        var isRCS = false;
        if (description.indexOf('@p3=') > -1) {
            description = description.substr(description.indexOf('@p3=') + 4);
        } else if (description.indexOf('@rcs=') > -1) {
            description = description.substr(description.indexOf('@rcs=') + 5);
            isRCS = true;
        } else {
            return;
        }
        if (description.indexOf('\n') > -1)
            description = description.substr(0, description.indexOf('\n'));
        $.getJSON(p3Utils.html2text(description) + '?=' + Date.now(), function(settings) {
            roomSettings = settings;
            if (isRCS) {
                roomSettings = that.convertRCSToPlugCubed(settings);
            }
            showMessage = true;
            that.execute();
        }).fail(function() {
            API.chatLog('Error loading Room Settings', true);
        });
        that.haveRoomSettings = true;
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
            that = this;
            Context.on('room:joining', this.clear, this);
            Context.on('room:joined', this.update, this);
        },
        update: function() {
            parseDescription(p3Utils.cleanHTML(RoomModel.get('description')));
        },
        /**
        * Converts RCS CCS to P3 RSS Format. Written by ReAnna.
        **/
        convertRCSToPlugCubed: function(ccs) {
            var rs = _.clone(ccs);
            var colors = ccs.ccc;
            var images = ccs.images;
            if (ccs.css) {
                rs.css = {
                    import: [ccs.css]
                };
            }
            if (colors) {
                rs.colors || (rs.colors = {});
                rs.colors.chat = _.omit(colors, 'rdj');
                if (colors.rdj) rs.colors.chat.residentdj = colors.rdj;
            }
            if (images) {
                rs.images = _.clone(images);
                rs.images.background = images.background;
                rs.images.playback = images.playback;
                rs.images.chat = _.omit(images, 'background', 'playback', 'rdj');
                if (images.rdj) rs.images.chat.residentdj = images.rdj;
            }

            return rs;
        },
        execute: function() {
            var i, a, loadEverything;
            loadEverything = Settings.useRoomSettings[document.location.pathname.split('/')[1]] != null ? Settings.useRoomSettings[document.location.pathname.split('/')[1]] : true;

            this.clear();
            if (roomSettings != null) {
                if (loadEverything) {
                    // colors
                    if (roomSettings.colors != null) {
                        // colors.background
                        if (roomSettings.colors.background != null && typeof roomSettings.colors.background === 'string' && p3Utils.isRGB(roomSettings.colors.background))
                            Styles.set('room-settings-background-color', 'body { background-color: ' + p3Utils.toRGB(roomSettings.colors.background) + '!important; }');

                        // colors.chat
                        if (roomSettings.colors.chat != null) {
                            a = {};
                            for (i in roomSettings.colors.chat) {
                                if (!roomSettings.colors.chat.hasOwnProperty(i)) continue;
                                if (ranks.indexOf(i) > -1 && typeof roomSettings.colors.chat[i] === 'string' && p3Utils.isRGB(roomSettings.colors.chat[i]))
                                    a[i] = p3Utils.toRGB(roomSettings.colors.chat[i]);
                            }
                            this.chatColors = a;
                        }

                        // colors.header
                        if (roomSettings.colors.header != null && typeof roomSettings.colors.header === 'string' && p3Utils.isRGB(roomSettings.colors.header))
                            Styles.set('room-settings-header', '#header { background-color: ' + p3Utils.toRGB(roomSettings.colors.header) + '!important; }');

                        // colors.footer
                        if (roomSettings.colors.footer != null && typeof roomSettings.colors.footer === 'string' && p3Utils.isRGB(roomSettings.colors.footer))
                            Styles.set('room-settings-footer', '.app-header { background-color: ' + p3Utils.toRGB(roomSettings.colors.footer) + '!important; }');
                    }

                    // css
                    if (roomSettings.css != null) {
                        // css.font
                        if (roomSettings.css.font != null && $.isArray(roomSettings.css.font)) {
                            var roomFonts = [];
                            for (i in roomSettings.css.font) {
                                if (!roomSettings.css.font.hasOwnProperty(i)) continue;
                                var font = roomSettings.css.font[i];
                                if (font.name != null && font.url != null) {
                                    font.toString = function() {
                                        var sources = [];
                                        if (typeof this.url === 'string')
                                            sources.push('url("' + this.url + '")');
                                        else {
                                            for (var j in this.url) {
                                                if (!this.url.hasOwnProperty(j)) continue;
                                                if (['woff', 'woff2', 'opentype', 'svg', 'svgz', 'embedded-opentype', 'truetype'].indexOf(j) > -1)
                                                    sources.push('url("' + this.url[j] + '") format("' + j + '")')
                                            }
                                        }
                                        return '@font-face { font-family: "' + this.name + '"; src: ' + sources.join(',') + '; }';
                                    };
                                    roomFonts.push(font.toString());
                                }
                            }
                            Styles.set('room-settings-fonts', roomFonts.join('\n'));
                        }
                        // css.import
                        if (roomSettings.css.import != null && $.isArray(roomSettings.css.import)) {
                            for (i in roomSettings.css.import) {
                                if (roomSettings.css.import.hasOwnProperty(i) && typeof roomSettings.css.import[i] === 'string')
                                    Styles.addImport(roomSettings.css.import[i]);
                            }
                        }
                        // css.setting
                        if (roomSettings.css.rule != null) {
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
                            Styles.set('room-settings-rules', roomCSSRules.join('\n'));
                        }
                    }

                    // images
                    if (roomSettings.images != null) {
                        // images.background
                        if (roomSettings.images.background)
                            Styles.set('room-settings-background-image', '.room-background { background-image: url("' + p3Utils.proxifyImage(roomSettings.images.background) + '")!important; }');

                        // images.playback
                        var playbackBackground = $('#playback').find('.background img');
                        if (playbackBackground.data('_o') == null)
                            playbackBackground.data('_o', playbackBackground.attr('src'));

                        if (roomSettings.images.playback != null) {
                            if (typeof roomSettings.images.playback === 'string' && roomSettings.images.playback.indexOf('http') === 0) {
                                var playbackFrame = new Image();
                                playbackFrame.onload = function() {
                                    playbackBackground.attr('src', this.src);
                                    RoomLoader.frameHeight = this.height - 10;
                                    RoomLoader.frameWidth = this.width - 18;
                                    RoomLoader.onVideoResize(Layout.getSize());
                                };
                                playbackFrame.src = p3Utils.proxifyImage(roomSettings.images.playback);
                            } else if (roomSettings.images.playback === false) {
                                playbackBackground.hide();
                            }
                        }

                        // images.booth
                        if (roomSettings.images.booth != null && typeof roomSettings.images.booth === 'string')
                            $('#dj-booth').append($('<div id="p3-dj-booth">').css('background-image', 'url("' + p3Utils.proxifyImage(roomSettings.images.booth) + '")'));

                        // images.icons
                        if (roomSettings.images.icons != null) {
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
                    if (roomSettings.text != null) {
                        // text.plugCubed
                        if (roomSettings.text.plugCubed != null) {

                        }

                        // text.plugDJ
                        if (roomSettings.text.plugDJ != null) {
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
                if (roomSettings.rules != null) {
                    this.rules.allowAutowoot = roomSettings.rules.allowAutowoot == null || roomSettings.rules.allowAutowoot === 'true' || roomSettings.rules.allowAutowoot === true;
                    this.rules.allowAutojoin = roomSettings.rules.allowAutojoin == null || roomSettings.rules.allowAutojoin === 'true' || roomSettings.rules.allowAutojoin === true;
                    this.rules.allowAutorespond = roomSettings.rules.allowAutorespond == null || roomSettings.rules.allowAutorespond === 'true' || roomSettings.rules.allowAutorespond === true;
                } else {
                    this.rules.allowAutowoot = true;
                    this.rules.allowAutojoin = true;
                    this.rules.allowAutorespond = true;
                }

                // roomscript
                if (roomSettings.roomscript != null) {
                    // TODO: Make this
                }

                // Update autorespond
                if (Settings.autorespond) {
                    if (this.rules.allowAutorespond) {
                        $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                    } else {
                        $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                    }
                }

                if (showMessage) {
                    p3Utils.chatLog(undefined, (typeof roomSettings.author === 'string' ? p3Lang.i18n('roomSpecificSettings.infoHeaderCredits', p3Utils.cleanHTML(roomSettings.author, '*')) : p3Lang.i18n('roomSpecificSettings.infoHeader')) + '<br>' + p3Lang.i18n('roomSpecificSettings.infoDisable'), p3Utils.logColors.infoMessage2, -1);
                    showMessage = false;
                }

                require('plugCubed/CustomChatColors').update();

                // Redraw menu
                require('plugCubed/dialogs/Menu').createMenu();
            }
        },
        clear: function() {
            this.chatColors = {};
            this.chatIcons = {};

            for (var i in langKeys) {
                if (!langKeys.hasOwnProperty(i)) continue;
                var key = langKeys[i];
                setPlugDJLang(key, getPlugDJLang(key, true));
            }

            $('#p3-dj-booth').remove();

            Styles.unset(['room-settings-background-color', 'room-settings-background-image', 'room-settings-booth', 'room-settings-fonts', 'room-settings-rules', 'room-settings-maingui']);
            Styles.clearImports();

            var playbackBackground = $('#playback').find('.background img');
            if (playbackBackground.data('_o') == null)
                playbackBackground.data('_o', playbackBackground.attr('src'));
            playbackBackground.attr('src', playbackBackground.data('_o'));
            playbackBackground.show();
            RoomLoader.frameHeight = playbackBackground.height() - 10;
            RoomLoader.frameWidth = playbackBackground.width() - 18;
            RoomLoader.onVideoResize(Layout.getSize());
        },
        close: function() {
            Context.off('room:joining', this.clear, this);
            Context.off('room:joined', this.update, this);
            this.clear();
        }
    });
    return new handler();
});
