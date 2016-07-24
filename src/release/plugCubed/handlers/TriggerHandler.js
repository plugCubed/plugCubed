define(['jquery', 'plugCubed/Class'], function($, Class) {
    return Class.extend({
        triggerHandlers: [],
        trigger: undefined,
        registered: false,
        init: function() {
            var i;

            if (this.triggerHandlers.length > 0) {
                this.close();
            }
            this.triggerHandlers = [];
            if (this.trigger == null) {
                throw new Error('Missing TriggerHandler trigger!');
            }
            if (typeof this.trigger === 'string') {
                this.triggerHandlers[this.trigger] = this.handler;
            } else if (_.isArray(this.trigger)) {
                for (i = 0; i < this.trigger.length; i++) {
                    if (!this.trigger[i]) continue;
                    if (typeof this[this.trigger[i]] === 'function') {
                        this.triggerHandlers[this.trigger[i]] = this[this.trigger[i]];
                    } else {
                        this.triggerHandlers[this.trigger[i]] = this.handler;
                    }
                }
            } else if ($.isPlainObject(this.trigger)) {
                for (i in this.trigger) {
                    if (!this.trigger.hasOwnProperty(i)) continue;
                    this.triggerHandlers[i] = this.trigger[i];
                }
            }
        },
        register: function() {
            var i;

            for (i in this.triggerHandlers) {
                if (!this.triggerHandlers.hasOwnProperty(i)) continue;
                if (typeof this.triggerHandlers[i] === 'function') {
                    API.on(i, this.triggerHandlers[i], this);
                } else if (typeof this[this.triggerHandlers[i]] === 'function') {
                    API.on(i, this[this.triggerHandlers[i]], this);
                }
            }
            this.registered = true;
        },
        close: function() {
            var i;

            for (i in this.triggerHandlers) {
                if (!this.triggerHandlers.hasOwnProperty(i)) continue;
                if (typeof this.triggerHandlers[i] === 'function') {
                    API.off(i, this.triggerHandlers[i], this);
                    delete this.triggerHandlers[i];
                } else if (typeof this[this.triggerHandlers[i]] === 'function') {
                    API.off(i, this[this.triggerHandlers[i]], this);
                    delete this[this.triggerHandlers[i]];
                }
            }
            this.registered = false;
        }
    });
});
