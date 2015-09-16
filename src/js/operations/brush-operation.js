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
 * An operation that can draw brushes on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.BrushOperation
 * @extends ImglyKit.Operation
 */
class BrushOperation extends Operation {
  constructor (...args) {
    super(...args)

    /**
     * The vertex shader used for this operation
     */
    this._vertexShader = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;

      void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
      }
    `

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;

      void main() {
        vec4 fragColor = texture2D(u_image, v_texCoord);
        gl_FragColor = fragColor;
      }
    `
  }

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    // Setup program
    if (!this._glslPrograms[renderer.id]) {
      this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
        this._vertexShader,
        this._fragmentShader
      )
    }

    const uniforms = {
      exampleUniform: { type: 'f', value: 0.1 }
    }
    renderer.runProgram(this._glslPrograms[renderer.id], { uniforms })
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @private
   */
  _renderCanvas (renderer) {
    var canvas = renderer.getCanvas()
    var context = renderer.getContext()

    // Use `context` for drawing stuff
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
BrushOperation.prototype.identifier = 'brush'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
BrushOperation.prototype.availableOptions = {
  color: { type: 'color', default: new Color(0, 0, 0, 1) },
  thickness: { type: 'number', default: 0.02 }
}

export default BrushOperation
