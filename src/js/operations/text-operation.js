"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from "./operation";
import Vector2 from "../lib/math/vector2";
import Color from "../lib/color";

/**
 * An operation that can draw text on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.TextOperation
 * @extends ImglyKit.Operation
 */
class TextOperation extends Operation {
  constructor (...args) {
    this.availableOptions = {
      fontSize: { type: "number", default: 0.1 },
      lineHeight: { type: "number", default: 1.1 },
      fontFamily: { type: "string", default: "Times New Roman" },
      fontWeight: { type: "string", default: "normal" },
      alignment: { type: "string", default: "left", available: ["left", "center", "right"] },
      verticalAlignment: { type: "string", default: "top", available: ["top", "center", "bottom"] },
      color: { type: "color", default: new Color(1, 1, 1, 1) },
      backgroundColor: { type: "color", default: new Color(0, 0, 0, 0) },
      position: { type: "vector2", default: new Vector2(0, 0) },
      text: { type: "string", required: true },
      maxWidth: { type: "number", default: 1.0 }
    };

    /**
     * The texture index used for the text
     * @type {Number}
     * @private
     */
    this._textureIndex = 1;

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = `
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
    `;

    super(...args);
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * operations.
   * @type {String}
   */
  get identifier () {
    return "text";
  }


  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    var textCanvas = this._renderTextCanvas(renderer);

    var canvas = renderer.getCanvas();
    var gl = renderer.getContext();

    var position = this._options.position.clone();
    var canvasSize = new Vector2(canvas.width, canvas.height);
    var size = new Vector2(textCanvas.width, textCanvas.height).divide(canvasSize);

    if (this._options.numberFormat === "absolute") {
      position.divide(canvasSize);
    }

    position.y = 1 - position.y; // Invert y
    position.y -= size.y; // Fix y

    // Adjust vertical alignment
    if (this._options.verticalAlignment === "center") {
      position.y += size.y / 2;
    } else if (this._options.verticalAlignment === "bottom") {
      position.y += size.y;
    }

    // Adjust horizontal alignment
    if (this._options.alignment === "center") {
      position.x -= size.x / 2;
    } else if (this._options.alignment === "right") {
      position.x -= size.x;
    }

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
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas (renderer) {
    var textCanvas = this._renderTextCanvas(renderer);

    var canvas = renderer.getCanvas();
    var context = renderer.getContext();

    var canvasSize = new Vector2(canvas.width, canvas.height);
    var scaledPosition = this._options.position.clone();

    if (this._options.numberFormat === "relative") {
      scaledPosition.multiply(canvasSize);
    }

    // Adjust vertical alignment
    if (this._options.verticalAlignment === "center") {
      scaledPosition.y -= textCanvas.height / 2;
    } else if (this._options.verticalAlignment === "bottom") {
      scaledPosition.y -= textCanvas.height;
    }

    // Adjust horizontal alignment
    if (this._options.alignment === "center") {
      scaledPosition.x -= textCanvas.width / 2;
    } else if (this._options.alignment === "right") {
      scaledPosition.x -= textCanvas.width;
    }

    context.drawImage(textCanvas, scaledPosition.x, scaledPosition.y);
  }

  /**
   * Renders the text canvas that will be used as a texture in WebGL
   * and as an image in canvas
   * @return {Canvas}
   * @private
   */
  _renderTextCanvas (renderer) {
    let line, lineNum;
    let canvas = renderer.createCanvas();
    let context = canvas.getContext("2d");

    let outputCanvas = renderer.getCanvas();
    let canvasSize = new Vector2(outputCanvas.width, outputCanvas.height);

    let maxWidth = this._options.maxWidth;
    let actualFontSize = this._options.fontSize * canvasSize.y;
    let actualLineHeight = this._options.lineHeight * actualFontSize;

    if (this._options.numberFormat === "relative") {
      maxWidth *= renderer.getCanvas().width;
    }

    // Apply text options
    this._applyTextOptions(renderer, context);

    let boundingBox = new Vector2();

    let lines = this._options.text.split("\n");
    if (typeof maxWidth !== "undefined") {
      // Calculate the bounding box
      boundingBox.x = maxWidth;
      lines = this._buildOutputLines(context, maxWidth);
    } else {
      for (lineNum = 0; lineNum < lines.length; lineNum++) {
        line = lines[lineNum];
        boundingBox.x = Math.max(boundingBox.x, context.measureText(line).width);
      }
    }

    // Calculate boundingbox height
    boundingBox.y = actualLineHeight * lines.length;

    // Resize the canvas
    canvas.width = boundingBox.x;
    canvas.height = boundingBox.y;

    // Get the context again
    context = canvas.getContext("2d");

    // Render background color
    context.fillStyle = this._options.backgroundColor.toRGBA();
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Apply text options
    this._applyTextOptions(renderer, context);

    // Draw lines
    for (lineNum = 0; lineNum < lines.length; lineNum++) {
      line = lines[lineNum];
      this._drawText(context, line, actualLineHeight * lineNum);
    }

    return canvas;
  }

  /**
   * Applies the text options on the given context
   * @param  {Renderer} renderer
   * @param  {RenderingContext2D} context
   * @private
   */
  _applyTextOptions (renderer, context) {
    let canvas = renderer.getCanvas();
    let canvasSize = new Vector2(canvas.width, canvas.height);
    let actualFontSize = this._options.fontSize * canvasSize.y;

    context.font = this._options.fontWeight + " " +
      actualFontSize + "px " +
      this._options.fontFamily;
    context.textBaseline = "top";
    context.textAlign = this._options.alignment;
    context.fillStyle = this._options.color.toRGBA();
  }

  /**
   * Iterate over all lines and split them into multiple lines, depending
   * on the width they need
   * @param {RenderingContext2d} context
   * @param {Number} maxWidth
   * @return {Array.<string>}
   * @private
   */
  _buildOutputLines (context, maxWidth) {
    var inputLines = this._options.text.split("\n");
    var outputLines = [];
    var currentChars = [];

    for (var lineNum = 0; lineNum < inputLines.length; lineNum++) {
      var inputLine = inputLines[lineNum];
      var lineChars = inputLine.split("");

      if (lineChars.length === 0) {
        outputLines.push("");
      }

      for (var charNum = 0; charNum < lineChars.length; charNum++) {
        var currentChar = lineChars[charNum];
        currentChars.push(currentChar);
        var currentLine = currentChars.join("");
        var lineWidth = context.measureText(currentLine).width;

        if (lineWidth > maxWidth && currentChars.length === 1) {
          outputLines.push(currentChars[0]);
          currentChars = [];
        } else if (lineWidth > maxWidth) {
          // Remove the last word
          var lastWord = currentChars.pop();

          // Add the line, clear the words
          outputLines.push(currentChars.join(""));
          currentChars = [];

          // Make sure to use the last word for the next line
          currentChars = [lastWord];
        } else if (charNum === lineChars.length - 1) {
          // Add the line, clear the words
          outputLines.push(currentChars.join(""));
          currentChars = [];
        }
      }

      // Line ended, but there's words left
      if (currentChars.length) {
        outputLines.push(currentChars.join(""));
        currentChars = [];
      }

    }
    return outputLines;
  }

  /**
   * Draws the given line onto the given context at the given Y position
   * @param  {RenderingContext2D} context
   * @param  {String} text
   * @param  {Number} y
   * @private
   */
  _drawText (context, text, y) {
    var canvas = context.canvas;
    if (this._options.alignment === "center") {
      context.fillText(text, canvas.width / 2, y);
    } else if (this._options.alignment === "left") {
      context.fillText(text, 0, y);
    } else if (this._options.alignment === "right") {
      context.fillText(text, canvas.width, y);
    }
  }
}

export default TextOperation;
