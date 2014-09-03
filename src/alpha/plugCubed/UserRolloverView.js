define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/bridges/Context'], function(Class, p3Utils, _$context) {
    var UserRolloverView = require('app/views/user/UserRolloverView');

    var handler = Class.extend({
        override: function() {
            if (typeof UserRolloverView._showSimple !== 'function')
                UserRolloverView._showSimple = UserRolloverView.showSimple;
            UserRolloverView.showSimple = function(a, b) {
                this._showSimple(a, b);
                var specialIconInfo = p3Utils.getPlugCubedSpecial(a.id);

                if (this.$specialRole) {
                    this.$specialRole.remove();
                    this.$meta.removeClass('p3special');
                    this.$roleIcon.css('background-image', '');
                }

                if (p3Utils.havePlugCubedRank(a.id)) {
                    if (p3Utils.havePlugCubedRank(a.id, true)) {
                        this.$roleIcon.addClass('icon-is-p3' + p3Utils.getHighestRank(a.id));
                        this.$role.text($('<span>').html(p3Utils.getAllPlugCubedRanks(a.id, true)).text());
                    }
                }

                if (specialIconInfo !== undefined) {
                    this.$specialRole = $('<span>').addClass('specialRole').text($('<span>').html(specialIconInfo.title).text());
                    this.$meta.append(this.$specialRole).addClass('p3special');
                    this.$roleIcon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/alpha/images/icons.p3special.' + specialIconInfo.icon + '.png")');
                }
            }
        },
        revert: function() {
            if (typeof UserRolloverView._showSimple === 'function')
                UserRolloverView.showSimple = UserRolloverView._showSimple;
        }
    });
    return new handler();
});