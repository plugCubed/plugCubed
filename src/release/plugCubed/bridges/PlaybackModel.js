define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/bridges/VolumeView'], function (Class, p3Utils, p3Lang, VolumeView) {
    var handler, that;

    if (p3Utils.runLite) {
        handler = Class.extend({
            init: function () {
                API.on(API.ADVANCE, this.djAdvance, this);
                this.set('lastVolume', this.get('volume'));
            },
            close: function () {
                API.off(API.ADVANCE, this.djAdvance, this);
            },
            djAdvance: function () {
                if (this.get('mutedOnce'))
                    this.unmute();
            },
            get: function (key) {
                switch (key) {
                case 'volume':
                    return API.getVolume();
                case 'muted':
                    return this.get('volume') === 0;
                default:
                    break;
                }
                return this[key];
            },
            set: function (key, value) {
                switch (key) {
                case 'volume':
                    API.setVolume(value);
                    return;
                case 'muted':
                    this.set('volume', value ? 0 : this.get('lastVolume'));
                    return;
                default:
                    break;
                }
                this[key] = value;
            },
            mute: function () {
                this.set('lastVolume', API.getVolume());
                API.setVolume(0);
            },
            muteOnce: function () {
                this.set('mutedOnce', true);
                this.set('lastVolume', API.getVolume());
                API.setVolume(0);
            },
            unmute: function () {
                API.setVolume(this.get('lastVolume'));
            }
        });
    } else {
        var PlaybackModel = require('app/models/PlaybackModel'),
            volume;

        function onMediaChange() {
            if (PlaybackModel.get('mutedOnce') === true)
                PlaybackModel.set('volume', PlaybackModel.get('lastVolume'));
        }

        handler = Class.extend({
            init: function () {
                that = this;
                PlaybackModel.off('change:volume', PlaybackModel.onVolumeChange);
                PlaybackModel.onVolumeChange = function () {
                    if (typeof plugCubed === 'undefined')
                        this.set('muted', this.get('volume') === 0);
                    else {
                        if (this.get('mutedOnce') === null)
                            this.set('mutedOnce', false);

                        if (this.get('volume') === 0) {
                            if (!this.get('muted'))
                                this.set('muted', true);
                            else if (!this.get('mutedOnce'))
                                this.set('mutedOnce', true);
                            else {
                                this.set('mutedOnce', false);
                                this.set('muted', false);
                            }
                        } else {
                            this.set('mutedOnce', false);
                            this.set('muted', false);
                        }
                    }
                };
                PlaybackModel.on('change:volume', PlaybackModel.onVolumeChange);

                PlaybackModel.on('change:media', onMediaChange);
                PlaybackModel._events['change:media'].unshift(PlaybackModel._events['change:media'].pop());

                setTimeout(function () {
                    $('#volume').remove();
                    volume = new VolumeView(that);
                    $('#now-playing-bar').append(volume.$el);
                    volume.render();
                }, 1);
            },
            onVolumeChange: function () {
                PlaybackModel.onVolumeChange();
            },
            get: function (key) {
                return PlaybackModel.get(key);
            },
            set: function (key, value) {
                PlaybackModel.set(key, value);
            },
            mute: function () {
                while (!PlaybackModel.get('muted') || PlaybackModel.get('mutedOnce'))
                    volume.onClick();
            },
            muteOnce: function () {
                while (!PlaybackModel.get('mutedOnce'))
                    volume.onClick();
            },
            unmute: function () {
                while (PlaybackModel.get('muted'))
                    volume.onClick();
            },
            close: function () {}
        });
    }

    return new handler();
});