/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import BaseUI from '../base/ui'
import React from 'react'
import EditorComponent from './components/editor-component'

export default class NightReactUI extends BaseUI {
  constructor (kit, options) {
    super(kit, options)

    this._kit = kit
    this._options = options
  }

  /**
   * Main entry point for the UI
   * @private
   */
  run () {
    React.render(<EditorComponent />, this._options.container)
  }
}
