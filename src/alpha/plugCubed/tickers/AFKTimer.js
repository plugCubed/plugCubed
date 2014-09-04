define(['jquery', 'plugCubed/handlers/TickerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang'], function($, TickerHandler, Settings, p3Utils, p3Lang) {
    var IgnoreCollection, handler;

    if (p3Utils.runLite) {
        IgnoreCollection = {
            _byId: {}
        };
    } else {
        IgnoreCollection = require('app/collections/IgnoreCollection');
    }

    handler = TickerHandler.extend({
        tickTime: 1E3,
        tick: function() {
            if (Settings.moderation.afkTimers && (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER)) && $('#waitlist-button').hasClass('selected')) {
                var a = API.getWaitList(), b = $('#waitlist').find('.user');
                for (var c = 0; c < a.length; c++) {
                    var d, e, f;

                    d = Date.now() - p3Utils.getUserData(a[c].id, 'lastChat', p3Utils.getUserData(a[c].id, 'joinTime', Date.now()));
                    e = IgnoreCollection._byId[a[c].id] === true ? p3Lang.i18n('error.ignoredUser') : p3Utils.getTimestamp(d, d < 36E5 ? 'mm:ss' : 'hh:mm:ss');
                    f = $(b[c]).find('.afkTimer');

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