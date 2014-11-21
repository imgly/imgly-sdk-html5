/* global describe, it, before, beforeEach, after, afterEach */
/* jshint unused:false */

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

describe("OperationsManager", function () {

  var StickersOperation = ImglyKit.Operation.extend({}, {
    identifier: "stickers"
  });

  describe("#register", function () {

    it("should successfully register an Operation", function () {
      ImglyKit.operations.register(StickersOperation);
      ImglyKit.operations.operations.should.have.property("stickers");
    });

    it("should not register the same identifier twice", function () {
      var FooOperation = ImglyKit.Operation.extend({}, {
        identifier: "foo"
      });
      ImglyKit.operations.register(FooOperation);

      function throwable() {
        ImglyKit.operations.register(FooOperation);
      }
      throwable.should.throw();
    });

  });

  describe("#select", function () {

    beforeEach(function () {
      ImglyKit.reset();
    });

    describe("when called with something that's not a string, object or array", function () {
      it("should throw an error", function () {
        function throwable() {
          ImglyKit.operations.select(1);
        }
        throwable.should.throw();
      });
    });

    describe("when called without arguments", function () {
      it("should throw an error", function () {
        function throwable() {
          ImglyKit.operations.select();
        }
        throwable.should.throw();
      });
    });

    describe("when called with a string of identifiers", function () {

      it("should select only the operations with the given identifiers", function () {
        ImglyKit.operations.select("filters,rotation");

        var identifiers = ImglyKit.operations.enabledOperations.map(function (op) {
          return op.identifier;
        });

        identifiers.indexOf("filters").should.not.equal(-1);
        identifiers.indexOf("rotation").should.not.equal(-1);
        identifiers.indexOf("crop").should.equal(-1);
      });
    });

    describe("when called with an array of identifiers", function () {
      it("should select only the operations with the given identifiers", function () {
        ImglyKit.operations.select(["filters", "rotation"]);

        var identifiers = ImglyKit.operations.enabledOperations.map(function (op) {
          return op.identifier;
        });

        identifiers.indexOf("filters").should.not.equal(-1);
        identifiers.indexOf("rotation").should.not.equal(-1);
        identifiers.indexOf("crop").should.equal(-1);
      });
    });

    describe("when called with { only: ... }", function () {
      it("should select only the operations with the given identifiers", function () {
        ImglyKit.operations.select({ only: "filters,rotation" });

        var identifiers = ImglyKit.operations.enabledOperations.map(function (op) {
          return op.identifier;
        });

        identifiers.indexOf("filters").should.not.equal(-1);
        identifiers.indexOf("rotation").should.not.equal(-1);
        identifiers.indexOf("crop").should.equal(-1);
      });
    });

    describe("when called with { except: ... }", function () {
      it("should select all but the given identifiers", function () {
        ImglyKit.operations.select({ except: "filters,rotation" });

        var identifiers = ImglyKit.operations.enabledOperations.map(function (op) {
          return op.identifier;
        });

        identifiers.indexOf("filters").should.equal(-1);
        identifiers.indexOf("rotation").should.equal(-1);
        identifiers.indexOf("crop").should.not.equal(-1);
      });
    });

  });

});
