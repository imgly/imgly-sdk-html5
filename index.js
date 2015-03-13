"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import ImglyKit from "./src/js/imglykit";

/* istanbul ignore next */
(function () {
  if (typeof window !== "undefined") {
    window.ImglyKit = ImglyKit;
  } else if (typeof module !== "undefined") {
    module.exports = ImglyKit;
  } else if (typeof global !== "undefined") {
    global.ImglyKit = ImglyKit;
  }
})();
