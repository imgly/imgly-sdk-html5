"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = require("./primitive");
var Utils = require("../../../lib/utils");

/**
 * Stores a 256 byte long lookup table in a 2d texture which will be
 * used to look up the corresponding value for each channel.
 * @class
 * @alias ImglyKit.Filter.Primitives.LookupTable
 * @extends {ImglyKit.Filter.Primitive}
 */
var LookupTable = Primitive.extend({
  constructor: function () {
    Primitive.apply(this, arguments);

    this._textureIndex = 3;
  }
});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
LookupTable.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform sampler2D u_lookupTable;

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);
    float r = texture2D(u_lookupTable, vec2(texColor.r, 0.0)).r;
    float g = texture2D(u_lookupTable, vec2(texColor.g, 0.0)).g;
    float b = texture2D(u_lookupTable, vec2(texColor.b, 0.0)).b;

    gl_FragColor = vec4(r, g, b, texColor.a);
  }

*/});

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
LookupTable.prototype.render = function(renderer) {
  this._updateTexture(renderer);

  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_lookupTable: 3
    }
  });
};

/**
 * Updates the lookup table texture
 * @private
 */
LookupTable.prototype._updateTexture = function(renderer) {
  var gl = renderer.getContext();

  if (typeof this._options.data === "undefined") {
    throw new Error("LookupTable: No data specified.");
  }

  var dataTypedArray = new Uint8Array(this._options.data);

  gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
  if (!this._texture) {
    this._texture = gl.createTexture();
  }
  gl.bindTexture(gl.TEXTURE_2D, this._texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataTypedArray);
  gl.activeTexture(gl.TEXTURE0);
};

module.exports = LookupTable;
