/* global describe, it, beforeEach */
/*jshint -W083 */
"use strict";
/*
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var path = require("path");
var fs = require("fs");
var canvas = require("canvas");
var ImglyKit = require("../..");
var TiltShiftOperation = ImglyKit.Operations.TiltShift;
var kit, image, tiltShiftOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image, ui: { enabled: false } });
});

describe("TiltShiftOperation", function () {

  this.timeout(10000);

  describe("#render", function () {

    describe("if `start` is not a Vector2", function () {

      it("should throw an error", function () {
        var throwable = function () {
          new TiltShiftOperation(kit, {
            start: null
          });
        };
        throwable.should.throw("Operation `tilt-shift`: Option `start` has to be an instance of ImglyKit.Vector2.");
      });

    });

    describe("if `end` is not a Vector2", function () {

      it("should throw an error", function () {
        var throwable = function () {
          new TiltShiftOperation(kit, {
            end: null
          });
        };
        throwable.should.throw("Operation `tilt-shift`: Option `end` has to be an instance of ImglyKit.Vector2.");
      });

    });

    describe("if both `start` and `end` are given", function () {

      it("should succeed", function (done) {
        tiltShiftOperation = new TiltShiftOperation(kit, {
          start: new ImglyKit.Vector2(0.5, 0.5),
          end: new ImglyKit.Vector2(0.5, 0.8)
        });
        kit.operationsStack.push(tiltShiftOperation);

        kit.render()
          .then(function () {
            done();
          });
      });

    });

  });

});
