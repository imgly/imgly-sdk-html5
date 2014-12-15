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
 * @alias ImglyKit.UI.Template
 */
function Template() {

}

/**
 * The string that will be used in the parent template
 * @type {String}
 */
Template.prototype.name = null;

/**
 * The source of this partial
 * @type {String}
 */
Template.prototype.source = null;

/**
 * Compiles this partial
 * @return {Hogan.Template}
 */
Template.prototype.compile = function() {
  if (this.source === null) {
    throw new Error("Template#compile: No source available.");
  }
  this._template = Hogan.compile(this.source);
};

/**
 * Renders the template
 * @return {String}
 */
Template.prototype.render = function() {
  return this._template.render();
};

/**
 * Returns the Hogan.Template instance. If this Template class is
 * used for the layout, `ImglyKit.UI` needs to have a reference to
 * the Hogan.Template instance to pass a context and the partials
 * @return {Hogan.Template}
 */
Template.prototype.getTemplate = function() {
  return this._template;
};

/**
 * To create an {@link ImglyKit.UI.Template} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Template.extend = require("../../lib/extend");

module.exports = Template;
