"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var LookupTable = require("./lookup-table");

/**
 * Tone curve primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.ToneCurve
 * @extends {ImglyKit.Filter.Primitives.LookupTable}
 */
var ToneCurve = LookupTable.extend({
  constructor: function () {
    LookupTable.apply(this, arguments);

    this._options.data = [];
    for(var i = 0; i < 256; i++) {
      this._options.data.push(Math.floor(Math.random() * 256));
      this._options.data.push(Math.floor(Math.random() * 256));
      this._options.data.push(Math.floor(Math.random() * 256));
      this._options.data.push(255);
    }
  }
});

module.exports = ToneCurve;
