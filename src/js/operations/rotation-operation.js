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
 * An operation that can rotate the canvas
 *
 * @class
 * @alias ImglyKit.Operations.RotationOperation
 * @extends ImglyKit.Operation
 */
class RotationOperation extends Operation {
  constructor (...args) {
    this.availableOptions = {

    };



    super(...args);
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * operations.
   * @type {String}
   */
  get identifier () {
    return "rotation";
  }

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {

  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas (renderer) {
    var canvas = renderer.getCanvas();

    var actualDegrees = this._options.degrees % 360;
    let newDimensions = this.getNewDimensions(renderer);

    // Create a rotated canvas
    var newCanvas = renderer.createCanvas();
    newCanvas.width = newDimensions.x;
    newCanvas.height = newDimensions.y;
    var newContext = newCanvas.getContext("2d");

    newContext.save();

    // Translate the canvas
    newContext.translate(newCanvas.width / 2, newCanvas.height / 2);

    // Rotate the canvas
    newContext.rotate(actualDegrees * (Math.PI / 180));

    // Create a temporary canvas so that we can draw the image
    // with the applied transformation
    var tempCanvas = renderer.cloneCanvas();
    newContext.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2);

    // Restore old transformation
    newContext.restore();

    renderer.setCanvas(newCanvas);
  }

  /**
   * Gets the new dimensions
   * @param {Renderer} renderer
   * @param {Vector2} [dimensions]
   * @return {Vector2}
   * @private
   */
  getNewDimensions (renderer, dimensions) {
    let canvas = renderer.getCanvas();
    dimensions = dimensions || new Vector2(canvas.width, canvas.height);

    let actualDegrees = this._options.degrees % 360;

    if (actualDegrees % 180 !== 0) {
      let tempX = dimensions.x;
      dimensions.x = dimensions.y;
      dimensions.y = tempX;
    }

    return dimensions;
  }
}

export default RotationOperation;
