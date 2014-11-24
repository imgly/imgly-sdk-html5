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
 * Parses the dimensions string and provides calculation functions
 * @class
 * @alias ImglyKit.ImageDimensions
 * @param {Image} image
 * @param {string} dimensions
 * @private
 */
function ImageDimensions(image, dimensions) {
  /**
   * @type {Image}
   * @private
   */
  this._image = image;

  /**
   * @type {string}
   * @private
   */
  this._dimensionsString = dimensions;
}

module.exports = ImageDimensions;
