define(['jquery', 'plugCubed/handlers/TickerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang'], function($, TickerHandler, Settings, p3Utils, p3Lang) {
    var IgnoreCollection = window.plugCubedModules.ignoreCollection;
    var handler = TickerHandler.extend({
        tickTime: 1000,
        tick: function() {
            if (Settings.moderation.afkTimers && (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER)) && $('#waitlist-button').hasClass('selected')) {
                var a = API.getWaitList();
                var b = $('#waitlist').find('.user');

                for (var c = 0; c < a.length; c++) {
                    var d = Date.now() - p3Utils.getUserData(a[c].id, 'lastChat', p3Utils.getUserData(a[c].id, 'joinTime', Date.now()));
                    var e = IgnoreCollection._byId[a[c].id] === true ? p3Lang.i18n('error.ignoredUser') : p3Utils.formatTime(Math.round(d / 1000));
                    var f = $(b[c]).find('.afkTimer');

                    if (f.length < 1) {
                        f = $('<div>').addClass('afkTimer');
                        $(b[c]).find('.meta').append(f);
                    }

                    f.text(e);
                }
            }
        },
        close: function() {
            this._super();
            $('#waitlist').find('.user .afkTimer').remove();
        }
    });

    return handler;
});
