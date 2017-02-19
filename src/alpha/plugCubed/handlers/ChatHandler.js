define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/RoomSettings'], function(Class, p3Utils, p3Lang, Settings, RoomSettings) {
    var twitchEmoteTemplate, Context, PopoutView, plugEmotes, regEmotes, start;

    twitchEmoteTemplate = '';
    Context = window.plugCubedModules.context;
    PopoutView = window.plugCubedModules.PopoutView;
    plugEmotes = window.plugCubedModules.emoji;
    regEmotes = /:([a-zA-Z0-9]+):/g;
    plugEmotes.include_title = true;

    $('#chat-messages').on('mouseover', '.p3-twitch-emote, .p3-tasty-emote, .p3-bttv-emote, .p3-twitch-sub-emote, .p3-ffz-emote, .emoji-inner', function() {
        if ($(this)[0].title != null && $(this)[0].title.length > 0) {
            $(this)[0].dataset.emote = ' ' + $(this)[0].title;
            $(this)[0].removeAttribute('title');
        }
        if ($(this)[0].className && $(this)[0].className.indexOf('gemoji-plug-') > -1) {
            $(this)[0].dataset.emote = /gemoji-plug-(.*)/gi.exec($(this)[0].className)[1];
        }

        if ($(this).data('emote') != null && $(this).data('emote').length > 0) {
            Context.trigger('tooltip:show', $(this).data('emote'), $(this), true);
        }
    }).on('mouseout', '.p3-twitch-emote, .p3-tasty-emote, .p3-bttv-emote, .p3-twitch-sub-emote, .p3-ffz-emote, .emoji-inner', function() {
        Context.trigger('tooltip:hide');
    });

    function convertImageLinks(text, $message) {
        if (Settings.chatImages) {
            if (text.toLowerCase().indexOf('nsfw') < 0) {
                var temp = $('<div/>');

                temp.html(text).find('a').each(function() {
                    var path, $video, identifier;
                    var imageURL = null;
                    var url = $(this).attr('href');

                    // Prevent plug.dj exploits
                    if (p3Utils.startsWithIgnoreCase(url, ['http://plug.dj', 'https://plug.dj'])) {
                        return;

                        // Normal image links
                    } else if (p3Utils.endsWithIgnoreCase(url, ['.gif', '.jpg', '.jpeg', '.png']) || p3Utils.endsWithIgnoreCase(p3Utils.getBaseURL(url), ['.gif', '.jpg', '.jpeg', '.png'])) {
                        imageURL = p3Utils.proxifyImage(url);

                        // gfycat links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://gfycat.com/', 'https://gfycat.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0) {
                                identifier = 'video-' + p3Utils.getRandomString(8);

                                $video = $('<video autoplay loop muted="muted">').addClass(identifier).css('display', 'block').css('max-width', '100%').css('height', 'auto').css('margin', '0 auto');

                                $(this).html('').append($video);

                                $.getJSON('https://gfycat.com/cajax/get/' + path, function(videoData) {
                                    $video = $message.find('.' + identifier);

                                    if (videoData.error) {
                                        console.log('error', videoData);
                                        $video.html(videoData.error);

                                        return;
                                    }

                                    var webmUrl, mp4Url, imgUrl;

                                    webmUrl = p3Utils.httpsifyURL(videoData.gfyItem.webmUrl);
                                    mp4Url = p3Utils.httpsifyURL(videoData.gfyItem.mp4Url);
                                    imgUrl = p3Utils.httpsifyURL(videoData.gfyItem.gifUrl);

                                    $video.append($('<source>').attr('type', 'video/webm').attr('src', webmUrl));
                                    $video.append($('<source>').attr('type', 'video/mp4').attr('src', mp4Url));
                                    $video.append($('<img>').attr('src', imgUrl));
                                });
                            }
                        }

                        // Lightshot links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://prntscr.com/', 'https://prntscr.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0) {
                                imageURL = 'https://api.plugCubed.net/redirect/prntscr/' + path;
                            }
                        }

                        // Imgur links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://imgur.com/gallery/', 'https://imgur.com/gallery/', 'http://imgur.com/', 'http://i.imgur.com/', 'https://i.imgur.com/', 'https://imgur.com/'])) {
                        path = url.split('/');
                        if (path.length >= 4) {
                            path = path[4] || path[3];
                            if (path && path.trim().length !== 0) {
                                identifier = 'video-' + p3Utils.getRandomString(8);

                                $video = $('<video autoplay loop muted="muted">').addClass(identifier).css('display', 'block').css('max-width', '100%').css('height', 'auto').css('margin', '0 auto');

                                $(this).html('').append($video);

                                $.getJSON('https://api.plugcubed.net/redirect/imgurraw/' + path, function(imgurData) {
                                    $video = $message.find('.' + identifier);

                                    if (imgurData.error) {
                                        console.log('error', imgurData);
                                        $video.html(imgurData.error);

                                        return;
                                    }

                                    if (imgurData.webm != null) $video.append($('<source>').attr('type', 'video/webm').attr('src', p3Utils.httpsifyURL(imgurData.webm)));

                                    if (imgurData.mp4 != null) $video.append($('<source>').attr('type', 'video/mp4').attr('src', p3Utils.httpsifyURL(imgurData.mp4)));

                                    if (imgurData.gifv != null) $video.append($('<source>').attr('type', 'video/mp4').attr('src', p3Utils.httpsifyURL(imgurData.gifv)));

                                    $video.attr('poster', p3Utils.httpsifyURL(imgurData.link));
                                    $video.append($('<img>').attr('src', p3Utils.httpsifyURL(imgurData.link)));
                                });
                            }
                        }

                        // Gyazo links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://gyazo.com/', 'https://gyazo.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0) {
                                imageURL = 'https://api.plugcubed.net/redirect/gyazo/' + path;
                            }
                        }
                    } else {

                        // DeviantArt links
                        var daTests = [/http:\/\/[a-z\-\.]+\.deviantart.com\/art\/[0-9a-zA-Z:\-]+/,
                            /http:\/\/[a-z\-\.]+\.deviantart.com\/[0-9a-zA-Z:\-]+#\/[0-9a-zA-Z:\-]+/,
                            /http:\/\/fav.me\/[0-9a-zA-Z]+/, /http:\/\/sta.sh\/[0-9a-zA-Z]+/];

                        for (var i in daTests) {
                            if (daTests.hasOwnProperty(i) && daTests[i].test(url)) {
                                imageURL = 'https://api.plugCubed.net/redirect/da/' + url;
                                break;
                            }
                        }
                    }

                    // If supported image link
                    if (imageURL !== null) {
                        var image = $('<img>').attr('src', imageURL).css('display', 'block').css('max-width', '100%').css('height', 'auto').css('margin', '0 auto');

                        $(this).attr('src', imageURL);
                        $(this).html(image);
                        text = temp.html();

                        return;
                    }
                });
            }
        }

        return text;
    }

    function tokenize(text) {
        var chunk, i, tokens;

        i = 0;
        tokens = [];

        function delimited(delim, type) {
            if (chunk[0] === delim && chunk[1] !== delim) {
                var end = chunk.indexOf(delim, 1);

                if (end > -1) {
                    tokens.push({
                        type: type,
                        text: chunk.slice(1, end)
                    });
                    i += end + 1;

                    return true;
                }
            }
        }

        function space() {
            var msg = /^\s+/.exec(text.slice(i));

            if (msg) {
                tokens.push({
                    type: 'word',
                    text: msg[0]
                });
                i += msg[0].length;
            }
        }

        while ((chunk = text.slice(i))) {
            var found =
                delimited('_', 'em') ||
                delimited('*', 'strong') ||
                delimited('`', 'code') ||
                delimited('\\', 'quote') ||
                delimited('~', 'strike');

            if (!found) {
                var end = chunk.indexOf(' ', 1) + 1;

                if (end === 0) {
                    end = chunk.length;
                }
                tokens.push({
                    type: 'word',
                    text: chunk.slice(0, end)
                });
                i += end;
            }
            space();
        }

        return tokens;
    }

    function transform(text) {
        if (!Settings.markdown) return text;

        return tokenize(text).reduce(function(string, token) {
            return string + (
                token.type === 'em' ? '<em>' + transform(token.text) + '</em>' :
                token.type === 'strong' ? '<strong>' + transform(token.text) + '</strong>' :
                token.type === 'code' ? '<code>' + token.text + '</code>' :
                token.type === 'quote' ? '<blockquote class="p3-blockquote">' + token.text + '</blockquote>' :
                token.type === 'strike' ? '<span class="p3-strike">' + transform(token.text) + '</span>' :
                token.text
            );
        }, '');
    }

    function convertEmoteByType(text, type) {
        if (typeof text !== 'string' || typeof type !== 'string' || ['bttvEmotes', 'ffzEmotes', 'twitchEmotes', 'twitchSubEmotes', 'tastyEmotes'].indexOf(type) === -1) return text;

        var temp, image, emoteData, emote, className;

        emoteData = window.plugCubed.emotes[type];
        className = type === 'bttvEmotes' ? 'p3-bttv-emote' : type === 'twitchEmotes' ? 'p3-twitch-emote' : type === 'twitchSubEmotes' ? 'p3-twitch-sub-emote' : type === 'tastyEmotes' ? 'p3-tasty-emote' : type === 'ffzEmotes' ? 'p3-ffz-emote' : '';
        image = $('<img>');
        temp = $('<div>');

        return text.replace(regEmotes, function(shortcode) {
            var lowerCode = shortcode.toLowerCase();

            emote = emoteData[lowerCode] || shortcode;

            if (emote && emote.imageURL) {
                temp = temp.empty().append(image.removeClass().addClass(className).attr('src', emote.imageURL).attr('data-emote', p3Utils.html2text(emote.emote)));

                return shortcode.replace(emote.emoteRegex, temp.html());
            }

            return shortcode;
        });
    }

    function convertEmotes(text) {
        if (typeof text !== 'string' || RoomSettings.rules.allowEmotes === false || text.indexOf(':') === -1) return text;

        return convertEmoteByType(
            convertEmoteByType(
                convertEmoteByType(
                    convertEmoteByType(
                        convertEmoteByType(text, 'twitchEmotes'),
                        'tastyEmotes'),
                    'twitchSubEmotes'),
                'bttvEmotes'),
            'ffzEmotes');
    }

    function onChatReceived(data) {
        if (!data.uid) return;

        data.un = p3Utils.cleanHTML(data.un, '*');
        data.message = p3Utils.cleanHTML(data.message, ['div', 'table', 'tr', 'td']);
    }

    function onChatReceivedLate(data) {
        if (!data.uid) return;

        var $this = $('.msg.cid-' + data.cid).closest('.cm');
        var $msg = $('.msg .text.cid-' + data.cid);
        var $icon;

        var previousMessages = '';
        var innerHTML = $msg.html();

        if (innerHTML != null && innerHTML.indexOf('<br>') > -1) {
            previousMessages = innerHTML.substr(0, innerHTML.lastIndexOf('<br>') + 4);
        }

        if (Settings.moderation.inlineUserInfo && (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) && $this.find('.p3-user-info').length === 0) {
            var $userInfo = $('<span>').addClass('p3-user-info');

            $userInfo.html('<strong>LVL:</strong> ' + API.getUser(data.uid).level + ' <strong>|</strong><strong>ID:</strong> ' + API.getUser(data.uid).id);
            $userInfo.insertAfter($this.find('.un'));
        }

        var msgClass = $this.attr('class');

        msgClass += ' fromID-' + data.uid;

        if (p3Utils.havePlugCubedRank(data.uid)) {
            msgClass += ' is-p3' + p3Utils.getHighestRank(data.uid);
        }

        msgClass += ' from-';
        if (p3Utils.hasPermission(data.uid, API.ROLE.HOST, true)) {
            msgClass += 'admin';
        } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER, true)) {
            msgClass += 'ambassador';
        } else if (p3Utils.hasPermission(data.uid, API.ROLE.HOST)) {
            msgClass += 'host';
        } else if (p3Utils.hasPermission(data.uid, API.ROLE.COHOST)) {
            $this.find('.icon-chat-host').attr('class', 'icon icon-chat-cohost');
            msgClass += 'cohost';
        } else if (p3Utils.hasPermission(data.uid, API.ROLE.MANAGER)) {
            msgClass += 'manager';
        } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER)) {
            msgClass += 'bouncer';
        } else if (p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
            msgClass += 'dj';
        } else if (p3Utils.hasPermission(data.uid, API.ROLE.NONE)) {
            msgClass += 'regular';
        }

        if (data.uid === API.getUser().id) {
            msgClass += ' from-you';
        }
        data.message = convertImageLinks(data.message, $msg);
        data.message = convertEmotes(data.message);
        if (~['mention', 'message', 'emote'].indexOf(data.type)) {
            data.message = transform(data.message);
        }

        if (p3Utils.havePlugCubedRank(data.uid) || p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
            var p3Rank = p3Utils.getHighestRank(data.uid);
            var specialIconInfo = p3Utils.getPlugCubedSpecial(data.uid);

            if (p3Rank != null) {

                $icon = $('<i>').addClass('icon icon-chat-p3' + p3Rank).prependTo($this.find('.from'));

                $icon.mouseover(function() {
                    Context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(data.uid)).text(), $(this), true);
                }).mouseout(function() {
                    Context.trigger('tooltip:hide');
                });

                if (specialIconInfo != null) {
                    $icon.css('background-image', 'url("https://plugcubed.net/scripts/alpha/images/icons.p3special."' + specialIconInfo.icon + '.png)');
                }
            }
        }

        $this.attr('class', msgClass);

        // Delete own chat if Bouncer or above
        if ((p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER, true) || p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER)) && data.uid === API.getUser().id) {
            if ($this.hasClass('deletable')) return;

            var deleteButton = $('<div>').addClass('delete-button').text('Delete');

            deleteButton.click(function() {
                return $.ajax({
                    type: 'DELETE',
                    url: '/_/chat/' + $this.data('cid')
                });
            });

            $this
                .addClass('deletable')
                .append(deleteButton);
        }

        $msg.html(previousMessages + p3Utils.cleanHTML(data.message, ['div', 'table', 'tr', 'td'], ['img', 'video', 'source']));

        $this.data('translated', false);
        $this.dblclick(function(e) {
            if (!e.ctrlKey) return;
            if ($this.data('translated')) {
                $msg.html(previousMessages + convertEmotes(convertImageLinks(data.message)));
                $this.data('translated', false);
            } else {
                $msg.html('<em>Translating...</em>');
                $.getJSON('https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20161006T200452Z.20a8f9334badc4dc.03bec1dcee7047013bf54af595d257c5e8fca99d&lang=en&options=1&text=' + encodeURIComponent(data.message.replace('&nbsp;', ' ')))
                    .done(function(langData) {
                        if (langData.error) {
                            $msg.html(previousMessages + convertEmotes(convertImageLinks(data.message)));
                            $this.data('translated', false);
                        } else if (langData.detected && langData.detected.lang && langData.detected.lang !== 'en') {
                            $msg.html(previousMessages + convertEmotes(convertImageLinks((Array.isArray(langData.text) && langData.text.length > 0 ? langData.text[0] : data.message))));
                            $this.data('translated', true);
                        }
                    })
                    .fail(function() {
                        $msg.html(previousMessages + convertEmotes(convertImageLinks(data.message)));
                        $this.data('translated', false);
                    });
            }
            e.stopPropagation();
        });
    }

    function onInputKeyUp(e) {
        if (e.keyCode === 38) {
            onInputMove(true, $(this));
        } else if (e.keyCode === 40) {
            onInputMove(false, $(this));
        }
    }

    function onInputMove(up, $this) {
        var latestInputs = p3Utils.getUserData(-1, 'latestInputs', []);

        if (latestInputs.length === 0) return;

        var curPos = p3Utils.getUserData(-1, 'curInputPos', 0);
        var tmpInput = p3Utils.getUserData(-1, 'tmpInput', null);

        if ((tmpInput == null && up) || curPos === 0) {
            tmpInput = $this.val();
        } else if (tmpInput == null) {
            return;
        }

        curPos = Math.max(0, Math.min(curPos + (up ? 1 : -1), latestInputs.length));

        p3Utils.setUserData(-1, 'curInputPos', curPos);
        p3Utils.setUserData(-1, 'tmpInput', tmpInput);

        $this.val(curPos === 0 ? tmpInput : latestInputs[latestInputs.length - curPos]);
    }

    var Handler = Class.extend({
        loadTwitchEmotes: function() {
            if (RoomSettings.rules.allowEmotes === false || !Settings.emotes.twitchEmotes) return;
            start = performance.now();

            $.getJSON('https://twitchemotes.com/api_cache/v2/global.json')
                .done(function(data) {
                    twitchEmoteTemplate = data.template.small;
                    var i, emotes, twitchEmotes;

                    emotes = data.emotes;
                    twitchEmotes = window.plugCubed.emotes.twitchEmotes = {};

                    for (i in emotes) {
                        if (!emotes.hasOwnProperty(i)) continue;
                        twitchEmotes[':' + i.toLowerCase() + ':'] = {
                            emote: i,
                            emoteRegex: new RegExp('(?::' + p3Utils.escapeRegex(i.toLowerCase()) + ':)', 'gi'),
                            imageURL: twitchEmoteTemplate.replace('{image_id}', emotes[i].image_id),
                            type: 'twitchemote'
                        };
                    }
                    twitchEmotes = _.chain(twitchEmotes).indexBy('emote').values().value();
                    p3Utils.generateEmoteHash();

                    console.log('[plug³ Twitch Emotes]', twitchEmotes.length + ' Twitch.TV emoticons loaded in ' + (performance.now() - start) + 'ms');
                })
                .fail(function() {
                    console.error('[plug³ Twitch Emotes] Failed to load JSON file');
                });
        },
        loadTwitchSubEmotes: function() {
            if (RoomSettings.rules.allowEmotes === false || !Settings.emotes.twitchSubEmotes) return;
            start = performance.now();

            $.getJSON('https://twitchemotes.com/api_cache/v2/subscriber.json')
                .done(function(data) {
                    var i, j, channels, twitchSubEmotes;

                    twitchSubEmotes = window.plugCubed.emotes.twitchSubEmotes = {};
                    channels = data.channels;

                    for (i in channels) {
                        if (!channels.hasOwnProperty(i)) continue;

                        var emotes = channels[i].emotes;
                        var emotesLength = emotes.length;

                        for (j = 0; j < emotesLength; j++) {
                            if (emotes[j].code) {

                                // skip this since we already have kappa, kreygasm, dansgame in twitchEmotes that ignores case.
                                if (emotes[j].code.toLowerCase() === 'kreygasm' || emotes[j].code.toLowerCase() === 'kappa' || emotes[j].code.toLowerCase() === 'dansgame') continue;
                                twitchSubEmotes[':' + emotes[j].code.toLowerCase() + ':'] = {
                                    emote: emotes[j].code,
                                    emoteRegex: new RegExp('(?::' + p3Utils.escapeRegex(emotes[j].code.toLowerCase()) + ':)', 'gi'),
                                    imageURL: twitchEmoteTemplate.replace('{image_id}', emotes[j].image_id),
                                    type: 'twitchsubemote'
                                };
                            }
                        }

                    }

                    twitchSubEmotes = _.chain(twitchSubEmotes).indexBy('emote').values().value();
                    p3Utils.generateEmoteHash();

                    console.log('[plug³ Twitch Subscriber Emotes]', twitchSubEmotes.length + ' Twitch.TV Subscriber emoticons loaded in ' + (performance.now() - start) + 'ms');
                })
                .fail(function() {
                    console.error('[plug³ Twitch Subscriber Emotes] Failed to load JSON file');
                });
        },
        convertEmotes: convertEmotes,
        loadBttvEmotes: function() {
            if (RoomSettings.rules.allowEmotes === false || !Settings.emotes.bttvEmotes) return;
            start = performance.now();

            $.getJSON('https://plugcubed.net/scripts/emojis/bttv.json', {
                _: new Date().getTime()
            })
                .done(function(data) {
                    var bttvEmotes, i, emote;

                    bttvEmotes = window.plugCubed.emotes.bttvEmotes = {};

                    // eslint-disable-next-line guard-for-in
                    for (i in data) {
                        emote = data[i];
                        if (emote) {
                            bttvEmotes[':' + i.toLowerCase() + ':'] = {
                                emote: i,
                                emoteRegex: new RegExp('(?::' + p3Utils.escapeRegex(i.toLowerCase()) + ':)', 'gi'),
                                imageURL: 'https://cdn.betterttv.net/emote/' + emote + '/1x',
                                type: 'bttvemote'
                            };
                        }
                    }
                    bttvEmotes = _.chain(bttvEmotes).indexBy('emote').values().value();
                    p3Utils.generateEmoteHash();

                    console.log('[plug³ BetterTTV Emotes]', bttvEmotes.length + ' BetterTTV emoticons loaded in ' + (performance.now() - start) + 'ms');

                })
                .fail(function() {
                    console.error('[plug³ BetterTTV Emotes] Failed to load JSON file');
                });
        },
        loadFfzEmotes: function() {
            if (RoomSettings.rules.allowEmotes === false || !Settings.emotes.ffzEmotes) return;
            start = performance.now();

            $.getJSON('https://plugcubed.net/scripts/emojis/ffz.json', {
                _: new Date().getTime()
            })
                .done(function(data) {
                    var ffzEmotes, i, emote;

                    ffzEmotes = window.plugCubed.emotes.ffzEmotes = {};

                    // eslint-disable-next-line guard-for-in
                    for (i in data) {
                        emote = data[i];
                        if (emote && i.toLowerCase() !== 'lul') {
                            ffzEmotes[':' + i.toLowerCase() + ':'] = {
                                emote: i,
                                emoteRegex: new RegExp('(?::' + p3Utils.escapeRegex(i.toLowerCase()) + ':)', 'gi'),
                                imageURL: 'https://cdn.frankerfacez.com/emoticon/' + emote + '/1',
                                type: 'ffzEmote'
                            };
                        }
                    }
                    ffzEmotes = _.chain(ffzEmotes).indexBy('emote').values().value();
                    p3Utils.generateEmoteHash();

                    console.log('[plug³ frankerFFZ Emotes]', ffzEmotes.length + ' frankerFFZ emoticons loaded in ' + (performance.now() - start) + 'ms');

                })
                .fail(function() {
                    console.error('[plug³ frankerFFZ Emotes] Failed to load JSON file');
                });
        },
        loadTastyEmotes: function() {
            if (RoomSettings.rules.allowEmotes === false || !Settings.emotes.tastyEmotes) return;
            start = performance.now();

            $.getJSON('https://emotes.tastycat.org/emotes-full.json')
                .done(function(data) {
                    var i, tastyEmotes;

                    tastyEmotes = window.plugCubed.emotes.tastyEmotes = {};

                    for (i in data.emotes) {
                        if (!data.emotes.hasOwnProperty(i)) continue;
                        tastyEmotes[':' + i.toLowerCase() + ':'] = {
                            emote: i,
                            emoteRegex: new RegExp('(?::' + p3Utils.escapeRegex(i.toLowerCase()) + ':)', 'gi'),
                            imageURL: data.emotes[i].url,
                            height: data.emotes[i].height,
                            width: data.emotes[i].width,
                            type: 'tastyemote'
                        };
                    }

                    tastyEmotes = _.chain(tastyEmotes).indexBy('emote').values().value();
                    p3Utils.generateEmoteHash();

                    console.log('[plug³ Tasty Emotes]', tastyEmotes.length + ' Tastycat emoticons loaded in ' + (performance.now() - start) + 'ms');

                })
                .fail(function(data) {
                    console.error('[plug³ Tasty Emotes] Failed to load JSON file');
                });

        },
        register: function() {
            Context.on('chat:receive', onChatReceived);
            Context._events['chat:receive'].unshift(Context._events['chat:receive'].pop());
            Context.on('chat:receive', onChatReceivedLate);

            $('#chat-input-field').on('keyup', onInputKeyUp);
        },
        close: function() {
            Context.off('chat:receive', onChatReceived);
            Context.off('chat:receive', onChatReceivedLate);

            $('#chat-input-field').off('keyup', onInputKeyUp);
        }
    });

    return new Handler();
});
