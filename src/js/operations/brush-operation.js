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

const DEFAULT_THICKNESS = 0.02
const DEFAULT_COLOR = new Color(1.0, 0.0, 0.0, 1.0)

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

    this._brushCanvas = document.createElement('canvas')
  }

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    this.renderBrushCanvas(renderer.getCanvas())
    var gl = renderer.getContext()
    this._setupProgram(renderer)
    this._uploadCanvasToTexture(gl, this._brushCanvas)

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

  /**
   * Uploads pixel-data contained in a canvas onto a texture
   * @param  {Context} gl    gl-context (use renderer.getContext())
   * @param  {Canvas} canvas A canvas that contains the pixel data for the texture
   */
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

  /**
   * This method initializes the shaders once
   * @param  {WebGLRenderer} renderer WebGLRenderer that is used to compile the
   * shafers
   */
  _setupProgram (renderer) {
    if (!this._glslPrograms[renderer.id]) {
      this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
        this._vertexShader,
        this._fragmentShader
      )
    }
  }

  /**
   * Renders the brush operation to a canvas
   * @param  {CanvasRenderer} renderer
   * @private
   */
  _renderCanvas (renderer) {
    this.renderBrushCanvas(renderer.getCanvas())
    var context = renderer.getContext()
    context.drawImage(this._brushCanvas, 0, 0)
  }

  /**
   * Renders the brush canvas that will be used as a texture in WebGL
   * and as an image in canvas
   * @param {Canvas} canvas
   * @private
   */
  renderBrushCanvas (outputCanvas, canvas = this._brushCanvas) {
    if (this._dirty) {
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, canvas.width, canvas.height)
    }

    if (canvas.width !== outputCanvas.width ||
        canvas.height !== outputCanvas.height) {
      canvas.width = outputCanvas.width
      canvas.height = outputCanvas.height
    }

    const paths = this._options.paths
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      path.renderToCanvas(canvas)
    }
  }

  /**
   * Creates and adds a new path
   * @param {Number} thickness
   * @param {Color} color
   * @return {BrushOperation.Path}
   */
  createPath (thickness, color) {
    const path = new BrushOperation.Path(this, thickness, color)
    this._options.paths.push(path)
    return path
  }

  /**
   * returns the longer size of the canvas
   * @param {Canvas}
   * @return {Number}
   */
  _getLongerSideSize (canvas) {
    return Math.max(canvas.width, canvas.height)
  }

  /**
   * returns the last color
   * @return {Color}
   */
  getLastColor () {
    const lastPath = this._options.paths[this._options.paths.length - 1]
    if (!lastPath) return DEFAULT_COLOR
    return lastPath.getColor()
  }

  /**
   * returns the last thickness
   * @return {Thickness}
   */
  getLastThickness () {
    const lastPath = this._options.paths[this._options.paths.length - 1]
    if (!lastPath) return DEFAULT_THICKNESS
    return lastPath.getThickness()
  }

  /**
   * Gets called when this operation has been set to dirty
   * @private
   */
  _onDirty () {
    this._options.paths.forEach((path) => {
      path.setDirty()
    })
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
  paths: { type: 'array', default: [] }
}

/**
 * Represents a path that can be drawn on a canvas
 */
BrushOperation.Path = class Path {
  constructor (operation, thickness, color) {
    this._thickness = thickness
    this._color = color
    this._controlPoints = []
  }

  renderToCanvas (canvas) {
    if (this._controlPoints.length < 2) return

    let lastControlPoint = this._controlPoints[0]
    let controlPoint = lastControlPoint
    for (let i = 1; i < this._controlPoints.length; i++) {
      controlPoint = this._controlPoints[i]
      controlPoint.renderToCanvas(canvas, lastControlPoint)
      lastControlPoint = controlPoint
    }
  }

  addControlPoint (position) {
    const controlPoint = new BrushOperation.ControlPoint(this, position)
    this._controlPoints.push(controlPoint)
  }

  getColor () {
    return this._color
  }

  getThickness () {
    return this._thickness
  }

  setDirty () {
    this._controlPoints.forEach((point) => {
      point.setDirty()
    })
  }
}

/**
 * Represents a control point of a path
 */
BrushOperation.ControlPoint = class ControlPoint {
  constructor (path, position) {
    this._path = path
    this._drawnCanvases = []
    this._position = position
  }

  renderToCanvas (canvas, lastControlPoint) {
    if (this._drawnCanvases.indexOf(canvas) !== -1) {
      // This control point has already been drawn on this canvas. Ignore.
      return
    }

    const context = canvas.getContext('2d')
    const canvasSize = new Vector2(canvas.width, canvas.height)
    const longerSide = Math.max(canvasSize.x, canvasSize.y)

    const position = this._position.clone().multiply(canvasSize)
    const lastPosition = lastControlPoint.getPosition()
      .clone()
      .multiply(canvasSize)

    context.beginPath()
    context.lineJoin = 'round'
    context.strokeStyle = this._path.getColor().toHex()
    context.lineWidth = this._path.getThickness() * longerSide
    context.moveTo(lastPosition.x, lastPosition.y)
    context.lineTo(position.x, position.y)
    context.closePath()
    context.stroke()
    this._drawnCanvases.push(canvas)
  }

  getPosition () {
    return this._position.clone()
  }

  setDirty () {
    this._drawnCanvases = []
  }
}

export default BrushOperation
