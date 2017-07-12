define(['plugCubed/handlers/OverrideHandler', 'plugCubed/Utils', 'plugCubed/handlers/ChatHandler', 'plugCubed/RoomSettings', 'plugCubed/Lang', 'plugCubed/dialogs/Commands'], function(OverrideHandler, p3Utils, ChatHandler, RoomSettings, p3Lang, p3Commands) {
    var Handler, suggestionView, emoji, CurrentUser, templateChatSuggestionItem, searchBinary;

    // Adapted from https://github.com/posabsolute/javascript-binary-search-algorithm
    searchBinary = function(needle, haystack, caseInsensitive) {
        if (needle === '') return [];

        var haystackLength, letterNumber, insensitive, searchTerm;

        haystackLength = haystack.length;
        letterNumber = needle.length;
        insensitive = typeof caseInsensitive === 'undefined' || caseInsensitive;
        searchTerm = (insensitive ? needle.toLowerCase() : needle);

        /* start binary search, Get middle position */
        var getElementPosition = findElement();

        /* get interval and return result array */
        if (getElementPosition === -1) return [];

        return findRangeElement();

        function findElement() {
            if (!Array.isArray(haystack) || !haystackLength) return -1;
            var high, low, mid;

            high = haystack.length - 1;
            low = 0;

            while (low <= high) {
                mid = parseInt(((low + high) / 2), 10);
                var element = haystack[mid].substr(0, letterNumber);

                element = (insensitive) ? element.toLowerCase() : element;

                if (element > searchTerm) {
                    high = mid - 1;
                } else if (element < searchTerm) {
                    low = mid + 1;
                } else {

                    return mid;
                }
            }

            return -1;
        }

        function findRangeElement() {
            var i, element, start, end, result;

            for (i = getElementPosition; i > 0; i--) {
                element = (insensitive ? haystack[i].substr(0, letterNumber).toLowerCase() : haystack[i].substr(0, letterNumber));

                if (element !== searchTerm) {
                    start = i + 1;
                    break;
                } else {
                    start = 0;
                }
            }
            for (i = getElementPosition; i < haystackLength; i++) {
                element = (insensitive ? haystack[i].substr(0, letterNumber).toLowerCase() : haystack[i].substr(0, letterNumber));

                if (element !== searchTerm) {
                    end = i;
                    break;
                } else {
                    end = haystackLength - 1;
                }
            }
            result = [];

            for (i = start; i < end; i++) {
                result.push(haystack[i]);
            }

            return result;
        }

    };
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
                if (message.indexOf('@') > -1 || message.indexOf(':') > -1) {
                    suggestionView._check(message, carat);
                }

                var p3EmoteHash, firstCharMessage, lookupArr, messageLength, p3EmoteHashArr, pos, lastIndexMessage, i, command, lowerMessage, sortedHashArr;

                lookupArr = [];
                p3EmoteHash = window.plugCubed.emotes.emoteHash;
                lowerMessage = message.toLowerCase();
                messageLength = message.length;

                if (messageLength > 0 && lowerMessage.indexOf(':') > -1 && RoomSettings.rules.allowEmotes !== false && (typeof p3EmoteHash === 'object' && p3EmoteHash !== null)) {
                    pos = 2;
                    lastIndexMessage = lowerMessage.lastIndexOf(' :');

                    if (lastIndexMessage === -1) {
                        lastIndexMessage = lowerMessage.indexOf(':') === 0 ? 0 : -1;
                    } else {
                        pos = 3;
                    }
                    if (lastIndexMessage > -1 && ((carat - lastIndexMessage) > pos)) {
                        if (lastIndexMessage === 0) {
                            lowerMessage = lowerMessage.substr(lastIndexMessage + 1, carat);
                        } else {
                            lowerMessage = lowerMessage.substr(lastIndexMessage + 2, carat);
                        }

                        firstCharMessage = lowerMessage.charAt(0);
                        p3EmoteHashArr = p3EmoteHash[firstCharMessage];
                        messageLength = lowerMessage.length;

                        if (p3EmoteHashArr && p3EmoteHashArr.length > 0 && messageLength < p3EmoteHashArr.longest) {
                            sortedHashArr = p3EmoteHashArr.slice().sort();
                            lookupArr = lookupArr.concat(searchBinary(lowerMessage, sortedHashArr, true));

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
                if (lowerMessage.indexOf('@') > -1) this.type = '@';
                if (lookupArr.length > 0) {
                    lookupArr.sort();
                    this.suggestions = this.suggestions.concat(lookupArr);
                    this.suggestions.length = Math.min(this.suggestions.length, 10);
                }
            };
            suggestionView.updateSuggestions = function() {
                var suggestion, length, i, emote, suggestedItem, suggestedItemColons;

                suggestionView._updateSuggestions();

                if (this.suggestions.length === 0) {
                    this.$el.hide();
                    this.index = -1;
                } else if (this.type === ':') {
                    this.$itemContainer.html('');
                    length = this.suggestions.length;

                    for (i = 0; i < length; i++) {
                        if (typeof this.suggestions[i] !== 'string') continue;

                        suggestedItem = this.suggestions[i];
                        suggestedItemColons = ':' + suggestedItem + ':';

                        if (emoji && emoji.map && emoji.map.colons && (emoji.map.colons[suggestedItem] || emoji.plugdata.indexOf(suggestedItem) > -1 || emoji.map.emoticons[suggestedItem] || suggestedItem.indexOf('::skin-tone-') > -1)) {
                            emote = emoji.replace_colons(suggestedItemColons, false, false, true);
                        } else {
                            emote = ChatHandler.convertEmotes(suggestedItemColons);
                        }

                        suggestion = $(templateChatSuggestionItem({
                            value: suggestedItemColons.trim(),
                            index: i,
                            image: emote
                        })).mousedown(this.pressBind).mouseenter(this.overBind);
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
                    this.$document.on('mousedown', this.documentClickBind);
                } else if (this.type === '/') {
                    this.$itemContainer.html('');
                    length = this.suggestions.length;

                    for (i = 0; i < length; i++) {
                        suggestion = $(templateChatSuggestionItem({
                            value: this.suggestions[i].trim(),
                            index: i,
                            image: '<img src="https://plugcubed.net/scripts/alpha/images/icons/command.png" class="p3Command-image" style="height: 16px; width: 16px; margin-top: 2px;">'
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
                    this.$document.on('mousedown', this.documentClickBind);
                }
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
