define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RoomSettings', 'plugCubed/Settings'], function(Class, ControlPanel, Styles, RoomSettings, Settings) {
    var Handler, $contentDiv, $formDiv, $localCSSInput, $submitButton, $clearButton, panel;

    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Custom CSS');

            $contentDiv = $('<div>').append($('<p>').text('Set your own room CSS.'));

            panel.addContent($contentDiv);

            $formDiv = $('<p>').width(500).css({
                margin: '25px auto auto auto',
                width: '90%'
            });
            $localCSSInput = $('<textarea>').attr({
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                mutliline: true,
                spellcheck: false,
                id: 'p3-custom-css-textarea',
                newlines: 'pasteintact',
                class: 'p3-textarea'
            });

            $submitButton = ControlPanel.button('Submit', true, function() {
                var $textarea = $('#p3-custom-css-textarea');

                if (typeof $textarea.val() === 'string' && $textarea.val().length > 0) {
                    Styles.set('room-settings-custom-css', $textarea.val());
                    Settings.customCSS = $textarea.val();
                    Settings.save();
                    this.changeSubmit(false);
                } else {
                    this.changeSubmit(true);
                }
            });
            $clearButton = ControlPanel.button('Clear', false, function() {
                var $textarea = $('#p3-custom-css-textarea');

                if (typeof $textarea.val() === 'string' && $textarea.val().length > 0) {
                    Styles.unset('room-settings-custom-css');
                    Settings.customCSS = '';
                    Settings.save();
                    $textarea.val('');
                    this.changeSubmit(true);
                } else {
                    this.changeSubmit(false);
                }
            });

            if (typeof Settings.customCSS === 'string' && Settings.customCSS.length > 0) {
                $localCSSInput.val(Settings.customCSS);
                $submitButton.changeSubmit(true);
                $clearButton.changeSubmit(true);
            }

            $formDiv.append($localCSSInput).append($submitButton.getJQueryElement().css({
                float: 'left'
            })).append($clearButton.getJQueryElement().css({
                float: 'right'
            }));

            panel.addContent($formDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);

            $contentDiv = $formDiv = $localCSSInput = panel = null;
        }
    });

    return new Handler();
});

