"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Provides utility functions for internal use
 * @class
 * @alias ImglyKit.Utils
 * @private
 */
var Utils = {};

/**
 * Checks if the given object is an Array
 * @param  {Object}  object
 * @return {Boolean}
 */
Utils.isArray = function (object) {
  return Object.prototype.toString.call(object) === "[object Array]";
};

/**
 * Returns the items selected by the given selector
 * @param  {Array} items
 * @param  {ImglyKit~Selector} selector - The selector
 * @return {Array} The selected items
 */
Utils.select = function (items, selector) {
  // Turn string parameter into an array
  if (typeof selector === "string") {
    selector = selector.split(",").map(function (identifier) {
      return identifier.trim();
    });
  }

  // Turn array parameter into an object with `only`
  if (Utils.isArray(selector)) {
    selector = { only: selector };
  }

  if (typeof selector.only !== "undefined") {
    // Select only the given identifiers
    return items.filter(function (item) {
      return selector.only.indexOf(item) !== -1;
    });
  } else if(typeof selector.except !== "undefined") {
    // Select all but the given identifiers
    return items.filter(function (item) {
      return selector.except.indexOf(item) === -1;
    });
  }

  throw new Error("Utils#select failed to filter items.");
};

/**
 * Returns the given object's values as an array
 * @param {Object} object
 * @returns {Array<*>}
 */
Utils.values = function (object) {
  var values = [];
  for (var key in object) {
    values.push(object[key]);
  }
  return values;
};

/**
 * We use this method to allow easy-to-use multiline strings by wrapping them
 * in a function inside of a multiline comment. We then use Function#toString
 * to get the content of the function, strip away the first and last line
 * et voila, we have a string.
 * I know this is ugly, but it's less noisy than ["a", "b"].join("\n");
 * @param {Function}
 * @returns {String}
 */
Utils.shaderString = function (f) {
  return f.toString().split("\n").slice(1, -1).join("\n");
};

/**
 * Multiplies the given matrices
 * @param  {Array} a
 * @param  {Array} b
 * @return {Array}
 */
Utils.multiplyMatrices = function(a, b) {
  var a00 = a[0*3+0];
  var a01 = a[0*3+1];
  var a02 = a[0*3+2];
  var a10 = a[1*3+0];
  var a11 = a[1*3+1];
  var a12 = a[1*3+2];
  var a20 = a[2*3+0];
  var a21 = a[2*3+1];
  var a22 = a[2*3+2];
  var b00 = b[0*3+0];
  var b01 = b[0*3+1];
  var b02 = b[0*3+2];
  var b10 = b[1*3+0];
  var b11 = b[1*3+1];
  var b12 = b[1*3+2];
  var b20 = b[2*3+0];
  var b21 = b[2*3+1];
  var b22 = b[2*3+2];
  return [a00 * b00 + a01 * b10 + a02 * b20,
          a00 * b01 + a01 * b11 + a02 * b21,
          a00 * b02 + a01 * b12 + a02 * b22,
          a10 * b00 + a11 * b10 + a12 * b20,
          a10 * b01 + a11 * b11 + a12 * b21,
          a10 * b02 + a11 * b12 + a12 * b22,
          a20 * b00 + a21 * b10 + a22 * b20,
          a20 * b01 + a21 * b11 + a22 * b21,
          a20 * b02 + a21 * b12 + a22 * b22];
};

module.exports = Utils;
