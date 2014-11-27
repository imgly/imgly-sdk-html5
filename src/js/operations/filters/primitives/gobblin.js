"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = require("./primitive");
var Utils = require("../../../lib/utils");

/**
 * Gobblin primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Gobblin
 * @extends {ImglyKit.Filter.Primitive}
 */
var Gobblin = Primitive.extend({});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
Gobblin.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);
    texColor.b = texColor.g * 0.33;
    texColor.r = texColor.r * 0.6;
    texColor.b += texColor.r * 0.33;
    texColor.g = texColor.g * 0.7;
    gl_FragColor = texColor;
  }

*/});

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
Gobblin.prototype.render = function(renderer) {
  renderer.runShader(null, this._fragmentShader);
};

module.exports = Gobblin;
