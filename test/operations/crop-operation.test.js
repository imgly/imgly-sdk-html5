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
var should = require("should");
var canvas = require("canvas");
var ImglyKit = require("../..");
var CropOperation = ImglyKit.Operations.Crop;
var kit, image, cropOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image, ui: { enabled: false } });
});

describe("CropOperation", function () {

  describe("#render", function () {

    describe("with both start and end set", function () {

      it("should succeed", function (done) {
        cropOperation = new CropOperation(kit, {
          start: new ImglyKit.Vector2(0.1, 0.1),
          end: new ImglyKit.Vector2(0.9, 0.9)
        });
        kit.operationsStack.push(cropOperation);

        kit.render()
          .then(function () {
            done();
          })
          .catch(function (err) {
            throw err;
          });
      });

      it("should correctly resize the canvas", function (done) {
        cropOperation = new CropOperation(kit, {
          start: new ImglyKit.Vector2(0.1, 0.1),
          end: new ImglyKit.Vector2(0.9, 0.9)
        });
        kit.operationsStack.push(cropOperation);

        kit.render(ImglyKit.RenderType.IMAGE)
          .then(function (result) {
            result.width.should.equal(image.width * 0.8);
            result.height.should.equal(image.height * 0.8);

            done();
          })
          .catch(function (err) {
            throw err;
          });
      });

    });

    describe("with `numberFormat` set to `absolute`", function () {

      it("should succeed", function (done) {
        cropOperation = new CropOperation(kit, {
          start: new ImglyKit.Vector2(100, 100),
          end: new ImglyKit.Vector2(400, 400),
          numberFormat: "absolute"
        });
        kit.operationsStack.push(cropOperation);

        kit.render()
          .then(function () {
            done();
          })
          .catch(function (err) {
            throw err;
          });
      });

      it("should correctly resize the canvas", function (done) {
        cropOperation = new CropOperation(kit, {
          start: new ImglyKit.Vector2(100, 100),
          end: new ImglyKit.Vector2(400, 400),
          numberFormat: "absolute"
        });
        kit.operationsStack.push(cropOperation);

        kit.render(ImglyKit.RenderType.IMAGE)
          .then(function (result) {
            result.width.should.equal(300);
            result.height.should.equal(300);

            done();
          })
          .catch(function (err) {
            throw err;
          });
      });

    });

  });

});
