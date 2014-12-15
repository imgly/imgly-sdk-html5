"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Hogan = require("hogan");

/**
 * @class
 * @alias ImglyKit.UI.Partial
 */
function Partial() {
  /**
   * The template
   * @type {Hogan.Template}
   * @private
   */
  this._template = this._compile();
}

/**
 * The string that will be used in the parent template
 * @type {String}
 */
Partial.prototype.name = null;

/**
 * The source of this partial
 * @type {String}
 */
Partial.prototype.source = null;

/**
 * Compiles this partial
 * @return {Hogan.Template}
 * @private
 */
Partial.prototype._compile = function() {
  if (this.source === null) {
    throw new Error("Partial#_compile: No source available.");
  }
  return Hogan.compile(this.source);
};

/**
 * Renders the template
 * @return {String}
 */
Partial.prototype.render = function() {
  return this._template.render();
};

/**
 * To create an {@link ImglyKit.UI.Partial} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Partial.extend = require("../../lib/extend");

module.exports = Partial;
