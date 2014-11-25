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
 * @param {Canvas} canvas
 * @param {CanvasRenderingContext3D} context
 * @extends {ImglyKit.Renderer}
 * @private
 */
var WebGLRenderer = Renderer.extend({});

module.exports = WebGLRenderer;
