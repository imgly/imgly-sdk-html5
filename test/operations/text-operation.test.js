/* global describe, it, beforeEach */
/*jshint -W083 */
"use strict";
/*
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var path = require("path");
var fs = require("fs");
var canvas = require("canvas");
var ImglyKit = require("../..");
var TextOperation = ImglyKit.Operations.Text;
var kit, image, textOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image, ui: { enabled: false } });
});

describe("TextOperation", function () {

  describe("#render", function () {

    describe("without a `text` set", function () {

      it("should throw an error", function (done) {

        textOperation = new TextOperation(kit, {
          position: new ImglyKit.Vector2(0, 0),
          fontSize: 12,
          fontFamily: "Impact",
          fontWeight: "bold",
          color: new ImglyKit.Color(1.0, 1.0, 1.0, 0.5)
        });
        kit.operationsStack.push(textOperation);

        kit.render()
          .then(function () {
            done(new Error("Rendering worked while it should not."));
          })
          .catch(function (err) {
            err.message.should.equal("Operation `text`: Option `text` is required.");
            done();
          });

      });

    });

    describe("with `text` not being a string", function () {

      it("should throw an error", function () {

        var throwable = function () {
          new TextOperation(kit, {
            position: new ImglyKit.Vector2(0, 0),
            fontSize: 12,
            fontFamily: "Impact",
            fontWeight: "bold",
            color: new ImglyKit.Color(1.0, 1.0, 1.0, 0.5),
            text: null
          });
        };
        throwable.should.throw("Operation `text`: Option `text` has to be a string.");

      });

    });

    describe("with `position` not being an instance of Vector2", function () {

      it("should throw an error", function () {

        var throwable = function () {
          new TextOperation(kit, {
            position: null,
            fontSize: 12,
            fontFamily: "Impact",
            fontWeight: "bold",
            color: new ImglyKit.Color(1.0, 1.0, 1.0, 0.5),
            text: "foo"
          });
        };
        throwable.should.throw("Operation `text`: Option `position` has to be an instance of ImglyKit.Vector2.");

      });

    });

    describe("with `alignment` being invalid", function () {

      it("should throw an error", function () {

        var throwable = function () {
          new TextOperation(kit, {
            alignment: "somewhere?",
            text: "foo"
          });
        };
        throwable.should.throw("Operation `text`: Invalid value for `alignment` (valid values are: left, center, right)");

      });

    });

    describe("with `verticalAlignment` being invalid", function () {

      it("should throw an error", function () {

        var throwable = function () {
          new TextOperation(kit, {
            verticalAlignment: "somewhere?",
            text: "foo"
          });
        };
        throwable.should.throw("Operation `text`: Invalid value for `verticalAlignment` (valid values are: top, center, bottom)");

      });

    });

  });

});
