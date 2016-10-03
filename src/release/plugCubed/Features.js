define(['plugCubed/Class', 'plugCubed/features/Alertson', 'plugCubed/features/Autojoin', 'plugCubed/features/Automute', 'plugCubed/features/Autorespond', 'plugCubed/features/Autowoot', 'plugCubed/features/Whois', 'plugCubed/features/WindowTitle', 'plugCubed/features/ChatLog'], function() {
    var modules, Class, Handler;

    modules = _.toArray(arguments);
    Class = modules.shift();

    Handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i = 0; i < modules.length; i++) {
                if (!modules[i].registered) {
                    modules[i].register();
                }
            }
        },
        unregister: function() {
            for (var i = 0; i < modules.length; i++) {
                if (modules[i].registered) {
                    modules[i].close();
                }
            }
        }
    });

    return new Handler();
});
