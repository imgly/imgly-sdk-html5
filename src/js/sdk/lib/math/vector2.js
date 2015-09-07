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
 * Represents a 2-dimensional vector while providing math functions to
 * modify / clone the vector. Fully chainable.
 * @class
 * @alias ImglyKit.Vector2
 * @param {number} x
 * @param {number} y
 * @private
 */
class Vector2 {
  constructor (x, y) {
    this.x = x
    this.y = y
    if (typeof this.x === 'undefined') {
      this.x = 0
    }
    if (typeof this.y === 'undefined') {
      this.y = 0
    }
  }

  /**
   * Sets the given values
   * @param {number} x
   * @param {number} y
   * @return {Vector2}
   */
  set (x, y) {
    this.x = x
    this.y = y
    return this
  }

  /**
   * Creates a clone of this vector
   * @return {Vector2}
   */
  clone () {
    return new Vector2(this.x, this.y)
  }

  /**
   * Copies the values of the given vector
   * @param  {Vector2} other
   * @return {Vector2}
   */
  copy (other) {
    this.x = other.x
    this.y = other.y
    return this
  }

  /**
   * Clamps this vector with the given Vector2 / number
   * @param  {(number|Vector2)} minimum
   * @param  {(number|Vector2)} maximum
   * @return {Vector2}
   */
  clamp (minimum, maximum) {
    let minimumSet = minimum !== null && typeof minimum !== 'undefined'
    let maximumSet = maximum !== null && typeof maximum !== 'undefined'

    /* istanbul ignore else  */
    if (!(minimum instanceof Vector2) && minimumSet) {
      minimum = new Vector2(minimum, minimum)
    }
    /* istanbul ignore else  */
    if (!(maximum instanceof Vector2) && maximumSet) {
      maximum = new Vector2(maximum, maximum)
    }

    if (minimumSet) {
      this.x = Math.max(minimum.x, this.x)
      this.y = Math.max(minimum.y, this.y)
    }

    if (maximumSet) {
      this.x = Math.min(maximum.x, this.x)
      this.y = Math.min(maximum.y, this.y)
    }
    return this
  }

  /**
   * Divides this vector by the given Vector2 / number
   * @param  {(number|Vector2)} divisor
   * @param  {number} [y]
   * @return {Vector2}
   */
  divide (divisor, y) {
    if (divisor instanceof Vector2) {
      this.x /= divisor.x
      this.y /= divisor.y
    } else {
      this.x /= divisor
      this.y /= (typeof y === 'undefined' ? divisor : y)
    }
    return this
  }

  /**
   * Subtracts the given Vector2 / number from this vector
   * @param  {(number|Vector2)} subtrahend
   * @param  {number} [y]
   * @return {Vector2}
   */
  subtract (subtrahend, y) {
    if (subtrahend instanceof Vector2) {
      this.x -= subtrahend.x
      this.y -= subtrahend.y
    } else {
      this.x -= subtrahend
      this.y -= (typeof y === 'undefined' ? subtrahend : y)
    }
    return this
  }

  /**
   * Multiplies the given Vector2 / number with this vector
   * @param  {(number|Vector2)} subtrahend
   * @param  {number} [y]
   * @return {Vector2}
   */
  multiply (factor, y) {
    if (factor instanceof Vector2) {
      this.x *= factor.x
      this.y *= factor.y
    } else {
      this.x *= factor
      this.y *= (typeof y === 'undefined' ? factor : y)
    }
    return this
  }

  /**
   * Adds the given Vector2 / numbers to this vector
   * @param {(number|Vector2)} addend
   * @param {number} [y]
   */
  add (addend, y) {
    if (addend instanceof Vector2) {
      this.x += addend.x
      this.y += addend.y
    } else {
      this.x += addend
      this.y += (typeof y === 'undefined' ? addend : y)
    }
    return this
  }

  /**
   * Checks whether the x and y value are the same as the given ones
   * @param  {(number|Vector2)} vec
   * @param  {number} y
   * @return {boolean}
   */
  equals (vec, y) {
    if (vec instanceof Vector2) {
      return vec.x === this.x && vec.y === this.y
    } else {
      return vec === this.x && y === this.y
    }
  }

  /**
   * Flips the x and y values of this vector
   * @return {Vector2}
   */
  flip () {
    let tempX = this.x
    this.x = this.y
    this.y = tempX
    return this
  }

  /**
   * Rounds the values of this vector
   * @returns {Vector2}
   */
  round () {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)
    return this
  }

  /**
   * Rounds up the values of this vector
   * @returns {Vector2}
   */
  ceil () {
    this.x = Math.ceil(this.x)
    this.y = Math.ceil(this.y)
    return this
  }

  /**
   * Rounds down the values of this vector
   * @returns {Vector2}
   */
  floor () {
    this.x = Math.floor(this.x)
    this.y = Math.floor(this.y)
    return this
  }

  /**
   * Makes both numbers of this vector positive
   * @returns {Vector2}
   */
  abs () {
    this.x = Math.abs(this.x)
    this.y = Math.abs(this.y)
    return this
  }

  /**
   * Returns a string representation of this vector
   * @return {String}
   */
  toString () {
    return `Vector2({ x: ${this.x}, y: ${this.y} })`
  }
}

export default Vector2
