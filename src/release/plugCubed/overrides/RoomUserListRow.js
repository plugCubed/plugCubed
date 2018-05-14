define(['jquery', 'plugCubed/Utils', 'plugCubed/RoomSettings', 'lang/Lang'], function($, p3Utils, RoomSettings, Lang) {
    var CurrentUser, RoomUserListRow, RoomUsersListView;

    CurrentUser = window.plugCubedModules.CurrentUser;
    RoomUsersListView = window.plugCubedModules.RoomUsersListView;
    RoomUserListRow = RoomUsersListView.prototype.RowClass;

    return RoomUserListRow.extend({
        vote: function() {
            if (this.model.get('grab') || this.model.get('vote') !== 0) {
                if (!this.$icon) {
                    this.$icon = $('<i>').addClass('icon');
                    this.$el.append(this.$icon);
                }
                var isStaff = (CurrentUser.hasPermission(API.ROLE.BOUNCER) || CurrentUser.hasPermission(API.ROLE.BOUNCER, true) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador());

                if (this.model.get('grab')) {
                    this.$icon.removeClass().addClass('icon icon-grab').attr('title', Lang.vote.grab);
                } else if (this.model.get('vote') === 1) {
                    this.$icon.removeClass().addClass('icon icon-woot').attr('title', Lang.vote.woot);
                } else if (this.model.get('vote') === -1 && (isStaff || (!isStaff && RoomSettings.rules.allowShowingMehs))) {
                    this.$icon.removeClass().addClass('icon icon-meh').attr('title', Lang.vote.meh);
                } else {
                    this.$icon.removeClass().removeAttr('title');
                }
            } else if (this.$icon) {
                this.$icon.remove();
                this.$icon = undefined;
            }

            var id = this.model.get('id');

            if (p3Utils.havePlugCubedRank(id) || p3Utils.hasPermission(id, API.ROLE.DJ)) {
                var $icon = this.$el.find('.icon:not(.icon-woot,.icon-meh,.icon-grab)');
                var specialIconInfo = p3Utils.getPlugCubedSpecial(id);

                if ($icon.length < 1) {
                    $icon = $('<i>').addClass('icon');
                    this.$el.append($icon);
                }

                if (p3Utils.havePlugCubedRank(id)) {
                    $icon.removeClass('icon-chat-subscriber');
                    $icon.removeClass('icon-chat-silver-subscriber');
                    $icon.addClass('icon-chat-p3' + p3Utils.getHighestRank(id));
                    $icon.attr('title', p3Utils.getAllPlugCubedRanks(id));
                }

                if (specialIconInfo != null) {
                    $icon.css('background-image', 'url("https://plugcubed.net/scripts/release/images/ranks/p3special.' + specialIconInfo.icon + '.png")');
                }
            }
        }
    });
});

