/* jshint unused:false */
/* jshint -W083 */
"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = require("lodash");
var Vector2 = require("../lib/math/vector2");
var Color = require("../lib/color");

/**
 * Base class for Operations. Extendable via {@link ImglyKit.Operation#extend}.
 * @class
 * @alias ImglyKit.Operation
 */
function Operation(kit, options) {
  if (kit.constructor.name !== "ImglyKit") {
    throw new Error("Operation: First parameter for constructor has to be an ImglyKit instance.");
  }

  this._kit = kit;
  this.availableOptions = _.extend(this.availableOptions || {}, {
    numberFormat: { type: "string", default: "relative", available: ["absolute", "relative"] }
  });

  this._initOptions(options || {});
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
Operation.identifier = null;

/**
 * Checks whether this Operation can be applied the way it is configured
 */
Operation.prototype.validateSettings = function() {
  var identifier = this.constructor.identifier;

  // Check for required options
  for (var optionName in this.availableOptions) {
    var optionConfig = this.availableOptions[optionName];
    if (optionConfig.required && typeof this._options[optionName] === "undefined") {
      throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` is required.");
    }
  }
};

/**
 * Applies this operation
 * @param  {Renderer} renderer
 * @return {Promise}
 * @abstract
 */
Operation.prototype.render = function() {
  /* istanbul ignore next */
  throw new Error("Operation#render is abstract and not implemented in inherited class.");
};

/**
 * Goes through the available options, sets _options defaults
 * @param {Object} userOptions
 * @private
 */
Operation.prototype._initOptions = function(userOptions) {
  this._options = {};

  // Set defaults, create getters and setters
  var optionName, option, capitalized;
  var self = this;
  for (optionName in this.availableOptions) {
    option = this.availableOptions[optionName];

    // Set default if available
    if (typeof option.default !== "undefined") {
      this._options[optionName] = option.default;
    }

    // Create setter and getter
    (function (optionName, option) {
      capitalized = optionName.charAt(0).toUpperCase() + optionName.slice(1);

      self["set" + capitalized] = function (value) {
        if (typeof option.setter !== "undefined") {
          value = option.setter.call(this, value);
        }
        self._setOption(optionName, value);
      };

      // Default getter
      self["get" + capitalized] = function () {
        return self._getOption(optionName);
      };
    })(optionName, option);

  }

  // Overwrite options with the ones given by user
  for (optionName in userOptions) {
    // Check if option is available
    if (typeof this.availableOptions[optionName] === "undefined") {
      throw new Error("Invalid option: " + optionName);
    }

    // Call setter
    capitalized = optionName.charAt(0).toUpperCase() + optionName.slice(1);
    this["set" + capitalized](userOptions[optionName]);
  }
};

/**
 * Returns the value for the given option
 * @param {String} optionName
 * @return {*}
 * @private
 */
Operation.prototype._getOption = function(optionName) {
  return this._options[optionName];
};

/**
 * Sets the value for the given option, validates it
 * @param {String} optionName
 * @param {*} value
 * @private
 */
Operation.prototype._setOption = function(optionName, value) {
  var optionConfig = this.availableOptions[optionName];
  var identifier = this.constructor.identifier;

  if (typeof optionConfig.validation !== "undefined") {
    optionConfig.validation(value);
  }

  switch (optionConfig.type) {
    // String options
    case "string":
      if (typeof value !== "string") {
        throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be a string.");
      }

      // String value restrictions
      var available = optionConfig.available;
      if (typeof available !== "undefined" && available.indexOf(value) === -1) {
        throw new Error("Operation `" + identifier + "`: Invalid value for `" + optionName + "` (valid values are: " + optionConfig.available.join(", ") + ")");
      }

      this._options[optionName] = value;
      break;

    // Number options
    case "number":
      if (typeof value !== "number") {
        throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be a number.");
      }

      this._options[optionName] = value;
      break;

    // Boolean options
    case "boolean":
      if (typeof value !== "boolean") {
        throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be a boolean.");
      }

      this._options[optionName] = value;
      break;

    // Vector2 options
    case "vector2":
      if (!(value instanceof Vector2)) {
        throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be an instance of ImglyKit.Vector2.");
      }

      this._options[optionName] = value.clone();

      break;

    // Color options
    case "color":
      if (!(value instanceof Color)) {
        throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be an instance of ImglyKit.Color.");
      }

      this._options[optionName] = value;
      break;
  }
};

/**
 * To create an {@link ImglyKit.Operation} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Operation.extend = require("../lib/extend");

module.exports = Operation;
