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
import Operation from './operation'

/**
 * An operation that can crop out a part of the image and rotates it
 *
 * @class
 * @alias PhotoEditorSDK.Operations.RotationOperation
 * @extends PhotoEditorSDK.Operation
 */
class RotationOperation extends Operation {
  constructor (...args) {
    super(...args)

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
        v_texCoord = a_texCoord;
      }
    `
  }

  /**
   * Rotates the image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    return new Promise((resolve, reject) => {
      var actualDegrees = this._options.degrees % 360

      // Build the rotation matrix
      var radians = actualDegrees * (Math.PI / 180)
      var c = Math.cos(radians)
      var s = Math.sin(radians)
      var rotationMatrix = [
        c, -s, 0,
        s, c, 0,
        0, 0, 1
      ]

      // Run the shader
      renderer.setTextureDimensions(this.getNewDimensions(renderer, renderer.getTextureDimensions()))
      renderer.runShader(this.vertexShader, null, {
        uniforms: {
          u_matrix: { type: 'mat3fv', value: rotationMatrix }
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
      const actualDegrees = this._options.degrees % 360
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

    let actualDegrees = this._options.degrees % 360
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
RotationOperation.identifier = 'rotation'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
RotationOperation.prototype.availableOptions = {
  degrees: { type: 'number', default: 0, validation: function (value) {
    if (value % 90 !== 0) {
      throw new Error('RotationOperation: `rotation` has to be a multiple of 90.')
    }
  }}
}

export default RotationOperation
