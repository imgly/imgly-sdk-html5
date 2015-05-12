/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

class Helpers {
  constructor (kit, ui, options) {
    this._kit = kit
    this._ui = ui
    this._options = options
  }

  assetPath (asset) {
    return this._options.assetsUrl + '/' + asset
  }
}

export default Helpers
