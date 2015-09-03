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
  constructor (renderer, options) {
    super(renderer, options)

    this._renderer = renderer
    this._registerWebFonts()
  }

  // TODO Remove this later, avoid SDK calling it on resize
  render () {}

  /**
   * Register all default languages
   * @private
   */
  _registerLanguages () {
    this.registerLanguage('en', require('./lang/en.json'))
    this.registerLanguage('de', require('./lang/de.json'))
  }

  /**
   * A unique string that represents this UI
   * @type {String}
   */
  get identifier () {
    return 'night-react'
  }

  /**
   * Creates a <style> block in <head> that specifies the web fonts
   * that we use in this UI. We're doing this in JS because the assets
   * path is dynamic.
   * @private
   */
  _registerWebFonts () {
    const regularFontPath = this._helpers.assetPath('fonts/montserrat-regular.woff', true)
    const lightFontPath = this._helpers.assetPath('fonts/montserrat-light.woff', true)

    const css = `
      // Injected by PhotoEditorSDK
      @font-face {
        font-family: "__pesdk_Montserrat";
        src: url('${regularFontPath}') format('woff');
        font-weight: normal;
        font-style: normal;
      }

      @font-face {
        font-family: "__pesdk_Montserrat";
        src: url('${lightFontPath}') format('woff');
        font-weight: 100;
        font-style: normal;
      }
    `

    const style = document.createElement('style')
    style.innerHTML = css

    const head = document.getElementsByTagName('head')[0]
    head.appendChild(style)
  }

  /**
   * Main entry point for the UI
   * @private
   */
  _attach () {
    // Container has to be position: relative
    this._options.container.style.position = 'relative'

    React.render(<EditorComponent
      ui={this}
      renderer={this._renderer}
      options={this._options} />,
      this._options.container)
  }
}
