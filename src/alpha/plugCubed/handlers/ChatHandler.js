define(['jquery', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/bridges/Context'], function($, Class, p3Utils, p3Lang, Settings, _$context) {
    var PopoutView, twitchEmotes = [];

    if (!p3Utils.runLite)
        PopoutView = require('app/views/room/popout/PopoutView');

    function convertImageLinks(text) {
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
                            if (path.trim().length !== 0)
                                imageURL = 'https://api.plugCubed.net/redirect/gfycat/' + path;
                        }

                        // Lightshot links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://prntscr.com/', 'https://prntscr.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0)
                                imageURL = 'https://prntscr.com/' + path + '/direct';
                        }

                        // Imgur links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://imgur.com/gallery/', 'https://imgur.com/gallery/'])) {
                        path = url.split('/');
                        if (path.length > 4) {
                            path = path[4];
                            if (path.trim().length !== 0)
                                imageURL = 'https://api.plugCubed.net/redirect/imgur/' + path;
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
                if (text.indexOf(' ' + twitchEmote.emote + ' ') > -1) {
                    var temp = $('<div>'), image = $('<img>').attr('src', twitchEmote.url).data('emote', $('<span>').html(twitchEmote.emote).text()).mouseover(function() {
                        _$context.trigger('tooltip:show', $(this).data('emote'), $(this), true);
                    }).mouseout(function() {
                        _$context.trigger('tooltip:hide');
                    });
                    image.on('load', function() {
                        var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'), height = this.height;
                        if (this.width > $chat.find('.message').width())
                            height *= this.width / $chat.find('.message').width();
                        $chat.scrollTop($chat[0].scrollHeight + height);
                    });
                    temp.append(image);
                    text = text.split(' ' + twitchEmote.emote + ' ').join(' ' + temp.html() + ' ');
                }
            }
            return (nbspStart ? '&nbsp;' : '') + text.substr(1, text.length - 2);
        }
        return text;
    }

    function onChatReceived(data) {
        if (!data.uid) return;

        if (API.getUser().permission > API.ROLE.RESIDENTDJ && (function(_) {
                return p3Utils.isPlugCubedDeveloper(_) || p3Utils.isPlugCubedSponsor(_) || p3Utils.isPlugCubedAmbassador(_);
            })(API.getUser().id)) {
            data.deletable = true;
        }

        data.type += ' fromID-' + data.uid;

        if (p3Utils.havePlugCubedRank(data.uid))
            data.type += ' is-p3' + p3Utils.getHighestRank(data.uid);

        if (p3Utils.hasPermission(data.uid, API.ROLE.RESIDENTDJ) || p3Utils.hasPermission(data.uid, 1, true) || data.uid == API.getUser().id) {
            data.type += ' from-';
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
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.RESIDENTDJ)) {
                data.type += 'residentdj';
            } else if (data.uid == API.getUser().id) {
                data.type += 'you';
            }
        }

        if (data.type.split(' ')[0] === 'mention') {
            data.type += ' is-';
            if (p3Utils.hasPermission(data.uid, 5, true)) {
                data.type += 'admin';
            } else if (p3Utils.hasPermission(data.uid, 2, true)) {
                data.type += 'ambassador';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER)) {
                data.type += 'staff';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
                data.type += 'dj';
            } else {
                data.type += 'you';
            }
            data.message = data.message.split('@' + API.getUser().username).join('<span class="name">@' + API.getUser().username + '</span>');
        }

        data.message = convertImageLinks(data.message);
        data.message = convertEmotes(data.message);
    }

    function onChatReceivedLate(data) {
        if (!data.uid) return;

        var $this = $('#chat div[data-cid="' + data.cid + '"]'), icon;

        if (data.type.split(' ')[0] === 'pm') {
            icon = $this.find('.icon');
            if (icon.length === 0) {
                icon = $('<i>').addClass('icon').css({
                    width: '16px',
                    height: '16px'
                }).appendTo($this);
            }
            if ($('.icon-chat-sound-on').length > 0) {
                p3Utils.playChatSound();
            }
        } else if (p3Utils.havePlugCubedRank(data.uid) || API.getUser(data.uid).permission > API.ROLE.NONE) {
            icon = $this.find('.icon');
            var specialIconInfo = p3Utils.getPlugCubedSpecial(data.uid);
            if (icon.length === 0) {
                icon = $('<i>').addClass('icon').css({
                    width: '16px',
                    height: '16px'
                }).appendTo($this);
            }

            icon.mouseover(function() {
                _$context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(data.uid)).text(), $(this), true);
            }).mouseout(function() {
                _$context.trigger('tooltip:hide');
            });

            if (specialIconInfo !== undefined) {
                icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/alpha/images/icons.p3special.' + specialIconInfo.icon + '.png")');
            }
        }

        if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
            $this.data('translated', false);
            $this.dblclick(function() {
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
            });
        }
    }

    function onChatDelete(cid) {
        if (!p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper())
            return;
        console.log(event);
        var data = event.data, time = Date.now(), $messages = $('#chat div[data-cid="' + data.cid + '"]');
        if ($messages.length > 0) {
            $messages.each(function() {
                $(this).removeClass('deletable').css('opacity', 0.3).off('mouseenter').off('mouseleave').mouseover(function() {
                    _$context.trigger('tooltip:show', 'Deleted by ' + p3Utils.cleanHTML(data.moderator, '*') + ' [' + p3Utils.getTimestamp(time) + ']', $(this));
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                });
            });
            data.cid = '';
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

            _$context.on('ModerateEvent:chatdelete', onChatDelete);
            _$context._events['ModerateEvent:chatdelete'].unshift(_$context._events['ModerateEvent:chatdelete'].pop());
        },
        close: function() {
            _$context.off('chat:receive', onChatReceived);
            _$context.off('chat:receive', onChatReceivedLate);
            _$context.off('ModerateEvent:chatdelete', onChatDelete);
        }
    });
    return new handler();
});