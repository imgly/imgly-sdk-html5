/* global describe, it, beforeEach */
"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var ImglyKit = require("../");
var kit = new ImglyKit({ image: null, ui: { enabled: false } });
var testOperation = ImglyKit.Operation.extend({
  availableOptions: {
    vec: { type: "vector2", default: new ImglyKit.Vector2(100, 200) },
    col: { type: "color", default: new ImglyKit.Color(0, 0, 0, 1) },
    str: { type: "string", default: "center", available: ["left", "center", "right"] },
    num: { type: "number", default: 1 },
    bool: { type: "boolean", default: false },
    req: { type: "string", required: true },
    notReq: { type: "vector2" },
    setterValue: { type: "string", setter: function (value) {
      return "customized " + value;
    }},
    val: { type: "string", validation: function (value) {
      if (value !== "test") {
        throw new Error("Validation error");
      }
    }}
  }
});
var operation;

describe("Operation", function () {

  describe("options", function () {

    beforeEach(function () {
      operation = new testOperation(kit);
    });

    describe("Vector2", function () {

      describe("#getVec()", function () {

        it("should return the default value", function () {
          var value = operation.getVec();
          value.should.be.an.instanceOf(ImglyKit.Vector2);
          value.x.should.equal(100);
          value.y.should.equal(200);
        });

      }); // #getVec()

      describe("#setVec()", function () {

        describe("with a vector", function () {

          it("should set the value", function () {
            operation.setVec(new ImglyKit.Vector2(200, 100));
            var value = operation.getVec();
            value.x.should.equal(200);
            value.y.should.equal(100);
          });

        });

        describe("with an invalid value", function () {

          it("should throw an error", function () {
            var throwable = function () {
              operation.setVec("foo?");
            };
            throwable.should.throw("Operation `null`: Option `vec` has to be an instance of ImglyKit.Vector2.");
          });

        });

      }); // #setVec()

    }); // Vector2

    describe("Color", function () {

      describe("#getCol()", function () {

        it("should return the default value", function () {
          var value = operation.getCol();
          value.should.be.an.instanceOf(ImglyKit.Color);
          value.r.should.equal(0);
          value.g.should.equal(0);
          value.b.should.equal(0);
          value.a.should.equal(1);
        });

      }); // #getCol()

      describe("#setCol()", function () {

        describe("with a color", function () {

          it("should set the value", function () {
            operation.setCol(new ImglyKit.Color(1, 1, 1, 1));
            var value = operation.getCol();
            value.r.should.equal(1);
            value.g.should.equal(1);
            value.b.should.equal(1);
            value.a.should.equal(1);
          });

        });

        describe("with an invalid value", function () {

          it("should throw an error", function () {
            var throwable = function () {
              operation.setCol("foo?");
            };
            throwable.should.throw("Operation `null`: Option `col` has to be an instance of ImglyKit.Color.");
          });

        });

      }); // #setVec()

    }); // Vector2

    describe("String", function () {

      describe("#getStr()", function () {

        it("should return the default value", function () {
          var value = operation.getStr();
          value.should.equal("center");
        });

      }); // #getStr()

      describe("#setStr()", function () {

        describe("with a valid value", function () {

          it("should set the value", function () {
            operation.setStr("left");
            var value = operation.getStr();
            value.should.equal("left");
          });

        });

        describe("with an invalid value", function () {

          it("should throw an error", function () {
            var throwable = function () {
              operation.setStr("foo");
            };
            throwable.should.throw("Operation `null`: Invalid value for `str` (valid values are: left, center, right)");
          });

        });

      }); // #setStr()

    }); // String

    describe("Number", function () {

      describe("#getNum()", function () {

        it("should return the default value", function () {
          var value = operation.getNum();
          value.should.equal(1);
        });

      }); // #getNum()

      describe("#setNum()", function () {

        describe("with a valid value", function () {

          it("should set the value", function () {
            operation.setNum(2);
            var value = operation.getNum();
            value.should.equal(2);
          });

        });

        describe("with an invalid value", function () {

          it("should throw an error", function () {
            var throwable = function () {
              operation.setNum("foo");
            };
            throwable.should.throw("Operation `null`: Option `num` has to be a number.");
          });

        });

      }); // #setNum()

    }); // Number

    describe("Boolean", function () {

      describe("#getBool()", function () {

        it("should return the default value", function () {
          var value = operation.getBool();
          value.should.equal(false);
        });

      }); // #getBool()

      describe("#setBool()", function () {

        describe("with a valid value", function () {

          it("should set the value", function () {
            operation.setBool(true);
            var value = operation.getBool();
            value.should.equal(true);
          });

        });

        describe("with an invalid value", function () {

          it("should throw an error", function () {
            var throwable = function () {
              operation.setBool("foo");
            };
            throwable.should.throw("Operation `null`: Option `bool` has to be a boolean.");
          });

        });

      }); // #setBool()

    }); // Boolean

    describe("required option", function () {

      describe("#validateSettings", function () {

        it("should return a rejected Promise", function (done) {

          operation.validateSettings()
            .catch(function (err) {
              err.message.should.equal("Operation `null`: Option `req` is required.");
              done();
            });

        });

      }); // when rendering

    }); // required option

    describe("not required option", function () {

      describe("#validateSettings()", function () {

        it("should not throw an error", function (done) {

          operation.setReq("foo"); // skip the validation for `req` option

          operation.validateSettings()
            .then(function () {
              done();
            });

        });

      }); // when rendering

    }); // not required option

    describe("option with custom setter", function () {

      describe("#setSetter()", function () {

        it("should correctly set the value", function () {

          var throwable = function () {
            operation.setSetterValue("test");
          };
          throwable.should.not.throw();

          var value = operation.getSetterValue();
          value.should.equal("customized test");

        });

      }); // #setSetter()

    }); // option with custom setter

    describe("option with custom validation", function () {

      describe("#setVal()", function () {

        describe("with an invalid value", function () {

          it("should throw an error", function () {
            var throwable = function () {
              operation.setVal("foo");
            };
            throwable.should.throw("Validation error");
          });

        });

        describe("with a valid value", function () {

          it("should not throw an error", function () {
            var throwable = function () {
              operation.setVal("test");
            };
            throwable.should.not.throw();
          });

        });

      }); // #setSetter()

    }); // option with custom setter

  }); // options

  describe("#setNumberFormat", function () {

    describe("with an invalid value", function() {

      it("should throw an error", function () {

        var throwable = function () {
          operation.setNumberFormat("foo");
        };
        throwable.should.throw("Operation `null`: Invalid value for `numberFormat` (valid values are: absolute, relative)");

      });

    });

    describe("with a invalid value", function() {

      it("should set the value", function () {

        operation.setNumberFormat("absolute");
        operation.getNumberFormat().should.equal("absolute");

      });

    });

  }); // #setNumberFormat()

}); // Operation
