define(['jquery', 'plugCubed/handlers/OverrideHandler', 'plugCubed/Utils'], function($, OverrideHandler, p3Utils) {
    if (p3Utils.runLite) return null;

    var WaitListRow, WaitListRowPrototype, originalFunction;

    WaitListRow = require('app/views/room/user/WaitListRow');
    WaitListRowPrototype = WaitListRow.prototype;
    originalFunction = WaitListRowPrototype.onRole;

    var handler = OverrideHandler.extend({
        doOverride: function() {
            WaitListRowPrototype.onRole = function() {
                originalFunction.apply(this);
                if (this.model.get('role') == 4) {
                    this.$('.name i').removeClass().addClass('icon icon-chat-cohost');
                }
            };
        },
        doRevert: function() {
            WaitListRowPrototype.onRole = originalFunction;
        }
    });

    return new handler();
});