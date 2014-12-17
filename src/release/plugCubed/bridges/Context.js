define(['plugCubed/Utils'], function(p3Utils) {
    if (!p3Utils.runLite)
        return require('app/base/Context');
    return {
        _events: {
            'chat:receive': [],
            'chat:delete': []
        },
        trigger: function() {
        },
        on: function(key) {
            this._events[key] = [];
        },
        off: function() {}
    };
});