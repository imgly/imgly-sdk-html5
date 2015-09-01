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

  // TODO Remove this later, avoid SDK calling it on resize
  render () {}

  /**
   * Main entry point for the UI
   * @private
   */
  _attach () {
    // Container has to be position: relative
    this._options.container.style.position = 'relative'

    const context = this.context

    React.withContext(context, () => {
      React.render(<EditorComponent
        kit={this._kit}
        options={this._options} />,
        this._options.container)
    })
  }
}
