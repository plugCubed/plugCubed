// ==UserScript==
// @icon         https://plugcubed.net/scripts/48.png
// @name         plugCubedLoader
// @namespace    https://plugcubed.net
// @description  Autorun plugCubed on plug.dj
// @author       Thomas "TAT" Andresen
// @match        https://*.plug.dj/*
// @include      https://*.plug.dj*
// @exclude      https://*.plug.dj/_/*
// @exclude      https://*.plug.dj/@/*
// @exclude      https://*.plug.dj/ba
// @exclude      https://*.plug.dj/dashboard
// @exclude      https://*.plug.dj/plot
// @exclude      https://*.plug.dj/press
// @exclude      https://*.plug.dj/partners
// @exclude      https://*.plug.dj/team
// @exclude      https://*.plug.dj/about
// @exclude      https://*.plug.dj/jobs
// @exclude      https://*.plug.dj/purchase
// @exclude      https://*.plug.dj/subscribe
// @downloadURL  https://plugcubed.net/scripts/plugCubed.user.js
// @updateURL    https://plugcubed.net/scripts/plugCubed.user.js
// @version      2.4
// @grant        none
// ==/UserScript==

/*
 * The MIT License (MIT)
 * Copyright (c) 2012-2018 The plugCubed Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var a = function() {
    var b = {
        c: function() {
            if (typeof API !== 'undefined' && API.enabled) {
                this.d();
            } else {
                setTimeout(function() {
                    b.c();
                }, 100);
            }
        },
        d: function() {
            $.getScript('https://plugcubed.net/scripts/release/plugCubed.min.js')
                .done(function() {
                    console.log('[plug³ UserScript] Loaded');
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    console.error('[plug³ UserScript] Error loading plug³ ' + jqXHR.status);
                });
        }
    };

    b.c();
};

var b = document.createElement('script');

b.textContent = '(' + a.toString() + ')();';
document.head.appendChild(b);
