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

var Utils = require("../src/js/lib/utils");

describe("Utils", function () {

  describe("#isArray", function () {

    it("should return true for arrays", function () {
      Utils.isArray([]).should.equal(true);
    });

    it("should return false for everything else", function () {
      Utils.isArray({}).should.equal(false);
    });

  });

  describe("#select", function () {

    var items;
    beforeEach(function () {
      items = ["a", "b", "c", "d"];
    });

    describe("when no selector is passed", function () {

      it("should return the same array", function () {
        var selectedItems = Utils.select(items);
        selectedItems.should.equal(items);
      });

    });

    describe("when an array is passed as a selector", function () {

      it("should only return the passed items", function () {
        var selectedItems = Utils.select(items, ["a", "b"]);
        selectedItems.should.have.length(2);
        selectedItems[0].should.equal("a");
        selectedItems[1].should.equal("b");
      });

    });

    describe("when a comma-separated string is passed as a selector", function () {

      it("should only return the passed items", function () {
        var selectedItems = Utils.select(items, "a, b");
        selectedItems.should.have.length(2);
        selectedItems[0].should.equal("a");
        selectedItems[1].should.equal("b");
      });

    });

    describe("when an object with an `only` property (string) is passed as a selector", function () {

      it("should only return the passed items", function () {
        var selectedItems = Utils.select(items, { only: "a, b" });
        selectedItems.should.have.length(2);
        selectedItems[0].should.equal("a");
        selectedItems[1].should.equal("b");
      });

    });

    describe("when an object with an `except` property (string) is passed as a selector", function () {

      it("should return all but the passed items", function () {
        var selectedItems = Utils.select(items, { except: "a, b" });
        selectedItems.should.have.length(2);
        selectedItems[0].should.equal("c");
        selectedItems[1].should.equal("d");
      });

    });

    describe("when an object with an `only` property (array) is passed as a selector", function () {

      it("should only return the passed items", function () {
        var selectedItems = Utils.select(items, { only: ["a", "b"] });
        selectedItems.should.have.length(2);
        selectedItems[0].should.equal("a");
        selectedItems[1].should.equal("b");
      });

    });

    describe("when an object with an `except` property (array) is passed as a selector", function () {

      it("should return all but the passed items", function () {
        var selectedItems = Utils.select(items, { except: ["a", "b"] });
        selectedItems.should.have.length(2);
        selectedItems[0].should.equal("c");
        selectedItems[1].should.equal("d");
      });

    });

    describe("when an object without an `only` or `except` property is passed as a selector", function () {

      it("should throw", function () {
        var throwable = function () {
          Utils.select(items, {});
        };
        throwable.should.throw();
      });

    });

  });

  describe("#getEventPosition", function () {

    var fakeEvent, fakeTouchEvent;
    beforeEach(function () {
      fakeEvent = {
        clientX: 50,
        clientY: 50,
        type: "mousemove"
      };

      fakeTouchEvent = {
        clientX: 50,
        clientY: 50,
        touches: [{
          clientX: 100,
          clientY: 100
        }],
        type: "touchmove"
      };
    });

    describe("when passing a touch event", function () {

      it("should return a Vector2 instance with the touch position", function () {
        var vec = Utils.getEventPosition(fakeTouchEvent);
        vec.x.should.equal(100);
        vec.y.should.equal(100);
      });

    });

    describe("when passing a mouse event", function () {

      it("should return a Vector2 instance with the mouse position", function () {
        var vec = Utils.getEventPosition(fakeEvent);
        vec.x.should.equal(50);
        vec.y.should.equal(50);
      });

    });

  });

});
