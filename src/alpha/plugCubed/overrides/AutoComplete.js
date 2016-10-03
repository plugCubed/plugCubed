define(['plugCubed/handlers/OverrideHandler', 'plugCubed/Utils', 'plugCubed/handlers/ChatHandler', 'plugCubed/RoomSettings', 'plugCubed/Lang', 'plugCubed/dialogs/Commands'], function(OverrideHandler, p3Utils, ChatHandler, RoomSettings, p3Lang, p3Commands) {
    var Handler, suggestionView, emoji, CurrentUser, templateChatSuggestionItem;

    emoji = window.plugCubedModules.emoji;
    suggestionView = window.plugCubedModules.chat.suggestionView;
    CurrentUser = window.plugCubedModules.CurrentUser;
    templateChatSuggestionItem = require('hbs!templates/room/chat/ChatSuggestionItem');
    Handler = OverrideHandler.extend({
        doOverride: function() {
            if (typeof suggestionView._check !== 'function') {
                suggestionView._check = suggestionView.check;
            }
            if (typeof suggestionView._updateSuggestions !== 'function') {
                suggestionView._updateSuggestions = suggestionView.updateSuggestions;
            }

            suggestionView.check = function(message, carat) {
                console.time('emote lookup');
                if (message.indexOf('@') > -1 || message.indexOf(':') > -1) {
                    suggestionView._check(message, carat);
                }

                var p3EmoteHash, firstCharMessage, lookupArr, messageLength, p3EmoteHashArr, lookupHashLength, p3EmoteHashArrItem, pos, lastIndexMessage, i, command, lowerMessage;

                lookupArr = [];
                p3EmoteHash = window.plugCubed.emotes.emoteHash;
                lowerMessage = message.toLowerCase();
                messageLength = message.length;

                if (messageLength > 0 && message.indexOf(':') > -1 && RoomSettings.rules.allowEmotes !== false && (typeof p3EmoteHash === 'object' && p3EmoteHash !== null)) {
                    pos = 2;
                    lastIndexMessage = message.lastIndexOf(' :');

                    if (lastIndexMessage === -1) {
                        lastIndexMessage = message.indexOf(':') === 0 ? 0 : -1;
                    } else {
                        pos = 3;
                    }
                    if (lastIndexMessage > -1 && ((carat - lastIndexMessage) > pos)) {
                        if (lastIndexMessage === 0) {
                            message = message.substr(lastIndexMessage + 1, carat);
                        } else {
                            message = message.substr(lastIndexMessage + 2, carat);
                        }
                        firstCharMessage = lowerMessage.charAt(0);
                        p3EmoteHashArr = p3EmoteHash[firstCharMessage];

                        messageLength = message.length;
                        if (p3EmoteHashArr && p3EmoteHashArr.length > 0 && messageLength < p3EmoteHashArr.longest) {
                            lookupHashLength = p3EmoteHashArr.length;
                            for (i = 0; i < lookupHashLength; i++) {
                                p3EmoteHashArrItem = p3EmoteHashArr[i];

                                if (p3EmoteHashArrItem.indexOf(lowerMessage) === 0 && message.indexOf('::') === -1) {
                                    lookupArr.push(p3EmoteHashArrItem);
                                }
                            }
                        }
                    }
                } else if (lowerMessage.charAt(0) === '/' && messageLength > 0) {
                    this.type = '/';

                    for (i = 0; i < p3Commands.modCommandsList.length; i++) {
                        command = p3Commands.modCommandsList[i];

                        if (command[0].indexOf(lowerMessage) === 0 && ((CurrentUser.hasPermission(command[(command.length === 3 ? 2 : 3)]) || CurrentUser.hasPermission(command[(command.length === 3 ? 2 : 3)])) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador())) {
                            lookupArr.push(command[0]);
                        }
                    }
                    for (i = 0; i < p3Commands.userCommandsList.length; i++) {
                        command = p3Commands.userCommandsList[i];

                        if (command[0].indexOf(lowerMessage) === 0) {
                            lookupArr.push(command[0]);
                        }
                    }

                }
                if (lookupArr.length && lookupArr.length > 0) {
                    lookupArr.sort();
                    lookupArr.length = Math.min(lookupArr.length, 10);
                    this.suggestions = this.suggestions.concat(lookupArr);
                }

                console.timeEnd('emote lookup');
            };
            suggestionView.updateSuggestions = function() {
                console.time('updateSuggestions');
                var suggestion, length, i;

                if (this.type !== '/') {
                    suggestionView._updateSuggestions();
                }

                if (this.suggestions.length === 0) {
                    this.$el.hide();
                    this.index = -1;
                } else if (this.type === ':') {
                    this.$itemContainer.html('');
                    length = this.suggestions.length;

                    for (i = 0; i < length; i++) {
                        suggestion = $(templateChatSuggestionItem({
                            value: ':' + this.suggestions[i] + ':',
                            index: i,
                            image: ChatHandler.convertEmotes(emoji.replace_colons(':' + this.suggestions[i] + ':', false, false, true))
                        })).mousedown(this.pressBind).mouseenter(this.overBind);
                        suggestion.addClass('emo');
                        this.$itemContainer.append(suggestion);
                    }
                } else if (this.type === '/') {
                    this.$itemContainer.html('');
                    length = this.suggestions.length;

                    for (i = 0; i < length; i++) {
                        suggestion = $(templateChatSuggestionItem({
                            value: this.suggestions[i],
                            index: i,
                            image: '<img src="https://plugcubed.net/scripts/dev/images/icons/command.png" class="p3Command-image" style="height: 16px; width: 16px; margin-top: 2px;">'
                        })).mousedown(this.pressBind).mouseenter(this.overBind);
                        suggestion.addClass('p3Command');
                        suggestion.addClass('emo');
                        this.$itemContainer.append(suggestion);
                    }
                    if (this.index === -1 || this.index >= length) {
                        this.index = 0;
                    }

                    this.updateSelectedSuggestion();
                    this.$el.height(length * 38);
                    _.delay(this.showBind, 10);
                    _.delay(this.showBind, 15);
                    this.$document.on("mousedown", this.documentClickBind);
                }
                console.timeEnd('updateSuggestions');
            };

        },
        doRevert: function() {
            if (typeof suggestionView._check === 'function') {
                suggestionView.check = suggestionView._check;
            }
            if (typeof suggestionView._updateSuggestions === 'function') {
                suggestionView.updateSuggestions = suggestionView._updateSuggestions;
            }

        }
    });

    return new Handler();
});

