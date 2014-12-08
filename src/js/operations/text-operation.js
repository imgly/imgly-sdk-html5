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
var Color = require("../lib/color");
var Utils = require("../lib/utils");

/**
 * An operation that can draw text on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.TextOperation
 * @extends ImglyKit.Operation
 */
var TextOperation = Operation.extend({
  constructor: function () {
    Operation.apply(this, arguments);

    if (typeof this._options.fontSize === "undefined") {
      this._options.fontSize = 30;
    }

    if (typeof this._options.lineHeight === "undefined") {
      this._options.lineHeight = 1.1;
    }

    if (typeof this._options.fontFamily === "undefined") {
      this._options.fontFamily = "Times New Roman";
    }

    if (typeof this._options.fontWeight === "undefined") {
      this._options.fontWeight = "normal";
    }

    if (typeof this._options.color === "undefined") {
      this._options.color = new Color(0.0, 0.0, 0.0, 1.0);
    }
  }
});

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
TextOperation.identifier = "text";

/**
 * The texture index used for the text
 * @type {Number}
 * @private
 */
TextOperation.prototype._textureIndex = 1;

/**
 * The fragment shader used for this operation
 */
TextOperation.prototype._fragmentShader = Utils.shaderString(function () {/**webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform sampler2D u_textImage;
  uniform vec2 u_position;
  uniform vec2 u_size;

  void main() {
    vec4 color0 = texture2D(u_image, v_texCoord);
    vec2 relative = (v_texCoord - u_position) / u_size;

    if (relative.x >= 0.0 && relative.x <= 1.0 &&
      relative.y >= 0.0 && relative.y <= 1.0) {

        vec4 color1 = texture2D(u_textImage, relative);
        gl_FragColor = vec4(mix(color0.rgb, color1.rgb, color1.a), 1.0);

    } else {

      gl_FragColor = color0;

    }
  }

*/});

/**
 * Checks whether this Operation can be applied the way it is configured
 * @return {boolean}
 */
TextOperation.prototype.validateSettings = function() {
  if (typeof this._options.position === "undefined") {
    throw new Error("TextOperation: `position` must be specified.");
  }

  if (!(this._options.position instanceof Vector2)) {
    throw new Error("TextOperation: `position` must be an instance of ImglyKit.Vector2.");
  }

  if (typeof this._options.text === "undefined") {
    throw new Error("TextOperation: `text` must be specified.");
  }

  if (typeof this._options.text !== "string") {
    throw new Error("TextOperation: `text` must a string.");
  }
};

/**
 * Applies this operation
 * @param  {Renderer} renderer
 * @return {Promise}
 * @abstract
 */
TextOperation.prototype.render = function(renderer) {
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
TextOperation.prototype._renderWebGL = function(renderer) {
  var textCanvas = this._renderTextCanvas(renderer);

  var canvas = renderer.getCanvas();
  var gl = renderer.getContext();

  var position = this._options.position.clone();
  var canvasSize = new Vector2(canvas.width, canvas.height);
  var size = new Vector2(textCanvas.width, textCanvas.height).divide(canvasSize);

  position.y = 1 - position.y; // Invert y
  position.y -= size.y; // Fix y

  // Upload the texture
  gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
  this._texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this._texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
  gl.activeTexture(gl.TEXTURE0);

  // Execute the shader
  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_textImage: { type: "i", value: this._textureIndex },
      u_position: { type: "2f", value: [position.x, position.y] },
      u_size: { type: "2f", value: [size.x, size.y] }
    }
  });
};

/**
 * Crops the image using Canvas2D
 * @param  {CanvasRenderer} renderer
 */
TextOperation.prototype._renderCanvas = function(renderer) {
  var textCanvas = this._renderTextCanvas(renderer);

  var canvas = renderer.getCanvas();
  var context = renderer.getContext();

  var canvasSize = new Vector2(canvas.width, canvas.height);
  var scaledPosition = this._options.position.clone().multiply(canvasSize);

  context.drawImage(textCanvas, scaledPosition.x, scaledPosition.y);
};

/**
 * Renders the text canvas that will be used as a texture in WebGL
 * and as an image in canvas
 * @return {Canvas}
 * @private
 */
TextOperation.prototype._renderTextCanvas = function(renderer) {
  var canvas = renderer.createCanvas();
  var context = canvas.getContext("2d");
  var maxWidth = this._options.maxWidth;
  var actualLineHeight = this._options.lineHeight * this._options.fontSize;

  // Apply text options
  this._applyTextOptions(context);

  var boundingBox = new Vector2();

  if (typeof maxWidth !== "undefined") {
    // Calculate the bounding box
    boundingBox = new Vector2(this._options.maxWidth, 0);

    var outputLines = this._buildOutputLines(context, maxWidth);

    // Calculate boundingbox height
    boundingBox.y = actualLineHeight * outputLines.length;

    // Resize the canvas
    canvas.width = boundingBox.x;
    canvas.height = boundingBox.y;

    // Get the context again, apply text options
    context = canvas.getContext("2d");
    this._applyTextOptions(context);

    // Draw lines
    for (var lineNum = 0; lineNum < outputLines.length; lineNum++) {
      var line = outputLines[lineNum];
      context.fillText(line, 0, actualLineHeight * lineNum);
    }

  } else {
    boundingBox.set(
      context.measureText(this._options.text).width,
      actualLineHeight
    );

    // Resize the canvas
    canvas.width = boundingBox.x;
    canvas.height = boundingBox.y;

    // Get the context again, apply text options
    context = canvas.getContext("2d");
    this._applyTextOptions(context);

    // No bounding box needed, just draw the text
    context.fillText(this._options.text, 0, 0);
  }

  return canvas;
};

/**
 * Applies the text options on the given context
 * @param  {RenderingContext2D} context
 * @private
 */
TextOperation.prototype._applyTextOptions = function(context) {
  context.font = this._options.fontWeight + " " +
    this._options.fontSize + "px " +
    this._options.fontFamily;
  context.textBaseline = "hanging";
  context.fillStyle = this._options.color.toRGBA();
};

/**
 * Iterate over all lines and split them into multiple lines, depending
 * on the width they need
 * @param {RenderingContext2d} context
 * @param {Number} maxWidth
 * @return {Array.<string>}
 * @private
 */
TextOperation.prototype._buildOutputLines = function(context, maxWidth) {
  var inputLines = this._options.text.split("\n");
  var outputLines = [];
  var currentWords = [];

  for (var lineNum = 0; lineNum < inputLines.length; lineNum++) {
    var inputLine = inputLines[lineNum];
    var lineWords = inputLine.split(" ");

    for (var wordNum = 0; wordNum < lineWords.length; wordNum++) {
      var currentWord = lineWords[wordNum];
      currentWords.push(currentWord);
      var currentLine = currentWords.join(" ");
      var lineWidth = context.measureText(currentLine).width;

      if (lineWidth > maxWidth && currentWords.length === 1) {
        outputLines.push(currentWords[0]);
        currentWords = [];
      } else if (lineWidth > maxWidth) {
        // Remove the last word
        var lastWord = currentWords.pop();

        // Add the line, clear the words
        outputLines.push(currentWords.join(" "));
        currentWords = [];

        // Make sure to use the last word for the next line
        currentWords = [lastWord];
      } else if (wordNum === lineWords.length - 1) {
        // Add the line, clear the words
        outputLines.push(currentWords.join(" "));
        currentWords = [];
      }
    }

    // Line ended, but there's words left
    if (currentWords.length) {
      outputLines.push(currentWords.join(" "));
      currentWords = [];
    }

  }
  return outputLines;
};

module.exports = TextOperation;
