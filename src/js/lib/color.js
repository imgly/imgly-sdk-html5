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
 * Represents a color
 * @class
 * @alias ImglyKit.Color
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} [a]
 * @private
 */
function Color(r, g, b, a) {
  if (typeof a === "undefined") a = 1.0;

  this._r = r;
  this._g = g;
  this._b = b;
  this._a = a;
}

/**
 * Returns an rgba() representation of this color
 * @return {String}
 */
Color.prototype.toRGBA = function() {
  var colors = [
    this._r * 255,
    this._g * 255,
    this._b * 255,
    this._a
  ];
  return "rgba(" + colors.join(",") + ")";
};

/**
 * Returns a hex representation of this color
 * @return {String}
 */
Color.prototype.toHex = function() {
  var components = [
    this._componentToHex(this._r * 255),
    this._componentToHex(this._g * 255),
    this._componentToHex(this._b * 255)
  ];
  return "#" + components.join("");
};

/**
 * Returns an array with 4 values (0...1)
 * @return {Array.<Number>}
 */
Color.prototype.toGLColor = function() {
  return [this._r, this._g, this._b, this._a];
};

/**
 * Returns the given number as hex
 * @param  {Number} component
 * @return {String}
 * @private
 */
Color.prototype._componentToHex = function(component) {
  var hex = component.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

module.exports = Color;
