"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import UI from "../base/ui";

// Partials
import CanvasPartial from "./partials/canvas";
import ControlsPartial from "./partials/controls";
import OverviewButtonPartial from "./partials/controls/overview-button";

import Layout from "./layout";

/**
 * The default UI
 * @class
 * @private
 */
class ImglyKitUI extends UI {
  constructor (kit, ...args) {
    super(kit, ...args);

    this._partialTemplates.push(new ControlsPartial(kit, this));
    this._partialTemplates.push(new OverviewButtonPartial(kit, this));
    this._partialTemplates.push(new CanvasPartial(kit, this));

    /**
     * A unique string that identifies this UI
     * @type {String}
     */
    this.identifier = "night";

    /**
     * The layout template that will be compiled and rendered
     * @type {Template}
     * @private
     */
    this._layoutTemplate = new Layout();
  }

  /**
   * Checks whether the operation with the given identifier is enabled
   * @param  {String} identifier
   * @return {Boolean}
   */
  operationEnabled (identifier) {
    return true;
  }
}

export default ImglyKitUI;
