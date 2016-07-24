define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RoomSettings'], function(Class, ControlPanel, Styles, RoomSettings) {
    var Handler, $contentDiv, $formDiv, $localFileInput, $clearButton, panel;

    // TODO: add in submit button
    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Background');

            $contentDiv = $('<div>').append($('<p>').text('Set your own room background.'));

            panel.addContent($contentDiv);

            $formDiv = $('<div>').width(500).css('margin', '25px auto auto auto');

            if (window.File && window.FileReader && window.FileList && window.Blob) {
                $localFileInput = ControlPanel.inputField('url', undefined, 'URL To Background').change(function(e) {

                    if (e.target.value != null) {
                        Styles.set('room-settings-background-image', '.room-background { background: url(' + e.target.value + ') fixed center center / cover !important; }');
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
            } else {
                $formDiv.append('Sorry, your browser does not support this');
            }

            panel.addContent($formDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);

            $contentDiv = $formDiv = $localFileInput = panel = null;
        }
    });

    return new Handler();
});
