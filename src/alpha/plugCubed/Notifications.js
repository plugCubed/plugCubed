define(['plugCubed/Class', 'plugCubed/notifications/History', 'plugCubed/notifications/SongLength', 'plugCubed/notifications/SongStats', 'plugCubed/notifications/SongUpdate', 'plugCubed/notifications/UserGrab', 'plugCubed/notifications/UserJoin', 'plugCubed/notifications/UserLeave', 'plugCubed/notifications/UserMeh'], function() {
    var modules, Class, handler;

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