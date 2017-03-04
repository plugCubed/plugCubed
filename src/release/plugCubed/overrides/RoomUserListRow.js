define(['jquery', 'plugCubed/Lang', 'plugCubed/Utils', 'plugCubed/RoomSettings'], function($, p3Lang, p3Utils, RoomSettings) {
    var Context, CurrentUser, RoomUserListRow, RoomUsersListView;

    Context = window.plugCubedModules.context;
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
                    this.$icon.removeClass().addClass('icon icon-grab');
                } else if (this.model.get('vote') === 1) {
                    this.$icon.removeClass().addClass('icon icon-woot');
                } else if (this.model.get('vote') === -1 && (isStaff || (!isStaff && RoomSettings.rules.allowShowingMehs))) {
                    this.$icon.removeClass().addClass('icon icon-meh');
                } else {
                    this.$icon.removeClass();
                }
            } else if (this.$icon) {
                this.$icon.remove();
                this.$icon = undefined;
            }

            var id = this.model.get('id');
            var $voteIcon = this.$el.find('.icon-woot,.icon-meh,.icon-grab');

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
                }

                $icon.mouseover(function() {
                    Context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(id)).text(), $(this), true);
                }).mouseout(function() {
                    Context.trigger('tooltip:hide');
                });

                if (specialIconInfo != null) {
                    $icon.css('background-image', 'url("https://plugcubed.net/scripts/release/images/ranks/p3special.' + specialIconInfo.icon + '.png")');
                }
            }

            if ($voteIcon.length > 0) {
                $voteIcon.mouseover(function() {
                    Context.trigger('tooltip:show', $('<span>').html(p3Lang.i18n('vote.' + ($voteIcon.hasClass('icon-grab') ? 'grab' : ($voteIcon.hasClass('icon-woot') ? 'woot' : 'meh')))).text(), $(this), true);
                }).mouseout(function() {
                    Context.trigger('tooltip:hide');
                });
            }
        }
    });
});

