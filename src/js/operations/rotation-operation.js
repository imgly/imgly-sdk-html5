"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = require("./operation");

/**
 * An operation that can rotate an image
 *
 * @class
 * @alias ImglyKit.Operations.RotationOperation
 * @extends ImglyKit.Operation
 */
var RotationOperation = Operation.extend({

}, {
  identifier: "rotation"
});

module.exports = RotationOperation;
