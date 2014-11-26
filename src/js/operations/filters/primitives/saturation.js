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
 * Saturation primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Saturation
 * @extends {ImglyKit.Filter.Primitive}
 */
var Saturation = Primitive.extend({
  constructor: function () {
    Primitive.apply(this, arguments);

    if (typeof this._options.saturation === "undefined") {
      this._options.saturation = 0;
    }
  }
});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
Saturation.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform float u_saturation;

  const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);
    float luminance = dot(texColor.rgb, luminanceWeighting);

    vec3 greyScaleColor = vec3(luminance);

    gl_FragColor = vec4(mix(greyScaleColor, texColor.rgb, u_saturation), texColor.a);
  }

*/});

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
Saturation.prototype.render = function(renderer) {
  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_saturation: this._options.saturation
    }
  });
};

module.exports = Saturation;
