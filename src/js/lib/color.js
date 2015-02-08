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
      Math.round(this.r * 255),
      Math.round(this.g * 255),
      Math.round(this.b * 255),
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
      this._componentToHex(Math.round(this.r * 255)),
      this._componentToHex(Math.round(this.g * 255)),
      this._componentToHex(Math.round(this.b * 255))
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
   * Converts the RGB value to HSL
   * @return {Array.<Number>}
   */
  toHSL () {
    let max = Math.max(this.r, this.g, this.b);
    let min = Math.min(this.r, this.g, this.b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max){
        case this.r:
          h = (this.g - this.b) / d + (this.g < this.b ? 6 : 0);
          break;
        case this.g:
          h = (this.b - this.r) / d + 2;
          break;
        case this.b:
          h = (this.r - this.g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, l];
  }

  /**
   * Changes the color so that the hue value matches the given one
   * @param {Number} hue
   */
  setHue (hue) {
    let [h, s, l] = this.toHSL();
    h = hue / 360;
    s = 1.0;
    l = 0.5;
    this.fromHSL(h, s, l);
  }

  /**
   * Sets the RGB values of this color to match the given HSL values
   * @param {Number} hue
   * @param {Number} saturation
   * @param {Number} luminance
   */
  fromHSL (hue, saturation, luminance) {
    if (saturation === 0){
      this.r = this.g = this.b = luminance; // achromatic
    } else {
      let hue2rgb = function hue2rgb(p, q, t){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      let q = luminance < 0.5 ? luminance * (1 + saturation) : luminance + saturation - luminance * saturation;
      let p = 2 * luminance- q;
      this.r = hue2rgb(p, q, hue + 1/3);
      this.g = hue2rgb(p, q, hue);
      this.b = hue2rgb(p, q, hue - 1/3);
    }
  }

  /**
   * Returns a clone of the current color
   * @return {Color}
   */
  clone () {
    return new Color(this.r, this.g, this.b, this.a);
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

  /**
   * Returns the string representation of this color
   * @returns {String}
   */
  toString () {
    return `Color(${this.r},${this.g},${this.b},${this.a})`;
  }
}

export default Color;
