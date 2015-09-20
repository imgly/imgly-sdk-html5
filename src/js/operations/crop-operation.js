/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from './operation'
import Vector2 from '../lib/math/vector2'
import WebGLRenderer from '../renderers/webgl-renderer.js'

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias ImglyKit.Operations.CropOperation
 * @extends ImglyKit.Operation
 */
class CropOperation extends Operation {
  constructor (...args) {
    super(...args)
  }

  /**
   * Rotates and crops the image using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    const start = this._options.start.clone()
    const end = this._options.end.clone()
    const size = end.clone().subtract(start)
    const fragmentShader = null

    if (!this._glslPrograms[renderer.id]) {
      this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(null, fragmentShader, textureCoordinates)
    }

    const textureCoordinates = new Float32Array([
        // First triangle
        start.x, 1.0 - end.y,
        end.x, 1.0 - end.y,
        start.x, 1.0 - start.y,

        // Second triangle
        start.x, 1.0 - start.y,
        end.x, 1.0 - end.y,
        end.x, 1.0 - start.y
      ])
    renderer.runProgram(this._glslPrograms[renderer.id], { textureCoordinates })
  }

  /**
   * Crops the image using Canvas
   * @param {CanvasRenderer} renderer
   * @override
   * @private
   */
  _renderCanvas (renderer) {
    var canvas = renderer.getCanvas()
    var dimensions = new Vector2(canvas.width, canvas.height)

    var newDimensions = this.getNewDimensions(renderer)

    // Create a temporary canvas to draw to
    var newCanvas = renderer.createCanvas()
    newCanvas.width = newDimensions.x
    newCanvas.height = newDimensions.y
    var newContext = newCanvas.getContext('2d')

    // The upper left corner of the cropped area on the original image
    var startPosition = this._options.start.clone()

    if (this._options.numberFormat === 'relative') {
      startPosition.multiply(dimensions)
    }

    // Draw the source canvas onto the new one
    newContext.drawImage(canvas,
      startPosition.x, startPosition.y, // source x, y
      newDimensions.x, newDimensions.y, // source dimensions
      0, 0, // destination x, y
      newDimensions.x, newDimensions.y // destination dimensions
      )

    // Set the new canvas
    renderer.setCanvas(newCanvas)
  }

  /**
   * Gets the new dimensions
   * @param {Renderer} renderer
   * @param {Vector2} [dimensions]
   * @return {Vector2}
   */
  getNewDimensions (renderer, dimensions) {
    let canvas = renderer.getCanvas()
    dimensions = dimensions || new Vector2(canvas.width, canvas.height)

    let newDimensions = this._options.end
      .clone()
      .subtract(this._options.start)

    if (this._options.numberFormat === 'relative') {
      newDimensions.multiply(dimensions)
    }

    return newDimensions
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
CropOperation.prototype.identifier = 'crop'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
CropOperation.prototype.availableOptions = {
  start: { type: 'vector2', required: true, default: new Vector2(0, 0) },
  end: { type: 'vector2', required: true, default: new Vector2(1, 1) }
}

export default CropOperation
