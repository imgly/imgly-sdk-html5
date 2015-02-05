"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Primitive from "./primitive";

/**
 * X400 primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.X400
 * @extends {ImglyKit.Filter.Primitive}
 */
class X400 extends Primitive {
  constructor (...args) {
    super(...args);

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;

      void main() {
        vec4 texColor = texture2D(u_image, v_texCoord);
        float gray = texColor.r * 0.3 + texColor.g * 0.3 + texColor.b * 0.3;
        gray -= 0.2;
        gray = clamp(gray, 0.0, 1.0);
        gray += 0.15;
        gray *= 1.4;
        gl_FragColor = vec4(vec3(gray), 1.0);
      }
    `;
  }

  /**
   * Renders the primitive (WebGL)
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  renderWebGL (renderer) {
    renderer.runShader(null, this._fragmentShader);
  }

  /**
   * Renders the primitive (Canvas)
   * @param  {CanvasRenderer} renderer
   */
  renderCanvas (renderer) {
    var canvas = renderer.getCanvas();
    var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4;

        var gray = imageData.data[index] / 255 * 0.3 + imageData.data[index + 1] / 255 * 0.3 + imageData.data[index + 2] / 255 * 0.3;
        gray -= 0.2;
        gray = Math.max(0.0, Math.min(1.0, gray));
        gray += 0.15;
        gray *= 1.4;

        gray *= 255;
        imageData.data[index] = gray;
        imageData.data[index + 1] = gray;
        imageData.data[index + 2] = gray;
      }
    }

    renderer.getContext().putImageData(imageData, 0, 0);
  }
}

export default X400;
