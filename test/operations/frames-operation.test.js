/* global describe, it, beforeEach */
/*jshint -W083 */
"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
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
var FramesOperation = ImglyKit.Operations.FramesOperation;
var kit, image, framesOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image, assetsUrl: "src/assets" });
});

describe("FramesOperation", function () {

  describe("#render", function () {

    describe("with `color` not being an instance of ImglyKit.Color", function () {

      it("should throw an error", function (done) {

        framesOperation = new FramesOperation(kit, {
          color: "red"
        });
        kit.operationsStack.push(framesOperation);

        kit.render()
          .then(function (result) {
            should.not.exist(result);
            done();
          })
          .catch(function () {
            done();
          });

      });

    });

    describe("with valid options", function () {

      it("should succeed", function (done) {

        framesOperation = new FramesOperation(kit, {
          color: new ImglyKit.Color(0, 0, 0, 1),
          thickness: 0.1
        });
        kit.operationsStack.push(framesOperation);

        kit.render()
          .then(function () {
            done();
          })
          .catch(function (err) {
            should.not.exist(err);
          });

      });

    });

  });

});
