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
var SaturationOperation = ImglyKit.Operations.Saturation;
var kit, image, saturationOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image, ui: { enabled: false } });
});

describe("SaturationOperation", function () {

  describe("#render", function () {

    describe("without saturation set", function () {

      it("should fail", function (done) {

        saturationOperation = new SaturationOperation(kit);
        kit.operationsStack.push(saturationOperation);

        kit.render()
          .then(function (result) {
            should.not.exist(result);
            done();
          })
          .catch(function (err) {
            err.should.be.instanceOf(Error);
            done();
          });

      });

    });

    describe("with saturation set", function () {

      it("should succeed", function (done) {

        saturationOperation = new SaturationOperation(kit, {
          saturation: 1.1
        });
        kit.operationsStack.push(saturationOperation);

        kit.render()
          .then(function () {
            done();
          })
          .catch(function (err) {
            throw err;
          });

      });

    });

  });

});
