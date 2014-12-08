/* global describe, it, beforeEach */
/*jshint -W083 */
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
var should = require("should");
var canvas = require("canvas");
var ImglyKit = require("../..");
var TextOperation = ImglyKit.Operations.TextOperation;
var kit, image, textOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image });
});

describe("TextOperation", function () {

  describe("#render", function () {

    describe("without a `text` set", function () {

      it("should throw an error", function (done) {

        textOperation = new TextOperation(kit, {
          position: new ImglyKit.Vector2(0, 0),
          fontSize: 12,
          fontFamily: "Impact",
          fontStyle: "bold",
          color: new ImglyKit.Color(1.0, 1.0, 1.0, 0.5)
        });
        kit.operationsStack.push(textOperation);

        kit.render()
          .then(function (result) {
            should.not.exist(result);
            done();
          })
          .catch(function (err) {
            err.should.match(/text/);
            done();
          });

      });

    });

    describe("with `text` not being a string", function () {

      it("should throw an error", function (done) {

        textOperation = new TextOperation(kit, {
          position: new ImglyKit.Vector2(0, 0),
          fontSize: 12,
          fontFamily: "Impact",
          fontStyle: "bold",
          color: new ImglyKit.Color(1.0, 1.0, 1.0, 0.5),
          text: null
        });
        kit.operationsStack.push(textOperation);

        kit.render()
          .then(function (result) {
            should.not.exist(result);
            done();
          })
          .catch(function (err) {
            err.should.match(/text/);
            done();
          });

      });

    });

    describe("with `position` not being an instance of Vector2", function () {

      it("should throw an error", function (done) {

        textOperation = new TextOperation(kit, {
          position: null,
          fontSize: 12,
          fontFamily: "Impact",
          fontStyle: "bold",
          color: new ImglyKit.Color(1.0, 1.0, 1.0, 0.5),
          text: "foo"
        });
        kit.operationsStack.push(textOperation);

        kit.render()
          .then(function (result) {
            should.not.exist(result);
            done();
          })
          .catch(function (err) {
            err.should.match(/position/);
            done();
          });

      });

    });

    // describe("with `text` set", function () {

    //   it("should succeed", function (done) {

    //     textOperation = new TextOperation(kit, {
    //       position: new ImglyKit.Vector2(0, 0),
    //       fontSize: 12,
    //       fontFamily: "Impact",
    //       fontStyle: "bold",
    //       color: new ImglyKit.Color(1.0, 1.0, 1.0, 0.5),
    //       text: "Sup bro?"
    //     });
    //     kit.operationsStack.push(textOperation);

    //     kit.render()
    //       .then(function () {
    //         done();
    //       })
    //       .catch(function (err) {
    //         throw err;
    //       });

    //   });

    // });

  });

});
