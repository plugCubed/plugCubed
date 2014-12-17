define(['jquery', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/bridges/Context'], function($, Class, p3Utils, p3Lang, Settings, _$context) {
    var PopoutView, twitchEmotes = [];

    if (!p3Utils.runLite)
        PopoutView = require('app/views/room/popout/PopoutView');

    function convertImageLinks(text, $message) {
        if (Settings.chatImages) {
            if (text.toLowerCase().indexOf('nsfw') < 0) {
                var temp = $('<div/>');
                temp.html(text).find('a').each(function() {
                    var url = $(this).attr('href'), path, imageURL = null;

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
                                var $video, identifier = 'video-' + p3Utils.getRandomString(8);

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
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://imgur.com/gallery/', 'https://imgur.com/gallery/','http://imgur.com/', 'https://imgur.com/'])) {
                        path = url.split('/');
                        if (path.length > 4) {
                            path = path[4];
                            if (path.trim().length !== 0) {
                                var $video, identifier = 'video-' + p3Utils.getRandomString(8);

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

                                    if (imgurData['webm'] !== undefined)
                                        $video.append($('<source>').attr('type', 'video/webm').attr('src', p3Utils.httpsifyURL(imgurData['webm'])));

                                    if (imgurData['webm'] !== undefined)
                                        $video.append($('<source>').attr('type', 'video/mp4').attr('src', p3Utils.httpsifyURL(imgurData['mp4'])));

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
                    var temp = $('<div>'), image = $('<img>').addClass('twitch-emote').attr('src', twitchEmote.url).data('emote', $('<span>').html(twitchEmote.emote).text());
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

        var $this = $('#chat').find('[data-cid="' + data.cid + '"]'), $icon;

        data.type = $this.attr('class') + ' fromID-' + data.uid;

        if (p3Utils.havePlugCubedRank(data.uid)) {
            data.type += ' is-p3' + p3Utils.getHighestRank(data.uid);
        }

        data.type += ' from';
        if (p3Utils.hasPermission(data.uid, API.ROLE.DJ) || data.uid == API.getUser().id) {
            data.type += '-';
            if (p3Utils.hasPermission(data.uid, API.ROLE.HOST, true)) {
                data.type += 'admin';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER, true)) {
                data.type += 'ambassador';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.HOST)) {
                data.type += 'host';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.COHOST)) {
                data.type += 'cohost';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.MANAGER)) {
                data.type += 'manager';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER)) {
                data.type += 'bouncer';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
                data.type += 'dj';
            } else if (data.uid == API.getUser().id) {
                data.type += 'you';
            }
        }

        data.message = convertImageLinks(data.message, $this);
        data.message = convertEmotes(data.message);

        $(data.message).find('.twitch-emote').mouseover(function() {
            _$context.trigger('tooltip:show', $(this).data('emote'), $(this), true);
        }).mouseout(function() {
            _$context.trigger('tooltip:hide');
        });

        if (p3Utils.havePlugCubedRank(data.uid) || p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
            $icon = $this.find('.from .icon');
            var specialIconInfo = p3Utils.getPlugCubedSpecial(data.uid);
            if ($icon.length === 0) {
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

            if (specialIconInfo !== undefined) {
                $icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/alpha/images/icons.p3special.' + specialIconInfo.icon + '.png")');
            }
        }

        $this.attr('class', data.type);
        $this.find('.text').html(p3Utils.cleanHTML(data.message, ['div', 'table', 'tr', 'td'], ['img', 'video', 'source']));

        if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
            $this.data('translated', false);
            $this.dblclick(function(e) {
                if (!e.ctrlKey) return true;
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
                            $this.find('.text').html(convertEmotes(convertImageLinks('&nbsp;' + a.query.results.json.sentences.trans)));
                            $this.data('translated', true);
                        }
                    }, 'json');
                }
                return false;
            });
        }
    }

    function onChatDelete(cid) {
        if (!p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper())
            return;
        var $messages = $('#chat').find('[data-cid="' + cid + '"]');
        if ($messages.length > 0) {
            $messages.each(function() {
                $(this).removeClass('deletable').css('opacity', 0.3).off('mouseenter').off('mouseleave');
            });
            cid = '';
        }
    }

    var handler = Class.extend({
        loadTwitchEmotes: function() {
            $.getJSON('https://api.plugcubed.net/proxy/http://twitchemotes.com/global.json', function(data) {
                twitchEmotes = [];
                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    twitchEmotes.push({
                        emote: i,
                        url: data[i].url.indexOf('http://') === 0 ? 'https://' + data[i].url.substr(7) : data[i].url
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
        },
        close: function() {
            _$context.off('chat:receive', onChatReceived);
            _$context.off('chat:receive', onChatReceivedLate);
            _$context.off('chat:delete', onChatDelete);
        }
    });
    return new handler();
});