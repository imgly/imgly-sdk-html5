"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Utils = require("../../lib/utils");

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
 * The list of partial templates that will be used
 * @type {Array.<Template>}
 * @private
 */
UI.prototype._partialTemplates = [];

/**
 * The layout template that will be compiled and rendered
 * @type {Template}
 * @private
 */
UI.prototype._layoutTemplate = null;

/**
 * A unique string that identifies this UI
 * @type {String}
 */
UI.prototype.identifier = null;

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
  this._layoutTemplate.compile();
  return this._layoutTemplate.getTemplate();
};

/**
 * Compiles the partials
 * @param {Array.<Partial>} partialObjects
 * @return {Object.<String, Partial>}
 * @private
 */
UI.prototype._compilePartials = function() {
  var partials = {}, partialObject;
  var templates = this._partialTemplates;
  for (var i = 0; i < templates.length; i++) {
    partialObject = templates[i];
    partials[partialObject.name] = partialObject;
    partialObject.compile();
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
  var partials = this._renderPartials();
  var context = {
    options: this._options
  };

  return this._layout.render(context, partials);
};

/**
 * To create an {@link ImglyKit.UI} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
UI.extend = require("../../lib/extend");

module.exports = UI;
