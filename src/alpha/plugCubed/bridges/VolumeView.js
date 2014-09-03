/**
 Modified version of plug.dj's VolumeView
 VolumeView copyright (C) 2014 by Plug DJ, Inc.
 */
define(['jquery', 'plugCubed/Lang', 'plugCubed/Utils', 'plugCubed/bridges/Context'], function($, p3Lang, p3Utils, _$context) {
    if (p3Utils.runLite) return null;
    var original = require('app/views/room/playback/VolumeView'), _PlaybackModel;

    return original.extend({
        initialize: function(PlaybackModel) {
            _PlaybackModel = PlaybackModel;
            this._super();
        },
        render: function() {
            this._super();
            this.$('.button').mouseover(function() {
                if (typeof plugCubed !== 'undefined') {
                    if (_PlaybackModel.get('mutedOnce')) {
                        _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), $(this), true);
                    } else if (_PlaybackModel.get('muted')) {
                        _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), $(this), true);
                    }
                }
            }).mouseout(function() {
                if (typeof plugCubed !== 'undefined')
                    _$context.trigger('tooltip:hide');
            });
            this.onChange();
            return this;
        },
        remove: function() {
            this._super();
            var volume = new original();
            $('#now-playing-bar').append(volume.$el);
            volume.render();
        },
        onClick: function() {
            if (typeof plugCubed !== 'undefined') {
                _$context.trigger('tooltip:hide');
                if (_PlaybackModel.get('muted')) {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), this.$('.button'), true);
                } else if (!_PlaybackModel.get('mutedOnce')) {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), this.$('.button'), true);
                } else {
                    _$context.trigger('tooltip:hide');
                }
            }

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
        },
        onChange: function() {
            var currentVolume = _PlaybackModel.get('volume');
            this.$span.text(currentVolume + '%');
            this.$circle.css('left', parseInt(this.$hit.css('left')) + this.max * (currentVolume / 100) - this.$circle.width() / 2);
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