define(['jquery', 'underscore', 'plugCubed/Class'], function($, _, Class) {
    var ControlPanelClass, JQueryElementClass;

    var PanelClass, ButtonClass, InputClass;

    var $controlPanelDiv, $topBarDiv, $menuDiv, $currentDiv, $closeDiv, scrollPane, shownHeight, tabs = {}, _this, _onResize, _onTabClick;

    JQueryElementClass = Class.extend({
        getJQueryElement: function() {
            console.error('Missing getJQueryElement');
            return null;
        }
    });

    ButtonClass = JQueryElementClass.extend({
        init: function(label, submit) {
            var that = this;
            this.$div = $('<div>').addClass('button').text(label);
            if (submit)
                this.$div.addClass('submit');
            this.$div.click(function() {
                that.onClick();
            });
            return this;
        },
        changeLabel: function(label) {
            this.$div.text(label);
            return this;
        },
        changeSubmit: function(submit) {
            this.$div.removeClass('submit');
            if (submit)
                this.$div.addClass('submit');
            return this;
        },
        onClick: function() {
            console.error('Missing onClick');
        },
        getJQueryElement: function() {
            return this.$div;
        }
    });

    InputClass = JQueryElementClass.extend({
        init: function(type, label, placeholder) {
            this.$div = $('<div>').addClass('input-group');
            if (label)
                this.$label = $('<div>').addClass('label').text(label);
            this.$input = $('<input>').attr({
                type: type,
                placeholder: placeholder
            });

            if (label)
                this.$div.append(this.$label);
            this.$div.append(this.$input);
        },
        changeLabel: function(label) {
            this.$div.text(label);
            return this;
        },
        changeSubmit: function(submit) {
            this.$div.removeClass('submit');
            if (submit)
                this.$div.addClass('submit');
            return this;
        },
        change: function(onChangeFunc) {
            if (typeof onChangeFunc == 'function')
                this.$div.change(onChangeFunc);
            return this;
        },
        getJQueryElement: function() {
            return this.$div;
        }
    });

    PanelClass = Class.extend({
        init: function(name) {
            this._content = [];
            this.name = name;
        },
        addContent: function(content) {
            if (content instanceof $) {
                this._content.push(content);
            }
        },
        print: function() {
            for (var i in this._content) {
                if (!this._content.hasOwnProperty(i)) continue;
                var $content = this._content[i];
                if ($content instanceof JQueryElementClass)
                    $content = $content.getJQueryElement();
                scrollPane.getContentPane().append($content);
            }
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
            if ($controlPanelDiv !== null)
                $controlPanelDiv.remove();
        },
        createControlPanel: function(onlyRecreate) {
            if ($controlPanelDiv !== null) {
                $controlPanelDiv.remove();
            } else if (onlyRecreate) return;
            $controlPanelDiv = $('<div>').attr('id', 'p3-control-panel');

            $menuDiv = $('<div>').attr('id', 'p3-control-panel-menu');

            for (var i in tabs) {
                if (tabs.hasOwnProperty(i)) {
                    $menuDiv.append($('<div>').addClass('p3-control-panel-menu-tab tab-' + i).data('id', i).text(i).click(_onTabClick));
                }
            }

            $topBarDiv = $('<div>').attr('id', 'p3-control-panel-top').append($('<span>').text('Control Panel'));

            $controlPanelDiv.append($topBarDiv).append($menuDiv);

            $currentDiv = $('<div>').attr('id', 'p3-control-panel-current');

            $controlPanelDiv.append($currentDiv);

            $closeDiv = $('<div>').attr('id', 'p3-control-panel-close').append('<i class="icon icon-arrow-down"></i>').click(function() {
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
            return new InputClass(type, label, placeholder);
        }, /**
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
            var newButton = new ButtonClass(label, submit);
            if (typeof onClick === 'function')
                newButton.onClick = onClick;
            return newButton;
        },
        onResize: function() {
            if ($controlPanelDiv === null) return;
            var $panel = $('#playlist-panel'), shownHeight = $(window).height() - 150;

            $controlPanelDiv.css({
                width: $panel.width(),
                height: this.shown ? shownHeight : 0,
                'z-index': 50
            });

            $currentDiv.css({
                width: $panel.width() - 256 - 20,
                height: this.shown ? shownHeight - $topBarDiv.height() - 20 : 0
            });

            if (this.shown && scrollPane) {
                scrollPane.reinitialise();
            }
        },
        toggleControlPanel: function(shown) {
            if ($controlPanelDiv === null) {
                if (shown !== null && !shown) return;
                this.createControlPanel();
            }
            this.shown = shown !== null ? shown : !this.shown;
            shownHeight = $(window).height() - 150;
            $controlPanelDiv.animate({
                height: this.shown ? shownHeight : 0
            }, {
                duration: 350,
                easing: 'easeInOutExpo',
                complete: function() {
                    if (!_this.shown) {
                        $controlPanelDiv.detach();
                        $controlPanelDiv = null;
                        scrollPane.destroy();
                        scrollPane = null;
                    }
                }
            });
        },
        onTabClick: function(e) {
            this.openTab($(e.currentTarget).data('id'));
        },
        openTab: function(id) {
            this.toggleControlPanel(true);
            var tab = tabs[id];
            if (tab === null || !(tab instanceof PanelClass)) return;

            $menuDiv.find('.current').removeClass('current');
            $('.p3-control-panel-menu-tab.tab-' + id).addClass('current');

            if (scrollPane === null) {
                $currentDiv.jScrollPane({
                    showArrows: true
                });
                scrollPane = $currentDiv.data('jsp');
            }

            scrollPane.getContentPane().html('');
            tab.print();

            this.onResize();
        },
        /**
         * Add a new tab, if it doesn't already exists
         * @param {string} name Name of tab
         * @returns {PanelClass}
         */
        addPanel: function(name) {
            name = name.trim();
            if (tabs[name] !== null) return null;
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
            if (!(panel instanceof PanelClass) || tabs[panel.name] === null) return false;
            delete tabs[panel.name];
            this.createControlPanel(true);
            return true;
        }
    });
    return new ControlPanelClass();
});