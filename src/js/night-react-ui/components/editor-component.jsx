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

import { React, ReactBEM } from '../globals'
import HeaderComponent from './header-component'
import SplashScreenComponent from './screens/splash/splash-screen-component'
import WebcamScreenComponent from './screens/webcam/webcam-screen-component'
import EditorScreenComponent from './screens/editor/editor-screen-component'
import ModalContainerComponent from './modal-container-component'
import ModalManager from '../lib/modal-manager'

class EditorComponent extends React.Component {
  constructor (...args) {
    super(...args)

    this._screens = {
      splash: SplashScreenComponent,
      webcam: WebcamScreenComponent,
      editor: EditorScreenComponent
    }

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
    this.props.kit.setImage(image)
    this.props.kit.reset()

    // Forces reinitialization
    this.setState({ screen: null })
    this.setState({ screen: this._screens.editor })
  }

  /**
   * Returns the context passed to all children
   * @return {Object}
   */
  getChildContext () {
    return {
      ui: this.props.ui,
      kit: this.props.kit,
      options: this.props.options,
      operationsStack: this.props.operationsStack,
      mediator: this.props.mediator
    }
  }

  /**
   * Renders this component
   * @return {React.Component}
   */
  render () {
    const Screen = this.state.screen
    if (!Screen) { return ReactBEM.transform(<div />) }

    return ReactBEM.transform(<div bem='$b:editor'>
      <ModalContainerComponent
        modalManager={ModalManager.instance}
        onUpdate={this._onModalManagerUpdate} />

      <div bem='e:table'>
        <HeaderComponent />
        <div bem='e:row m:screen'>
          <div bem='e:cell m:screen'>
            <Screen editor={this} {...this._props} ref='screen' />
          </div>
        </div>
      </div>
    </div>)
  }
}

EditorComponent.childContextTypes = {
  ui: React.PropTypes.object.isRequired,
  kit: React.PropTypes.object.isRequired,
  operationsStack: React.PropTypes.object.isRequired,
  mediator: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}

EditorComponent.propTypes = {
  ui: React.PropTypes.object.isRequired,
  kit: React.PropTypes.object.isRequired,
  operationsStack: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}

export default EditorComponent
