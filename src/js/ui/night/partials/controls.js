"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var fs = require("fs");
var Template = require("../../base/template");

/**
 * The controls partial
 *
 * @class
 * @extends ImglyKit.UI.Template
 * @private
 */
var ControlsPartial = Template.extend();

/**
 * The string that will be used in the parent template
 * @type {String}
 */
ControlsPartial.prototype.name = "controls";

/**
 * The list of buttons that can be displayed in the overview.
 * `operations` specifies the operation identifiers that need to be
 * enabled to show the button.
 * @type {Array.<Object>}
 * @private
 */
ControlsPartial.prototype._availableOverviewButtons = [
  { identifier: "filters", operations: ["filters"] },
  { identifier: "stickers", operations: ["stickers"] },
  { identifier: "rotation", operations: ["rotation"] },
  { identifier: "focus", operations: ["radial-blur", "tilt-shift"] },
  { identifier: "crop", operations: ["crop"] },
  { identifier: "brightness", operations: ["brightness"] },
  { identifier: "contrast", operations: ["contrast"] },
  { identifier: "saturation", operations: ["saturation"] },
  { identifier: "text", operations: ["text"] },
  { identifier: "frames", operations: ["frames"] }
];

/**
 * The source of this partial
 * @type {String}
 */
ControlsPartial.prototype.source = fs.readFileSync(__dirname + "/../templates/controls.mustache", "utf8");

/**
 * Returns an object that is being attached to the layout locals
 * so that they can be used via {{#partialName}}{{>partialName}}{{/partialName}}
 * in Hogan
 * @return {Object.<String,*>}
 */
ControlsPartial.prototype.getLocals = function() {
  return {
    overviewButtons: this._getOverviewButtons()
  };
};

/**
 * Returns an array of identifiers that should be displayed as operation
 * buttons in the overview (depending on which operations are enabled)
 * @return {Array.<String>}
 * @private
 */
ControlsPartial.prototype._getOverviewButtons = function() {
  var buttons = [], buttonInfo, operationIdentifiers, enabled;

  // Iterate the available overview buttons
  for (var i = 0; i < this._availableOverviewButtons.length; i++) {
    enabled = false;
    buttonInfo = this._availableOverviewButtons[i];
    operationIdentifiers = buttonInfo.operations;

    // Check whether (at least) one of the operations are enabled
    for (var j = 0; j < operationIdentifiers.length; j++) {
      if (this._ui.operationEnabled(operationIdentifiers[j])) {
        enabled = true;
      }
    }

    // Enable the button in the overview
    if (enabled) {
      buttons.push({ identifier: buttonInfo.identifier });
    }
  }
  return buttons;
};

module.exports = ControlsPartial;
