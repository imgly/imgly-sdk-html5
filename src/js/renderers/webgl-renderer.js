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
 * @alias ImglyKit.WebGLRenderer
 * @extends {ImglyKit.Renderer}
 * @private
 */
var WebGLRenderer = Renderer.extend({});

/**
 * Checks whether this type of renderer is supported in the current environment
 * @abstract
 * @returns {boolean}
 */
WebGLRenderer.isSupported = function () {
  return !!(typeof window !== "undefined" && window.WebGLRenderingContext);
};

/**
 * Gets the rendering context from the Canva
 * @return {RenderingContext}
 * @abstract
 */
WebGLRenderer.prototype._getContext = function() {
  /* istanbul ignore next */
  return this._canvas.getContext("webgl") ||
    this._canvas.getContext("webgl-experimental");
};

module.exports = WebGLRenderer;
