define(['jquery', 'underscore', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/Settings'], function($, _, Class, p3Utils, p3Lang, Styles, Settings) {

    var Context, PlugUI, RoomModel, Handler, showMessage, oriLang, Lang, langKeys, ranks, that;

    /**
     * @property {{ background: String, chat: { admin: String, ambassador: String, bouncer: String, cohost: String, residentdj: String, host: String, manager: String }|null, footer: String, header: String }|null} colors
     * @property {{ font: Array, import: Array, rule: Array }|null} css
     * @property {{ background: String, booth: String, icons: { admin: String, ambassador: String, bouncer: String, cohost: String, residentdj: String, host: String, manager: String }|null, playback: String }|null} images
     * @property {{ plugCubed: Object, plugDJ: Object }|null} text
     * @property {{ allowAutorespond: Boolean|String, allowAutojoin: Boolean|String, allowAutowoot: Boolean|String }|null} rules
     * @property {String|null} roomscript
     */
    var roomSettings; // eslint-disable-line one-var

    Context = window.plugCubedModules.context;
    Lang = window.plugCubedModules.Lang;
    PlugUI = window.plugCubedModules.plugUrls;
    RoomModel = window.plugCubedModules.room;
    showMessage = false;
    oriLang = _.extend({}, Lang);
    langKeys = $.map(oriLang, function(v, i) {
        if (typeof v === 'string') {
            return i;
        }

        return $.map(v, function(v2, i2) {
            return i + '.' + i2;
        });
    });
    ranks = ['admin', 'ambassador', 'bouncer', 'cohost', 'residentdj', 'leader', 'host', 'manager', 'volunteer'];

    function getPlugDJLang(key, original) {
        if (!key) return '';
        var parts = key.split('.');
        var last = parts.pop();
        var partsLen = parts.length;
        var cur = original ? oriLang : Lang;

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

    function setFooterIcon() {
        $('#footer-user').find('.name .icon').removeClass().addClass('icon icon-chat-' + p3Utils.getRank());
    }

    function setPlugDJLang(key, value) {
        if (!key || !value) return;
        var parts = key.split('.');
        var last = parts.pop();
        var partsLen = parts.length;
        var cur = Lang;

        for (var i = 0; i < partsLen; i++) {
            var part = parts[i];

            if (cur[part] != null) {
                cur = cur[part];
            } else return;
        }
        if (cur[last] != null) {
            cur[last] = value;
        }
    }

    function parseDescription(description) {
        var isRCS = false;

        if (description.indexOf('@p3=') > -1) {
            description = description.substr(description.indexOf('@p3=') + 4);
            that.haveRoomSettings = true;
        } else if (description.indexOf('@rcs=') > -1) {
            description = description.substr(description.indexOf('@rcs=') + 5);
            isRCS = true;
            that.haveRoomSettings = true;
        } else {
            that.haveRoomSettings = false;
            require('plugCubed/CustomChatColors').update();

            return;
        }
        if (description.indexOf('\n') > -1) {
            description = description.substr(0, description.indexOf('\n'));
        }
        $.getJSON(p3Utils.html2text(description), function(settings) {
            roomSettings = settings;
            if (isRCS) {
                roomSettings = that.convertRCSToPlugCubed(settings);
            }
            showMessage = Settings.useRoomSettings[p3Utils.getRoomID()] != null ? Settings.useRoomSettings[p3Utils.getRoomID()] : true;
            that.execute();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
            p3Utils.chatLog(undefined, 'Error loading Room Settings ' + jqXHR.status, -2);
        });
    }

    Handler = Class.extend({
        rules: {
            allowAutowoot: true,
            allowAutorespond: true,
            allowAutojoin: true,
            allowEmotes: true,
            allowShowingMehs: true
        },
        haveRoomSettings: false,
        chatColors: {},
        chatIcons: {},
        init: function() {
            that = this;
            Context.on('change:role', setFooterIcon);
            Context.on('room:joining', this.clear, this);
            Context.on('room:joined', this.update, this);
            Context.on('chat:receive', this.checkModUpdate, this);
            setFooterIcon();
        },
        update: function() {
            parseDescription(p3Utils.cleanHTML(RoomModel.get('long_description')));
        },

        // Converts RCS CCS to P3 RSS Format. Written by ReAnna.
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
                rs.colors = rs.colors || {};
                rs.colors.chat = _.omit(colors, 'rdj');
                if (colors.rdj) {
                    rs.colors.chat.residentdj = colors.rdj;
                }
            }
            if (images) {
                rs.images = _.clone(images);
                rs.images.icons = _.omit(images, 'background', 'playback', 'rdj');
                if (images.rdj) {
                    rs.images.icons.residentdj = images.rdj;
                }
            }

            return rs;
        },
        execute: function() {
            var i, a, loadEverything;

            loadEverything = Settings.useRoomSettings[p3Utils.getRoomID()] != null ? Settings.useRoomSettings[p3Utils.getRoomID()] : true;

            this.clear();
            if (roomSettings != null) {
                if (loadEverything) {

                    // colors
                    if (roomSettings.colors != null) {

                        // colors.background
                        if (roomSettings.colors.background != null && typeof roomSettings.colors.background === 'string' && p3Utils.isRGB(roomSettings.colors.background)) {
                            Styles.set('room-settings-background-color', 'body { background-color: ' + p3Utils.toRGB(roomSettings.colors.background) + '!important; }');
                        }

                        // colors.chat
                        if (roomSettings.colors.chat != null) {
                            a = {};
                            for (i in roomSettings.colors.chat) {
                                if (!roomSettings.colors.chat.hasOwnProperty(i)) continue;
                                if (ranks.indexOf(i) > -1 && typeof roomSettings.colors.chat[i] === 'string' && p3Utils.isRGB(roomSettings.colors.chat[i])) {
                                    a[i] = p3Utils.toRGB(roomSettings.colors.chat[i]);
                                }
                            }
                            this.chatColors = a;
                        }

                        // colors.header
                        if (roomSettings.colors.header != null && typeof roomSettings.colors.header === 'string' && p3Utils.isRGB(roomSettings.colors.header)) {
                            Styles.set('room-settings-header', '#header { background-color: ' + p3Utils.toRGB(roomSettings.colors.header) + '!important; }');
                        }

                        // colors.footer
                        if (roomSettings.colors.footer != null && typeof roomSettings.colors.footer === 'string' && p3Utils.isRGB(roomSettings.colors.footer)) {
                            Styles.set('room-settings-footer', '.app-header { background-color: ' + p3Utils.toRGB(roomSettings.colors.footer) + '!important; }');
                        }
                    }

                    // css
                    if (roomSettings.css != null) {

                        // css.font
                        if (roomSettings.css.font != null && Array.isArray(roomSettings.css.font)) {
                            var roomFonts = [];

                            for (i = 0; i < roomSettings.css.font.length; i++) {
                                var font = roomSettings.css.font[i];

                                if (font.name != null && font.url != null) {
                                    font.toString = function() {
                                        var sources = [];

                                        if (typeof this.url === 'string') {
                                            sources.push('url("' + this.url + '")');
                                        } else {
                                            for (var j in this.url) {
                                                if (!this.url.hasOwnProperty(j)) continue;
                                                if (['woff', 'woff2', 'opentype', 'svg', 'svgz', 'embedded-opentype', 'truetype'].indexOf(j) > -1) {
                                                    sources.push('url("' + this.url[j] + '") format("' + j + '")');
                                                }
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
                        if (roomSettings.css.import != null) {
                            if (Array.isArray(roomSettings.css.import)) {
                                for (i = 0; i < roomSettings.css.import.length; i++) {
                                    if (typeof roomSettings.css.import[i] === 'string') {
                                        Styles.addImport(roomSettings.css.import[i]);
                                    }
                                }
                            } else if (typeof roomSettings.css.import === 'string') {
                                Styles.addImport(roomSettings.css.import);
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

                    // emotes
                    if ((roomSettings.emotes != null || roomSettings.emoji != null || roomSettings.emoticons != null) && (roomSettings.rules.allowEmotes == null || roomSettings.rules.allowEmotes === 'true' || roomSettings.rules.allowEmotes === true)) {
                        roomSettings.emotes || (roomSettings.emotes = roomSettings.emoticons || roomSettings.emoji);
                        delete roomSettings.emoticons;
                        delete roomSettings.emoji;

                        for (i in roomSettings.emotes) {
                            if (!roomSettings.emotes.hasOwnProperty(i) || roomSettings.emotes[i] == null) continue;

                            var emote = roomSettings.emotes[i];

                            if (typeof emote === 'string') {
                                window.plugCubed.emotes.customEmotes[':' + i + ':'] = {
                                    url: emote,
                                    size: 'auto'
                                };
                            } else if (emote != null && typeof emote === 'object' && emote.hasOwnProperty('url')) {
                                if (!('size' in emote) && (!('width' in emote) || !('height' in emote))) {
                                    emote.size = 'auto';
                                }
                                window.plugCubed.emotes.customEmotes[':' + i + ':'] = emote;
                            }

                        }

                    }

                    // images
                    if (roomSettings.images != null) {

                        // images.background
                        if (roomSettings.images.background) {
                            Styles.set('room-settings-background-image', '.left-side-wrapper { background-image: url("' + p3Utils.proxifyImage(roomSettings.images.background) + '") !important; background-position-x: center !important; background-position-y: bottom !important; }');
                        }

                        // images.playback
                        var playbackBackground = $('.left-side-wrapper-inner');

                        if (roomSettings.images.playback != null) {
                            if (typeof roomSettings.images.playback === 'string' && roomSettings.images.playback.indexOf('http') === 0) {
                                playbackBackground.css('background-image', 'url(' + roomSettings.images.playback + ')');
                            } else if (roomSettings.images.playback === false) {
                                playbackBackground.hide();
                            }
                        }

                        // images.booth
                        if (roomSettings.images.booth != null && typeof roomSettings.images.booth === 'string' && roomSettings.images.booth.indexOf('http') === 0) {
                            $('#dj-booth').append($('<div id="p3-dj-booth">').css('background-image', 'url("' + p3Utils.proxifyImage(roomSettings.images.booth) + '")'));
                        }

                        // images.icons
                        if (roomSettings.images.icons != null) {
                            a = {};
                            for (i in roomSettings.images.icons) {
                                if (!roomSettings.images.icons.hasOwnProperty(i)) continue;
                                if (ranks.indexOf(i) > -1 && typeof roomSettings.images.icons[i] === 'string' && roomSettings.images.icons[i].indexOf('http') === 0) {
                                    a[i] = p3Utils.proxifyImage(roomSettings.images.icons[i]);
                                }
                            }
                            this.chatIcons = a;
                        }
                    }

                    // text
                    if (roomSettings.text != null) {

                        // text.plugCubed
                        if (roomSettings.text.plugCubed != null) { // eslint-disable-line no-empty
                        }

                        // text.plugDJ
                        if (roomSettings.text.plugDJ != null) {
                            for (i in roomSettings.text.plugDJ) {
                                if (!roomSettings.text.plugDJ.hasOwnProperty(i)) continue;
                                var value = roomSettings.text.plugDJ[i];

                                if (i && value && typeof value == 'string') {
                                    setPlugDJLang(i, roomSettings.text.plugDJ[i]);
                                }
                            }
                        }
                    }
                }

                // rules
                if (roomSettings.rules != null) {
                    this.rules.allowAutowoot = roomSettings.rules.allowAutowoot == null || roomSettings.rules.allowAutowoot === 'true' || roomSettings.rules.allowAutowoot === true;
                    this.rules.allowAutojoin = roomSettings.rules.allowAutojoin == null || roomSettings.rules.allowAutojoin === 'true' || roomSettings.rules.allowAutojoin === true;
                    this.rules.allowAutorespond = roomSettings.rules.allowAutorespond == null || roomSettings.rules.allowAutorespond === 'true' || roomSettings.rules.allowAutorespond === true;
                    this.rules.allowEmotes = roomSettings.rules.allowEmotes == null || roomSettings.rules.allowEmotes === 'true' || roomSettings.rules.allowEmotes === true;
                    this.rules.allowShowingMehs = roomSettings.rules.allowShowingMehs == null || roomSettings.rules.allowShowingMehs === 'true' || roomSettings.rules.allowShowingMehs === true;
                } else {
                    this.rules.allowAutowoot = true;
                    this.rules.allowAutojoin = true;
                    this.rules.allowAutorespond = true;
                    this.rules.allowEmotes = true;
                    this.rules.allowShowingMehs = true;
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

            Styles.unset(['room-settings-background-color', 'room-settings-background-image', 'room-settings-booth', 'room-settings-fonts', 'room-settings-rules', 'room-settings-maingui', 'CCC-text-admin', 'CCC-text-ambassador', 'CCC-text-host', 'CCC-text-cohost', 'CCC-text-manager', 'CCC-text-bouncer', 'CCC-text-residentdj', 'CCC-text-regular', 'CCC-text-you', 'CCC-image-admin', 'CCC-image-ambassador', 'CCC-image-host', 'CCC-image-cohost', 'CCC-image-manager', 'CCC-image-bouncer', 'CCC-image-residentdj']);
            Styles.clearImports();
            var playbackBackground = $('.left-side-wrapper-inner');

            playbackBackground.css('background-image', 'url(' + PlugUI.videoframe + ')');
            playbackBackground.show();
        },

        /*
         * RCS compatibility--reload room settings if a moderator chats
         * "!rcsreload ccs".
         */
        checkModUpdate: function(message) {
            if ((API.hasPermission(message.uid, API.ROLE.COHOST) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) && (p3Utils.startsWith(message.message, '!rcsreload ccs') || p3Utils.startsWith(message.message, '!p3reload ccs'))) {
                this.update();
            }
        },
        close: function() {
            Context.off('change:role', setFooterIcon);
            Context.off('room:joining', this.clear, this);
            Context.off('room:joined', this.update, this);
            Context.off('chat:receive', this.checkModUpdate, this);
            this.clear();
        }
    });

    return new Handler();
});
