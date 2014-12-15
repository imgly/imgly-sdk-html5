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
var Utils = require("../lib/utils");
var Hogan = require("hogan");

// Partials
var HeaderPartial = require("./partials/header");

/**
 * @class
 * @param {Object} options
 * @param {HTMLElement} [options.container] - Specifies where the UI should be
 *                                          added to. If none is given, the UI
 *                                          will automatically be disabled.
 */
function UI(options) {
  if (typeof options.container === "undefined") {
    throw new Error("UI: `container` not defined in options.");
  }

  if (!Utils.isDOMElement(options.container)) {
    throw new Error("UI: `container` is not a DOM element.");
  }

  /**
   * @type {Object}
   * @private
   */
  this._options = options;

  /**
   * Contains the partial objects
   * @type {Object.<String, HoganTemplate>}
   * @private
   */
  this._partials = this._compilePartials();

  /**
   * Contains the layout template
   * @type {HoganTemplate}
   */
   this._layout = this._compileLayout();
}

/**
 * Renders the UI, then attaches it to the DOM
 */
UI.prototype.attach = function () {
  var self = this;
  var source = this._render();
  self._options.container.innerHTML = source;
};

/**
 * Compiles the layout
 * @return {Hogan.Template}
 * @private
 */
UI.prototype._compileLayout = function() {
  var layout = fs.readFileSync(__dirname + "/templates/layout.mustache", "utf8");
  var template = Hogan.compile(layout);
};

/**
 * Compiles the partials
 * @return {Object.<String, Partial>}
 * @private
 */
UI.prototype._compilePartials = function() {
  var partialObjects = [
    new HeaderPartial()
  ];

  var partials = {}, partialObject;
  for (var i = 0; i < partialObjects.length; i++) {
    partialObject = partialObjects[i];
    partials[partialObject.name] = partialObject;
  }
  return partials;
};

/**
 * Renders the partial templates
 * @return {Object.<String, String>}
 * @private
 */
UI.prototype._renderPartials = function() {
  var partials = {}, partial;
  for (var partialName in this._partials) {
    partial = this._partials[partialName];
    partials[partialName] = partial.render();
  }
  return partials;
};

/**
 * Renders the UI
 * @return {String}
 * @private
 */
UI.prototype._render = function () {
  var layout = fs.readFileSync(__dirname + "/templates/layout.mustache", "utf8");
  var template = Hogan.compile(layout);

  var partials = this._renderPartials();
  var context = {
    options: this._options
  };

  return template.render(context, partials);
};

module.exports = UI;
