"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = require("./filter");
var Utils = require("../../lib/utils");

/**
 * K1 Filter
 * @class
 * @alias ImglyKit.Filters.K1Filter
 * @extends {ImglyKit.Filter}
 */
var K1Filter = Filter.extend({});

/**
 * A unique string that identifies this operation. Can be used to select
 * the active filter.
 * @type {String}
 */
K1Filter.identifier = "k1";

/**
 * Renders the filter
 * @param  {Renderer} renderer
 * @return {Promise}
 */
K1Filter.prototype.render = function(renderer) {
  var fragmentShader = Utils.shaderString(function() {/*

    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_image;

    void main() {
      vec4 texColor = texture2D(u_image, v_texCoord);
      gl_FragColor = vec4((texColor.rgb + vec3(0.2)), texColor.a);
    }

  */});

  renderer.runShader(null, fragmentShader);
};

module.exports = K1Filter;
