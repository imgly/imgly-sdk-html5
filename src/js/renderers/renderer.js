"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
var Vector2 = require("../lib/math/vector2");

/**
 * @class
 * @alias ImglyKit.Renderer
 * @param {Canvas} canvas
 * @param {CanvasRenderingContext} context
 * @private
 */
function Renderer(canvas, context) {
  /**
   * @type {Canvas}
   * @private
   */
  this._canvas = canvas;

  /**
   * @type {CanvasRenderingContext}
   * @private
   */
  this._context = context;
}

/**
 * Returns the current size of the canvas
 * @return {Vector2}
 */
Renderer.prototype.getSize = function() {
  return new Vector2(this._canvas.width, this._canvas.height);
};

/**
 * To create an {@link ImglyKit.Renderer} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Renderer.extend = require("../lib/extend");

module.exports = Renderer;
