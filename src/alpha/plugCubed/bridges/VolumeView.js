/**
 * Modified version of plug.dj's VolumeView
 * VolumeView copyright (C) 2014 by Plug DJ, Inc.
 */
define(['jquery', 'plugCubed/Lang', 'plugCubed/Utils'], function($, p3Lang, p3Utils) {
    var Context = window.plugCubedModules.context;
    var Original = window.plugCubedModules.Volume;
    var _PlaybackModel;

    return Original.extend({
        initialize: function(PlaybackModel) {
            _PlaybackModel = PlaybackModel;
            this._super();
        },
        render: function() {
            this._super();
            this.$('.button').mouseover(function() {
                if (typeof window.plugCubed !== 'undefined') {
                    if (_PlaybackModel.get('mutedOnce')) {
                        Context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), $(this), true);
                    } else if (_PlaybackModel.get('muted')) {
                        Context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), $(this), true);
                    }
                }
            }).mouseout(function() {
                if (typeof window.plugCubed !== 'undefined') {
                    Context.trigger('tooltip:hide');
                }
            });
            this.onChange();

            return this;
        },
        remove: function() {
            this._super();
            var volume = new Original();

            $('#now-playing-bar').append(volume.$el);
            volume.render();
        },
        onClick: function() {
            if (_PlaybackModel.get('mutedOnce')) {
                _PlaybackModel.set('volume', _PlaybackModel.get('lastVolume'));
            } else if (_PlaybackModel.get('muted')) {
                _PlaybackModel.onVolumeChange();
                this.onChange();
            } else if (_PlaybackModel.get('volume') > 0) {
                _PlaybackModel.set({
                    lastVolume: _PlaybackModel.get('volume'),
                    volume: 0
                });
            }
            if (typeof window.plugCubed !== 'undefined') {
                Context.trigger('tooltip:hide');
                if (_PlaybackModel.get('mutedOnce')) {
                    Context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), this.$('.button'), true);
                } else if (_PlaybackModel.get('muted')) {
                    Context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), this.$('.button'), true);
                } else {
                    Context.trigger('tooltip:hide');
                }
            }
        },
        onChange: function() {
            var currentVolume = _PlaybackModel.get('volume');

            this.$span.text(currentVolume + '%');
            this.$circle.css('left', (parseInt(this.$hit.css('left'), 10) + (this.max * (currentVolume / 100))) - (this.$circle.width() / 2));
            if (currentVolume > 60 && !this.$icon.hasClass('icon-volume-on')) {
                this.$icon.removeClass().addClass('icon icon-volume-on');
            } else if (currentVolume > 0 && !this.$icon.hasClass('icon-volume-half')) {
                this.$icon.removeClass().addClass('icon icon-volume-half');
            } else if (currentVolume === 0) {
                if (_PlaybackModel.get('mutedOnce')) {
                    if (!this.$icon.hasClass('icon-volume-off-once')) {
                        this.$icon.removeClass().addClass('icon icon-volume-off-once');
                    }
                } else if (!this.$icon.hasClass('icon-volume-off')) {
                    this.$icon.removeClass().addClass('icon icon-volume-off');
                }
            }
        }
    });
});
