"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Utils from "../../lib/utils";

/**
 * @class
 * @param {ImglyKit} kit
 * @param {Object} options
 * @param {HTMLElement} [options.container] - Specifies where the UI should be
 *                                          added to. If none is given, the UI
 *                                          will automatically be disabled.
 */
class UI {
  constructor (kit, options) {
    if (typeof options.container === "undefined") {
      throw new Error("UI: `container` not defined in options.");
    }

    if (!Utils.isDOMElement(options.container)) {
      throw new Error("UI: `container` is not a DOM element.");
    }

    /**
     * The list of partial templates that will be used
     * @type {Array.<Template>}
     * @private
     */
    this._partialTemplates = [];

    /**
     * The layout template that will be compiled and rendered
     * @type {Template}
     * @private
     */
    this._layoutTemplate = null;

    /**
     * A unique string that identifies this UI
     * @type {String}
     */
    this.identifier = null;

    /**
     * @type {ImglyKit}
     * @private
     */
    this._kit = kit;

    /**
     * @type {Object}
     * @private
     */
    this._options = options;

    /**
     * Contains the partial objects
     * @private
     */
    this._partials = null;

    /**
     * Contains the layout template
     * @type {HoganTemplate}
     */
    this._layout = null;
  }

  /**
   * Renders the UI, then attaches iØt to the DOM
   */
  attach () {
    var self = this;
    var source = this._render();
    self._options.container.innerHTML = source;
  }

  /**
   * Compiles the layout
   * @return {Hogan.Template}
   * @private
   */
  _compileLayout () {
    this._layoutTemplate.compile();
    return this._layoutTemplate.getTemplate();
  }

  /**
   * Compiles the partials
   * @param {Array.<Partial>} partialObjects
   * @return {Object.<String, Partial>}
   * @private
   */
  _compilePartials () {
    var partials = {}, partialObject;
    var templates = this._partialTemplates;
    for (var i = 0; i < templates.length; i++) {
      partialObject = templates[i];
      partials[partialObject.name] = partialObject;
      partialObject.compile();
    }
    return partials;
  }

  /**
   * Renders the partial templates
   * @return {Object.<String, String>}
   * @private
   */
  _renderPartials () {
    var partials = {}, partial;
    for (var partialName in this._partials) {
      partial = this._partials[partialName];
      partials[partialName] = partial.getTemplate();
    }
    return partials;
  }

  /**
   * Compiles the partials and the layout
   * @private
   */
  _compile () {
    this._partials = this._compilePartials();
    this._layout = this._compileLayout();
  }

  /**
   * Renders the UI
   * @return {String}
   * @private
   */
  _render () {
    this._compile();

    var partials = this._renderPartials();
    var locals = this.getLocals();

    return this._layout.render(locals, partials);
  }

  /**
   * Returns the locals that are passed to Hogan
   * @return {Object}
   */
  getLocals () {
    var self = this;
    var locals = {
      options: this._options,

      // Helpers
      img: function () { return self._imagePathHelper.call(self); }
    };

    // Attach locals for all known partials
    for (var partialName in this._partials) {
      locals[partialName] = this._partials[partialName].getLocals();
    }

    return locals;
  }

  /**
   * A helper that creates a valid file path for the given file name
   * @param  {String} file
   * @return {Function}
   * @private
   */
  _imagePathHelper () {
    var self = this;
    return function (file) {
      return self._options.assetsUrl + "/" + file;
    };
  }
}

/**
 * To create an {@link ImglyKit.UI} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
import extend from "../../lib/extend";
UI.extend = extend;

export default UI;
