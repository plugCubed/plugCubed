define(['plugCubed/Class', 'plugCubed/overrides/Context', 'plugCubed/overrides/UserRolloverView', 'plugCubed/overrides/WaitListRow', 'plugCubed/overrides/ChatFacadeEvent'], function() {
    var modules, Class, Handler;

    modules = _.toArray(arguments);
    Class = modules.shift();

    Handler = Class.extend({
        override: function() {
            this.revert();
            for (var i = 0; i < modules.length; i++) {
                if (modules[i] != null) {
                    modules[i].override();
                }
            }
        },
        revert: function() {
            for (var i = 0; i < modules.length; i++) {
                if (modules[i] != null) {
                    modules[i].revert();
                }
            }
        }
    });

    return new Handler();
});
