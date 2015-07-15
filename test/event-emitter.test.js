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

var should = require("should");
var EventEmitter = require("../src/js/lib/event-emitter");
var ee;

describe("EventEmitter", function () {
  beforeEach(function () {
    ee = new EventEmitter();
  });

  describe("#on", function () {

    it("should add a listener", function () {
      var fn = function () {

      };
      ee.on("foo", fn);
      ee._events.foo.length.should.equal(1);
    });

    describe("with a parameter that is not a function", function () {

      it("should throw", function () {
        var throwable = function () {
          ee.on("foo", "bar");
        };
        throwable.should.throw();
      });

    });

    it("should not add a listener twice", function () {
      var fn = function () {};
      ee.on("foo", fn);
      ee.on("foo", fn);
      ee._events.foo.length.should.equal(1);
    });

  });

  describe("#off", function () {

    describe("without a passed function", function () {

      it("should remove all listeners", function () {
        var fn = function () {};
        var fn2 = function () {};
        ee.on("foo", fn);
        ee.on("foo", fn2);
        ee._events.foo.length.should.equal(2);
        ee.off("foo");
        should.not.exist(ee._events.foo);
      });

    });

    describe("with a passed function", function () {

      it("should only remove the given listener function", function () {
        var fn = function () {};
        var fn2 = function () {};
        ee.on("foo", fn);
        ee.on("foo", fn2);
        ee._events.foo.length.should.equal(2);
        ee.off("foo", fn2);
        ee._events.foo.length.should.equal(1);
      });

    });

    describe("with an event that does not exist", function () {

      it("should ignore the call", function () {
        var fn = function () {};
        ee.off("doesnotexist", fn);
      });

    });

    describe("with a listener that does not exist", function () {

      it("should ignore the call", function () {
        var fn = function () {};
        var fn2 = function () {};
        ee.on("foo", fn);
        ee.off("foo", fn2);
      });

    });

    describe("with a listener that is not a function", function () {

      it("should throw", function () {
        var throwable = function () {
          ee.off("foo", "bar");
        };
        throwable.should.throw();
      });

    });

  });

  describe("#once", function () {

    it("should add a listener that deletes itself after calling", function () {
      var called = 0;
      var fn = function () { called++; };
      ee.once("foo", fn);
      ee.emit("foo");
      ee.emit("foo");
      called.should.equal(1);
    });

  });

  describe("#emit", function () {

    it("should call the event listeners for the given event", function (done) {
      var fn = function (a, b, c) {
        a.should.equal(1);
        b.should.equal(2);
        c.should.equal(3);
        done();
      };
      var fn2 = function () {};
      ee.on("foo", fn);
      ee.on("bar", fn2);
      ee.emit("foo", 1, 2, 3);
    });

  });

  describe("maxListeners", function () {

    describe("with maxListeners set to 5", function () {

      describe("when adding 6 listeners", function () {

        it("should print an error message", function () {
          ee.setMaxListeners(5);

          for (var i = 0; i < 6; i++) {
            var fn = function () {};
            ee.on("foo", fn);
          }
        });

      });

    });

    describe("#setMaxListeners", function () {

      describe("with a value that is not a number", function () {

        it("should throw", function () {
          var throwable = function () {
            ee.setMaxListeners("foo");
          };
          throwable.should.throw();
        });

      });

    });

  });

});
