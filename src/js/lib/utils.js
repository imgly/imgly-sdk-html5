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
 * Checks if the given object is a DOM element
 * @param  {Object}  o
 * @return {Boolean}
 */
/* istanbul ignore next */
Utils.isDOMElement = function (o) {
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement :
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
};

module.exports = Utils;
