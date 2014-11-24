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

var should = require("should");
var ImglyKit = require("..");
var Image = require("canvas").Image;
var kit;
var StickersOperation;

describe("OperationsManager", function () {

  beforeEach(function () {
    StickersOperation = ImglyKit.Operation.extend({}, {
      identifier: "stickers"
    });

    kit = new ImglyKit({
      image: new Image(100, 100)
    });
  });

  describe("#register", function () {

    it("should successfully register an Operation", function () {
      kit.operations.register(StickersOperation);
      kit.operations.operations.should.have.property("stickers");
    });

    it("should not register the same identifier twice", function () {
      var FooOperation = ImglyKit.Operation.extend({}, {
        identifier: "foo"
      });
      kit.operations.register(FooOperation);

      function throwable() {
        kit.operations.register(FooOperation);
      }
      throwable.should.throw();
    });

  }); // #register

  describe("#select", function () {

    beforeEach(function () {
      kit.reset();
    });

    describe("when called with something that's not a string, object or array", function () {
      it("should throw an error", function () {
        function throwable() {
          kit.operations.select(1);
        }
        throwable.should.throw();
      });
    });

    describe("when called without arguments", function () {
      it("should throw an error", function () {
        function throwable() {
          kit.operations.select();
        }
        throwable.should.throw();
      });
    });

    describe("when called with a string of identifiers", function () {

      it("should select only the operations with the given identifiers", function () {
        kit.operations.select("filters,rotation");

        var identifiers = kit.operations.enabledOperations.map(function (op) {
          return op.identifier;
        });

        identifiers.indexOf("filters").should.not.equal(-1);
        identifiers.indexOf("rotation").should.not.equal(-1);
        identifiers.indexOf("crop").should.equal(-1);
      });
    });

    describe("when called with an array of identifiers", function () {
      it("should select only the operations with the given identifiers", function () {
        kit.operations.select(["filters", "rotation"]);

        var identifiers = kit.operations.enabledOperations.map(function (op) {
          return op.identifier;
        });

        identifiers.indexOf("filters").should.not.equal(-1);
        identifiers.indexOf("rotation").should.not.equal(-1);
        identifiers.indexOf("crop").should.equal(-1);
      });
    });

    describe("when called with { only: ... }", function () {
      it("should select only the operations with the given identifiers", function () {
        kit.operations.select({ only: "filters,rotation" });

        var identifiers = kit.operations.enabledOperations.map(function (op) {
          return op.identifier;
        });

        identifiers.indexOf("filters").should.not.equal(-1);
        identifiers.indexOf("rotation").should.not.equal(-1);
        identifiers.indexOf("crop").should.equal(-1);
      });
    });

    describe("when called with { except: ... }", function () {
      it("should select all but the given identifiers", function () {
        kit.operations.select({ except: "filters,rotation" });

        var identifiers = kit.operations.enabledOperations.map(function (op) {
          return op.identifier;
        });

        identifiers.indexOf("filters").should.equal(-1);
        identifiers.indexOf("rotation").should.equal(-1);
        identifiers.indexOf("crop").should.not.equal(-1);
      });
    });

  }); // #select

  describe("#find", function () {

    describe("with an existing identifier", function () {

      it("should return an Operation", function () {
        var operation = kit.operations.find("filters");
        var FiltersOperation = require("../src/js/operations/filters-operation");
        operation.prototype.should.equal(FiltersOperation.prototype);
      });

    });

    describe("with an identifier that does not exist", function () {

      it("should return null", function () {
        var operation = kit.operations.find("nothing");
        should.not.exist(operation);
      });

    });

  }); // #find

}); // OperationsManager
