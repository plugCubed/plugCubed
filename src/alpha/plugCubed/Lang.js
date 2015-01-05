define('plugCubed/Lang', ['jquery', 'plugCubed/Class'], function($, Class) {
    var language, defaultLanguage, _this, Lang;

    language = {};
    defaultLanguage = {};

    Lang = Class.extend({
        curLang: 'en',
        defaultLoaded: false,
        loaded: false,
        init: function() {
            _this = this;
            $.getJSON('https://d1rfegul30378.cloudfront.net/alpha/lang.json?_' + Date.now(), function(a) {
                _this.allLangs = a;
            }).done(function() {
                if (_this.allLangs.length === 1) API.chatLog('Error loading language informations for plugCubed', true);
                _this.loadDefault();
            }).fail(function() {
                API.chatLog('Error loading language informations for plugCubed', true);
                _this.loadDefault();
            });
        },
        /**
         * Load default language (English) from server.
         */
        loadDefault: function() {
            $.getJSON('https://d1rfegul30378.cloudfront.net/alpha/langs/lang.en.json?_' + Date.now(), function(languageData) {
                defaultLanguage = languageData;
                _this.defaultLoaded = true;
            }).error(function() {
                setTimeout(function() {
                    _this.loadDefault();
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
                    _this.load(callback);
                }, 500);
                return;
            }
            var lang = API.getUser().language;
            if (!lang || lang === 'en' || this.allLangs.indexOf(lang) < 0) {
                language = {};
                $.extend(true, language, defaultLanguage);
                this.curLang = 'en';
                this.loaded = true;
                if (typeof callback === 'function') callback();
                return;
            }
            $.getJSON('https://d1rfegul30378.cloudfront.net/alpha/langs/lang.' + lang + '.json?_' + Date.now(), function(languageData) {
                language = {};
                $.extend(true, language, defaultLanguage, languageData);
                _this.curLang = lang;
                _this.loaded = true;
                if (typeof callback === 'function') callback();
            }).error(function() {
                console.log('[plug³] Couldn\'t load language file for ' + lang);
                language = {};
                $.extend(true, language, defaultLanguage);
                _this.curLang = 'en';
                _this.loaded = true;
                if (typeof callback === 'function') callback();
            });
        },
        /**
         * Get string from language file.
         * @param {String} selector Selector key
         * @returns {*} String from language file, if not found returns selector and additional arguments.
         */
        i18n: function(selector) {
            var a = language, i;
            if (a === undefined || selector === undefined) {
                return '{' + $.makeArray(arguments).join(', ') + '}';
            }
            var key = selector.split('.');
            for (i in key) {
                if (!key.hasOwnProperty(i)) continue;
                if (a[key[i]] === undefined) {
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
            "file": "en",
            "name": "English"
        }]
    });
    return new Lang();
});