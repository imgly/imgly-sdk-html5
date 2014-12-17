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

import * as _ from "lodash";
import Vector2 from "../lib/math/vector2";
import Color from "../lib/color";

/**
 * Base class for Operations. Extendable via {@link ImglyKit.Operation#extend}.
 * @class
 * @alias ImglyKit.Operation
 */
class Operation {
  constructor (kit, options) {
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
  get identifier () {
    return null;
  }

  /**
   * Checks whether this Operation can be applied the way it is configured
   */
  validateSettings () {
    var identifier = this.identifier;

    // Check for required options
    for (var optionName in this.availableOptions) {
      var optionConfig = this.availableOptions[optionName];
      if (optionConfig.required && typeof this._options[optionName] === "undefined") {
        throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` is required.");
      }
    }
  }

  /**
   * Applies this operation
   * @param  {Renderer} renderer
   * @return {Promise}
   * @abstract
   */
  render (renderer) {
    if (renderer.identifier === "webgl") {
      /* istanbul ignore next */
      this._renderWebGL(renderer);
    } else {
      this._renderCanvas(renderer);
    }
  }

  /**
   * Applies this operation using WebGL
   * @return {WebGLRenderer} renderer
   * @private
   */
  _renderWebGL () {
    throw new Error("Operation#_renderWebGL is abstract and not implemented in inherited class.");
  }

  /**
   * Applies this operation using Canvas2D
   * @return {CanvasRenderer} renderer
   * @private
   */
  _renderCanvas () {
    throw new Error("Operation#_renderCanvas is abstract and not implemented in inherited class.");
  }

  /**
   * Goes through the available options, sets _options defaults
   * @param {Object} userOptions
   * @private
   */
  _initOptions (userOptions) {
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
  }

  /**
   * Returns the value for the given option
   * @param {String} optionName
   * @return {*}
   * @private
   */
  _getOption (optionName) {
    return this._options[optionName];
  }

  /**
   * Sets the value for the given option, validates it
   * @param {String} optionName
   * @param {*} value
   * @private
   */
  _setOption (optionName, value) {
    var optionConfig = this.availableOptions[optionName];
    var identifier = this.identifier;

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
  }
}

/**
 * To create an {@link ImglyKit.Operation} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
import extend from "../lib/extend";
Operation.extend = extend;

export default Operation;
