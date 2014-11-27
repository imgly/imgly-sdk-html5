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
  /* istanbul ignore next */
  throw new Error("Primitive#render is abstract and not implemented in inherited class.");
};

Primitive.extend = require("../../../lib/extend");

module.exports = Primitive;
