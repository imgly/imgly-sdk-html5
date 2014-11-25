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
 * Represents a 2-dimensional vector while providing math functions to
 * modify / clone the vector. Fully chainable.
 * @class
 * @alias ImglyKit.Vector2
 * @param {number} x
 * @param {number} y
 * @private
 */
function Vector2(x, y) {
  this.x = x;
  this.y = y;
  if (typeof this.x === "undefined") {
    this.x = 0;
  }
  if (typeof this.y === "undefined") {
    this.y = 0;
  }
}

/**
 * Sets the given values
 * @param {number} x
 * @param {number} y
 * @return {Vector2}
 */
Vector2.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
  return this;
};

/**
 * Creates a clone of this vector
 * @return {Vector2}
 */
Vector2.prototype.clone = function() {
  return new Vector2(this.x, this.y);
};

/**
 * Copies the values of the given vector
 * @param  {Vector2} other
 * @return {Vector2}
 */
Vector2.prototype.copy = function(other) {
  this.x = other.x;
  this.y = other.y;
  return this;
};

/**
 * Clamps this vector with the given Vector2 / number
 * @param  {(number|Vector2)} minimum
 * @param  {(number|Vector2)} maximum
 * @return {Vector2}
 */
Vector2.prototype.clamp = function(minimum, maximum) {
  /* istanbul ignore else  */
  if (!(minimum instanceof Vector2)) {
    minimum = new Vector2(minimum, minimum);
  }
  /* istanbul ignore else  */
  if (!(maximum instanceof Vector2)) {
    maximum = new Vector2(maximum, maximum);
  }
  this.x = Math.max(minimum.x, Math.min(maximum.x, this.x));
  this.y = Math.max(minimum.y, Math.min(maximum.y, this.y));
  return this;
};

/**
 * Divides this vector by the given Vector2 / number
 * @param  {(number|Vector2)} divisor
 * @param  {number} [y]
 * @return {Vector2}
 */
Vector2.prototype.divide = function(divisor, y) {
  if (divisor instanceof Vector2) {
    this.x /= divisor.x;
    this.y /= divisor.y;
  } else {
    this.x /= divisor;
    this.y /= (typeof y === "undefined" ? divisor : y);
  }
  return this;
};

/**
 * Subtracts the given Vector2 / number from this vector
 * @param  {(number|Vector2)} subtrahend
 * @param  {number} [y]
 * @return {Vector2}
 */
Vector2.prototype.subtract = function(subtrahend, y) {
  if (subtrahend instanceof Vector2) {
    this.x -= subtrahend.x;
    this.y -= subtrahend.y;
  } else {
    this.x -= subtrahend;
    this.y -= (typeof y === "undefined" ? subtrahend : y);
  }
  return this;
};

/**
 * Adds the given Vector2 / numbers to this vector
 * @param {(number|Vector2)} addend
 * @param {number} [y]
 */
Vector2.prototype.add = function(addend, y) {
  if (addend instanceof Vector2) {
    this.x += addend.x;
    this.y += addend.y;
  } else {
    this.x += addend;
    this.y += (typeof y === "undefined" ? addend : y);
  }
  return this;
};

/**
 * Returns a string representation of this vector
 * @return {String}
 */
Vector2.prototype.toString = function() {
  return "Vector2({ x: " + this.x + ", y: " + this.y + " })";
};

module.exports = Vector2;
