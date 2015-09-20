/*eslint-disable */

/**
 Simple JavaScript Inheritance
 By John Resig http://ejohn.org/
 MIT Licensed.

 Modified by Plug DJ, Inc.
 */
define(function() {
    var e;
    var t;
    var n;
    e = false;
    t = /xyz/.test(function() {
        xyz
    }) ? /\b_super\b/ : /.*/;
    n = function() {};
    n.extend = function(n) {
        var r = this.prototype;

        e = true;
        var i = new this;
        e = false;

        for (var s in n) {
            if (!n.hasOwnProperty(s)) continue;
            if (typeof n[s] == "function" && typeof r[s] == "function" && t.test(n[s])) {
                i[s] = function(e, t) {
                    return function() {
                        var n = this._super;
                        this._super = r[e];
                        var i = t.apply(this, arguments);
                        this._super = n;
                        return i;
                    }
                }(s, n[s]);
            } else {
                i[s] = n[s];
            }
        }

        function Class() {
            !e && this.init && this.init.apply(this, arguments);
        }

        Class.prototype = i;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        return Class;
    };
    return n;
});
