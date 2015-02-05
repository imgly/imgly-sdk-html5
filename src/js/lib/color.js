"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
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
class Color {
  constructor (r, g, b, a) {
    if (typeof a === "undefined") a = 1.0;

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
   * Returns an rgba() representation of this color
   * @return {String}
   */
  toRGBA () {
    var colors = [
      this.r * 255,
      this.g * 255,
      this.b * 255,
      this.a
    ];
    return "rgba(" + colors.join(",") + ")";
  }

  /**
   * Returns a hex representation of this color
   * @return {String}
   */
  toHex () {
    var components = [
      this._componentToHex(this.r * 255),
      this._componentToHex(this.g * 255),
      this._componentToHex(this.b * 255)
    ];
    return "#" + components.join("");
  }

  /**
   * Returns an array with 4 values (0...1)
   * @return {Array.<Number>}
   */
  toGLColor () {
    return [this.r, this.g, this.b, this.a];
  }

  /**
   * Returns an array with 3 values (0...1)
   * @return {Array.<Number>}
   */
  toRGBGLColor () {
    return [this.r, this.g, this.b];
  }

  /**
   * Returns the given number as hex
   * @param  {Number} component
   * @return {String}
   * @private
   */
  _componentToHex (component) {
    var hex = component.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
}

export default Color;
