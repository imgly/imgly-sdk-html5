/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Promise from '../vendor/promise'
import Matrix from '../lib/math/matrix'
import Operation from './operation'

/**
 * An operation that can rotate and flip an image
 *
 * @class
 * @alias PhotoEditorSDK.Operations.OrientationOperation
 * @extends PhotoEditorSDK.Operation
 */
class OrientationOperation extends Operation {
  constructor (...args) {
    super(...args)

    /**
     * The vertex shader used for this operation
     */
    this.vertexShader = require('raw!../shaders/generic/sprite.vert')
  }

  /**
   * Rotates the image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    return new Promise((resolve, reject) => {
      const actualDegrees = this._options.rotation % 360
      const radians = actualDegrees * (Math.PI / 180)

      // Apply rotation
      const c = Math.cos(radians)
      const s = Math.sin(radians)
      let rotationMatrix = new Matrix()
      rotationMatrix.a = c
      rotationMatrix.b = -s
      rotationMatrix.c = s
      rotationMatrix.d = c

      // Apply flip
      let flipMatrix = new Matrix()
      flipMatrix.a = this._options.flipHorizontally ? -1 : 1
      flipMatrix.d = this._options.flipVertically ? -1 : 1

      const matrix = flipMatrix.multiply(rotationMatrix)

      // Run the shader
      renderer.setTextureDimensions(this.getNewDimensions(renderer, renderer.getTextureDimensions()))
      renderer.runShader(this.vertexShader, null, {
        uniforms: {
          u_projMatrix: { type: 'mat3fv', value: matrix.toArray() }
        }
      })
      resolve()
    })
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @return {Promise}
   * @private
   */
  _renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      const canvas = renderer.getCanvas()
      const context = renderer.getContext()
      const actualDegrees = this._options.rotation % 360
      const radians = actualDegrees * Math.PI / 180
      const newDimensions = this.getNewDimensions(renderer)

      // Clone the canvas
      const tempCanvas = renderer.cloneCanvas()

      renderer.resizeTo(newDimensions)
      context.save()
      context.translate(canvas.width / 2, canvas.height / 2)
      context.rotate(radians)
      context.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2)
      context.restore()

      resolve()
    })
  }

  /**
   * Gets the new dimensions
   * @param {Renderer} renderer
   * @param {Vector2} [dimensions]
   * @return {Vector2}
   */
  getNewDimensions (renderer, dimensions) {
    dimensions = dimensions || renderer.getSize()

    let actualDegrees = this._options.rotation % 360
    if (actualDegrees % 180 !== 0) {
      dimensions.flip()
    }

    return dimensions
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
OrientationOperation.identifier = 'orientation'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
OrientationOperation.prototype.availableOptions = {
  rotation: { type: 'number', default: 0, validation: function (value) {
    if (value % 90 !== 0) {
      throw new Error('OrientationOperation: `rotation` has to be a multiple of 90.')
    }
  }},
  flipVertically: { type: 'boolean', default: false },
  flipHorizontally: { type: 'boolean', default: false }
}

export default OrientationOperation
