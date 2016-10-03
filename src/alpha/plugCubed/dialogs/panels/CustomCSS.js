define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RoomSettings'], function(Class, ControlPanel, Styles, RoomSettings) {
    var Handler, $contentDiv, $formDiv, $localFileInput, $clearButton, panel;

    // TODO: add in submit button
    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Custom CSS');

            $contentDiv = $('<div>').append($('<p>').text('Set your own room CSS.'));

            panel.addContent($contentDiv);

            $formDiv = $('<div>').width(500).css('margin', '25px auto auto auto');
            $localFileInput = ControlPanel.inputField('textbox', undefined, 'Custom CSS to add').change(function(e) {

                if (e.target.value != null) {
                    Styles.set('room-settings-custom-css', e.target.value);
                    $clearButton.changeSubmit(true);

                    return;
                }
                $clearButton.changeSubmit(false);
            });

            $clearButton = ControlPanel.button('Clear', false, function() {
                RoomSettings.execute();
                $clearButton.changeSubmit(false);
            });

            $formDiv.append($localFileInput.getJQueryElement()).append($clearButton.getJQueryElement());

            panel.addContent($formDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);

            $contentDiv = $formDiv = $localFileInput = panel = null;
        }
    });

    return new Handler();
});
