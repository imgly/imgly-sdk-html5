"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import _ from "lodash";
import Primitive from "./primitive";
import Color from "../../../lib/color";

/**
 * Glow primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Glow
 * @extends {ImglyKit.Filter.Primitive}
 */
class Glow extends Primitive {
  constructor (...args) {
    super(...args);

    this._options = _.defaults(this._options, {
      color: new Color(1, 1, 1)
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;

      uniform vec3 u_color;

      void main() {
        vec3 texColor = texture2D(u_image, v_texCoord).rgb;

        vec2 textureCoord = v_texCoord - vec2(0.5, 0.5);
        textureCoord /= 0.75;

        float d = 1.0 - dot(textureCoord, textureCoord);
        d = clamp(d, 0.2, 1.0);
        vec3 newColor = texColor * d * u_color.rgb;
        gl_FragColor = vec4(vec3(newColor),1.0);
      }
    `;
  }

  /**
   * Renders the primitive (WebGL)
   * @param  {WebGLRenderer} renderer
   * @return {Promise}
   */
  /* istanbul ignore next */
  renderWebGL (renderer) {
    renderer.runShader(null, this._fragmentShader, {
      uniforms: {
        u_color: { type: "3f", value: this._options.color.toRGBGLColor()}
      }
    });
  }

  /**
   * Renders the primitive (Canvas)
   * @param  {CanvasRenderer} renderer
   * @return {Promise}
   */
  renderCanvas (renderer) {
    var canvas = renderer.getCanvas();
    var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
    var color = this._options.color;

    var d;
    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4;

        var x01 = x / canvas.width;
        var y01 = y / canvas.height;

        var nx = (x01 - 0.5) / 0.75;
        var ny = (y01 - 0.5) / 0.75;

        var scalarX = nx * nx;
        var scalarY = ny * ny;
        d = 1 - (scalarX + scalarY);
        d = Math.min(Math.max(d, 0.1), 1.0);

        imageData.data[index] = imageData.data[index] * (d * color.r);
        imageData.data[index + 1] = imageData.data[index + 1] * (d * color.g);
        imageData.data[index + 2] = imageData.data[index + 2] * (d * color.b);
        imageData.data[index + 3] = 255;
      }
    }

    renderer.getContext().putImageData(imageData, 0, 0);
  }
}

export default Glow;
