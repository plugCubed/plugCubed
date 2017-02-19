define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RoomSettings'], function(Class, ControlPanel, Styles, RoomSettings) {
    var Handler, $contentDiv, $formDiv, $localFileInput, $clearButton, panel;

    // TODO: add in submit button
    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Background');

            $contentDiv = $('<div>').append($('<p>').text('Set your own room background.'));

            panel.addContent($contentDiv);

            $formDiv = $('<div>').width(500).css('margin', '25px auto auto auto');
            $localFileInput = ControlPanel.inputField('url', undefined, 'URL To Background').change(function(e) {

                if (e.target.value != null) {
                    var url = e.target.value;
                    var reg = /\.(jpeg|jpg|gif|png)$/;

                    if (!reg.test(url)) return false;
                    $.get(url, function (dat, stat) {
                        if (stat === 'success') {
                            Styles.set('room-settings-background-image', '.room-background { background: url(' + p3Utils.proxifyImage(url) + ') fixed center center / cover !important; }');
                            $clearButton.changeSubmit(true);

                            return;
                        }
                    });
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
