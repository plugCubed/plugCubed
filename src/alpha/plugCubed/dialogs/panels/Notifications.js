define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RSS'], function(Class, ControlPanel, Styles, RSS) {
    var handler, $contentDiv, $formDiv, $localFileInput;

    handler = Class.extend({
        register: function() {
            ControlPanel.addPanel('Notifications');

            $contentDiv = $('<div>').append($('<p>').text('Control which notifications you want and how you want them.'));

            ControlPanel.addToPanel('Notifications', $contentDiv);

            $formDiv = $('<div>').width(500).css('margin', '25px auto auto auto');

            if (window.File && window.FileReader && window.FileList && window.Blob) {
                $localFileInput = ControlPanel.inputField('file', undefined, 'Local file').change(function(e) {
                    if (!(function() {
                            var files = e.target.files;

                            for (var i = 0, f; f = files[i]; i++) {
                                // Only process image files.
                                if (!f.type.match('image.*')) {
                                    continue;
                                }

                                var reader = new FileReader();

                                // Closure to capture the file information.
                                reader.onload = function(e) {
                                    //Styles.set('rss-background-image', '.room-background { background-image: url(' + e.target.result + ')!important; }');
                                };

                                // Read in the image file as a data URL.
                                reader.readAsDataURL(f);
                                return true;
                            }
                            return false;
                        })()) {
                        RSS.execute();
                    }
                });
                $formDiv.append($localFileInput);
            }

            ControlPanel.addToPanel('Notifications', $formDiv);
        },
        close: function() {
            ControlPanel.removePanel('Notifications');
        }
    });
    return new handler();
});