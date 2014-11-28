/* jshint unused: false */
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
 * Base class for primitives. Extendable via {@link ImglyKit.Filter.Primitive#extend}
 * @class
 * @alias ImglyKit.Filter.Primitive
 */
function Primitive(options) {
  options = options || {};

  this._options = options;
}

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
Primitive.prototype.render = function(renderer) {
  if (renderer.identifier === "webgl") {
    this.renderWebGL(renderer);
  } else {
    this.renderCanvas(renderer);
  }
};

/**
 * Renders the primitive (WebGL)
 * @param  {CanvasRenderer} renderer
 */
/* istanbul ignore next */
Primitive.prototype.renderWebGL = function(renderer) {
  /* istanbul ignore next */
  throw new Error("Primitive#renderWebGL is abstract and not implemented in inherited class.");
};

/**
 * Renders the primitive (Canvas2D)
 * @param  {CanvasRenderer} renderer
 */
Primitive.prototype.renderCanvas = function(renderer) {
  /* istanbul ignore next */
  throw new Error("Primitive#renderCanvas is abstract and not implemented in inherited class.");
};

Primitive.extend = require("../../../lib/extend");

module.exports = Primitive;
