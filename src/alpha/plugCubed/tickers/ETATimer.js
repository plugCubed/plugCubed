define(['jquery', 'plugCubed/handlers/TickerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang'], function($, TickerHandler, Settings, p3Utils, p3Lang) {
    var booth, handler, Lang;

    booth = window.plugCubedModules.booth;
    Lang = window.plugCubedModules.Lang;

    try {
        handler = TickerHandler.extend({
            tickTime: 1000,
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

                    if (API.getHistory() == null) {
                        return;
                    }

                    var time, isDJ, waitListPos, timePerSong, historyArr, $djButton, boothAttributes;

                    boothAttributes = booth.attributes;
                    isDJ = boothAttributes && boothAttributes.currentDJ === this.myID;
                    waitListPos = API.getWaitListPosition();
                    timePerSong = 0;
                    historyArr = API.getHistory();
                    $djButton = $('#dj-button').find('span');

                    for (var i = 0; i < historyArr.length; i++) {
                        if (historyArr[i] == null || historyArr[i].media == null || !_.isFinite(historyArr[i].media.duration)) continue;

                        if (historyArr[i].media.duration === 0 || historyArr[i].media.duration >= 600) {
                            timePerSong += 240;
                        } else {
                            timePerSong += historyArr[i].media.duration;
                        }

                    }

                    timePerSong = Math.round(timePerSong / historyArr.length);

                    if (isDJ) {
                        this.$span.text(p3Lang.i18n('eta.alreadyDJ'));

                        return;
                    }

                    if (waitListPos < 0) {
                        time = p3Utils.formatTime((API.getWaitList().length * timePerSong) + API.getTimeRemaining());
                        this.$span.text(p3Lang.i18n('eta.joinTime', time));
                        $djButton.html((boothAttributes.isLocked ? Lang.dj.boothLocked : (boothAttributes.waitingDJs.length < 50 ? Lang.dj.waitJoin : Lang.dj.waitFull)) + '<br><small class="dark-label">ETA: ' + time + '!</small>');

                        return;
                    }

                    time = p3Utils.formatTime((waitListPos * timePerSong) + API.getTimeRemaining());
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
        console.error('Error while creating ETATimer');
        console.error(e);
    }

    return handler;
});
