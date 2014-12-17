define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RoomSettings'], function(Class, ControlPanel, Styles, RoomSettings) {
    var handler, $contentDiv, $formDiv, $localFileInput, $clearButton, panel;

    handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Background');

            $contentDiv = $('<div>').append($('<p>').text('Set your own room background.'));

            panel.addContent($contentDiv);

            $formDiv = $('<div>').width(500).css('margin', '25px auto auto auto');

            if (window.File && window.FileReader && window.FileList && window.Blob) {
                $localFileInput = ControlPanel.inputField('file', undefined, 'Local file').change(function(e) {
                    var files = e.target.files;

                    for (var i = 0, f; f = files[i]; i++) {
                        // Only process image files.
                        if (!f.type.match('image.*')) {
                            continue;
                        }

                        var reader = new FileReader();

                        // Closure to capture the file information.
                        reader.onload = function(e) {
                            Styles.set('room-settings-background-image', '.room-background { background-image: url(' + e.target.result + ')!important; }');
                        };

                        // Read in the image file as a data URL.
                        reader.readAsDataURL(f);

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

    return new handler();
});