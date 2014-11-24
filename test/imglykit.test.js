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

var ImglyKit = require("..");
var Image = require("canvas").Image;
var image = new Image(100, 100);
var kit;

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

    describe("when `options.ui` is set to false", function () {

      it("should not initialize the UI");

    });

  }); // #constructor

  describe("#render", function () {

    before(function () {
      kit = new ImglyKit({ ui: false, image: image });
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

    });

  }); // #render

});
