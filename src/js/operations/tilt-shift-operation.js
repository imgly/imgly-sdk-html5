"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = require("./operation");
var Vector2 = require("../lib/math/vector2");
var Utils = require("../lib/utils");

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias ImglyKit.Operations.TiltShiftOperation
 * @extends ImglyKit.Operation
 */
var TiltShiftOperation = Operation.extend({
  constructor: function () {
    Operation.apply(this, arguments);

    if (typeof this._options.start === "undefined") {
      this._options.start = new Vector2(0.0, 0.8);
    }

    if (typeof this._options.end === "undefined") {
      this._options.end = new Vector2(1.0, 0.8);
    }

    if (typeof this._options.blurRadius === "undefined") {
      this._options.blurRadius = 0.01;
    }

    if (typeof this._options.gradientRadius === "undefined") {
      this._options.gradientRadius = 0.3;
    }
  }
});

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
TiltShiftOperation.identifier = "tilt-shift";

/**
 * The fragment shader used for this operation
 * @internal Based on evanw's glfx.js tilt shift shader:
 *           https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
 */
TiltShiftOperation.fragmentShader = Utils.shaderString(function () {/**webgl

  precision mediump float;
  uniform sampler2D u_image;
  uniform float blurRadius;
  uniform float gradientRadius;
  uniform vec2 start;
  uniform vec2 end;
  uniform vec2 delta;
  uniform vec2 texSize;
  varying vec2 v_texCoord;

  float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
  }

  void main() {
      vec4 color = vec4(0.0);
      float total = 0.0;

      float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

      vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));
      float radius = smoothstep(0.0, 1.0, abs(dot(v_texCoord - start, normal)) / gradientRadius) * blurRadius;
      for (float t = -30.0; t <= 30.0; t++) {
          float percent = (t + offset - 0.5) / 30.0;
          float weight = 1.0 - abs(percent);
          vec4 sample = texture2D(u_image, v_texCoord + delta * percent * radius);

          sample.rgb *= sample.a;

          color += sample * weight;
          total += weight;
      }

      gl_FragColor = color / total;
      gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
  }

*/});

/**
 * Checks whether this Operation can be applied the way it is configured
 * @return {boolean}
 */
TiltShiftOperation.prototype.validateSettings = function() {
  if (!(this._options.start instanceof Vector2)) {
    throw new Error("TiltShiftOperation: `start` has to be a Vector2 instance.");
  }

  if (!(this._options.end instanceof Vector2)) {
    throw new Error("TiltShiftOperation: `end` has to be a Vector2 instance.");
  }
};

/**
 * Applies this operation
 * @param  {Renderer} renderer
 * @return {Promise}
 * @abstract
 */
TiltShiftOperation.prototype.render = function(renderer) {
  if (renderer.identifier === "webgl") {
    this._renderWebGL(renderer);
  } else {
    this._renderCanvas(renderer);
  }
};

/**
 * Crops this image using WebGL
 * @param  {WebGLRenderer} renderer
 */
/* istanbul ignore next */
TiltShiftOperation.prototype._renderWebGL = function(renderer) {
  var canvas = renderer.getCanvas();

  var start = this._options.start.clone();
  start.y = 1 - start.y;
  var end = this._options.end.clone();
  end.y = 1 - end.y;
  var delta = end.clone().subtract(start);

  var d = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

  renderer.runShader(null, TiltShiftOperation.fragmentShader, {
    uniforms: {
      blurRadius: { type: "f", value: this._options.blurRadius },
      gradientRadius: { type: "f", value: this._options.gradientRadius },
      start: { type: "2f", value: [start.x, start.y] },
      end: { type: "2f", value: [end.x, end.y] },
      delta: { type: "2f", value: [delta.x / d, delta.y / d] },
      texSize: { type: "2f", value: [canvas.width, canvas.height] }
    }
  });

  renderer.runShader(null, TiltShiftOperation.fragmentShader, {
    uniforms: {
      blurRadius: { type: "f", value: this._options.blurRadius },
      gradientRadius: { type: "f", value: this._options.gradientRadius },
      start: { type: "2f", value: [start.x, start.y] },
      end: { type: "2f", value: [end.x, end.y] },
      delta: { type: "2f", value: [-delta.y / d, delta.x / d] },
      texSize: { type: "2f", value: [canvas.width, canvas.height] }
    }
  });
};

/**
 * Crops the image using Canvas2D
 * @param  {CanvasRenderer} renderer
 */
TiltShiftOperation.prototype._renderCanvas = function(renderer) {
  var canvas = renderer.getCanvas();
};

module.exports = TiltShiftOperation;
