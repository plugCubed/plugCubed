define(['plugCubed/Class', 'plugCubed/tickers/AFKTimer', 'plugCubed/tickers/AntiDangerousScripts', 'plugCubed/tickers/AntiHideVideo'], function() {
    var modules, Class, instances;

    modules = $.makeArray(arguments);
    Class = modules.shift();
    instances = [];

    var handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (!modules.hasOwnProperty(i)) continue;
                instances[i] = new modules[i]();
            }
        },
        unregister: function() {
            for (var i in instances) {
                if (!instances.hasOwnProperty(i)) continue;
                instances[i].close();
            }
        }
    });

    return new handler();
});