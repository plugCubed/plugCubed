define(['jquery', 'plugCubed/handlers/OverrideHandler', 'plugCubed/dialogs/panes/InventoryPane', 'plugCubed/Utils', 'plugCubed/ModuleLoader', 'plugCubed/bridges/Layout'], function($, OverrideHandler, InventoryPane, p3Utils, ModuleLoader, Layout) {

    var UserInventory = ModuleLoader.getView({
        id: 'user-inventory'
    });

    var TabMenu = ModuleLoader.getView({
        isTemplate: true,
        template: 'hbs!templates/user/inventory/TabMenu'
    });

    var handler = OverrideHandler.extend({
        doOverride: function() {
            if (typeof TabMenu.prototype._render !== 'function')
                TabMenu.prototype._render = TabMenu.prototype.render;

            TabMenu.prototype.render = function() {
                var that = this;

                this._render();

                $('<button class="p3">plug&#179;</button>').insertAfter($(this.$el).find('button:first')).click(function() {
                    that.trigger('select', 'p3');
                });

                $(this.$el).find('button').css('width', (100 / $(this.$el).find('button').length) + '%');

                return this;
            };

            if (typeof UserInventory.prototype._onMenuSelect != 'function')
                UserInventory.prototype._onMenuSelect = UserInventory.prototype.onMenuSelect;

            UserInventory.prototype.onMenuSelect = function(a) {
                if (a === 'p3') {
                    this.clear();
                    this.view = new InventoryPane();
                    this.$el.append(this.view.$el);
                    this.view.render();
                    this.onResize(Layout.getSize());
                } else {
                    this._onMenuSelect(a);
                }
            };
        },
        doRevert: function() {
            if (typeof UserInventory.prototype._onMenuSelect === 'function')
                UserInventory.prototype.onMenuSelect = UserInventory.prototype._onMenuSelect;

            if (typeof TabMenu.prototype._render != 'function')
                TabMenu.prototype.render = TabMenu.prototype._render;
        }
    });

    return new handler();
});
