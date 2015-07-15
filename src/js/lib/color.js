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
    if (typeof a === 'undefined') {
      a = 1.0
    }

    this.r = r
    this.g = g
    this.b = b
    this.a = a
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
    ]
    return 'rgba(' + colors.join(',') + ')'
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
    ]
    return '#' + components.join('')
  }

  /**
   * Returns an array with 4 values (0...1)
   * @return {Array.<Number>}
   */
  toGLColor () {
    return [this.r, this.g, this.b, this.a]
  }

  /**
   * Returns an array with 3 values (0...1)
   * @return {Array.<Number>}
   */
  toRGBGLColor () {
    return [this.r, this.g, this.b]
  }

  /**
   * Converts the RGB value to HSV
   * @return {Array.<Number>}
   */
  toHSV () {
    let max = Math.max(this.r, this.g, this.b)
    let min = Math.min(this.r, this.g, this.b)
    let h
    let s
    let v = max
    let d = max - min
    s = max === 0 ? 0 : d / max

    if (max === min) {
      h = 0 // achromatic
    } else {
      switch (max) {
        case this.r:
          h = (this.g - this.b) / d + (this.g < this.b ? 6 : 0)
          break
        case this.g:
          h = (this.b - this.r) / d + 2
          break
        case this.b:
          h = (this.r - this.g) / d + 4
          break
      }
      h /= 6
    }

    return [h, s, v]
  }

  /**
   * Sets the RGB values of this color to match the given HSV values
   * @param {Number} h
   * @param {Number} s
   * @param {Number} v
   */
  fromHSV (h, s, v) {
    let {r, g, b} = this

    let i = Math.floor(h * 6)
    let f = h * 6 - i
    let p = v * (1 - s)
    let q = v * (1 - f * s)
    let t = v * (1 - (1 - f) * s)

    switch (i % 6) {
      case 0:
        r = v
        g = t
        b = p
        break
      case 1:
        r = q
        g = v
        b = p
        break
      case 2:
        r = p
        g = v
        b = t
        break
      case 3:
        r = p
        g = q
        b = v
        break
      case 4:
        r = t
        g = p
        b = v
        break
      case 5:
        r = v
        g = p
        b = q
        break
    }

    this.r = r
    this.g = g
    this.b = b
  }

  /**
   * Returns a clone of the current color
   * @return {Color}
   */
  clone () {
    return new Color(this.r, this.g, this.b, this.a)
  }

  /**
   * Returns the given number as hex
   * @param  {Number} component
   * @return {String}
   * @private
   */
  _componentToHex (component) {
    var hex = component.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  /**
   * Returns the string representation of this color
   * @returns {String}
   */
  toString () {
    return `Color(${this.r}, ${this.g}, ${this.b}, ${this.a})`
  }
}

export default Color
