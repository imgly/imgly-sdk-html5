"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

module.exports = function(prototypeProperties, classProperties) {
  /*jshint validthis:true*/
  var parent = this;
  var name, prop;

  if (typeof classProperties === "undefined") {
    classProperties = {};
  }

  // Constructor
  function child() {
    parent.apply(this, arguments);
  }

  // Copy static properties
  for (name in parent) {
    prop = parent[name];
    child[name] = prop;
  }

  // Inherit from parent while avoiding that the
  // parent's constructor is called
  function Surrogate() {
    this.constructor = child;
  }
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  // Copy prototype properties
  for (name in prototypeProperties) {
    prop = prototypeProperties[name];
    child.prototype[name] = prop;
  }

  // Copy class properties
  for (name in classProperties) {
    prop = classProperties[name];
    child[name] = prop;
  }

  return child;
};
