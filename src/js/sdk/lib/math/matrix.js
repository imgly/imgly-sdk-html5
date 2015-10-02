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
 * Represents a 3-dimensional matrix
 * @class
 * @alias ImglyKit.Vector2
 * @param {number} x
 * @param {number} y
 * @private
 */
export default class Matrix {
  constructor () {
    this.a = 1
    this.b = 0
    this.c = 0
    this.d = 1
    this.tx = 0
    this.ty = 0
  }

  /**
   * Multiplies this matrix with the given one
   * @param  {Matrix} matrix
   * @return {Matrix}
   */
  multiply (matrix) {
    let a, b, c, d, tx, ty
    a = this.a * matrix.a + this.b * matrix.c
    b = this.a * matrix.b + this.b * matrix.d
    c = this.c * matrix.a + this.d * matrix.c
    d = this.c * matrix.b + this.d * matrix.d
    tx = this.tx * matrix.a + this.ty * matrix.c + matrix.tx
    ty = this.tx * matrix.b + this.ty * matrix.d + matrix.ty

    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.tx = tx
    this.ty = ty
    return this
  }

  /**
   * Returns an array representation of this matrix
   * @return {Array}
   */
  toArray () {
    return new Float32Array(
      [
        this.a, this.b, 0,
        this.c, this.d, 0,
        this.tx, this.ty, 1
      ]
    )
  }
}
