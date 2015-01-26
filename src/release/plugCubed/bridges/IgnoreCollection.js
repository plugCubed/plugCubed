define(['plugCubed/Utils'], function(p3Utils) {
    if (!p3Utils.runLite)
        return require('app/collections/IgnoreCollection');
    return {
        _byId: {}
    };
});