define(['jquery', 'plugCubed/Class', 'plugCubed/Utils'], function($, Class, p3Utils) {
    var PopoutView, obj, styles = {};
    if (!p3Utils.runLite) {
        PopoutView = require('app/views/room/popout/PopoutView');
    }
    function update() {
        var a = '';
        for (var i in styles) {
            if (styles.hasOwnProperty(i))
                a += styles[i];
        }
        obj.text(a);
        if (PopoutView && PopoutView._window)
            $(PopoutView._window.document).find('#plugCubedStyles').text(a)
    }
    var a = Class.extend({
        init: function() {
            obj = $('<style type="text/css">');
            $('body').prepend(obj);
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