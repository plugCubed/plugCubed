define(['jquery', 'plugCubed/Class'], function($, Class) {
    return Class.extend({
        init: function(min, max, val, callback) {
            this.min = min ? min : 0;
            this.max = max ? max : 100;
            this.value = val ? val : this.min;
            this.cb = callback;

            this.startBind = $.proxy(this.onStart, this);
            this.moveBind = $.proxy(this.onUpdate, this);
            this.stopBind = $.proxy(this.onStop, this);
            this.clickBind = $.proxy(this.onClick, this);

            this.$slider = $('<div class="p3slider"><div class="line"></div><div class="circle"></div><div class="hit"></div></div>');
            this.$line = this.$slider.find('.line');
            this.$hit = this.$slider.find('.hit');
            this.$circle = this.$slider.find('.circle');

            this.$hit.mousedown(this.startBind);

            this._max = this.$hit.width() - this.$circle.width();
            this.onChange();

            return this;
        },
        onStart: function(event) {
            this._min = this.$hit.offset().left;
            this._max = this.$hit.width() - this.$circle.width();
            $(document).on('mouseup', this.stopBind).on('mousemove', this.moveBind);

            return this.onUpdate(event);
        },
        onUpdate: function(event) {
            this.value = Math.max(this.min, Math.min(this.max, ~~((this.max - this.min) * ((event.pageX - this._min) / this._max)) + this.min));
            this.onChange();
            event.preventDefault();
            event.stopPropagation();

            return false;
        },
        onStop: function(event) {
            $(document).off('mouseup', this.stopBind).off('mousemove', this.moveBind);
            event.preventDefault();
            event.stopPropagation();

            return false;
        },
        onChange: function() {
            this.$circle.css('left', this.$hit.position().left + (this.$line.width() || 85) * ((this.value - this.min) / (this.max - this.min)) - this.$circle.width() / 2);
            if (typeof this.cb === 'function') this.cb(this.value);
        }
    });
});
