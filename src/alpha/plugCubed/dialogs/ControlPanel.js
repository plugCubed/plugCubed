define(['jquery', 'underscore', 'plugCubed/Class'], function($, _, Class) {
    var $controlPanelDiv, $menuDiv, $currentDiv, $closeDiv, shownHeight, ControlPanelClass, PanelClass, tabs = {}, _this, _onResize, _onTabClick;

    PanelClass = Class.extend({
        _content: [],
        name: '',
        init: function(name) {
            this.name = name;
        },
        addContent: function(content) {
            if (content instanceof $) {
                this._content.push(content);
            }
        },
        print: function() {
            return this._content.join('');
        }
    });

    ControlPanelClass = Class.extend({
        init: function() {
            _this = this;
            _onResize = _.bind(this.onResize, this);
            _onTabClick = _.bind(this.onTabClick, this);

            $(window).resize(_onResize);

            this.shown = false;
        },
        close: function() {
            $(window).off('resize', _onResize);
            if ($controlPanelDiv !== undefined)
                $controlPanelDiv.remove();
        },
        createControlPanel: function(onlyRecreate) {
            if ($controlPanelDiv !== undefined) {
                $controlPanelDiv.remove();
            } else if (onlyRecreate) return;
            $controlPanelDiv = $('<div>').attr('id', 'p3-control-panel');

            $menuDiv = $('<div>').attr('id', 'p3-control-panel-menu');

            for (var i in tabs) {
                if (tabs.hasOwnProperty(i)) {
                    $menuDiv.append($('<div>').addClass('p3-control-panel-menu-tab').data('id', i).text(i).click(_onTabClick));
                }
            }

            $controlPanelDiv.append($menuDiv);

            $currentDiv = $('<div>').attr('id', 'p3-control-pannel-current');

            $controlPanelDiv.append($currentDiv);

            $closeDiv = $('<div>').attr('id', 'p3-control-panel-close').append('<i class="icon icon-playlist-close"></i>').click(function() {
                _this.toggleControlPanel(false);
            });

            $controlPanelDiv.append($closeDiv);

            $('body').append($controlPanelDiv);
            this.onResize();
        },
        /**
         * Create an input field
         * @param {string} type Type of input field
         * @param {undefined|string} [label]
         * @param {undefined|string} [placeholder] Placeholder
         * @returns {*|jQuery}
         */
        inputField: function(type, label, placeholder) {
            var $div, $label, $input;

            $div = $('<div>').addClass('input-group');
            if (label)
                $label = $('<div>').addClass('label').text(label);
            $input = $('<input>').attr({
                type: type,
                placeholder: placeholder
            });

            if (label)
                $div.append($label);
            $div.append($input);
            return $div;
        },
        /**
         * This callback type is called `requestCallback` and is displayed as a global symbol.
         *
         * @callback onButtonClick
         * @param {object}
         */
        /**
         * Create a button
         * @param {string} label
         * @param {boolean} submit
         * @param {onButtonClick} onClick
         * @returns {*|jQuery}
         */
        button: function(label, submit, onClick) {
            var $div = $('<div>').addClass('button').text(label);
            if (submit)
                $div.addClass('submit');
            if (typeof onClick === 'function')
                $div.click(onClick);
            return $div;
        },
        onResize: function() {
            if ($controlPanelDiv === undefined) return;
            var $panel = $('#playlist-panel'), shownHeight = $(window).height() - 150;
            $controlPanelDiv.css({
                width: $panel.width(),
                height: this.shown ? shownHeight : 0,
                'z-index': 50
            });
            $currentDiv.css({
                width: $panel.width() - 256 - 20,
                height: this.shown ? shownHeight - 20 : 0
            });
        },
        toggleControlPanel: function(shown) {
            if ($controlPanelDiv === undefined) {
                if (shown !== undefined && !shown) return;
                this.createControlPanel();
            }
            this.shown = shown !== undefined ? shown : !this.shown;
            shownHeight = $(window).height() - 150;
            $controlPanelDiv.animate({
                height: this.shown ? shownHeight : 0
            }, {
                duration: 350,
                easing: 'easeInOutExpo',
                complete: function() {
                    if (!_this.shown) {
                        $controlPanelDiv.detach();
                        $controlPanelDiv = undefined;
                    }
                }
            });
        },
        onTabClick: function(e) {
            var $this = $(e.currentTarget);
            var tab = tabs[$this.data('id')];
            if (tab === undefined || !(tab instanceof PanelClass)) return;
            $menuDiv.find('.current').removeClass('current');
            $this.addClass('current');
            $currentDiv.html('');
            tab.print();
        },
        /**
         * Add a new tab, if it doesn't already exists
         * @param {string} name Name of tab
         * @returns {PanelClass}
         */
        addPanel: function(name) {
            name = name.trim();
            if (tabs[name] !== undefined) return null;
            tabs[name] = new PanelClass(name);
            this.createControlPanel(true);
            return tabs[name];
        },
        /**
         * Remove a tab, if tab exists
         * @param {PanelClass} panel Name of tab
         * @returns {Boolean}
         */
        removePanel: function(panel) {
            if (!(panel instanceof PanelClass) || tabs[panel.name] === undefined) return false;
            delete tabs[panel.name];
            this.createControlPanel(true);
            return true;
        }
    });
    return new ControlPanelClass();
});