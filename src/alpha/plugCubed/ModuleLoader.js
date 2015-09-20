/**
 * Thank you to ReAnna https://github.com/goto-bus-stop and Yemasthui https://github.com/Yemasthui
 **/

define(['plugCubed/Class', 'underscore', 'backbone'], function(Class, _, backbone) {

    var modules = require.s.contexts._.defined;
    var iterator;
    var collectionConstructor = backbone.Collection;
    var modelConstructor = backbone.Model;
    var viewConstructor = backbone.View;

    var moduleLoader = Class.extend({
        iterate: function(a, c) {
            if (!_.isObject(c) || !_.isObject(a)) return false;
            var d;
            for (d in a) {
                if (a.hasOwnProperty(d)) {
                    if (_.isObject(a[d])) {
                        if (!this.iterate(a[d], c[d])) return false;
                    } else if ((typeof c[d]).toLowerCase() !== a[d].toLowerCase()) return false;
                }
                return true;
            }
        },
        getModule: function(a) {
            for (iterator in modules) {
                if (modules.hasOwnProperty(iterator)) {
                    var module = modules[iterator];
                    if (this.iterate(a, module)) return module;
                }
            }
        },
        getEvent: function(event) {
            for (iterator in modules) {
                if (modules.hasOwnProperty(iterator) && modules[iterator] && modules[iterator]._name === event) return modules[iterator];
            }
        },
        getView: function(identifier) {
            for (iterator in modules) {
                if (modules.hasOwnProperty(iterator)) {
                    var module = modules[iterator];
                    var idMatch;
                    var classMatch;
                    if (!module) continue;

                    if (module.prototype && _.isFunction(module.prototype.render) && _.isFunction(module.prototype.$) && !identifier.isBackbone) {
                        idMatch = identifier.id && module.prototype.id === identifier.id;
                        classMatch = identifier.className && module.prototype.className === identifier.className;

                        var templateMatch = identifier.isTemplate && module.prototype.template === require(identifier.template);
                        var idFunction = identifier.func && _.isFunction(module.prototype[identifier.func]) && idMatch;
                        var classFunction = identifier.func && _.isFunction(module.prototype[identifier.func]) && classMatch;
                        var objMatch;

                        if (identifier.objMatch && identifier.objMatch.length) {
                            for (var i in identifier.objMatch) {
                                if (identifier.objMatch.hasOwnProperty(i) && identifier.objMatch[i] in module.prototype)
                                    objMatch = true;
                            }
                        }

                        if (identifier.objMatch && objMatch) {
                            if (module.prototype.collection === 'undefined' && module.prototype.eventName === 'undefined') return module;
                        }
                        if ((!identifier.func && classMatch) || (!identifier.func && idMatch) || (!identifier.func && templateMatch) || (identifier.func && idFunction) || (identifier.func && classFunction)) return module;

                    } else if (identifier.isBackbone) {

                        idMatch = identifier.id && module.id === identifier.id;
                        classMatch = identifier.className && module.className === identifier.className;

                        var backboneId = module instanceof backbone.View && idMatch;
                        var backboneClass = module instanceof viewConstructor && classMatch;

                        if ((idMatch && backboneId) || (classMatch && backboneClass)) return module;
                        if (identifier.isModel && module instanceof modelConstructor && _.isString(module.get('description'))) return module;
                    }
                }
            }
        },
        getCollection: function(identifier) {
            for (iterator in modules) {
                if (modules.hasOwnProperty(iterator)) {
                    var module = modules[iterator];
                    if (!module || !(module instanceof collectionConstructor)) continue;
                    if (identifier.comparator && module.comparator) {
                        if (identifier.comparator === module.comparator) return module;
                    }
                }
            }
        }
    });
    return new moduleLoader();
});
