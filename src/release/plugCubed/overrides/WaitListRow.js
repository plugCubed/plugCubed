define(['jquery', 'plugCubed/handlers/OverrideHandler', 'plugCubed/Utils'], function($, OverrideHandler, p3Utils) {

    var WaitListRow, WaitListRowPrototype, originalFunction, Handler;

    WaitListRow = window.plugCubedModules.WaitlistRow;
    WaitListRowPrototype = WaitListRow.prototype;
    originalFunction = WaitListRowPrototype.onRole;

    Handler = OverrideHandler.extend({
        doOverride: function() {
            WaitListRowPrototype.onRole = function() {
                originalFunction.apply(this);
                if (this.model.get('role') === 4) {
                    this.$('.name i').removeClass().addClass('icon icon-chat-cohost');
                }
            };
        },
        doRevert: function() {
            WaitListRowPrototype.onRole = originalFunction;
        }
    });

    return new Handler();
});
