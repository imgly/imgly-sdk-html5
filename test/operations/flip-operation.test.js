/* global describe, it, beforeEach */
/*jshint -W083 */
"use strict";
/*!
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
var FlipOperation = ImglyKit.Operations.Flip;
var kit, image, flipOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image, ui: { enabled: false } });
});

describe("FlipOperation", function () {

  describe("#render", function () {

    it("should succeed", function (done) {
      flipOperation = new FlipOperation(kit, {
        horizontal: true,
        vertical: true
      });
      kit.operationsStack.push(flipOperation);

      kit.render()
        .then(function () {
          done();
        })
        .catch(function (err) {
          throw err;
        });
    });

  });

});
