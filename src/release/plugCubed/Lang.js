define('plugCubed/Lang', ['jquery', 'plugCubed/Class'], function($, Class) {
    var language;
    var defaultLanguage;
    var that;
    var Lang;

    language = {};
    defaultLanguage = {};

    Lang = Class.extend({
        curLang: 'en',
        defaultLoaded: false,
        loaded: false,
        init: function() {
            that = this;
            $.getJSON('https://d1rfegul30378.cloudfront.net/files/lang.json?_' + Date.now(), function(a) {
                that.allLangs = a;
            }).done(function() {
                if (that.allLangs.length === 1) API.chatLog('Error loading language info for plug³');
                that.loadDefault();
            }).fail(function() {
                API.chatLog('Error loading language info for plug³');
                that.loadDefault();
            });
        },
        /**
         * Load default language (English) from server.
         */
        loadDefault: function() {
            $.getJSON('https://d1rfegul30378.cloudfront.net/files/langs/lang.en.json?_' + Date.now(), function(languageData) {
                defaultLanguage = languageData;
                that.defaultLoaded = true;
            }).error(function() {
                setTimeout(function() {
                    that.loadDefault();
                }, 500);
            });
        },
        /**
         * Load language file from server.
         * @param {Function} [callback] Optional callback that will be called on success and failure.
         */
        load: function(callback) {
            if (!this.defaultLoaded) {
                setTimeout(function() {
                    that.load(callback);
                }, 500);
                return;
            }
            var lang = API.getUser().language;
            if (!lang || lang === 'en' || this.allLangs.indexOf(lang) < 0) {
                language = {};
                $.extend(true, language, defaultLanguage);
                this.curLang = 'en';
                this.loaded = true;
                if (typeof callback === 'function') {
                    callback();
                    return;
                }
                return;
            }
            $.getJSON('https://d1rfegul30378.cloudfront.net/files/langs/lang.' + lang + '.json?_' + Date.now(), function(languageData) {
                language = {};
                $.extend(true, language, defaultLanguage, languageData);
                that.curLang = lang;
                that.loaded = true;
                if (typeof callback === 'function') {
                    callback();
                    return;
                }
            }).error(function() {
                console.log('[plug³] Couldn\'t load language file for ' + lang);
                language = {};
                $.extend(true, language, defaultLanguage);
                that.curLang = 'en';
                that.loaded = true;
                if (typeof callback === 'function') {
                    callback();
                    return;
                }
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
                return '{' + $.makeArray(arguments).join(', ') + '}';
            }
            var key = selector.split('.');
            for (i in key) {
                if (!key.hasOwnProperty(i)) continue;
                if (a[key[i]] == null) {
                    return '{' + $.makeArray(arguments).join(', ') + '}';
                }
                a = a[key[i]];
            }
            if (arguments.length > 1) {
                for (i = 1; i < arguments.length; i++)
                    a = a.split('%' + i).join(arguments[i]);
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
