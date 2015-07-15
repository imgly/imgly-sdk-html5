/* global describe, it */
"use strict";
/*
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var ImageDimensions = require("../src/js/lib/image-dimensions");
var Vector2 = require("../src/js/lib/math/vector2");
var initialDimensions = new Vector2(800, 600);
var dimensions, calculatedDimensions;

describe("ImageDimensions", function () {

  describe("#constructor", function () {

    describe("with an unparseable dimensions string", function () {

      it("should throw an error", function () {
        var throwable = function () {
          new ImageDimensions("foo?");
        };
        throwable.should.throw();
      });

    });

    describe("when fixed modifier (!) is set but x or y are not set", function () {

      it("should throw an error", function () {
        var throwable = function () {
          new ImageDimensions("100x!");
        };
        throwable.should.throw();
      });

    });

    describe("when x and y are both not set", function () {

      it("should throw an error", function () {
        var throwable = function () {
          new ImageDimensions("x");
        };
        throwable.should.throw();
      });

    });

  }); // #constructor

  describe("#calculateFinalDimensions", function () {

    describe("without any rules", function () {

      it("should return the initial dimensions", function () {

        dimensions = new ImageDimensions();
        calculatedDimensions = dimensions.calculateFinalDimensions(initialDimensions);
        calculatedDimensions.x.should.equal(initialDimensions.x);
        calculatedDimensions.y.should.equal(initialDimensions.y);

      });

    });

    describe("with a fixed size like \"100x200!\"", function () {

      it("should return the fixed dimensions", function () {

        dimensions = new ImageDimensions("100x200!");
        calculatedDimensions = dimensions.calculateFinalDimensions(initialDimensions);
        calculatedDimensions.x.should.equal(100);
        calculatedDimensions.y.should.equal(200);

      });

    });

    describe("with a maximum size like \"100x200\"", function () {

      it("should return the new dimensions while taking account of the ratio", function () {

        dimensions = new ImageDimensions("100x200");
        calculatedDimensions = dimensions.calculateFinalDimensions(initialDimensions);
        calculatedDimensions.x.should.equal(100);
        calculatedDimensions.y.should.equal(75);

        dimensions = new ImageDimensions("400x150");
        calculatedDimensions = dimensions.calculateFinalDimensions(initialDimensions);
        calculatedDimensions.x.should.equal(200);
        calculatedDimensions.y.should.equal(150);

      });

    });

    describe("with a maximum width like \"100x\"", function () {

      it("should return the new dimensions while taking account of the ratio", function () {

        dimensions = new ImageDimensions("100x");
        calculatedDimensions = dimensions.calculateFinalDimensions(initialDimensions);
        calculatedDimensions.x.should.equal(100);
        calculatedDimensions.y.should.equal(75);

      });

    });

    describe("with a maximum height like \"x200\"", function () {

      it("should return the new dimensions while taking account of the ratio", function () {

        dimensions = new ImageDimensions("x150");
        calculatedDimensions = dimensions.calculateFinalDimensions(initialDimensions);
        calculatedDimensions.x.should.equal(200);
        calculatedDimensions.y.should.equal(150);

      });

    });

  }); // #calculateFinalDimensions

});
