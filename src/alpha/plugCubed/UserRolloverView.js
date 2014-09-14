define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/bridges/Context'], function(Class, p3Utils, _$context) {
    var UserRolloverView = require('app/views/user/UserRolloverView');

    var handler = Class.extend({
        override: function() {
            if (typeof UserRolloverView._showSimple !== 'function')
                UserRolloverView._showSimple = UserRolloverView.showSimple;
            if (typeof UserRolloverView._clear !== 'function')
                UserRolloverView._clear = UserRolloverView.clear;
            UserRolloverView.showSimple = function(a, b) {
                this._showSimple(a, b);
                var specialIconInfo = p3Utils.getPlugCubedSpecial(a.id);

                if (this.$p3Role === undefined) {
                    this.$p3Role = $('<span>').addClass('p3Role');
                    this.$meta.append(this.$p3Role);
                }

                if (p3Utils.havePlugCubedRank(a.id)) {
                    this.$meta.addClass('has-p3Role is-p3' + p3Utils.getHighestRank(a.id));
                    if (specialIconInfo !== undefined) {
                        this.$p3Role.text($('<span>').html(specialIconInfo.title).text()).css({
                            'background-image': 'url("https://d1rfegul30378.cloudfront.net/alpha/images/icons.p3special.' + specialIconInfo.icon + '.png")'
                        });
                    } else {
                        this.$p3Role.text($('<span>').html(p3Utils.getAllPlugCubedRanks(a.id, true)).text());
                    }
                }
            };
            UserRolloverView.clear = function() {
                this._clear();
                this.$meta.removeClass('has-p3Role is-p3developer is-p3sponsor is-p3special is-p3ambassador is-p3donatorDiamond is-p3donatorPlatinum is-p3donatorGold is-p3donatorSilver is-p3donatorBronze');
            };
        },
        revert: function() {
            if (typeof UserRolloverView._showSimple === 'function')
                UserRolloverView.showSimple = UserRolloverView._showSimple;
            if (typeof UserRolloverView._clear === 'function')
                UserRolloverView.clear = UserRolloverView._clear;
        }
    });
    return new handler();
});