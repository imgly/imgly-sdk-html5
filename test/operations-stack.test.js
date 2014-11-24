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

var ImglyKit = require("..");
var Image = require("canvas").Image;
var image = new Image(100, 100);
var kit;

describe("OperationsStack", function () {

  describe("#push", function () {

    before(function () {
      kit = new ImglyKit({ image: image });
    });

    it("should add an operation", function () {
      kit.operationsStack.push(new ImglyKit.Operations.FiltersOperation());
      kit.operationsStack.length.should.equal(1);
    });

  }); // #push

});
