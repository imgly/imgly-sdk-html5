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
import Color from '../lib/color'

/**
 * An operation that can draw a frame on the canvas
 *
 * @class
 * @alias PhotoEditorSDK.Operations.FrameOperation
 * @extends PhotoEditorSDK.Operation
 */
class FrameOperation extends Operation {
  constructor (...args) {
    super(...args)

    /**
     * The texture index used for the frame
     * @type {Number}
     * @private
     */
    this._textureIndex = 1

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = require('raw!../shaders/frame.frag')
  }

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    return new Promise((resolve, reject) => {
      var canvas = renderer.getCanvas()

      var color = this._options.color
      var thickness = this._options.thickness * Math.min(canvas.height, canvas.width)
      var thicknessVec2 = [thickness / canvas.width, thickness / canvas.height]

      let uniforms = {
        u_color: { type: '4f', value: color.toGLColor() },
        u_thickness: { type: '2f', value: thicknessVec2 }
      }

      if (!this._glslPrograms[renderer.id]) {
        this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
          null,
          this._fragmentShader
        )
      }

      renderer.runProgram(this._glslPrograms[renderer.id], { uniforms })

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

      const color = this._options.color
      const thickness = this._options.thickness * Math.min(canvas.width, canvas.height)

      context.save()
      context.beginPath()
      context.lineWidth = thickness * 2
      context.strokeStyle = color.toRGBA()
      context.rect(0, 0, canvas.width, canvas.height)
      context.stroke()
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
FrameOperation.identifier = 'frame'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
FrameOperation.prototype.availableOptions = {
  color: { type: 'color', default: new Color(0, 0, 0, 1) },
  thickness: { type: 'number', default: 0.05 }
}

export default FrameOperation
