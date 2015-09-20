define(['jquery', 'plugCubed/handlers/OverrideHandler', 'plugCubed/Utils', 'plugCubed/ModuleLoader'], function($, OverrideHandler, p3Utils, ModuleLoader) {

    var WaitListRow;
    var WaitListRowPrototype;
    var originalFunction;

    WaitListRow = ModuleLoader.getView({
        className: 'user',
        func: 'onRemoveClick'
    });
    WaitListRowPrototype = WaitListRow.prototype;
    originalFunction = WaitListRowPrototype.onRole;

    var handler = OverrideHandler.extend({
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

    return new handler();
});
