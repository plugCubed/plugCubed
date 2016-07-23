define(['plugCubed/Class', 'plugCubed/tickers/AFKTimer', 'plugCubed/tickers/ETATimer'], function() {
    var modules, Class, instances;

    modules = _.toArray(arguments);
    Class = modules.shift();
    instances = [];

    var Handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i = 0; i < modules.length; i++) {
                instances[i] = new modules[i]();
            }
        },
        unregister: function() {
            for (var i = 0; i < modules.length; i++) {
                if (instances[i]) {
                    instances[i].close();
                }
            }
        }
    });

    return new Handler();
});
