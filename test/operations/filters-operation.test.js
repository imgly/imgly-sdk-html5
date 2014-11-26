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

var path = require("path");
var fs = require("fs");
var canvas = require("canvas");
var ImglyKit = require("../..");
var FiltersOperation = ImglyKit.Operations.FiltersOperation;
var kit, image;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image });
});

describe("FiltersOperation", function () {

  describe("with no selected filter", function () {

    it("rendering should fail", function (done) {

      var filtersOperation = new FiltersOperation(kit);
      kit.operationsStack.push(filtersOperation);

      kit.render()
        .then(function () {
          done(new Error("Rendering succeeded while it shouldn't succeed."));
        })
        .catch(function (err) {
          err.should.be.an.instanceOf(Error);
          done();
        });

    });

  });

});
