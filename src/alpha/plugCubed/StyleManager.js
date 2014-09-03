define(['jquery', 'plugCubed/Class'], function($, Class) {
    var obj, styles = {}, update = function() {
        var a = '';
        for (var i in styles) {
            if (styles.hasOwnProperty(i))
                a += styles[i];
        }
        obj.text(a);
    }, a = Class.extend({
        init: function() {
            obj = $('<style type="text/css">');
            $('head').append(obj);
        },
        get: function(key) {
            return styles[key];
        },
        set: function(key, style) {
            styles[key] = style;
            update();
        },
        has: function(key) {
            return styles[key] !== undefined;
        },
        unset: function(key) {
            if (typeof key === 'string') {
                key = [key];
            }
            var doUpdate = false;
            for (var i in key) {
                if (key.hasOwnProperty(i) && this.has(key[i])) {
                    delete styles[key[i]];
                    doUpdate = true;
                }
            }
            if (doUpdate)
                update();
        },
        destroy: function() {
            styles = {};
            obj.remove();
        }
    });
    return new a();
});