"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = require("lodash");
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

    this._options = _.defaults(this._options, {
      brightness: 1.0
    });
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
 * Renders the primitive (WebGL)
 * @param  {WebGLRenderer} renderer
 */
/* istanbul ignore next */
Brightness.prototype.renderWebGL = function(renderer) {
  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_brightness: { type: "f", value: this._options.brightness }
    }
  });
};

/**
 * Renders the primitive (Canvas)
 * @param  {CanvasRenderer} renderer
 */
Brightness.prototype.renderCanvas = function(renderer) {
  var canvas = renderer.getCanvas();
  var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
  var brightness = this._options.brightness;

  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
      var index = (canvas.width * y + x) * 4;

      imageData.data[index]     = imageData.data[index] + brightness * 255;
      imageData.data[index + 1] = imageData.data[index + 1] + brightness * 255;
      imageData.data[index + 2] = imageData.data[index + 2] + brightness * 255;
    }
  }

  renderer.getContext().putImageData(imageData, 0, 0);
};

module.exports = Brightness;
