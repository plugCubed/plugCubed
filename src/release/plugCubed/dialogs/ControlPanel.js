define(['jquery', 'underscore', 'plugCubed/Class', 'plugCubed/Utils'], function($, _, Class, p3Utils) {

    var ControlPanelClass, JQueryElementClass, HeaderClass, ItemClass, PanelClass, ButtonClass, InputClass, $controlPanelDiv, $topBarDiv, $menuDiv, $currentDiv, $closeDiv, scrollPane, shownHeight, _onResize, _onTabClick;
    var tabs = {};

    JQueryElementClass = Class.extend({
        getJQueryElement: function() {
            console.error('Missing getJQueryElement');

            return null;
        }
    });

    HeaderClass = JQueryElementClass.extend({
        init: function(label) {
            this.$div = $('<div>').addClass('p3-header').append($('<span>').text(label));

            return this;
        },
        getJQueryElement: function() {
            return this.$div;
        }
    });

    ItemClass = JQueryElementClass.extend({
        init: function(label) {
            var that = this;
            var cssClass = label.trim().toLowerCase().replace(/ /g, '-');

            this.$div = $('<div>').addClass('p3-item').addClass(cssClass).append($('<i>').addClass('icon icon-check-blue')).append($('<span>').text(label));
            this.$div.click(function() {
                that.onClick();
            });

            return this;
        },
        onClick: function() {
            console.error('Missing onClick');
        },
        changeCheckmark: function(enabled) {
            if (enabled) {
                this.$div.addClass('selected');
            } else {
                this.$div.removeClass('selected');
            }
        },
        getJQueryElement: function() {
            return this.$div;
        }
    });

    ButtonClass = JQueryElementClass.extend({
        init: function(label, submit) {
            var that = this;

            this.$div = $('<div>').addClass('button').text(label);
            if (submit) {
                this.$div.addClass('submit');
            }
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
            if (submit) {
                this.$div.addClass('submit');
            }

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
            if (label) {
                this.$label = $('<div>').addClass('label').text(label);
            }
            this.$input = $('<input>').attr({
                type: type,
                placeholder: placeholder
            });

            if (label) {
                this.$div.append(this.$label);
            }
            this.$div.append(this.$input);
        },
        changeLabel: function(label) {
            this.$div.text(label);

            return this;
        },
        changeSubmit: function(submit) {
            this.$div.removeClass('submit');
            if (submit) {
                this.$div.addClass('submit');
            }

            return this;
        },
        change: function(onChangeFunc) {
            if (typeof onChangeFunc == 'function') {
                this.$div.change(onChangeFunc);
            }

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
            for (var i = 0; i < this._content.length; i++) {
                var $content = this._content[i];

                if ($content instanceof JQueryElementClass) {
                    $content = $content.getJQueryElement();
                }
                scrollPane.getContentPane().append($content);
            }
        }
    });

    ControlPanelClass = Class.extend({
        init: function() {
            _onResize = _.bind(this.onResize, this);
            _onTabClick = _.bind(this.onTabClick, this);
            $(window).resize(_onResize);
            this.shown = false;
        },
        close: function() {
            $(window).off('resize', _onResize);
            if ($controlPanelDiv != null) {

                $controlPanelDiv.remove();
            }
        },
        createControlPanel: function(onlyRecreate) {
            var that = this;

            if ($controlPanelDiv != null) {
                $controlPanelDiv.remove();
            } else if (onlyRecreate) return;

            $controlPanelDiv = $('<div>').attr('id', 'p3-control-panel');

            $menuDiv = $('<div>').attr('id', 'p3-control-panel-menu');

            for (var i in tabs) {
                if (tabs.hasOwnProperty(i)) {
                    $menuDiv.append($('<div>').addClass('p3-control-panel-menu-tab tab-' + i.replace(/ /g, '-')).data('id', i).text(i).click(_onTabClick));
                }
            }

            $topBarDiv = $('<div>').attr('id', 'p3-control-panel-top').append($('<span>').text('Control Panel'));

            $controlPanelDiv.append($topBarDiv).append($menuDiv);

            $currentDiv = $('<div>').attr('id', 'p3-control-panel-current');

            $controlPanelDiv.append($currentDiv);

            $closeDiv = $('<div>').attr('id', 'p3-control-panel-close').append('<i class="icon icon-arrow-up"></i>').click(function() {
                that.toggleControlPanel(false);
            });

            $controlPanelDiv.append($closeDiv);

            $('body').append($controlPanelDiv);
            this.onResize();
        },

        /**
         * Create an input field
         * @param {string} type Type of input field
         * @param {undefined|string} [label] Label for input field
         * @param {undefined|string} [placeholder] Placeholder
         * @returns {*|jQuery} Returns new input field class
         */
        inputField: function(type, label, placeholder) {
            return new InputClass(type, label, placeholder);
        },

        /**
         * @callback onButtonClick
         * @param {object}
         */
        /**
         * Create a button
         * @param {string} label Label for button
         * @param {boolean} submit Adds submit class to button
         * @param {onButtonClick} onClick Function handler for onclick
         * @returns {*|jQuery} Returns new button class
         */
        button: function(label, submit, onClick) {
            var newButton = new ButtonClass(label, submit);

            if (typeof onClick === 'function') {
                newButton.onClick = onClick;
            }

            return newButton;
        },

        /**
         * Create a p3 header
         * @param {string} label Label for header
         * @returns {*|jQuery} Returns new header class
         */
        header: function(label) {
            var newHeader = new HeaderClass(label);

            return newHeader;
        },

        /**
         * @callback onItemClick
         * @param {object}
         */
        /**
         * Create a p3 item
         * @param {string} label Label for item
         * @param {onItemClick} onClick Function handler for onclick
         * @returns {*|jQuery} Returns new item class
         */
        item: function(label, onClick) {
            var newItem = new ItemClass(label);

            if (typeof onClick === 'function') {
                newItem.onClick = onClick;
            }

            return newItem;
        },
        onResize: function() {
            if ($controlPanelDiv == null) return;
            var $panel = $('#playlist-panel');

            shownHeight = $(document).height() - 108;
            $controlPanelDiv.css({
                width: $panel.width(),
                height: this.shown ? shownHeight : 0,
                'z-index': 10000
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
            if ($controlPanelDiv == null) {
                if (typeof shown === 'boolean' && !shown) return;
                this.createControlPanel();
            }
            this.shown = typeof shown === 'boolean' ? shown : !this.shown;
            shownHeight = $(document).height() - 108;

            var that = this;

            $controlPanelDiv.animate({
                height: this.shown ? shownHeight : 0
            }, {
                duration: 350,
                easing: 'easeInOutExpo',
                complete: function() {
                    if (!that.shown && scrollPane != null) {
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

            if (tab == null || !(tab instanceof PanelClass)) return;

            $menuDiv.find('.current').removeClass('current');
            $('.p3-control-panel-menu-tab.tab-' + id.replace(/ /g, '-')).addClass('current');

            if (scrollPane == null) {
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
         * @returns {PanelClass} Returns new tab
         */
        addPanel: function(name) {
            name = name.trim();
            if (tabs[name] != null) return null;
            tabs[name] = new PanelClass(name);
            this.createControlPanel(true);

            return tabs[name];
        },

        /**
         * Remove a tab, if tab exists
         * @param {PanelClass} panel Name of tab
         * @returns {Boolean} Returns true for deleted, false if panel not defined
         */
        removePanel: function(panel) {
            if (!(panel instanceof PanelClass) || tabs[panel.name] == null) return false;
            delete tabs[panel.name];
            this.createControlPanel(true);

            return true;
        }
    });

    return new ControlPanelClass();
});
