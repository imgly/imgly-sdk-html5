/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { React, ReactBEM, EventEmitter } from '../globals'
import HeaderComponent from './header-component'
import SplashScreenComponent from './screens/splash/splash-screen-component'
import WebcamScreenComponent from './screens/webcam/webcam-screen-component'
import EditorScreenComponent from './screens/editor/editor-screen-component'

class EditorComponent extends React.Component {
  constructor (...args) {
    super(...args)

    this._screens = {
      splash: SplashScreenComponent,
      webcam: WebcamScreenComponent,
      editor: EditorScreenComponent
    }

    this._mediator = new EventEmitter()

    let initialScreen = this._screens.splash
    if (this.props.ui.hasImage()) {
      initialScreen = this._screens.editor
    }
    this.state = { screen: initialScreen }
  }

  /**
   * Switches to the webcam screen
   */
  switchToWebcamScreen () {
    this.setState({ screen: this._screens.webcam })
  }

  /**
   * Switches to the splash screen
   */
  switchToSplashScreen () {
    this.setState({ screen: this._screens.splash })
  }

  /**
   * Gets called when an image is ready for editing
   * @param {Image} image
   */
  setImage (image) {
    this.setState({ screen: this._screens.editor })
  }

  /**
   * Returns the context passed to all children
   * @return {Object}
   */
  getChildContext () {
    return {
      ui: this.props.ui,
      renderer: this.props.renderer,
      options: this.props.options,
      mediator: this._mediator
    }
  }

  /**
   * Renders this component
   * @return {React.Component}
   */
  render () {
    const Screen = this.state.screen

    return ReactBEM.transform(<div bem='$b:editor'>
      <HeaderComponent />
      <div bem='e:row m:screen'>
        <div bem='e:cell m:screen'>
          <Screen editor={this} {...this._props} />
        </div>
      </div>
    </div>)
  }
}

EditorComponent.childContextTypes = {
  ui: React.PropTypes.object.isRequired,
  renderer: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
  mediator: React.PropTypes.object.isRequired
}

EditorComponent.propTypes = {
  ui: React.PropTypes.object.isRequired,
  renderer: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}

export default EditorComponent
