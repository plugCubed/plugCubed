// ==UserScript==
// @name           plugCubedLoader
// @namespace      TAT
// @description    Autorun plugCubed on plug.dj
// @author         Jeremy "Colgate" Richardson
// @author         Thomas "TAT" Andresen
// @include        http://plug.dj/*
// @version        1.2
// ==/UserScript==

/*
Copyright © 2012-2013 by Jeremy "Colgate" Richardson and Thomas "TAT" Andresen

Permission to use and/or distribute this software for any purpose without fee is hereby granted,
provided that the above copyright notice and this permission notice appear in all copies.

Permission to copy and/or edit this software or parts of it for any purpose is NOT permitted
without written permission by the authors.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHORS DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE
INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHORS BE LIABLE
FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

var script = document.createElement("script");
script.textContent = "if (typeof Class !== 'undefined' && typeof Slug !== 'undefined') {" +
    "var plugCubedLoader = Class.extend({" +
        "init: function() {if (typeof Slug !== 'undefined') this.wait();}," +
        "wait: function() {if (typeof API !== 'undefined' && API.isReady) this.run(); else setTimeout($.proxy(this.wait,this),100);}," +
        "run: function() {console.log('plugCubedLoader v.1.2 enabled!');var a = document.createElement('script');a.setAttribute('id','plugcubed-js');document.body.appendChild(a);a.setAttribute('src','http://tatdk.github.com/plugCubed/compiled/plugCubed.min.js');}" +
    "});" +
    "_PCL = new plugCubedLoader(); }";
document.head.appendChild(script);