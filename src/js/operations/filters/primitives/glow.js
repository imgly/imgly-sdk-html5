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
 * Glow primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Glow
 * @extends {ImglyKit.Filter.Primitive}
 */
var Glow = Primitive.extend({
  constructor: function () {
    Primitive.apply(this, arguments);

    if (typeof this._options.color === "undefined") {
      this._options.color = [255, 255, 255];
    }
  }
});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
Glow.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  uniform vec3 u_color;

  void main() {
    vec3 texColor = texture2D(u_image, v_texCoord).rgb;

    vec2 textureCoord = v_texCoord - vec2(0.5, 0.5);
    textureCoord /= 0.75;

    float d = 1.0 - dot(textureCoord, textureCoord);
    d = clamp(d, 0.2, 1.0);
    vec3 newColor = texColor * d * u_color.rgb;
    gl_FragColor = vec4(vec3(newColor),1.0);
  }

*/});

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
Glow.prototype.render = function(renderer) {
  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_color: { type: "3f", value: [
        this._options.color[0] / 255,
        this._options.color[1] / 255,
        this._options.color[2] / 255
      ]}
    }
  });
};

module.exports = Glow;
