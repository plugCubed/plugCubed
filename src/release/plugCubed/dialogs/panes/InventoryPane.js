define(['jquery', 'plugCubed/Utils', 'plugCubed/AvatarManifest', 'plugCubed/dialogs/panes/AvatarCell', 'lang/Lang'], function($, p3Utils, p3AvatarManifest, AvatarCell, plugLang) {
    if (p3Utils.runLite) return;

    var GenericPane = require('app/views/user/inventory/GenericPane');
    var Template = require('hbs!templates/user/inventory/Inventory');
    var TheUserModel = require('app/models/TheUserModel');
    var Random = require('app/utils/Random');
    
    var handler = GenericPane.extend({
        className: "p3",
        render: function() {
            this.$el.append(Template(plugLang));
            this.$(".box").jScrollPane();
            this.scrollPane = this.$(".box").data("jsp");
            TheUserModel.on("change:ep change:pp", this.onChange, this);
            this.onChange();
            this.onUpdate();
            this.updateAvatars();
        },
        updateAvatars: function() {
            this.clear();
            for (var i in p3AvatarManifest.manifest) {
                if (!p3AvatarManifest.manifest.hasOwnProperty(i)) continue;
                var cell = new AvatarCell({
                    model: p3AvatarManifest.manifest[i],
                    blink: Random.MASTER.integer(0, 19)
                });
                this.$(".grid").append(cell.$el);
                this.cells.push(cell);
                cell.render();
            }
            this.scrollPane.reinitialise();
        },
        remove: function() {
            TheUserModel.off("change:ep change:pp", this.onChange, this);
            this.clear();
            this.$(".grid .header").remove();

            this.cells = undefined;
            delete this.cells;

            this.scrollPane && this.scrollPane.destroy();
            this.scrollPane = undefined;
            delete this.scrollPane;
        }
    });

    return handler;
});