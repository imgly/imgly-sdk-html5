/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Helper function to correctly set up the prototype chain
 * Based on the backbone.js extend function:
 * https://github.com/jashkenas/backbone/blob/master/backbone.js
 * @param  {Object} prototypeProperties
 * @param  {Object} classProperties
 * @return {Object}
 */
module.exports = function (prototypeProperties, classProperties) {
  /*jshint validthis:true*/
  var parent = this
  var child

  // The constructor function for the new subclass is either defined by you
  // (the 'constructor' property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (prototypeProperties && prototypeProperties.hasOwnProperty('constructor')) {
    child = prototypeProperties.constructor
  } else {
    child = function () { return parent.apply(this, arguments) }
  }

  // Add static properties to the constructor function, if supplied.
  var key
  for (key in parent) {
    child[key] = parent[key]
  }
  if (typeof classProperties !== 'undefined') {
    for (key in classProperties) {
      child[key] = classProperties[key]
    }
  }

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  var Surrogate = function () { this.constructor = child }
  Surrogate.prototype = parent.prototype
  child.prototype = new Surrogate()

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (prototypeProperties) {
    for (key in prototypeProperties) {
      child.prototype[key] = prototypeProperties[key]
    }
  }

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype

  return child
}
