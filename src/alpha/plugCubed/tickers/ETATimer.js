define(['jquery', 'plugCubed/handlers/TickerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'lang/Lang'], function($, TickerHandler, Settings, p3Utils, p3Lang, Lang) {
    var handler;

    try {
        handler = TickerHandler.extend({
            tickTime: 1E3,
            init: function() {
                this.myID = API.getUser().id;
                this.$span = null;
                $('#your-next-media').find('span:first').removeClass('song').addClass('song');
                this._super();
            },
            createElement: function() {
                this.$span = $('<span class="eta dark-label">').css({
                    'font-size': '14px',
                    top: '28px'
                });
                $('#your-next-media').append(this.$span);
            },
            tick: function() {
                if (Settings.etaTimer) {
                    if (this.$span == null) {
                        this.createElement();
                    }

                    if (API.getDJ() == null) {
                        this.$span.text(p3Lang.i18n('eta.boothAvailable'));
                        return;
                    }

                    if (API.getHistory() == null)
                        return;

                    var isDJ, waitListPos, timePerSong, history, time, $djButton;

                    isDJ = API.getDJ() != null && API.getDJ().id == this.myID;
                    waitListPos = API.getWaitListPosition();
                    timePerSong = 0;
                    history = API.getHistory();
                    $djButton = $('#dj-button').find('span');

                    for (var i in history) {
                        if (history.hasOwnProperty(i))
                            timePerSong += history[i].info == null || history[i].info.duration === 0 ? 240 : history[i].info.duration;
                    }

                    timePerSong = Math.round(timePerSong / history.length);

                    if (isDJ) {
                        this.$span.text(p3Lang.i18n('eta.alreadyDJ'));
                        return;
                    }

                    if (waitListPos < 0) {
                        time = p3Utils.formatTime(API.getWaitList().length * timePerSong + API.getTimeRemaining());
                        this.$span.text(p3Lang.i18n('eta.joinTime', time));
                        $djButton.html((API.getWaitList().length < 50 ? Lang.dj.waitJoin : Lang.dj.waitFull) + '<br><small class="dark-label">' + time + '</small>');
                        return;
                    }

                    time = p3Utils.formatTime(waitListPos * timePerSong + API.getTimeRemaining());
                    this.$span.text(p3Lang.i18n('eta.waitListTime', waitListPos + 1, API.getWaitList().length, time), 10);
                    $djButton.html(Lang.dj.waitLeave + '<br><small class="dark-label">' + (waitListPos + 1) + '/' + API.getWaitList().length + ' (' + time + ')</small>');
                } else if (this.$span != null) {
                    this.$span.remove();
                    this.$span = null;
                }
            },
            close: function() {
                if (this.$span != null) {
                    this.$span.remove();
                    this.$span = null;
                }
                this._super();
                $('#your-next-media').find('.song').removeClass('song');
            }
        });
    } catch (e) {
        console.log('Error while creating ETATimer');
        console.log(e);
    }

    return handler;
});