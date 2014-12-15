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
var Template = require("../base/template");

/**
 * The layout template
 *
 * @class
 * @extends ImglyKit.UI.Template
 * @private
 */
var Layout = Template.extend();

/**
 * The string that will be used in the parent template
 * @type {String}
 */
Layout.prototype.name = "layout";

/**
 * The source of this partial
 * @type {String}
 */
Layout.prototype.source = fs.readFileSync(__dirname + "/templates/layout.mustache", "utf8");

module.exports = Layout;
