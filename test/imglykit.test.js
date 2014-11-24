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
var kit, image;
var canvas = require("canvas");

describe("ImglyKit", function () {

  describe("#constructor", function () {

    describe("when no options are given", function () {

      it("should throw an error", function () {
        var throwable = function () {
          new ImglyKit();
        };
        throwable.should.throw();
      });

    });

  }); // #constructor

});
