/* global describe, it, beforeEach */
"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Color = require("../src/js/color");
var color;

describe("Color", function () {
  beforeEach(function () {
    color = new Color(1.0, 0.0, 0.0, 1.0);
  });

  describe("#toRGBA", function () {

    it("should return an rgba() representation of the color", function () {
      color.toRGBA().should.equal("rgba(255,0,0,1)");
    });

  });

  describe("#toHex", function () {

    it("should return a hex representation of the color", function () {
      color.toHex().should.equal("#ff0000");
    });

  });

});
