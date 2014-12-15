"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var UI = require("../base/ui");

// Partials
var HeaderPartial = require("./partials/header");
var Layout = require("./layout");

/**
 * The default (new) UI
 * @class
 * @private
 */
var ImglyKitUI = UI.extend({
  /**
   * A unique string that identifies this UI
   * @type {String}
   */
  identifier: "imglykit",

  /**
   * The list of partial templates that will be used
   * @type {Array.<Template>}
   * @private
   */
  _partialTemplates: [
    new HeaderPartial()
  ],

  /**
   * The layout template that will be compiled and rendered
   * @type {Template}
   * @private
   */
  _layoutTemplate: new Layout()
});

module.exports = ImglyKitUI;
