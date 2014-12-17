"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import * as fs from "fs";
import Template from "../../base/template";

/**
 * The canvas partial
 *
 * @class
 * @extends ImglyKit.UI.Template
 * @private
 */
class CanvasPartial extends Template {
  constructor (...args) {
    super(...args);

    /**
     * The string that will be used in the parent template
     * @type {String}
     */
    this.name = "canvas";

    /**
     * The source of this partial
     * @type {String}
     */
    this.source = fs.readFileSync(__dirname + "/../templates/canvas.mustache", "utf8");
  }
}

export default CanvasPartial;
