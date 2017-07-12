define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/StyleManager', 'plugCubed/dialogs/Menu', 'plugCubed/Lang'], function(Class, ControlPanel, Settings, p3Utils, Styles, Menu, p3Lang) {
    var Handler, $contentDiv, panel, $twitchItem, $twitchSubItem, $bttvItem, $tastyItem, $ffzItem, $p3EmotesItem, $markdownItem, $emojiSetGoogle, $emojiSetApple, $emojiSetEmojione, $emojiSetTwitter, $dropdown, $dropdownOptions, chatHandler, emoji, $examples, mentionChange, mentionNames;

    emoji = window.plugCubedModules.emoji;
    $examples = $('<span class="p3-emoji-samples">').html(emoji.replacement('1f604') + '' + emoji.replacement('1f44d') + '' + emoji.replacement('1f44b') + '' + emoji.replacement('1f494') + '' + emoji.replacement('1f680'));
    chatHandler = require('plugCubed/handlers/ChatHandler');
    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel(p3Lang.i18n('menu.chatcustomizations'));

            $contentDiv = $('<div>').append($('<p>').text(p3Lang.i18n('panels.chatcustomizations.description'))).width(500).css('margin', '25px auto auto auto');
            $twitchItem = ControlPanel.item('Twitch Emotes', function() {
                Settings.emotes.twitchEmotes = !Settings.emotes.twitchEmotes;
                this.changeCheckmark(Settings.emotes.twitchEmotes);
                Menu.setEnabled('twitchemotes', Settings.emotes.twitchEmotes);

                if (Settings.emotes.twitchEmotes) {
                    chatHandler.loadTwitchEmotes();
                } else {
                    p3Utils.generateEmoteHash();
                }
                Settings.save();
            });
            $twitchSubItem = ControlPanel.item('Twitch Subscriber Emotes', function() {
                Settings.emotes.twitchSubEmotes = !Settings.emotes.twitchSubEmotes;
                this.changeCheckmark(Settings.emotes.twitchSubEmotes);

                if (Settings.emotes.twitchSubEmotes) {
                    chatHandler.loadTwitchSubEmotes();
                } else {
                    p3Utils.generateEmoteHash();
                }
                Settings.save();
            });
            $bttvItem = ControlPanel.item('BetterTTV Emotes', function() {
                Settings.emotes.bttvEmotes = !Settings.emotes.bttvEmotes;
                this.changeCheckmark(Settings.emotes.bttvEmotes);

                if (Settings.emotes.bttvEmotes) {
                    chatHandler.loadBttvEmotes();
                } else {
                    p3Utils.generateEmoteHash();
                }
                Settings.save();
            });
            $tastyItem = ControlPanel.item('TastyPlug Emotes', function() {
                Settings.emotes.tastyEmotes = !Settings.emotes.tastyEmotes;
                this.changeCheckmark(Settings.emotes.tastyEmotes);

                if (Settings.emotes.tastyEmotes) {
                    chatHandler.loadTastyEmotes();
                } else {
                    p3Utils.generateEmoteHash();
                }
                Settings.save();
            });
            $ffzItem = ControlPanel.item('FrankerFFZ Emotes', function() {
                Settings.emotes.ffzEmotes = !Settings.emotes.ffzEmotes;
                this.changeCheckmark(Settings.emotes.ffzEmotes);

                if (Settings.emotes.ffzEmotes) {
                    chatHandler.loadFfzEmotes();
                } else {
                    p3Utils.generateEmoteHash();
                }
                Settings.save();
            });
            $p3EmotesItem = ControlPanel.item('RoomSettings Emotes', function() {
                Settings.emotes.customEmotes = !Settings.emotes.customEmotes;
                this.changeCheckmark(Settings.emotes.customEmotes);
                Settings.save();
            });
            $markdownItem = ControlPanel.item('Chat Markdown', function() {
                Settings.markdown = !Settings.markdown;
                this.changeCheckmark(Settings.markdown);
                Settings.save();
            });
            $emojiSetGoogle = ControlPanel.item('Google', function() {
                if (Settings.emotes.emoteSet !== 'google') {
                    Settings.emotes.emoteSet = 'google';
                    this.changeCheckmark(true);
                    $emojiSetApple.changeCheckmark(false);
                    $emojiSetEmojione.changeCheckmark(false);
                    $emojiSetTwitter.changeCheckmark(false);
                    Styles.set('plug-emojiset', "span.emoji-inner:not(.gemoji-plug) { background:url('https://i.imgur.com/T0l9HFK.png')}");
                } else {
                    this.changeCheckmark(false);
                    $emojiSetApple.getJQueryElement().click();

                }
                Settings.save();

            });
            $emojiSetApple = ControlPanel.item('Apple (plug.dj default)', function() {
                if (Settings.emotes.emoteSet !== 'apple') {
                    Settings.emotes.emoteSet = 'apple';
                    this.changeCheckmark(true);
                    $emojiSetGoogle.changeCheckmark(false);
                    $emojiSetEmojione.changeCheckmark(false);
                    $emojiSetTwitter.changeCheckmark(false);
                    Styles.set('plug-emojiset', "span.emoji-inner:not(.gemoji-plug) { background:url('https://i.imgur.com/4YeIpli.jpg') }");
                }
                Settings.save();

            });
            $emojiSetEmojione = ControlPanel.item('Emojione', function() {
                if (Settings.emotes.emoteSet !== 'emojione') {
                    Settings.emotes.emoteSet = 'emojione';
                    this.changeCheckmark(true);
                    $emojiSetApple.changeCheckmark(false);
                    $emojiSetGoogle.changeCheckmark(false);
                    $emojiSetTwitter.changeCheckmark(false);
                    Styles.set('plug-emojiset', "span.emoji-inner:not(.gemoji-plug) { background:url('https://i.imgur.com/PT0KMtp.png')}");
                } else {
                    this.changeCheckmark(false);
                    $emojiSetApple.getJQueryElement().click();
                }
                Settings.save();

            });
            $emojiSetTwitter = ControlPanel.item('Twitter', function() {
                if (Settings.emotes.emoteSet !== 'twitter') {
                    Settings.emotes.emoteSet = 'twitter';
                    this.changeCheckmark(true);
                    $emojiSetApple.changeCheckmark(false);
                    $emojiSetEmojione.changeCheckmark(false);
                    $emojiSetGoogle.changeCheckmark(false);
                    Styles.set('plug-emojiset', "span.emoji-inner:not(.gemoji-plug) { background:url('https://i.imgur.com/gFFWRXH.png')}");
                } else {
                    this.changeCheckmark(false);
                    $emojiSetApple.getJQueryElement().click();

                }
                Settings.save();

            });
            mentionNames = ['Boink', 'Bubble', 'Click', 'Coins', 'Drops', 'Hiccup', 'Poke', 'R2D2', 'Spring', 'System Fault', 'WellDone', 'What', 'Default'];
            mentionChange = function(event) {

                var number = parseInt(event.target.id.split('mention')[1], 10);

                $('div.p3-mention-dropdown button.p3-dropbtn').text(p3Lang.i18n('panels.chatcustomizations.mentionSoundTitle', '-- ' + mentionNames[number]));
                switch (number) {
                    case 0:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/boink.mp3';
                        break;
                    case 1:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/bubble.mp3';
                        break;
                    case 2:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/click.mp3';
                        break;
                    case 3:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/coins.mp3';
                        break;
                    case 4:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/drops.mp3';
                        break;
                    case 5:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/hiccup.mp3';
                        break;
                    case 6:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/poke.mp3';
                        break;
                    case 7:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/r2d2.mp3';
                        break;
                    case 8:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/spring.mp3';
                        break;
                    case 9:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/system-fault.mp3';
                        break;
                    case 10:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/well-done.mp3';
                        break;
                    case 11:
                        Settings.mentionSound = 'https://plugcubed.net/scripts/audio/mentions/what.mp3';
                        break;
                    case 12:
                    default:
                        Settings.mentionSound = window.plugCubedModules.plugUrls.sfx;
                        break;
                }
                Settings.save();

            };
            $dropdownOptions = $('<div>').addClass('p3-mention-dropdown-content');

            for (var i = 0; i < mentionNames.length; i++) {
                $dropdownOptions.append($('<a>').click(mentionChange).attr('href', '#').attr('id', 'mention' + i).text(mentionNames[i]));
            }
            $dropdown = $('<div>').addClass('p3-mention-dropdown')
                .append($('<button>').addClass('p3-dropbtn').text(p3Lang.i18n('panels.chatcustomizations.mentionSoundTitle', '-- Default')))
                .append($dropdownOptions);

            $emojiSetGoogle.changeCheckmark((Settings.emotes.emoteSet === 'google'));
            $emojiSetApple.changeCheckmark((Settings.emotes.emoteSet === 'apple'));
            $emojiSetEmojione.changeCheckmark((Settings.emotes.emoteSet === 'emojione'));
            $emojiSetTwitter.changeCheckmark((Settings.emotes.emoteSet === 'twitter'));
            $twitchItem.changeCheckmark(Settings.emotes.twitchEmotes);
            $twitchSubItem.changeCheckmark(Settings.emotes.twitchSubEmotes);
            $bttvItem.changeCheckmark(Settings.emotes.bttvEmotes);
            $p3EmotesItem.changeCheckmark(Settings.emotes.customEmotes);
            $tastyItem.changeCheckmark(Settings.emotes.tastyEmotes);
            $ffzItem.changeCheckmark(Settings.emotes.ffzEmotes);
            $markdownItem.changeCheckmark(Settings.markdown);
            $contentDiv
                .append($('<div>').addClass('p3-control-left')
                    .append(ControlPanel.header('Emotes').getJQueryElement())
                    .append($bttvItem.getJQueryElement())
                    .append($ffzItem.getJQueryElement())
                    .append($tastyItem.getJQueryElement())
                    .append($twitchItem.getJQueryElement())
                    .append($twitchSubItem.getJQueryElement())
                    .append($p3EmotesItem.getJQueryElement())
                    .append(ControlPanel.header('Emoji Sets').getJQueryElement())
                    .append($examples)
                    .append($emojiSetApple.getJQueryElement())
                    .append($emojiSetGoogle.getJQueryElement())
                    .append($emojiSetEmojione.getJQueryElement())
                    .append($emojiSetTwitter.getJQueryElement())
                )
                .append($('<div>').addClass('p3-control-right')
                    .append(ControlPanel.header('Chat Enhancements').getJQueryElement())
                    .append($markdownItem.getJQueryElement())
                    .append($dropdown)
                );

            panel.addContent($contentDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);
        }
    });

    return new Handler();
});
