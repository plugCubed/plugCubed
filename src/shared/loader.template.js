/**
 * @author  JTBrinkmann
 * @author  Chikachi
 * @author  Colgate
 * @author  ReAnna
 * @author  Thedark1337
 *
 * @version VERSION.MAJOR.VERSION.MINOR.VERSION.PATCH-VERSION.BUILD+VERSION.PRERELEASE
 *
 * @license Copyright © 2012-%YEAR% The plug³ Team and other contributors
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */

/**
 * Loader File adapted from ReAnna's ExtPlug
 */

;(function loading() {
    if (!(~window.location.hostname.indexOf('plug.dj'))) return alert('Loading plug³ outside of plug.dj is not supported.');

    // Fixes some analytics issues when using tracking / ad blockers
    window.Intercom = window.Intercom || {};
    window.amplitude = window.amplitude || { __VERSION__: 1337 };

    if (isLoaded()) {

        var requirejs = window.requirejs;
        var require = window.require;
        var define = window.define;
        var plugCubed = window.plugCubed;

        if (typeof plugCubed !== 'undefined') {
            plugCubed.close();
        }

        // CODE_TO_REPLACE

        require(['plugCubed/Loader'], function(Loader) {
            window.plugCubed = new Loader();
            if  (typeof console.time === 'function') console.time('[plug³] Loaded')
        });
    } else {
        setTimeout(loading, 20);
    }

    function isLoaded() {
        return window.require && window.define && window.API && window.jQuery && window.jQuery('#room').length > 0;
    }
})();
