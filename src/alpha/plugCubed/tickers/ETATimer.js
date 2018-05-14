define(['jquery', 'plugCubed/handlers/TickerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang'], function($, TickerHandler, Settings, p3Utils, p3Lang) {
    var boothAttributes, firstTick, handler;

    boothAttributes = window.plugCubedModules.booth.attributes;
    firstTick = true;

    try {
        handler = TickerHandler.extend({
            tickTime: 1000,
            init: function() {
                this.myID = API.getUser().id;
                this.$etaText = null;
                this.$div = null;
                this._super();
            },
            createElement: function() {
                if (this.$div == null || $('.p3-eta-span').length === 0) {
                    if (this.$div != null) {
                        this.$div.remove();
                        this.$div = null;
                    }
                    this.$div = $('<div id="p3-eta-timer-footer">').append($('<span class="p3-eta-span">').css({
                        'font-size': '14px',
                        position: 'absolute',
                        bottom: '70px',
                        'white-space': 'nowrap',
                        left: '60px'
                    }));
                    $('.community__bottom').before(this.$div);
                }
                if (this.$etaText == null || $('.p3-eta-timer').length === 0) {
                    if (this.$etaText != null) {
                        this.$etaText.remove();
                        this.$etaText = null;
                    }
                    this.$etaText = $('<div id="p3-eta-timer">').append('<small class="p3-eta-timer" style="color: slategrey;">');
                    $('.room-controls__bottom-text').after(this.$etaText);
                }
            },
            tick: function() {
                if ($('#rs-eta-container').length > 0) return;
                if (Settings.etaTimer) {
                    if (firstTick) {
                        firstTick = false;

                        return;
                    }

                    this.createElement();

                    if (API.getHistory() == null || (boothAttributes.isLocked && (API.getUser().role < API.ROLE.MANAGER || (API.getUser().gRole > 0 && API.getUser().gRole < window.plugCubedModules.GROLE.AMBASSADOR))) || (boothAttributes.waitingDJS && boothAttributes.waitingDJS.length > 50)) {
                        this.$div.remove();
                        this.$etaText.remove();
                    } else if (boothAttributes.currentDJ == null) {
                        this.$div.find('span').text(p3Lang.i18n('eta.boothAvailable'));
                        this.$etaText.remove();
                    } else {
                        var time, waitListPos, timePerSong, historyArr;

                        waitListPos = API.getWaitListPosition();
                        timePerSong = 0;
                        historyArr = API.getHistory();

                        for (var i = 0; i < historyArr.length; i++) {
                            if (historyArr[i] == null || historyArr[i].media == null || !_.isFinite(historyArr[i].media.duration)) continue;

                            if (historyArr[i].media.duration === 0 || historyArr[i].media.duration >= 600) {
                                timePerSong += 240;
                            } else {
                                timePerSong += historyArr[i].media.duration;
                            }

                        }

                        timePerSong = Math.round(timePerSong / historyArr.length);

                        if (boothAttributes && boothAttributes.currentDJ === this.myID) {
                            this.$div.find('span').text(p3Lang.i18n('eta.alreadyDJ'));
                        } else if (waitListPos < 0) {
                            time = p3Utils.formatTime((API.getWaitList().length * timePerSong) + API.getTimeRemaining());
                            this.$div.find('span').text(p3Lang.i18n('eta.joinTime', time));
                            this.$etaText.find('small').text('ETA: ' + time + '!');
                        } else {
                            time = p3Utils.formatTime((waitListPos * timePerSong) + API.getTimeRemaining());
                            this.$div.find('span').text(p3Lang.i18n('eta.waitListTime', waitListPos + 1, API.getWaitList().length, time), 10);
                            this.$etaText.find('small').text('ETA: ' + time + ' (' + (waitListPos + 1) + '/' + API.getWaitList().length + ')');
                        }
                    }
                }
            },
            close: function() {
                if (this.$div != null) {
                    this.$div.remove();
                    this.$div = null;
                }
                if (this.$etaText != null) {
                    this.$etaText.remove();
                    this.$etaText = null;
                }
                this._super();
            }
        });
    } catch (e) {
        console.error('Error while creating ETATimer');
        console.error(e);
    }

    return handler;
});
