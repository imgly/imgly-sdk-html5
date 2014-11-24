"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Holds a list of {@link ImglyKit.Operation} objects
 * @class
 * @alias ImglyKit.OperationsStack
 * @extends {Array}
 * @param {ImglyKit} kit
 */
function OperationsStack(kit) {
  /**
   * @type {ImglyKit}
   * @private
   */
  this._kit = kit;
}

OperationsStack.prototype = new Array();

module.exports = OperationsStack;
