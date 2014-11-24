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
 * Handles the image rendering process
 * @class
 * @alias ImglyKit.RenderImage
 * @param {ImglyKit.OperationsStack} operationsStack
 * @param {ImglyKit.ImageDimensions} imageDimensions
 * @private
 */
function RenderImage(operationsStack, imageDimensions) {
  /**
   * @type {ImglyKit.OperationsStack}
   * @private
   */
  this._stack = operationsStack;

  /**
   * @type {ImglyKit.ImageDimensions}
   * @private
   */
  this._dimensions = imageDimensions;
}

module.exports = RenderImage;
