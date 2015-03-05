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
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias ImglyKit.Operations.CropOperation
 * @extends ImglyKit.Operation
 */
class CropOperation extends Operation {
  constructor (...args) {
    this.availableOptions = {
      start: { type: "vector2", required: true, default: new Vector2(0, 0) },
      end: { type: "vector2", required: true, default: new Vector2(1, 1) }
    };

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
    return "crop";
  }

  /**
   * Rotates and crops the image using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    var canvas = renderer.getCanvas();
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
    var newDimensions = this.getNewDimensions(renderer);

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
   * Crops the image using Canvas
   * @param {CanvasRenderer} renderer
   * @override
   * @private
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

    return newDimensions;
  }
}

export default CropOperation;
