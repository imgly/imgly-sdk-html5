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
 * Grayscale primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Grayscale
 * @extends {ImglyKit.Filter.Primitive}
 */
var Grayscale = Primitive.extend({});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
Grayscale.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  vec3 W = vec3(0.2125, 0.7154, 0.0721);

  void main() {
    vec3 texColor = texture2D(u_image, v_texCoord).rgb;
    float luminance = dot(texColor, W);
    gl_FragColor = vec4(vec3(luminance), 1.0);
  }

*/});

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
Grayscale.prototype.render = function(renderer) {
  renderer.runShader(null, this._fragmentShader);
};

module.exports = Grayscale;
