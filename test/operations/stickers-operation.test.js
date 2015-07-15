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
var should = require("should");
var canvas = require("canvas");
var ImglyKit = require("../..");
var StickersOperation = ImglyKit.Operations.Stickers;
var kit, image, stickersOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image, assetsUrl: "src/assets", ui: { enabled: false } });
});

describe("StickersOperation", function () {

  describe("#render", function () {

    describe("without a `sticker` set", function () {

      it("should throw an error", function (done) {

        stickersOperation = new StickersOperation(kit, {

        });
        kit.operationsStack.push(stickersOperation);

        kit.render()
          .then(function (result) {
            should.not.exist(result);
            done();
          })
          .catch(function (err) {
            err.should.match(/sticker/);
            done();
          });

      });

    });

    describe("with `sticker` not existing", function () {

      it("should throw an error", function (done) {

        stickersOperation = new StickersOperation(kit, {
          sticker: "foo",
          position: new ImglyKit.Vector2()
        });
        kit.operationsStack.push(stickersOperation);

        kit.render()
          .then(function (result) {
            should.not.exist(result);
            done();
          })
          .catch(function () {
            done();
          });

      });

    });

    describe("with `position` not being an instance of Vector2", function () {

      it("should throw an error", function () {

        var throwable = function () {
          new StickersOperation(kit, {
            sticker: "nerd-glasses",
            position: null
          });
        };
        throwable.should.throw("Operation `stickers`: Option `position` has to be an instance of ImglyKit.Vector2.");

      });

    });

    describe("with `size` not being an instance of Vector2", function () {

      it("should throw an error", function () {

        var throwable = function () {
          new StickersOperation(kit, {
            sticker: "nerd-glasses",
            size: null
          });
        };
        throwable.should.throw("Operation `stickers`: Option `size` has to be an instance of ImglyKit.Vector2.");

      });

    });

    describe("with valid options", function () {

      it("should succeed", function (done) {

        stickersOperation = new StickersOperation(kit, {
          sticker: "stickers/sticker-glasses-nerd.png",
          position: new ImglyKit.Vector2(0, 0)
        });
        kit.operationsStack.push(stickersOperation);

        kit.render()
          .then(function () {
            done();
          })
          .catch(function (err) {
            should.not.exist(err);
          });

      });

    });

  });

});
