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

/**
 * An operation that can crop out a part of the image and rotates it
 *
 * @class
 * @alias ImglyKit.Operations.CropRotationOperation
 * @extends ImglyKit.Operation
 */
class CropRotationOperation extends Operation {
  constructor (...args) {
    this.availableOptions = {
      start: { type: "vector2", required: true, default: new Vector2(0, 0) },
      end: { type: "vector2", required: true, default: new Vector2(1, 1) },
      degrees: { type: "number", default: 0, validation: function (value) {
        if (value % 90 !== 0) {
          throw new Error("RotationOperation: `rotation` has to be a multiple of 90.");
        }
      }}
    };

    /**
     * The fragment shader used for this operation
     */
    this.vertexShader = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      uniform mat3 u_matrix;

      void main() {
        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
        // gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
      }
    `;

    /**
     * The fragment shader used for this operation
     */
    this.fragmentShader = `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      uniform vec2 u_cropStart;
      uniform vec2 u_cropEnd;

      void main() {
        vec2 size = u_cropEnd - u_cropStart;
        gl_FragColor = texture2D(u_image, v_texCoord * size + u_cropStart);
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
    return "crop-rotation";
  }

  /**
   * Rotates and crops the image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    this._renderRotationWebGL(renderer);
    this._renderCropWebGL(renderer);
  }

  /**
   * Crops the image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderCropWebGL (renderer) {
    var canvas = renderer.getCanvas();
    var gl = renderer.getContext();
    var canvasSize = new Vector2(canvas.width, canvas.height);

    var start = this._options.start.clone();
    var end = this._options.end.clone();

    if (this._options.numberFormat === "absolute") {
      start.divide(canvasSize);
      end.divide(canvasSize);
    }

    // 0..1 > 1..0 on y-axis
    var originalStartY = start.y;
    start.y = 1 - end.y;
    end.y = 1 - originalStartY;

    // The new size
    var newDimensions = this.getNewCropDimensions(renderer);

    // Make sure we don't resize the input texture
    var lastTexture = renderer.getLastTexture();

    // Resize all textures except the one we use as input
    var textures = renderer.getTextures();
    var texture;
    for (var i = 0; i < textures.length; i++) {
      texture = textures[i];
      if (texture === lastTexture) continue;

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, newDimensions.x, newDimensions.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    // Resize the canvas
    canvas.width = newDimensions.x;
    canvas.height = newDimensions.y;

    // Run the cropping shader
    renderer.runShader(null, this.fragmentShader, {
      uniforms: {
        u_cropStart: { type: "2f", value: [start.x, start.y] },
        u_cropEnd: { type: "2f", value: [end.x, end.y] }
      }
    });
  }

  /**
   * Rotates this image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  _renderRotationWebGL (renderer) {
    var canvas = renderer.getCanvas();
    var gl = renderer.getContext();

    var actualDegrees = this._options.degrees % 360;
    var lastTexture = renderer.getLastTexture();

    // If we're not rotating by 180 degrees, we need to resize the canvas
    // and the texture
    if (actualDegrees % 180 !== 0) {
      let newDimensions = this.getNewRotationDimensions(renderer);

      // Resize the canvas
      canvas.width = newDimensions.x;
      canvas.height = newDimensions.y;

      // Resize the current texture
      var currentTexture = renderer.getCurrentTexture();
      gl.bindTexture(gl.TEXTURE_2D, currentTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      // Resize all other textures except the input texture
      var textures = renderer.getTextures();
      var texture;
      for (var i = 0; i < textures.length; i++) {
        texture = textures[i];

        // We resize the input texture at the end
        if (texture === lastTexture) continue;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
    }

    // Build the rotation matrix
    var radians = actualDegrees * (Math.PI / 180);
    var c = Math.cos(radians);
    var s = Math.sin(radians);
    var rotationMatrix = [
      c,-s, 0,
      s, c, 0,
      0, 0, 1
    ];

    // Run the shader
    renderer.runShader(this.vertexShader, null, {
      uniforms: {
        u_matrix: { type: "mat3fv", value: rotationMatrix }
      }
    });
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas (renderer) {
    var canvas = renderer.getCanvas();
    var dimensions = new Vector2(canvas.width, canvas.height);

    var newDimensions = this.getNewDimensions(renderer);

    // Create a temporary canvas to draw to
    var newCanvas = renderer.createCanvas();
    newCanvas.width = newDimensions.x;
    newCanvas.height = newDimensions.y;
    var newContext = newCanvas.getContext("2d");

    // The upper left corner of the cropped area on the original image
    var startPosition = this._options.start.clone();

    if (this._options.numberFormat === "relative") {
      startPosition.multiply(dimensions);
    }

    // Draw the source canvas onto the new one
    newContext.drawImage(canvas,
      startPosition.x, startPosition.y, // source x, y
      newDimensions.x, newDimensions.y, // source dimensions
      0, 0, // destination x, y
      newDimensions.x, newDimensions.y // destination dimensions
      );

    // Set the new canvas
    renderer.setCanvas(newCanvas);
  }

  /**
   * Gets the new dimensions
   * @param {Renderer} renderer
   * @param {Vector2} [dimensions]
   * @return {Vector2}
   */
  getNewDimensions (renderer, dimensions) {
    let canvas = renderer.getCanvas();
    dimensions = dimensions || new Vector2(canvas.width, canvas.height);

    let newDimensions = this._options.end
      .clone()
      .subtract(this._options.start);

    if (this._options.numberFormat === "relative") {
      newDimensions.multiply(dimensions);
    }

    let actualDegrees = this._options.degrees % 360;
    if (actualDegrees % 180 !== 0) {
      let tempX = newDimensions.x;
      newDimensions.x = newDimensions.y;
      newDimensions.y = tempX;
    }

    return newDimensions;
  }

  /**
   * Gets the new dimensions after cropping
   * @param {Renderer} renderer
   * @returns {Vector2}
   */
  getNewCropDimensions (renderer) {
    let canvas = renderer.getCanvas();
    let newDimensions = new Vector2(canvas.width, canvas.height);

    let size = this._options.end
      .clone()
      .subtract(this._options.start);

    if (this._options.numberFormat === "relative") {
      size.multiply(newDimensions);
    }

    return size;
  }

  /**
   * Gets the new dimensions after rotating
   * @param {Renderer} renderer
   * @returns {Vector2}
   */
  getNewRotationDimensions (renderer) {
    let canvas = renderer.getCanvas();
    let newDimensions = new Vector2(canvas.width, canvas.height);

    let actualDegrees = this._options.degrees % 360;
    if (actualDegrees % 180 !== 0) {
      let tempX = newDimensions.x;
      newDimensions.x = newDimensions.y;
      newDimensions.y = tempX;
    }

    return newDimensions;
  }
}

export default CropRotationOperation;
