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
var Partial = require("./partial");

/**
 * The header partial
 *
 * @class
 * @extends ImglyKit.UI.Partial
 * @private
 */
var HeaderPartial = Partial.extend();

/**
 * The string that will be used in the parent template
 * @type {String}
 */
HeaderPartial.prototype.name = "header";

/**
 * The source of this partial
 * @type {String}
 */
HeaderPartial.prototype.source = fs.readFileSync(__dirname + "/../templates/header.mustache", "utf8");

module.exports = HeaderPartial;
