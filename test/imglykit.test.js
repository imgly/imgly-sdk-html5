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

describe("OperationsManager", function () {

  describe("#register", function () {

    it("should successfully register an Operation", function () {
      var StickersOperation = ImglyKit.Operation.extend({}, {
        identifier: "stickers"
      });
      ImglyKit.operations.register(StickersOperation);
      ImglyKit.operations.operations.should.have.property("stickers");
    });

    it("should not register the same identifier twice", function () {
      var FooOperation = ImglyKit.Operation.extend({}, {
        identifier: "foo"
      });
      ImglyKit.operations.register(FooOperation);

      function throwable() {
        ImglyKit.operations.register(FooOperation);
      }
      throwable.should.throw();
    });

  });

});
