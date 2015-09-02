/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { React, BEM, Classnames } from '../globals'
import SplashScreen from './screens/splash/splash-screen'

const block = BEM.block('editor')

class EditorComponent extends React.Component {
  constructor (...args) {
    super(...args)

    this._screens = {
      splash: SplashScreen
    }
    this._currentScreenClass = this._screens.splash
  }

  /**
   * Returns the context passed to all children
   * @return {Object}
   */
  getChildContext () {
    return {
      ui: this.props.ui,
      renderer: this.props.renderer,
      options: this.props.options
    }
  }

  /**
   * Renders this component
   * @return {React.Component}
   */
  render () {
    const Screen = this._currentScreenClass

    const row = block.element('row')
    const cell = block.element('cell')

    return (<div className={block.str}>
      <div className={Classnames(row.str, row.modifier('header').str)}>
        <div className={Classnames(cell.str, cell.modifier('header').str)}></div>
      </div>
      <div className={Classnames(row.str, row.modifier('screen').str)}>
        <div className={Classnames(cell.str, cell.modifier('screen').str)}>
          <Screen {...this._props} />
        </div>
      </div>
    </div>)
  }
}

EditorComponent.childContextTypes = {
  ui: React.PropTypes.object.isRequired,
  renderer: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}

EditorComponent.propTypes = {
  ui: React.PropTypes.object.isRequired,
  renderer: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}

export default EditorComponent
