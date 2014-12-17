define(['plugCubed/Class'], function(Class) {
    return Class.extend({
        init: function() {
            this.overriden = false;
        },
        doOverride: function() {
        },
        doRevert: function() {
        },
        override: function() {
            if (this.overriden) return;
            this.doOverride();
            this.overriden = true;
        },
        revert: function() {
            if (!this.overriden) return;
            this.doRevert();
            this.overriden = false;
        }
    })
});