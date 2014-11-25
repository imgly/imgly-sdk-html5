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

var path = require("path");
var fs = require("fs");
var ImglyKit = require("..");
var canvas = require("canvas");
var image, kit;

describe("RenderImage", function () {

  describe("#render", function () {

    beforeEach(function () {
      image = new canvas.Image();
      var imagePath = path.resolve(__dirname, "assets/test.png");
      var buffer = fs.readFileSync(imagePath);
      image.src = buffer;

      kit = new ImglyKit({ image: image });
    });

    /**
     * RenderType
     */

    describe("RenderType", function () {

      describe("when none is given", function () {

        it("should render to a data url", function (done) {
          kit.render()
            .then(function (result) {
              result.should.be.type("string");
              result.should.startWith("data:");
              done();
            });
        });

      });

      describe("when set to ImglyKit.RenderType.IMAGE", function () {

        it("should render to an image", function (done) {
          kit.render(ImglyKit.RenderType.IMAGE)
            .then(function (result) {
              result.should.be.an.instanceOf(canvas.Image);
              done();
            });
        });

      });

      describe("when set to ImglyKit.RenderType.DATA_URL", function () {

        it("should render to a data url", function (done) {
          kit.render(ImglyKit.RenderType.DATA_URL)
            .then(function (result) {
              result.should.be.type("string");
              result.should.startWith("data:");
              done();
            });
        });

      });

    }); // RenderType

    /**
     * ImageFormat
     */

    describe("ImageFormat", function () {

      describe("when none is given", function () {

        it("should render as PNG", function (done) {
          kit.render(ImglyKit.RenderType.DATA_URL)
            .then(function (result) {
              result.should.be.type("string");
              result.should.startWith("data:image/png");
              done();
            });
        });

      });

      describe("when set to ImglyKit.ImageFormat.PNG", function () {

        it("should render as PNG", function (done) {
          kit.render(ImglyKit.RenderType.DATA_URL)
            .then(function (result) {
              result.should.be.type("string");
              result.should.startWith("data:image/png");
              done();
            });
        });

      });

    });

  }); // #render

});
