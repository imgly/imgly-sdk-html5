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

    this._textureIndex = 1
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
      uniform sampler2D u_textImage;
      uniform vec2 u_position;
      uniform vec2 u_size;

      void main() {
        vec4 color0 = texture2D(u_image, v_texCoord);
        vec2 relative = (v_texCoord - u_position) / u_size;

        if (relative.x >= 0.0 && relative.x <= 1.0 &&
          relative.y >= 0.0 && relative.y <= 1.0) {

            vec4 color1 = texture2D(u_textImage, relative);

            // GL_SOURCE_ALPHA, GL_ONE_MINUS_SOURCE_ALPHA
            gl_FragColor = color1 + color0 * (1.0 - color1.a);

        } else {

          gl_FragColor = color0;

        }
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
    var pathCanvas = this._renderBrushCanvas(renderer)
    var gl = renderer.getContext()
    this._setupProgram(renderer)
    this._uploadCanvasToTexture(gl, pathCanvas)

    // use the complete area available
    var position = new Vector2(0, 0)
    var size = new Vector2(1, 1)

    // Execute the shader
    renderer.runShader(null, this._fragmentShader, {
      uniforms: {
        u_textImage: { type: 'i', value: this._textureIndex },
        u_position: { type: '2f', value: [position.x, position.y] },
        u_size: { type: '2f', value: [size.x, size.y] }
      }
    })
  }

  _uploadCanvasToTexture (gl, canvas) {
    gl.activeTexture(gl.TEXTURE0 + this._textureIndex)
    this._texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this._texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // Set premultiplied alpha
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
    gl.activeTexture(gl.TEXTURE0)
  }

  _setupProgram (renderer) {
    if (!this._glslPrograms[renderer.id]) {
      this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
        this._vertexShader,
        this._fragmentShader
      )
    }
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @private
   */
  _renderCanvas (renderer) {
    var pathCanvas = this._renderBrushCanvas(renderer)
    var context = renderer.getContext()
    context.drawImage(pathCanvas, 0, 0)
  }

  /**
   * Renders the text canvas that will be used as a texture in WebGL
   * and as an image in canvas
   * @return {Canvas}
   * @private
   */
  _renderBrushCanvas (renderer) {
    let canvas = renderer.createCanvas()
    let context = canvas.getContext('2d')

    let outputCanvas = renderer.getCanvas()
    let canvasSize = new Vector2(outputCanvas.width, outputCanvas.height)
    canvas.width = canvasSize.x
    canvas.height = canvasSize.y

    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    context.strokeStyle = this._options.color.toHex()
    context.lineJoin = 'round'
    context.lineWidth = this._options.thickness

    var controlPoints = this._options.controlPoints.map((point) => {
      return point.clone().multiply(canvasSize)
    })

    for (var i = 0; i < controlPoints.length; i++) {
      context.beginPath()
      if (this._options.buttonStatus[i] && i) {
        context.moveTo(controlPoints[i - 1].x, controlPoints[i - 1].y)
      } else {
        context.moveTo(controlPoints[i].x - 1, controlPoints[i].y)
      }
      context.lineTo(controlPoints[i].x, controlPoints[i].y)
      context.closePath()
      context.stroke()
    }

    return canvas
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
  color: { type: 'color', default: new Color(1, 0, 0, 1) },
  thickness: { type: 'number', default: 5 },
  controlPoints: { type: 'object', default: [] },
  buttonStatus: { type: 'object', default: [] }
}

export default BrushOperation
