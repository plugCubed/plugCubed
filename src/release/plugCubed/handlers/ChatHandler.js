define(['jquery', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/bridges/Context'], function($, Class, p3Utils, p3Lang, Settings, _$context) {
    var PopoutView, twitchEmoteTemplate = '', twitchEmotes = [];

    if (!p3Utils.runLite)
        PopoutView = require('app/views/room/popout/PopoutView');

    $("#chat-messages").on('mouseover', '.twitch-emote', function() {
        _$context.trigger('tooltip:show', $(this).data('emote'), $(this), true);
    }).on('mouseout', '.twitch-emote', function() {
        _$context.trigger('tooltip:hide');
    });

    function convertImageLinks(text, $message) {
        if (Settings.chatImages) {
            if (text.toLowerCase().indexOf('nsfw') < 0) {
                var temp = $('<div/>');
                temp.html(text).find('a').each(function() {
                    var url = $(this).attr('href'), path, imageURL = null, $video, identifier;

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

                                $video.on('load', function() {
                                    var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'), height = this.height;
                                    if (this.width > $chat.find('.message').width())
                                        height *= this.width / $chat.find('.message').width();
                                    $chat.scrollTop($chat[0].scrollHeight + height);
                                });

                                $.getJSON('https://gfycat.com/cajax/get/' + path, function(videoData) {
                                    $video = $message.find('.' + identifier);

                                    if (videoData.error) {
                                        console.log('error', videoData);
                                        $video.html(videoData.error);
                                        return;
                                    }

                                    var webmUrl, mp4Url, imgUrl;

                                    webmUrl = p3Utils.httpsifyURL(videoData['gfyItem']['webmUrl']);
                                    mp4Url = p3Utils.httpsifyURL(videoData['gfyItem']['mp4Url']);
                                    imgUrl = p3Utils.httpsifyURL(videoData['gfyItem']['gifUrl']);

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
                            if (path.trim().length !== 0)
                                imageURL = 'https://api.plugCubed.net/redirect/prntscr/' + path;
                        }

                        // Imgur links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://imgur.com/gallery/', 'https://imgur.com/gallery/', 'http://imgur.com/', 'https://imgur.com/'])) {
                        path = url.split('/');
                        if (path.length > 4) {
                            path = path[4];
                            if (path.trim().length !== 0) {
                                identifier = 'video-' + p3Utils.getRandomString(8);

                                $video = $('<video autoplay loop muted="muted">').addClass(identifier).css('display', 'block').css('max-width', '100%').css('height', 'auto').css('margin', '0 auto');

                                $(this).html('').append($video);

                                $video.on('load', function() {
                                    var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'), height = this.height;
                                    if (this.width > $chat.find('.message').width())
                                        height *= this.width / $chat.find('.message').width();
                                    $chat.scrollTop($chat[0].scrollHeight + height);
                                });

                                $.getJSON('https://api.plugcubed.net/redirect/imgurraw/' + path, function(imgurData) {
                                    $video = $message.find('.' + identifier);

                                    if (imgurData.error) {
                                        console.log('error', imgurData);
                                        $video.html(imgurData.error);
                                        return;
                                    }

                                    if (imgurData['webm'] != null)
                                        $video.append($('<source>').attr('type', 'video/webm').attr('src', p3Utils.httpsifyURL(imgurData['webm'])));

                                    if (imgurData['webm'] != null)
                                        $video.append($('<source>').attr('type', 'video/mp4').attr('src', p3Utils.httpsifyURL(imgurData['mp4'])));

                                    $video.attr('poster', p3Utils.httpsifyURL(imgurData['link']));
                                    $video.append($('<img>').attr('src', p3Utils.httpsifyURL(imgurData['link'])));
                                });
                            }
                        }

                        // Gyazo links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://gyazo.com/', 'https://gyazo.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0)
                                imageURL = 'https://i.gyazo.com/' + path + '.png';
                        }
                    } else {
                        // DeviantArt links
                        var daTests = [/http:\/\/[a-z\-\.]+\.deviantart.com\/art\/[0-9a-zA-Z:\-]+/, /http:\/\/[a-z\-\.]+\.deviantart.com\/[0-9a-zA-Z:\-]+#\/[0-9a-zA-Z:\-]+/, /http:\/\/fav.me\/[0-9a-zA-Z]+/, /http:\/\/sta.sh\/[0-9a-zA-Z]+/];
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
                        $(this).html(image);
                        image.on('load', function() {
                            var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'), height = this.height;
                            if (this.width > $chat.find('.message').width())
                                height *= this.width / $chat.find('.message').width();
                            $chat.scrollTop($chat[0].scrollHeight + height);
                        });
                    }
                });
                text = temp.html();
            }
        }
        return text;
    }

    function convertEmotes(text) {
        if (Settings.twitchEmotes) {
            var nbspStart = p3Utils.startsWithIgnoreCase(text, '&nbsp;');
            text = ' ' + (nbspStart ? text.replace('&nbsp;', '') : text) + ' ';
            for (var i in twitchEmotes) {
                if (!twitchEmotes.hasOwnProperty(i)) continue;
                var twitchEmote = twitchEmotes[i];
                if (text.indexOf(' ' + twitchEmote.emote + ' ') > -1 || text.indexOf(':' + twitchEmote.emote + ':') > -1) {
                    var temp = $('<div>'), image = $('<img>').addClass('twitch-emote').attr('src', twitchEmoteTemplate.split('{image_id}').join(twitchEmote.image_id)).data('emote', $('<span>').html(twitchEmote.emote).text());
                    image.on('load', function() {
                        var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'), height = this.height;
                        if (this.width > $chat.find('.message').width())
                            height *= this.width / $chat.find('.message').width();
                        $chat.scrollTop($chat[0].scrollHeight + height);
                    });
                    temp.append(image);
                    text = text.split(' ' + twitchEmote.emote + ' ').join(' ' + temp.html() + ' ');
                    text = text.split(':' + twitchEmote.emote + ':').join(temp.html());
                }
            }
            return (nbspStart ? '&nbsp;' : '') + text.substr(1, text.length - 2);
        }
        return text;
    }

    function onChatReceived(data) {
        if (!data.uid) return;

        if (data.uid == API.getUser().id) {
            var latestInputs = p3Utils.getUserData(-1, 'latestInputs', []);
            latestInputs.push(data.message);
            if (latestInputs.length > 10) {
                latestInputs.splice(0, 1);
            }
            p3Utils.setUserData(-1, 'latestInputs', latestInputs);
            p3Utils.setUserData(-1, 'tmpInput', null);
        }

        p3Utils.setUserData(data.uid, 'lastChat', Date.now());

        if (p3Utils.hasPermission(undefined, API.ROLE.DJ) && (function(_) {
                return p3Utils.isPlugCubedDeveloper(_) || p3Utils.isPlugCubedSponsor(_) || p3Utils.isPlugCubedAmbassador(_);
            })(API.getUser().id)) {
            data.deletable = true;
        }

        data.un = p3Utils.cleanHTML(data.un, '*');
        data.message = p3Utils.cleanHTML(data.message, ['div', 'table', 'tr', 'td']);
    }

    function onChatReceivedLate(data) {
        if (!data.uid) return;

        var $this = $('.text.cid-' + data.cid).closest('.cm'), $icon;

        var previousMessages = '', innerHTML = $this.find('.text').html();
        if (innerHTML != null && innerHTML.indexOf('<br>') > -1) {
            previousMessages = innerHTML.substr(0, innerHTML.lastIndexOf('<br>') + 4);
        }

        var msgClass = $this.attr('class');

        msgClass += ' fromID-' + data.uid;

        if (p3Utils.havePlugCubedRank(data.uid)) {
            msgClass += ' is-p3' + p3Utils.getHighestRank(data.uid);
        }

        msgClass += ' from';
        if (p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
            msgClass += '-';
            if (p3Utils.hasPermission(data.uid, API.ROLE.HOST, true)) {
                msgClass += 'admin';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER, true)) {
                msgClass += 'ambassador';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.HOST)) {
                msgClass += 'host';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.COHOST)) {
                msgClass += 'cohost';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.MANAGER)) {
                msgClass += 'manager';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER)) {
                msgClass += 'bouncer';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
                msgClass += 'dj';
            }
        }

        if (data.uid == API.getUser().id) {
            msgClass += ' from-you';
        }

        data.message = convertImageLinks(data.message, $this);
        data.message = convertEmotes(data.message);

        if (p3Utils.havePlugCubedRank(data.uid) || p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
            $icon = $this.find('.from .icon');
            var specialIconInfo = p3Utils.getPlugCubedSpecial(data.uid);
            if ($icon.length === 0 && specialIconInfo != null) {
                $icon = $('<i>').addClass('icon').css({
                    width: '16px',
                    height: '16px'
                }).prependTo($this.find('.from'));
            }

            $icon.mouseover(function() {
                _$context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(data.uid)).text(), $(this), true);
            }).mouseout(function() {
                _$context.trigger('tooltip:hide');
            });

            if (specialIconInfo != null) {
                $icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/files/images/icons.p3special.' + specialIconInfo.icon + '.png")');
            }
        }

        $this.attr('class', msgClass);
        $this.find('.text').html(previousMessages + p3Utils.cleanHTML(data.message, ['div', 'table', 'tr', 'td'], ['img', 'video', 'source']));

        $this.data('translated', false);
        $this.dblclick(function(e) {
            if (!e.ctrlKey) return;
            if ($this.data('translated')) {
                $this.find('.text').html(convertEmotes(convertImageLinks(data.message)));
                $this.data('translated', false);
            } else {
                $this.find('.text').html('<em>Translating...</em>');
                $.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Ftranslate.google.com%2Ftranslate_a%2Ft%3Fclient%3Dp3%26sl%3Dauto%26tl%3D' + API.getUser().language + '%26ie%3DUTF-8%26oe%3DUTF-8%26q%3D' + encodeURIComponent(encodeURIComponent(data.message.replace('&nbsp;', ' '))) + '%22&format=json', function(a) {
                    if (a.error) {
                        $this.find('.text').html(convertEmotes(convertImageLinks(data.message)));
                        $this.data('translated', false);
                    } else {
                        $this.find('.text').html(convertEmotes(convertImageLinks(p3Utils.objectSelector(a, 'query.results.json.sentences.trans', data.message))));
                        $this.data('translated', true);
                    }
                }, 'json');
            }
            e.stopPropagation();
        });
    }

    function onChatDelete(cid) {
        if ((!p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper()) || !Settings.moderation.showDeletedMessages)
            return;

        var $messages = $('.text.cid-' + cid);

        if ($messages.length > 0) {
            $messages.each(function() {
                $(this).removeClass('cid-' + cid).closest('.cm').removeClass('deletable').css('opacity', 0.3).off('mouseenter').off('mouseleave');
            });
        }
    }

    function onInputKeyUp(e) {
        if (e.keyCode == 38) {
            onInputMove(true, $(this));
        } else if (e.keyCode == 40) {
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

    var handler = Class.extend({
        loadTwitchEmotes: function() {
            $.getJSON('https://api.plugcubed.net/twitchemotes', function(data) {
                twitchEmoteTemplate = data['template']['small'];

                twitchEmotes = [];
                for (var i in data['emotes']) {
                    if (!data['emotes'].hasOwnProperty(i)) continue;
                    twitchEmotes.push({
                        emote: i,
                        image_id: data['emotes'][i].image_id
                    });
                }
                
                console.log('[plug³]', twitchEmotes.length + ' Twitch.TV emoticons loaded!');
            });
        },
        unloadTwitchEmotes: function() {
            twitchEmotes = [];
        },
        register: function() {
            _$context.on('chat:receive', onChatReceived);
            _$context._events['chat:receive'].unshift(_$context._events['chat:receive'].pop());
            _$context.on('chat:receive', onChatReceivedLate);

            _$context.on('chat:delete', onChatDelete);
            _$context._events['chat:delete'].unshift(_$context._events['chat:delete'].pop());

            $('#chat-input-field').on('keyup', onInputKeyUp);
        },
        close: function() {
            _$context.off('chat:receive', onChatReceived);
            _$context.off('chat:receive', onChatReceivedLate);
            _$context.off('chat:delete', onChatDelete);

            $('#chat-input-field').off('keyup', onInputKeyUp);
        }
    });
    return new handler();
});