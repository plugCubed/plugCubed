define(['jquery', 'plugCubed/handlers/OverrideHandler', 'plugCubed/Utils', 'plugCubed/ModuleLoader'], function($, OverrideHandler, p3Utils, ModuleLoader) {

    var UserRolloverView = ModuleLoader.getView({
        isBackbone: true,
        id: 'user-rollover'
    });

    var handler = OverrideHandler.extend({
        doOverride: function() {
            if (typeof UserRolloverView._showSimple !== 'function')
                UserRolloverView._showSimple = UserRolloverView.showSimple;

            if (typeof UserRolloverView._clear !== 'function')
                UserRolloverView._clear = UserRolloverView.clear;

            UserRolloverView.showSimple = function(a, b) {
                this._showSimple(a, b);
                var specialIconInfo = p3Utils.getPlugCubedSpecial(a.id);

                if (this.$p3Role == null) {
                    this.$p3Role = $('<span>').addClass('p3Role');
                    this.$meta.append(this.$p3Role);
                }

                if (p3Utils.havePlugCubedRank(a.id)) {
                    this.$meta.addClass('has-p3Role is-p3' + p3Utils.getHighestRank(a.id));
                    if (specialIconInfo != null) {
                        this.$p3Role.text($('<span>').html(specialIconInfo.title).text()).css({
                            'background-image': 'url("https://d1rfegul30378.cloudfront.net/files/images/icons.p3special.' + specialIconInfo.icon + '.png")'
                        });
                    } else {
                        this.$p3Role.text($('<span>').html(p3Utils.getHighestRankString(a.id)).text());
                    }
                }
            };

            UserRolloverView.clear = function() {
                this._clear();
                this.$meta.removeClass('has-p3Role is-p3developer is-p3sponsor is-p3special is-p3ambassador is-p3donatorDiamond is-p3donatorPlatinum is-p3donatorGold is-p3donatorSilver is-p3donatorBronze');
            };
        },
        doRevert: function() {
            if (typeof UserRolloverView._showSimple === 'function')
                UserRolloverView.showSimple = UserRolloverView._showSimple;

            if (typeof UserRolloverView._clear === 'function')
                UserRolloverView.clear = UserRolloverView._clear;
        }
    });
    return new handler();
});
