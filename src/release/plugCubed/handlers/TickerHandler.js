define(['jquery', 'plugCubed/Class'], function($, Class) {
    return Class.extend({
        // Time between each tick (in milliseconds)
        tickTime: 1E3,
        closed: false,
        init: function() {
            this.proxy = $.proxy(this.handler, this);
            this.proxy();
        },
        handler: function() {
            this.tick();
            if (!this.closed) {
                this.timeoutID = setTimeout(this.proxy, this.tickTime);
            }
        }, // The function that is called on each tick
        tick: function() {},
        close: function() {
            clearTimeout(this.timeoutID);
            this.closed = true;
        }
    });
});
