define(['plugCubed/Class'], function(Class) {
    return Class.extend({
        init: function() {
            this.overridden = false;
        },
        doOverride: function() {
        },
        doRevert: function() {
        },
        override: function() {
            if (this.overridden) return;
            this.doOverride();
            this.overridden = true;
        },
        revert: function() {
            if (!this.overridden) return;
            this.doRevert();
            this.overridden = false;
        }
    })
});