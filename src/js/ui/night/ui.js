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
var CanvasPartial = require("./partials/canvas");
var ControlsPartial = require("./partials/controls");
var OverviewButtonPartial = require("./partials/controls/overview-button");

var Layout = require("./layout");

/**
 * The default UI
 * @class
 * @private
 */
var ImglyKitUI = UI.extend({
  /**
   * A unique string that identifies this UI
   * @type {String}
   */
  identifier: "night",

  constructor: function (kit) {
    this._partialTemplates.push(new ControlsPartial(kit, this));
    this._partialTemplates.push(new OverviewButtonPartial(kit, this));
    this._partialTemplates.push(new CanvasPartial(kit, this));

    UI.apply(this, arguments);
  },

  /**
   * The layout template that will be compiled and rendered
   * @type {Template}
   * @private
   */
  _layoutTemplate: new Layout(),

  /**
   * Checks whether the operation with the given identifier is enabled
   * @param  {String} identifier
   * @return {Boolean}
   */
  operationEnabled: function (identifier) {
    return true;
  }
});

module.exports = ImglyKitUI;
