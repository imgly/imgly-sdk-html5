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
var Operation = require("./operation");
var Color = require("../lib/color");
var Utils = require("../lib/utils");

/**
 * An operation that can frames on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.FramesOperation
 * @extends ImglyKit.Operation
 */
var FramesOperation = Operation.extend({
  constructor: function () {
    Operation.apply(this, arguments);

    this._options = _.defaults(this._options, {
      color: new Color(0, 0, 0, 1),
      thickness: 0.02
    });
  }
});

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FramesOperation.identifier = "frames";

/**
 * The texture index used for the frame
 * @type {Number}
 * @private
 */
FramesOperation.prototype._textureIndex = 1;

/**
 * The fragment shader used for this operation
 */
FramesOperation.prototype._fragmentShader = Utils.shaderString(function () {/**webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform sampler2D u_frameImage;
  uniform vec4 u_color;
  uniform vec2 u_thickness;

  void main() {
    vec4 fragColor = texture2D(u_image, v_texCoord);
    if (v_texCoord.x < u_thickness.x || v_texCoord.x > 1.0 - u_thickness.x ||
      v_texCoord.y < u_thickness.y || v_texCoord.y > 1.0 - u_thickness.y) {
        fragColor = u_color;
      }

    gl_FragColor = fragColor;
  }

*/});

/**
 * Checks whether this Operation can be applied the way it is configured
 * @return {boolean}
 */
FramesOperation.prototype.validateSettings = function() {
  if (!(this._options.color instanceof Color)) {
    throw new Error("FramesOperation: `color` has to be an instance of ImglyKit.Color");
  }
};

/**
 * Applies this operation
 * @param  {Renderer} renderer
 * @return {Promise}
 * @abstract
 */
FramesOperation.prototype.render = function(renderer) {
  var self = this;
  if (renderer.identifier === "webgl") {
    return self._renderWebGL(renderer);
  } else {
    return self._renderCanvas(renderer);
  }
};

/**
 * Crops this image using WebGL
 * @param  {WebGLRenderer} renderer
 * @private
 */
FramesOperation.prototype._renderWebGL = function(renderer) {
  var canvas = renderer.getCanvas();

  var color = this._options.color;
  var thickness = this._options.thickness * canvas.height;
  var thicknessVec2 = [thickness / canvas.width, thickness / canvas.height];

  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_color: { type: "4f", value: color.toGLColor() },
      u_thickness: { type: "2f", value: thicknessVec2 }
    }
  });
};

/**
 * Crops the image using Canvas2D
 * @param  {CanvasRenderer} renderer
 * @private
 */
FramesOperation.prototype._renderCanvas = function(renderer) {
  var canvas = renderer.getCanvas();
  var context = renderer.getContext();

  var color = this._options.color;
  var thickness = this._options.thickness * canvas.height;

  context.save();
  context.beginPath();
  context.lineWidth = thickness * 2;
  context.strokeStyle = color.toRGBA();
  context.rect(0, 0, canvas.width, canvas.height);
  context.stroke();
  context.restore();
};

module.exports = FramesOperation;
