define(['jquery', 'plugCubed/Class', 'plugCubed/Utils'], function($, Class, p3Utils) {
    var obj;
    var styles = {};
    var imports = [];
    var PopoutView = window.plugCubedModules.PopoutView;

    function update() {
        var a = '';
        var i;

        for (i = 0; i < imports.length; i++) {
            if (imports[i]) {
                a += '@import url("' + imports[i] + '");\n';
            }
        }

        for (i in styles) {
            if (styles.hasOwnProperty(i)) {
                a += styles[i] + '\n';
            }
        }

        obj.text(a);
        if (PopoutView && PopoutView._window) {
            $(PopoutView._window.document).find('#plugCubedStyles').text(a);
        }
    }

    var A = Class.extend({
        init: function() {
            obj = $('<style type="text/css">');
            $('body').prepend(obj);
        },
        getList: function() {
            for (var key in styles) {
                if (!styles.hasOwnProperty(key)) continue;
                console.log('[plug³ StyleManager]', key, styles);
            }
        },
        get: function(key) {
            return styles[key];
        },
        addImport: function(url) {
            if (imports.indexOf(url) > -1) return;
            imports.push(url);
            update();
        },
        clearImports: function() {
            if (imports.length === 0) return;
            imports = [];
            update();
        },
        set: function(key, style) {
            styles[key] = style;
            update();
        },
        has: function(key) {
            return styles[key] != null;
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

            if (doUpdate) {
                update();
            }
        },
        destroy: function() {
            styles = {};
            obj.remove();
        }
    });

    return new A();
});
