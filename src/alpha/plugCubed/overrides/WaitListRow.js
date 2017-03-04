define(['jquery', 'plugCubed/handlers/OverrideHandler', 'plugCubed/Utils'], function($, OverrideHandler, p3Utils) {

    var WaitListRow, WaitListRowPrototype, originalFunction, Handler;

    WaitListRow = window.plugCubedModules.WaitlistRow;
    WaitListRowPrototype = WaitListRow.prototype;
    originalFunction = WaitListRowPrototype.onRole;

    Handler = OverrideHandler.extend({
        doOverride: function() {
            WaitListRowPrototype.onRole = function() {
                originalFunction.apply(this);
                if (p3Utils.havePlugCubedRank(this.model.get('id'))) {
                    var specialIconInfo = p3Utils.getPlugCubedSpecial(this.model.get('id'));

                    this.$('.name i').removeClass('has-p3Role is-p3developer is-p3sponsor is-p3special is-p3ambassador is-p3donatorDiamond is-p3donatorPlatinum is-p3donatorGold is-p3donatorSilver is-p3donatorBronze').addClass('has-p3Role is-p3' + p3Utils.getHighestRank(this.model.get('id')));
                    if (specialIconInfo != null) {
                        this.$('.name i').css('background-image', 'url("https://plugcubed.net/scripts/alpha/images/ranks/p3special.' + specialIconInfo.icon + '.png")');
                    }
                }
                if (this.model.get('role') === 4) {
                    this.$('.name i').removeClass('icon icon.chat-host').addClass('icon icon-chat-cohost');
                }
            };
        },
        doRevert: function() {
            WaitListRowPrototype.onRole = originalFunction;
        }
    });

    return new Handler();
});
