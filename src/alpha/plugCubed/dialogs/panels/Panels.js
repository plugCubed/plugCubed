define(['plugCubed/Class', 'plugCubed/dialogs/panels/Background', 'plugCubed/dialogs/panels/Notifications'], function() {
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