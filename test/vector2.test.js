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

var Vector2 = require("../src/js/lib/math/vector2");

describe("Vector2", function () {

  describe("#constructor", function () {

    describe("when no arguments are given", function () {

      it("should set x and y to 0", function () {
        var vec = new Vector2();
        vec.x.should.equal(0);
        vec.y.should.equal(0);
      });

    });

    describe("when x and y are given", function () {

      it("should set x and y", function () {
        var vec = new Vector2(100, 200);
        vec.x.should.equal(100);
        vec.y.should.equal(200);
      });

    });

  }); // #constructor

  describe("#set", function () {

    it("should set the given values", function () {
      var vec = new Vector2();
      vec.set(100, 200);
      vec.x.should.equal(100);
      vec.y.should.equal(200);
    });

  }); // #set

  describe("#clone", function () {

    it("should return a clone of the vector", function () {
      var vec = new Vector2(100, 200);
      var vec2 = vec.clone();
      vec2.x.should.equal(100);
      vec2.y.should.equal(200);
      vec.should.not.equal(vec2); // should not be the same object
    });

  }); // #clone

  describe("#copy", function () {

    it("should copy the values of the given vector", function () {
      var vec = new Vector2(100, 200);
      var vec2 = new Vector2();
      vec2.copy(vec);

      vec2.x.should.equal(100);
      vec2.y.should.equal(200);
    });

  }); // #copy

  describe("#clamp", function () {

    it("should clamp the values to the given minimum and maximum", function () {
      var vec = new Vector2(100, 100);
      vec.clamp(200, 500);
      vec.x.should.equal(200);
      vec.y.should.equal(200);
      vec.clamp(0, 100);
      vec.x.should.equal(100);
      vec.y.should.equal(100);
    });

  }); // #copy

  describe("#divide", function () {

    it("should divide the x and y values by the given values", function () {
      var vec = new Vector2(100, 100);
      vec.divide(2, 5);
      vec.x.should.equal(50);
      vec.y.should.equal(20);
    });

    describe("when a vector is given", function () {

      it("should divide by the vector's values", function () {
        var vec = new Vector2(100, 100);
        vec.divide(new Vector2(2, 5));
        vec.x.should.equal(50);
        vec.y.should.equal(20);
      });

    });

    describe("when y is not given", function () {

      it("should divide x and y by the given single value", function () {
        var vec = new Vector2(100, 100);
        vec.divide(2);
        vec.x.should.equal(50);
        vec.y.should.equal(50);
      });

    });

  }); // #divide

  describe("#multiply", function () {

    it("should multiply the x and y values with the given values", function () {
      var vec = new Vector2(100, 100);
      vec.multiply(2, 5);
      vec.x.should.equal(200);
      vec.y.should.equal(500);
    });

    describe("when a vector is given", function () {

      it("should multiply with the vector's values", function () {
        var vec = new Vector2(100, 100);
        vec.multiply(new Vector2(2, 5));
        vec.x.should.equal(200);
        vec.y.should.equal(500);
      });

    });

    describe("when y is not given", function () {

      it("should multiply x and y with the given single value", function () {
        var vec = new Vector2(100, 100);
        vec.multiply(2);
        vec.x.should.equal(200);
        vec.y.should.equal(200);
      });

    });

  }); // #multiply

  describe("#subtract", function () {

    it("should subtract the given values", function () {
      var vec = new Vector2(100, 100);
      vec.subtract(50, 30);
      vec.x.should.equal(50);
      vec.y.should.equal(70);
    });

    describe("when a vector is given", function () {

      it("should subtract the vector's values", function () {
        var vec = new Vector2(100, 100);
        vec.subtract(new Vector2(50, 30));
        vec.x.should.equal(50);
        vec.y.should.equal(70);
      });

    });

    describe("when y is not given", function () {

      it("should subtract the single given value from both x and y", function () {
        var vec = new Vector2(100, 100);
        vec.subtract(50);
        vec.x.should.equal(50);
        vec.y.should.equal(50);
      });

    });

  }); // #subtract

  describe("#add", function () {

    it("should add the given values", function () {
      var vec = new Vector2(100, 100);
      vec.add(50, 30);
      vec.x.should.equal(150);
      vec.y.should.equal(130);
    });

    describe("when a vector is given", function () {

      it("should add the vector's values", function () {
        var vec = new Vector2(100, 100);
        vec.add(new Vector2(50, 30));
        vec.x.should.equal(150);
        vec.y.should.equal(130);
      });

    });

    describe("when y is not given", function () {

      it("should add the single given value to both x and y", function () {
        var vec = new Vector2(100, 100);
        vec.add(50);
        vec.x.should.equal(150);
        vec.y.should.equal(150);
      });

    });

  }); // #add

  describe("#equals", function () {

    describe("when a vector is given", function () {

      describe("if the values are equal", function () {
        it("should return true", function () {
          var vec1 = new Vector2(100, 100);
          var vec2 = new Vector2(100, 100);
          vec2.equals(vec1).should.equal(true);
        });
      });

      describe("if the values are not equal", function () {
        it("should return false", function () {
          var vec1 = new Vector2(100, 100);
          var vec2 = new Vector2(20, 20);
          vec2.equals(vec1).should.equal(false);
        });
      });

    });

    describe("when two numbers are given", function () {

      describe("if the values are equal", function () {
        it("should return true", function () {
          var vec1 = new Vector2(100, 100);
          vec1.equals(100, 100).should.equal(true);
        });
      });

      describe("if the values are not equal", function () {
        it("should return false", function () {
          var vec1 = new Vector2(100, 100);
          vec1.equals(20, 20).should.equal(false);
        });
      });

    });

  }); // #equals

  describe("#toString", function () {

    it("should return a string representation of the vector", function () {
      var vec = new Vector2(100, 100);
      vec.toString().should.equal("Vector2({ x: 100, y: 100 })");
    });

  }); // #toString

});
