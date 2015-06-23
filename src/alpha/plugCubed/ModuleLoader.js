define(['plugCubed/Class'], function(Class) {
    var moduleLoader = Class.extend({
        iterate: function(a, c) {
            if (typeof c !== 'object' || typeof a !== 'object') return false;
            var d;
            for (d in a) {
                if (a.hasOwnProperty(d)) {
                    if (typeof a[d] === 'object') {
                        if (!this.iterate(a[d], c[d])) return false;
                    } else if ((typeof c[d]).toLowerCase() !== a[d].toLowerCase()) return false;
                }
                return true;
            }
        },
        getModule: function(a) {
            var modules = require.s.contexts._.defined,
                iterator;
            for (iterator in modules) {
                if (modules.hasOwnProperty(iterator)) {
                    var module = modules[iterator];
                    if (this.iterate(a, module)) return module;
                }
            }
        }
    });
    return new moduleLoader();
});
