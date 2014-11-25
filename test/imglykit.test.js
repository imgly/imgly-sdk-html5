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

describe("ImglyKit", function () {

  describe("#constructor", function () {

    describe("when no options are given", function () {

      it("should throw an error", function () {
        var throwable = function () {
          new ImglyKit();
        };
        throwable.should.throw();
      });

    });

    describe("when `options.container` is not set", function () {

      it("should not initialize the UI");

    });

  }); // #constructor

  describe("#render", function () {

    beforeEach(function () {
      image = new canvas.Image();
      var imagePath = path.resolve(__dirname, "assets/test.png");
      var buffer = fs.readFileSync(imagePath);
      image.src = buffer;

      kit = new ImglyKit({ image: image });
    });

    describe("validations", function () {

      describe("when an invalid render type is given", function () {

        it("should throw an error", function () {
          var throwable = function () {
            kit.render("invalid");
          };
          throwable.should.throw();
        });

      });

      describe("when an invalid image format is given", function () {

        it("should throw an error", function () {
          var throwable = function () {
            kit.render(null, "invalid");
          };
          throwable.should.throw();
        });

      });

    }); // validations

    describe("without any operations on the stack", function() {
      it("should return a promise", function (done) {
        kit.render()
          .then(function () {
            done();
          });
      });
    });

  }); // #render

});
