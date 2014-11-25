"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
var Renderer = require("./renderer");

/**
 * @class
 * @alias ImglyKit.CanvasRenderer
 * @param {Canvas} canvas
 * @param {CanvasRenderingContext2D} context
 * @extends {ImglyKit.Renderer}
 * @private
 */
var CanvasRenderer = Renderer.extend({});

/**
 * Draws the given image on the canvas
 * @param  {Image} image
 */
CanvasRenderer.prototype.drawImage = function(image) {
  this._context.drawImage(image, 0, 0);
};

module.exports = CanvasRenderer;
