define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/StyleManager', 'plugCubed/dialogs/Menu'], function(Class, ControlPanel, Settings, p3Utils, Styles, Menu) {
    var Handler, $contentDiv, panel, $twitchItem, $twitchSubItem, $bttvItem, $tastyItem, $ffzItem, $p3EmotesItem, $markdownItem, $emojiSetGoogle, $emojiSetApple, $emojiSetEmojione, $emojiSetTwitter, $dropdown, chatHandler, emoji, $examples;

    emoji = window.plugCubedModules.emoji;
    $examples = $('<span class="p3-emoji-samples">').html(emoji.replacement('1f604') + '' + emoji.replacement('1f44d') + '' + emoji.replacement('1f44b') + '' + emoji.replacement('1f494') + '' + emoji.replacement('1f680'));
    chatHandler = require('plugCubed/handlers/ChatHandler');
    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Chat Customizations');

            $contentDiv = $('<div>').append($('<p>').text('Customize your chat with emojis, notifications, markdown, and other features.')).width(500).css('margin', '25px auto auto auto');
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

            $('<script>')
                .attr('type', 'text/javascript')
                .text('function mentionChange(name){var Settings=require("plugCubed/Settings");$("div.p3-mention-dropdown button.p3-dropbtn").text("Mention Sound -- "+name);switch(name){case "Boink":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/boink.mp3";Settings.save();break;case "Bubble":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/bubble.mp3";Settings.save();break;case "Click":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/click.mp3";Settings.save();break;case "Coins":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/coins.mp3";Settings.save();break;case "Drops":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/drops.mp3";Settings.save();break;case "Hiccup":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/hiccup.mp3";Settings.save();break;case "Poke":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/poke.mp3";Settings.save();break;case "R2D2":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/r2d2.mp3";Settings.save();break;case "Spring":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/spring.mp3";Settings.save();break;case "System-Fault":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/system-fault.mp3";Settings.save();break;case "Well Done":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/well-done.mp3";Settings.save();break;case "What":Settings.mentionSound="https://plugcubed.net/scripts/audio/mentions/what.mp3";Settings.save();break;case "Default":default:Settings.mentionSound=p3Utils.PlugUI.sfx;Settings.save();break}}')
                .appendTo('head');
            $dropdown = $('<div class="p3-mention-dropdown">')
                .append($('<button class="p3-dropbtn">').text('Mention Sounds -- Default'))
                .append($('<div class="p3-mention-dropdown-content">')
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention1\').text)">').attr('id', 'mention1').text('Boink'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention2\').text)">').attr('id', 'mention2').text('Bubble'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention3\').text)">').attr('id', 'mention3').text('Click'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention4\').text)">').attr('id', 'mention4').text('Coins'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention5\').text)">').attr('id', 'mention5').text('Drops'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention6\').text)">').attr('id', 'mention6').text('Hiccup'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention7\').text)">').attr('id', 'mention7').text('Poke'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention8\').text)">').attr('id', 'mention8').text('R2D2'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention9\').text)">').attr('id', 'mention9').text('Spring'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention10\').text)">').attr('id', 'mention10').text('System Fault'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention11\').text)">').attr('id', 'mention11').text('WellDone'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention12\').text)">').attr('id', 'mention12').text('What'))
                    .append($('<a href="#" onClick="mentionChange(document.getElementById(\'mention13\').text)">').attr('id', 'mention13').text('Default')));
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
