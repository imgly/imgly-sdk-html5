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

var sinon = require("sinon");
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

      kit = new ImglyKit({ image: image, ui: { enabled: false } });
    });

    describe("validations", function () {

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
            kit.render(ImglyKit.RenderType.DATAURL)
              .then(function (result) {
                result.should.be.type("string");
                result.should.startWith("data:");
                done();
              });
          });

        });

        // describe("when set to ImglyKit.RenderType.BUFFER", function () {
        //   this.timeout(10000)

        //   it("should render to a buffer", function (done) {
        //     kit.render(ImglyKit.RenderType.BUFFER)
        //       .then(function (result) {
        //         result.constructor.name.should.equal("Buffer");
        //         done();
        //       });
        //   });

        // });

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

    });

    /**
     * Rendering
     */

    describe("rendering", function () {

      describe("dimensions", function () {

        it("should resize the result to the requested size", function (done) {
          kit.render(ImglyKit.RenderType.IMAGE, null, "100x100!")
            .then(function (result) {
              result.width.should.equal(100);
              result.height.should.equal(100);
              done();
            })
            .catch(function (err) {
              done(err);
            });
        });

      });

      describe("operations", function () {

        it("should call the operation's #render method", function (done) {
          // Create Operation and stub #render
          var operation = new ImglyKit.Operation(kit);
          sinon.stub(operation, "render");

          // Make sure the operation is used
          kit.operationsStack.push(operation);

          kit.render()
            .then(function () {
              operation.render.calledOnce.should.equal(true);
              done();
            });
        });

      });

    });


  }); // #render

});
