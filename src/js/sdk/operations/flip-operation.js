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
import Promise from '../vendor/promise'

/**
 * An operation that can flip the canvas
 *
 * @class
 * @alias PhotoEditorSDK.Operations.FlipOperation
 * @extends PhotoEditorSDK.Operation
 */
class FlipOperation extends Operation {
  constructor (...args) {
    super(...args)

    /**
     * The fragment shader used for this operation
     */
    this.fragmentShader = require('raw!../shaders/operations/flip.frag')
  }

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    return new Promise((resolve, reject) => {
      renderer.runShader(null, this.fragmentShader, {
        uniforms: {
          u_flipVertical: { type: 'f', value: this._options.vertical },
          u_flipHorizontal: { type: 'f', value: this._options.horizontal }
        }
      })
      resolve()
    })
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      const canvas = renderer.getCanvas()
      const context = renderer.getContext()

      let scaleX = 1, scaleY = 1
      let translateX = 0, translateY = 0

      if (this._options.horizontal) {
        scaleX = -1
        translateX = canvas.width
      }

      if (this._options.vertical) {
        scaleY = -1
        translateY = canvas.height
      }

      // Save the current state
      context.save()

      // Apply the transformation
      context.translate(translateX, translateY)
      context.scale(scaleX, scaleY)

      // Create a temporary canvas so that we can draw the image
      // with the applied transformation
      const tempCanvas = renderer.cloneCanvas()
      context.drawImage(tempCanvas, 0, 0)

      // Restore old transformation
      context.restore()

      resolve()
    })
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FlipOperation.identifier = 'flip'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
FlipOperation.prototype.availableOptions = {
  horizontal: { type: 'boolean', default: false },
  vertical: { type: 'boolean', default: false }
}

export default FlipOperation
