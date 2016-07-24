define(['plugCubed/Class', 'plugCubed/notifications/History', 'plugCubed/notifications/SongLength', 'plugCubed/notifications/SongStats', 'plugCubed/notifications/SongUpdate', 'plugCubed/notifications/UserGrab', 'plugCubed/notifications/UserJoin', 'plugCubed/notifications/UserLeave', 'plugCubed/notifications/UserMeh', 'plugCubed/notifications/History', 'plugCubed/notifications/SongUnavailable', 'plugCubed/notifications/BoothAlert'], function() {
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
