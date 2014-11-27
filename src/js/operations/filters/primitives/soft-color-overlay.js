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
 * SoftColorOverlay primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.SoftColorOverlay
 * @extends {ImglyKit.Filter.Primitive}
 */
var SoftColorOverlay = Primitive.extend({});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
SoftColorOverlay.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform vec3 u_overlay;

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);
    vec4 overlayVec4 = vec4(u_overlay, texColor.a);
    gl_FragColor = max(overlayVec4, texColor);
  }

*/});

/**
 * Renders the primitive
 * @param  {Renderer} renderer
 * @return {Promise}
 */
SoftColorOverlay.prototype.render = function(renderer) {
  var overlay = [
    this._options.red / 255,
    this._options.green / 255,
    this._options.blue / 255
  ];

  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_overlay: { type: "3f", value: overlay }
    }
  });
};

module.exports = SoftColorOverlay;
