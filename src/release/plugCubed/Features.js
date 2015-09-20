define(['plugCubed/Class', 'plugCubed/features/Alertson', 'plugCubed/features/Autojoin', 'plugCubed/features/Automute', 'plugCubed/features/Autorespond', 'plugCubed/features/Autowoot', 'plugCubed/features/Whois', 'plugCubed/features/WindowTitle'], function() {
    var modules;
    var Class;
    var handler;

    modules = $.makeArray(arguments);
    Class = modules.shift();

    handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && !modules[i].registered)
                    modules[i].register();
            }
        },
        unregister: function() {
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && modules[i].registered)
                    modules[i].close();
            }
        }
    });

    return new handler();
});
