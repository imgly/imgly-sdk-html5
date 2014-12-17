"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from "./operation";
import Vector2 from "../lib/math/vector2";
import StackBlur from "../vendor/stack-blur";

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias ImglyKit.Operations.TiltShiftOperation
 * @extends ImglyKit.Operation
 */
class TiltShiftOperation extends Operation {
  constructor (...args) {
    this.availableOptions = {
      start: { type: "vector2", default: new Vector2(0.0, 0.5) },
      end: { type: "vector2", default: new Vector2(1.0, 0.5) },
      blurRadius: { type: "number", default: 30 },
      gradientRadius: { type: "number", default: 50 }
    };

    /**
     * The fragment shader used for this operation
     * @internal Based on evanw's glfx.js tilt shift shader:
     *           https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
     */
    this.fragmentShader = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform float blurRadius;
      uniform float gradientRadius;
      uniform vec2 start;
      uniform vec2 end;
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

          vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));
          float radius = smoothstep(0.0, 1.0, abs(dot(v_texCoord * texSize - start, normal)) / gradientRadius) * blurRadius;
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
    `;

    super(...args);
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * operations.
   * @type {String}
   */
  static get identifier () {
    return "tilt-shift";
  }

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    var canvas = renderer.getCanvas();
    var canvasSize = new Vector2(canvas.width, canvas.height);

    var start = this._options.start.clone();
    var end = this._options.end.clone();

    if (this._options.numberFormat === "relative") {
      start.multiply(canvasSize);
      end.multiply(canvasSize);
    }

    start.y = canvasSize.y - start.y;
    end.y = canvasSize.y - end.y;

    var delta = end.clone().subtract(start);
    var d = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

    var uniforms = {
      blurRadius: { type: "f", value: this._options.blurRadius },
      gradientRadius: { type: "f", value: this._options.gradientRadius },
      start: { type: "2f", value: [start.x, start.y] },
      end: { type: "2f", value: [end.x, end.y] },
      delta: { type: "2f", value: [delta.x / d, delta.y / d] },
      texSize: { type: "2f", value: [canvas.width, canvas.height] }
    };

    renderer.runShader(null, TiltShiftOperation.fragmentShader, {
      uniforms: uniforms
    });

    uniforms.delta.value = [-delta.y / d, delta.x / d];

    renderer.runShader(null, TiltShiftOperation.fragmentShader, {
      uniforms: uniforms
    });
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas (renderer) {
    var canvas = renderer.getCanvas();

    var blurryCanvas = this._blurCanvas(renderer);
    var maskCanvas = this._createMask(renderer);

    this._applyMask(canvas, blurryCanvas, maskCanvas);
  }

  /**
   * Creates a blurred copy of the canvas
   * @param  {CanvasRenderer} renderer
   * @return {Canvas}
   * @private
   */
  _blurCanvas (renderer) {
    var newCanvas = renderer.cloneCanvas();
    var blurryContext = newCanvas.getContext("2d");
    var blurryImageData = blurryContext.getImageData(0, 0, newCanvas.width, newCanvas.height);
    StackBlur.stackBlurCanvasRGBA(blurryImageData, 0, 0, newCanvas.width, newCanvas.height, this._options.blurRadius);
    blurryContext.putImageData(blurryImageData, 0, 0);

    return newCanvas;
  }

  /**
   * Creates the mask canvas
   * @param  {CanvasRenderer} renderer
   * @return {Canvas}
   * @private
   */
  _createMask (renderer) {
    var canvas = renderer.getCanvas();

    var canvasSize = new Vector2(canvas.width, canvas.height);
    var gradientRadius = this._options.gradientRadius;

    var maskCanvas = renderer.createCanvas(canvas.width, canvas.height);
    var maskContext = maskCanvas.getContext("2d");

    var start = this._options.start.clone();
    var end = this._options.end.clone();

    if (this._options.numberFormat === "relative") {
      start.multiply(canvasSize);
      end.multiply(canvasSize);
    }

    var rad = Math.atan((end.y - start.y) / (end.x - start.x));

    var gradientStart = start.clone();
    gradientStart.x += Math.sin(rad * Math.PI / 2) * gradientRadius;
    gradientStart.y -= Math.cos(rad * Math.PI / 2) * gradientRadius;

    var gradientEnd = start.clone();
    gradientEnd.x -= Math.sin(rad * Math.PI / 2) * gradientRadius;
    gradientEnd.y += Math.cos(rad * Math.PI / 2) * gradientRadius;

    // Build gradient
    var gradient = maskContext.createLinearGradient(
      gradientStart.x, gradientStart.y,
      gradientEnd.x,   gradientEnd.y
    );
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(0.5, "#FFFFFF");
    gradient.addColorStop(1, "#000000");

    // Draw gradient
    maskContext.fillStyle = gradient;
    maskContext.fillRect(0, 0, canvas.width, canvas.height);

    return maskCanvas;
  }

  /**
   * Applies the blur and mask to the input canvas
   * @param  {Canvas} inputCanvas
   * @param  {Canvas} blurryCanvas
   * @param  {Canvas} maskCanvas
   * @private
   */
  _applyMask (inputCanvas, blurryCanvas, maskCanvas) {
    var inputContext = inputCanvas.getContext("2d");
    var blurryContext = blurryCanvas.getContext("2d");
    var maskContext = maskCanvas.getContext("2d");

    var inputImageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
    var pixels = inputImageData.data;
    var blurryPixels = blurryContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;
    var maskPixels = maskContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;

    var index, alpha;
    for (var y = 0; y < inputCanvas.height; y++) {
      for (var x = 0; x < inputCanvas.width; x++) {
        index = (y * inputCanvas.width + x) * 4;
        alpha = maskPixels[index] / 255;

        pixels[index] = alpha * pixels[index] + (1 - alpha) * blurryPixels[index];
        pixels[index + 1] = alpha * pixels[index + 1] + (1 - alpha) * blurryPixels[index + 1];
        pixels[index + 2] = alpha * pixels[index + 2] + (1 - alpha) * blurryPixels[index + 2];
      }
    }

    inputContext.putImageData(inputImageData, 0, 0);
  }
}

export default TiltShiftOperation;
