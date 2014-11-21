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
var kit;

before(function () {
  kit = new ImglyKit();
});

describe("OperationsManager", function () {
  describe("#register", function () {
    it("should successfully register an Operation", function () {
      var StickersOperation = ImglyKit.Operation.extend({}, {
        identifier: "stickers"
      });
      ImglyKit.operations.register(StickersOperation);
      ImglyKit.operations.operations.should.have.property("stickers");
    });
  });
});
