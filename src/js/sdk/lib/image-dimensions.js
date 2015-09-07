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
 * Parses the dimensions string and provides calculation functions
 * @class
 * @alias ImglyKit.ImageDimensions
 * @param {string} dimensions
 * @private
 */
class ImageDimensions {
  constructor (dimensions) {
    /**
     * The available dimension modifiers
     * @type {Object}
     * @private
     */
    this._modifiers = {
      FIXED: '!'
    }

    /**
     * @type {string}
     * @private
     */
    this._dimensionsString = dimensions

    /**
     * An object that represents the parsed dimensions string
     * @type {Object}
     */
    this._rules = this._parse()

    this._validateRules()
  }

  /**
   * Parses the dimensions string
   * @private
   */
  _parse () {
    if (typeof this._dimensionsString === 'undefined' || this._dimensionsString === null) {
      return null
    }

    var match = this._dimensionsString.match(/^([0-9]+)?x([0-9]+)?([\!])?$/i)
    if (!match) {
      throw new Error('Invalid size option: ' + this._dimensionsString)
    }

    return {
      x: isNaN(match[1]) ? null : parseInt(match[1], 10),
      y: isNaN(match[2]) ? null : parseInt(match[2], 10),
      modifier: match[3]
    }
  }

  /**
   * Validates the rules
   * @private
   */
  _validateRules () {
    if (this._rules === null) return

    var xAvailable = this._rules.x !== null
    var yAvailable = this._rules.y !== null

    if (this._rules.modifier === this._modifiers.FIXED && !(xAvailable && yAvailable)) {
      throw new Error('Both `x` and `y` have to be set when using the fixed (!) modifier.')
    }

    if (!xAvailable && !yAvailable) {
      throw new Error('Neither `x` nor `y` are given.')
    }
  }

  /**
   * Calculates the final dimensions using the dimensions string and the
   * given initial dimensions
   * @param  {Vector2} initialDimensions
   * @return {Vector2}
   */
  calculateFinalDimensions (initialDimensions) {
    var dimensions = initialDimensions.clone(), ratio

    if (this._rules === null) return dimensions

    /* istanbul ignore else */
    if (this._rules.modifier === this._modifiers.FIXED) {
      // Fixed dimensions
      dimensions.set(this._rules.x, this._rules.y)
    } else if (this._rules.x !== null && this._rules.y !== null) {
      // Both x and y given, resize to fit
      ratio = Math.min(this._rules.x / dimensions.x, this._rules.y / dimensions.y)
      dimensions.multiply(ratio)
    } else if (this._rules.x !== null) {
      // Fixed x, y by ratio
      ratio = initialDimensions.y / initialDimensions.x
      dimensions.x = this._rules.x
      dimensions.y = dimensions.x * ratio
    } else if (this._rules.y !== null) {
      // Fixed y, x by ratio
      ratio = initialDimensions.x / initialDimensions.y
      dimensions.y = this._rules.y
      dimensions.x = dimensions.y * ratio
    }

    return dimensions
  }
}

export default ImageDimensions
