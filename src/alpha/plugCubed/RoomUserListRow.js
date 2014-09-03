define(['jquery', 'plugCubed/Lang', 'plugCubed/Utils', 'plugCubed/bridges/Context'], function($, p3Lang, p3Utils, _$context) {
    var RoomUserListRow = require('app/views/room/user/RoomUserListRow');
    return RoomUserListRow.extend({
        vote: function() {
            if (this.model.get('curated') || this.model.get('vote') !== 0) {
                if (!this.$icon) {
                    this.$icon = $('<i>').addClass('icon');
                }
                this.$el.append(this.$icon);
                if (this.model.get('curated')) {
                    this.$icon.removeClass().addClass('icon icon-curate');
                } else if (this.model.get('vote') == 1) {
                    this.$icon.removeClass().addClass('icon icon-woot');
                } else {
                    this.$icon.removeClass().addClass('icon icon-meh');
                }
            } else if (this.$icon) {
                this.$icon.remove();
                this.$icon = undefined;
            }

            var id = this.model.get('id'), $voteIcon = this.$el.find('.icon-woot,.icon-meh,.icon-curate');
            
            if (p3Utils.havePlugCubedRank(id) || API.getUser(id).permission > API.ROLE.NONE) {
                var $icon = this.$el.find('.icon:not(.icon-woot,.icon-meh,.icon-curate)'), specialIconInfo = p3Utils.getPlugCubedSpecial(id);
                if ($icon.length < 1) {
                    $icon = $('<i>').addClass('icon');
                    this.$el.append($icon);
                }

                if (p3Utils.havePlugCubedRank(id)) {
                    $icon.addClass('icon-is-p3' + p3Utils.getHighestRank(id));
                }

                $icon.mouseover(function() {
                    _$context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(id)).text(), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                });

                if (specialIconInfo !== undefined) {
                    $icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/alpha/images/icons.p3special.' + specialIconInfo.icon + '.png")');
                }
            }

            if ($voteIcon.length > 0) {
                $voteIcon.mouseover(function() {
                    _$context.trigger('tooltip:show', $('<span>').html(p3Lang.i18n('vote.' + ($voteIcon.hasClass('icon-curate') ? 'curate' : ($voteIcon.hasClass('icon-woot') ? 'woot' : 'meh')))).text(), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                });
            }
        }
    });
});