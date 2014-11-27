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
 * Contrast primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Contrast
 * @extends {ImglyKit.Filter.Primitive}
 */
var Contrast = Primitive.extend({
  constructor: function () {
    Primitive.apply(this, arguments);

    if (typeof this._options.contrast === "undefined") {
      this._options.contrast = 1.0;
    }
  }
});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
Contrast.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform float u_contrast;

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);
    gl_FragColor = vec4(((texColor.rgb - vec3(0.5)) * u_contrast + vec3(0.5)), texColor.a);
  }

*/});

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
Contrast.prototype.render = function(renderer) {
  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_contrast: { type: "f", value: this._options.contrast }
    }
  });
};

module.exports = Contrast;
