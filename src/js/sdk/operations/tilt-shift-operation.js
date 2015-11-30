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
import StackBlur from '../vendor/stack-blur'
import Promise from '../vendor/promise'

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias PhotoEditorSDK.Operations.TiltShiftOperation
 * @extends PhotoEditorSDK.Operation
 */
class TiltShiftOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._fragmentShader = require('raw!../shaders/tilt-shift.frag')

    this._cachedBlurredCanvas = null
    this._lastBlurRadius = this._options.blurRadius
    this._lastGradientRadius = this._options.gradientRadius
  }

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    return new Promise((resolve, reject) => {
      var canvas = renderer.getCanvas()
      var canvasSize = new Vector2(canvas.width, canvas.height)

      var start = this._options.start.clone()
      var end = this._options.end.clone()

      if (this._options.numberFormat === 'relative') {
        start.multiply(canvasSize)
        end.multiply(canvasSize)
      }

      start.y = canvasSize.y - start.y
      end.y = canvasSize.y - end.y

      var delta = end.clone().subtract(start)
      var d = Math.sqrt(delta.x * delta.x + delta.y * delta.y)

      var uniforms = {
        blurRadius: { type: 'f', value: this._options.blurRadius },
        gradientRadius: { type: 'f', value: this._options.gradientRadius },
        start: { type: '2f', value: [start.x, start.y] },
        end: { type: '2f', value: [end.x, end.y] },
        delta: { type: '2f', value: [delta.x / d, delta.y / d] },
        texSize: { type: '2f', value: [canvas.width, canvas.height] }
      }

      if (!this._glslPrograms[renderer.id]) {
        this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
          null,
          this._fragmentShader
        )
      }

      renderer.runProgram(this._glslPrograms[renderer.id], { uniforms })

      // Update delta for second pass
      uniforms.delta.value = [-delta.y / d, delta.x / d]

      renderer.runProgram(this._glslPrograms[renderer.id], { uniforms })
      resolve()
    })
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @return {Promise}
   */
  _renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      const canvas = renderer.getCanvas()

      const optionsChanged = this._options.blurRadius !== this._lastBlurRadius ||
        this._options.gradientRadius !== this._lastGradientRadius
      let blurryCanvas
      if (optionsChanged || this._cachedBlurredCanvas === null) {
        // Blur and cache canvas
        blurryCanvas = this._blurCanvas(renderer)
        this._cachedBlurredCanvas = blurryCanvas
        this._lastBlurRadius = this._options.blurRadius
        this._lastGradientRadius = this._options.gradientRadius
      } else {
        // Use cached canvas
        blurryCanvas = this._cachedBlurredCanvas
      }

      const maskCanvas = this._createMask(renderer)
      this._applyMask(canvas, blurryCanvas, maskCanvas)

      resolve()
    })
  }

  /**
   * Creates a blurred copy of the canvas
   * @param  {CanvasRenderer} renderer
   * @return {Canvas}
   * @private
   */
  _blurCanvas (renderer) {
    var newCanvas = renderer.cloneCanvas()
    var blurryContext = newCanvas.getContext('2d')
    var blurryImageData = blurryContext.getImageData(0, 0, newCanvas.width, newCanvas.height)
    StackBlur.stackBlurCanvasRGBA(blurryImageData, 0, 0, newCanvas.width, newCanvas.height, this._options.blurRadius)
    blurryContext.putImageData(blurryImageData, 0, 0)

    return newCanvas
  }

  /**
   * Creates the mask canvas
   * @param  {CanvasRenderer} renderer
   * @return {Canvas}
   * @private
   */
  _createMask (renderer) {
    var canvas = renderer.getCanvas()

    var canvasSize = new Vector2(canvas.width, canvas.height)
    var gradientRadius = this._options.gradientRadius

    var maskCanvas = renderer.createCanvas(canvas.width, canvas.height)
    var maskContext = maskCanvas.getContext('2d')

    var start = this._options.start.clone()
    var end = this._options.end.clone()

    if (this._options.numberFormat === 'relative') {
      start.multiply(canvasSize)
      end.multiply(canvasSize)
    }

    let dist = end.clone().subtract(start)
    let middle = start.clone().add(dist.clone().divide(2))

    let totalDist = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2))
    let factor = dist.clone().divide(totalDist)

    let gradientStart = middle.clone()
      .add(gradientRadius * factor.y, -gradientRadius * factor.x)
    let gradientEnd = middle.clone()
      .add(-gradientRadius * factor.y, gradientRadius * factor.x)

    // Build gradient
    var gradient = maskContext.createLinearGradient(
      gradientStart.x, gradientStart.y,
      gradientEnd.x, gradientEnd.y
    )
    gradient.addColorStop(0, '#000000')
    gradient.addColorStop(0.5, '#FFFFFF')
    gradient.addColorStop(1, '#000000')

    // Draw gradient
    maskContext.fillStyle = gradient
    maskContext.fillRect(0, 0, canvas.width, canvas.height)

    return maskCanvas
  }

  /**
   * Applies the blur and mask to the input canvas
   * @param  {Canvas} inputCanvas
   * @param  {Canvas} blurryCanvas
   * @param  {Canvas} maskCanvas
   * @private
   */
  _applyMask (inputCanvas, blurryCanvas, maskCanvas) {
    var inputContext = inputCanvas.getContext('2d')
    var blurryContext = blurryCanvas.getContext('2d')
    var maskContext = maskCanvas.getContext('2d')

    var inputImageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height)
    var pixels = inputImageData.data
    var blurryPixels = blurryContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data
    var maskPixels = maskContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data

    for (let i = 0; i < maskPixels.length; i++) {
      let alpha = maskPixels[i] / 255
      pixels[i] = alpha * pixels[i] + (1 - alpha) * blurryPixels[i]
    }

    inputContext.putImageData(inputImageData, 0, 0)
  }

  /**
   * Sets the dirty state of this operation
   * @param {Boolean} dirty
   * @comment Since blur operations do seperate caching of the
   *          blurred canvas, we need to invalidate the cache when the
   *          dirty state changes.
   */
  set dirty (dirty) {
    super.dirty = dirty
    this._cachedBlurredCanvas = null
  }

  /**
   * Returns the dirty state
   * @type {Boolean}
   */
  get dirty () {
    return super.dirty
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
TiltShiftOperation.identifier = 'tilt-shift'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
TiltShiftOperation.prototype.availableOptions = {
  start: { type: 'vector2', default: new Vector2(0.0, 0.5) },
  end: { type: 'vector2', default: new Vector2(1.0, 0.5) },
  blurRadius: { type: 'number', default: 30 },
  gradientRadius: { type: 'number', default: 50 }
}

export default TiltShiftOperation
