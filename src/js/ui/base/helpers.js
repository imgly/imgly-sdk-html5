/*
 * Photo Editor SDK - photoeditorsdk.com
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
    var path = this._options.assetsUrl + '/' + asset

    var assetPathResolver = this._ui.options.ui.assetPathResolver
    if (typeof assetPathResolver !== 'undefined') {
      path = assetPathResolver(path)
    }

    return path
  }

  translate (key) {
    return this._ui.translate(key)
  }
}

export default Helpers
