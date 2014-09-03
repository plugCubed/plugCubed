define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RSS'], function(Class, ControlPanel, Styles, RSS) {
    var handler, $contentDiv, $formDiv, $localFileInput;

    handler = Class.extend({
        register: function() {
            ControlPanel.addTab('Background');

            $contentDiv = $('<div>').append($('<p>').text('Set your own room background.'));

            ControlPanel.addToTab('Background', $contentDiv);

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
                                        Styles.set('rss-background-image', 'body { background-image: url(' + e.target.result + ')!important; }');
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

            ControlPanel.addToTab('Background', $formDiv);
        },
        close: function() {
            ControlPanel.removeTab('Background');
        }
    });
    return new handler();
});