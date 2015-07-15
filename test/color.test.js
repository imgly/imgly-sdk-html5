/* global describe, it, beforeEach */
"use strict";
/*
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Color = require("../src/js/lib/color");
var color;

describe("Color", function () {
  beforeEach(function () {
    color = new Color(1.0, 0.0, 0.0, 1.0);
  });

  describe("#constructor", function () {

    describe("when no alpha is given", function () {

      it("should set the alpha to 1.0", function () {
        var newColor = new Color(1.0, 0.0, 0.0);
        newColor.a.should.equal(1);
      });

    });

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

  describe("#toGLColor", function () {

    it("should return an array with 0..1 values", function () {
      var gl = color.toGLColor();
      gl[0].should.equal(1.0);
      gl[1].should.equal(0.0);
      gl[2].should.equal(0.0);
      gl[3].should.equal(1.0);
    });

  });

  describe("#toRGBGLColor", function () {

    it("should return an array with 0..1 values", function () {
      var gl = color.toRGBGLColor();
      gl[0].should.equal(1.0);
      gl[1].should.equal(0.0);
      gl[2].should.equal(0.0);
    });

  });

  describe("#toHSV", function () {

    it("should return an array with HSV values", function () {
      var hsv = color.toHSV();
      hsv[0].should.equal(0.0);
      hsv[1].should.equal(1.0);
      hsv[2].should.equal(1.0);
    });

  });

  describe("#fromHSV", function () {

    it("should set the RGB values according to the given HSV values", function () {
      color.fromHSV(0, 1, 1);
      color.r.should.equal(1);
      color.g.should.equal(0);
      color.b.should.equal(0);
      color.r = 1;
      color.g = 0;
      color.b = 0;
    });

  });

  describe("#clone", function () {

    it("should return a new object with the same values", function () {
      var newColor = color.clone();
      newColor.should.not.equal(color); // not the same object
      newColor.r.should.equal(color.r);
      newColor.g.should.equal(color.g);
      newColor.b.should.equal(color.b);
    });

  });

  describe("#toString", function () {

    it("should return a string representation of the color", function () {
      var str = color.toString();
      str.should.equal("Color(1, 0, 0, 1)");
    });

  });

});
