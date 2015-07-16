define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/bridges/VolumeView', 'plugCubed/ModuleLoader'], function(Class, p3Utils, p3Lang, VolumeView, ModuleLoader) {
    var handler, that, volume;

    var PlaybackModel = ModuleLoader.getModule({
            onElapsedChange: 'function'
        });

    function onMediaChange() {
        if (PlaybackModel.get('mutedOnce') === true)
            PlaybackModel.set('volume', PlaybackModel.get('lastVolume'));
    }

    handler = Class.extend({
        init: function() {
            that = this;
            PlaybackModel.off('change:volume', PlaybackModel.onVolumeChange);
            PlaybackModel.onVolumeChange = function() {
                if (typeof plugCubed === 'undefined') {
                    this.set('muted', this.get('volume') === 0);
                } else {
                    if (this.get('mutedOnce') == null)
                        this.set('mutedOnce', false);

                    if (this.get('volume') === 0) {
                        if (!this.get('muted')) {
                            this.set('muted', true);
                        } else if (!this.get('mutedOnce')) {
                            this.set('mutedOnce', true);
                        }
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

            setTimeout(function() {
                $('#volume').remove();
                volume = new VolumeView(that);
                $('#now-playing-bar').append(volume.$el);
                volume.render();
            }, 1);
        },
        onVolumeChange: function() {
            PlaybackModel.onVolumeChange();
        },
        get: function(key) {
            return PlaybackModel.get(key);
        },
        set: function(key, value) {
            PlaybackModel.set(key, value);
        },
        mute: function() {
            while (!PlaybackModel.get('muted') || PlaybackModel.get('mutedOnce'))
                volume.onClick();
        },
        muteOnce: function() {
            while (!PlaybackModel.get('mutedOnce'))
                volume.onClick();
        },
        unmute: function() {
            while (PlaybackModel.get('muted'))
                volume.onClick();
        },
        close: function() {}
    });

    return new handler();
});
