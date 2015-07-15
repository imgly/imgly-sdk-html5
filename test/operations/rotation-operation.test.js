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
var RotationOperation = ImglyKit.Operations.Rotation;
var kit, image, rotationOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image, ui: { enabled: false } });
});

describe("RotationOperation", function () {

  describe("#render", function () {

    describe("with a rotation that's not divisible by 90", function () {

      it("should fail", function () {
        var throwable = function () {
          new RotationOperation(kit, { degrees: 45 });
        }
        throwable.should.throw("RotationOperation: `rotation` has to be a multiple of 90.");
      });

    });

    it("should succeed", function (done) {
      rotationOperation = new RotationOperation(kit, {
        degrees: 90
      });
      kit.operationsStack.push(rotationOperation);

      kit.render()
        .then(function () {
          done();
        })
        .catch(function (err) {
          throw err;
        });
    });

    it("should correctly resize the canvas", function (done) {
      rotationOperation = new RotationOperation(kit, {
        degrees: 90
      });
      kit.operationsStack.push(rotationOperation);

      kit.render(ImglyKit.RenderType.IMAGE)
        .then(function (result) {
          result.width.should.equal(image.height);
          result.height.should.equal(image.width);

          done();
        })
        .catch(function (err) {
          throw err;
        });
    });

  });

});
