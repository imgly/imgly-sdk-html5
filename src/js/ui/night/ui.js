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
var UI = require("../base/ui");

// Partials
var ControlsPartial = require("./partials/controls");
var OperationButtonPartial = require("./partials/controls/operation-button");
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
  identifier: "night",

  /**
   * The list of partial templates that will be used
   * @type {Array.<Template>}
   * @private
   */
  _partialTemplates: [
    new ControlsPartial(), // {{>controls}}
    new OperationButtonPartial() // {{>operationButton}}
  ],

  /**
   * The layout template that will be compiled and rendered
   * @type {Template}
   * @private
   */
  _layoutTemplate: new Layout(),

  /**
   * Returns the context that is passed to Hogan
   * @return {Object}
   * @private
   */
  _getRenderingContext: function () {
    var context = UI.prototype._getRenderingContext.call(this);

    return _.extend(context, {

    });
  }
});

module.exports = ImglyKitUI;
