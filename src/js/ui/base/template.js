"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import * as Hogan from "hogan";

/**
 * @class
 * @alias ImglyKit.UI.Template
 */
class Template {
  constructor (kit, ui) {
    /**
     * @type {ImglyKit}
     * @private
     */
    this._kit = kit;

    /**
     * @type {ImglyKit.UI}
     * @private
     */
    this._ui = ui;

    /**
     * The string that will be used in the parent template
     * @type {String}
     */
    this.name = null;

    /**
     * The source of this partial
     * @type {String}
     */
    this.source = null;
  }

  /**
   * Compiles this partial
   * @return {Hogan.Template}
   */
  compile () {
    if (this.source === null) {
      throw new Error("Template#compile: No source available.");
    }
    this._template = Hogan.compile(this.source);
  }

  /**
   * Renders the template
   * @return {String}
   */
  render () {
    return this._template.render();
  }

  /**
   * Returns the Hogan.Template instance. If this Template class is
   * used for the layout, `ImglyKit.UI` needs to have a reference to
   * the Hogan.Template instance to pass a context and the partials
   * @return {Hogan.Template}
   */
  getTemplate () {
    return this._template;
  }

  /**
   * Returns an object that is being attached to the layout locals
   * so that they can be used via {{#partialName}}{{>partialName}}{{/partialName}}
   * in Hogan
   * @return {Object.<String,*>}
   */
  getLocals () {
    return {};
  }
}

/**
 * To create an {@link ImglyKit.UI.Template} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
import extend from "../../lib/extend";
Template.extend = extend;

export default Template;
