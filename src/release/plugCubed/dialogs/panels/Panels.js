define(['plugCubed/Class', 'plugCubed/dialogs/panels/About', 'plugCubed/dialogs/panels/Background', 'plugCubed/dialogs/panels/Commands', 'plugCubed/dialogs/panels/ChatCustomization', 'plugCubed/dialogs/panels/CustomCSS'], function() {
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
