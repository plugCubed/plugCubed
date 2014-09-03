define(['plugCubed/Utils'], function(p3Utils) {
    if (!p3Utils.runLite)
        return require('app/base/Context');
    return {
        _events: [],
        trigger: function() {
        },
        on: function() {},
        off: function() {}
    };
});