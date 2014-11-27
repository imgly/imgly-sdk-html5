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
 * X400 primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.X400
 * @extends {ImglyKit.Filter.Primitive}
 */
var X400 = Primitive.extend({});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
X400.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);
    float gray = texColor.r * 0.3 + texColor.g * 0.3 + texColor.b * 0.3;
    gray -= 0.2;
    gray = clamp(gray, 0.0, 1.0);
    gray += 0.15;
    gray *= 1.4;
    gl_FragColor = vec4(vec3(gray), 1.0);
  }

*/});

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
X400.prototype.render = function(renderer) {
  renderer.runShader(null, this._fragmentShader);
};

module.exports = X400;
