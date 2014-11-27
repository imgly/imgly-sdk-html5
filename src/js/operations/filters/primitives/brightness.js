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
 * Brightness primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Brightness
 * @extends {ImglyKit.Filter.Primitive}
 */
var Brightness = Primitive.extend({
  constructor: function () {
    Primitive.apply(this, arguments);

    if (typeof this._options.brightness === "undefined") {
      this._options.brightness = 1.0;
    }
  }
});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
Brightness.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform float u_brightness;

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);
    gl_FragColor = vec4((texColor.rgb + vec3(u_brightness)), texColor.a);
  }

*/});

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
Brightness.prototype.render = function(renderer) {
  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_brightness: { type: "f", value: this._options.brightness }
    }
  });
};

module.exports = Brightness;
