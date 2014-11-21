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
 * @constructor
 */
function Operation(kit) {
  this.kit = kit;
}

/**
 * @function
 * @description  To create an {@link Operation} class of your own, call this
 *               method and provide instance properties and functions.
 */
Operation.extend = require("../lib/extend");

module.exports = Operation;
