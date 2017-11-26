define('plugCubed/Lang', ['jquery', 'plugCubed/Class', 'plugCubed/Version'], function($, Class, Version) {
    var language, defaultLanguage, that, Lang;

    language = defaultLanguage = {};

    Lang = Class.extend({
        curLang: 'en',

        /**
         * Load default language (English) from server.
         * @param {Function} [callback] Optional callback that will be called on success and failure.
         */
        loadDefault: function(callback) {
            that = this;

            $.getJSON('https://plugcubed.net/scripts/release/langs/lang.en.json?v=' + Version.getSemver())
                .done(function(languageData) {
                    defaultLanguage = languageData;

                    return callback();
                })
                .fail(function() {
                    setTimeout(function() {
                        that.loadDefault(callback);
                    }, 500);
                });
        },

        /**
         * Load language file from server.
         * @param {Function} [callback] Optional callback that will be called on success and failure.
         */
        load: function(callback) {
            that = this;
            var defaultCallback = function() {
                var lang = API.getUser().language;

                if (!lang || lang === 'en' || that.allLangs.indexOf(lang) < 0) {
                    language = {};
                    _.extend(language, defaultLanguage);
                    that.curLang = 'en';

                    if (typeof callback === 'function') {
                        return callback();
                    }

                    return;
                }
                $.getJSON('https://plugcubed.net/scripts/release/langs/lang.' + lang + '.json?v=' + Version.getSemver())
                    .done(function(languageData) {
                        language = {};
                        _.extend(language, defaultLanguage, languageData);
                        that.curLang = lang;
                        if (typeof callback === 'function') {
                            return callback();
                        }
                    })
                    .fail(function() {
                        console.log('[plug³ Lang] Couldn\'t load language file for ' + lang);
                        language = {};
                        _.extend(language, defaultLanguage);
                        that.curLang = 'en';

                        if (typeof callback === 'function') {
                            return callback();
                        }
                    });
            };

            $.getJSON('https://plugcubed.net/scripts/release/lang.json?v=' + Version.getSemver())
                .done(function(data) {
                    that.allLangs = data;
                    if (that.allLangs.length === 1) API.chatLog('Error loading language info for plug³');
                    that.loadDefault(defaultCallback);
                })
                .fail(function() {
                    API.chatLog('Error loading language info for plug³');
                    that.loadDefault(defaultCallback);
                });
        },

        /**
         * Get string from language file.
         * @param {String} selector Selector key
         * @returns {*} String from language file, if not found returns selector and additional arguments.
         */
        i18n: function(selector) {
            var a = language;
            var i;

            if (a == null || selector == null) {
                return '{' + _.toArray(arguments).join(', ') + '}';
            }
            var key = selector.split('.');

            for (i = 0; i < key.length; i++) {
                if (a[key[i]] == null) {
                    return '{' + _.toArray(arguments).join(', ') + '}';
                }
                a = a[key[i]];
            }
            if (arguments.length > 1) {
                for (i = 1; i < arguments.length; i++) {
                    a = a.split('%' + i).join(arguments[i]);
                }
            }

            return a;
        },
        allLangs: [{
            file: 'en',
            name: 'English'
        }]
    });

    return new Lang();
});
