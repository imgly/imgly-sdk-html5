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

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias ImglyKit.Operations.RadialBlurOperation
 * @extends ImglyKit.Operation
 */
class RadialBlurOperation extends Operation {
  constructor (...args) {
    super(...args)

    /**
     * The fragment shader used for this operation
     * @internal Based on evanw's glfx.js tilt shift shader:
     *           https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
     */
    this._fragmentShader = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform float blurRadius;
      uniform float gradientRadius;
      uniform vec2 position;
      uniform vec2 delta;
      uniform vec2 texSize;
      varying vec2 v_texCoord;

      float random(vec3 scale, float seed) {
        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
      }

      void main() {
          vec4 color = vec4(0.0);
          float total = 0.0;

          float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
          float radius = smoothstep(0.0, 1.0, abs(distance(v_texCoord * texSize, position)) / (gradientRadius * 2.0)) * blurRadius;
          for (float t = -30.0; t <= 30.0; t++) {
              float percent = (t + offset - 0.5) / 30.0;
              float weight = 1.0 - abs(percent);
              vec4 sample = texture2D(u_image, v_texCoord + delta * percent * radius / texSize);

              sample.rgb *= sample.a;

              color += sample * weight;
              total += weight;
          }

          gl_FragColor = color / total;
          gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
      }
    `

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
    var canvas = renderer.getCanvas()
    var canvasSize = new Vector2(canvas.width, canvas.height)

    var position = this._options.position.clone()
    position.y = 1 - position.y

    if (this._options.numberFormat === 'relative') {
      position.multiply(canvasSize)
    }

    var uniforms = {
      blurRadius: { type: 'f', value: this._options.blurRadius },
      gradientRadius: { type: 'f', value: this._options.gradientRadius },
      position: { type: '2f', value: [position.x, position.y] },
      texSize: { type: '2f', value: [canvas.width, canvas.height] },
      delta: { type: '2f', value: [1, 1] }
    }

    // Setup program
    if (!this._glslPrograms[renderer.id]) {
      this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
        null,
        this._fragmentShader
      )
    }

    renderer.runProgram(this._glslPrograms[renderer.id], { uniforms })

    // Update delta for second pass
    uniforms.delta.value = [-1, 1]

    renderer.runProgram(this._glslPrograms[renderer.id], { uniforms })
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas (renderer) {
    var canvas = renderer.getCanvas()

    let blurRadiusChanged = this._options.blurRadius !== this._lastBlurRadius
    let blurryCanvas
    if (blurRadiusChanged || this._cachedBlurredCanvas === null) {
      // Blur and cache canvas
      blurryCanvas = this._blurCanvas(renderer)
      this._cachedBlurredCanvas = blurryCanvas
      this._lastBlurRadius = this._options.blurRadius
      this._lastGradientRadius = this._options.gradientRadius
    } else {
      // Use cached canvas
      blurryCanvas = this._cachedBlurredCanvas
    }

    var maskCanvas = this._createMask(renderer)

    this._applyMask(canvas, blurryCanvas, maskCanvas)
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

    var position = this._options.position.clone()

    if (this._options.numberFormat === 'relative') {
      position.multiply(canvasSize)
    }

    // Build gradient
    var gradient = maskContext.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, gradientRadius
    )
    gradient.addColorStop(0, '#FFFFFF')
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

    var index, alpha
    for (var y = 0; y < inputCanvas.height; y++) {
      for (var x = 0; x < inputCanvas.width; x++) {
        index = (y * inputCanvas.width + x) * 4
        alpha = maskPixels[index] / 255

        pixels[index] = alpha * pixels[index] + (1 - alpha) * blurryPixels[index]
        pixels[index + 1] = alpha * pixels[index + 1] + (1 - alpha) * blurryPixels[index + 1]
        pixels[index + 2] = alpha * pixels[index + 2] + (1 - alpha) * blurryPixels[index + 2]
      }
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
RadialBlurOperation.prototype.identifier = 'radial-blur'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
RadialBlurOperation.prototype.availableOptions = {
  position: { type: 'vector2', default: new Vector2(0.5, 0.5) },
  gradientRadius: { type: 'number', default: 50 },
  blurRadius: { type: 'number', default: 20 }
}

export default RadialBlurOperation
