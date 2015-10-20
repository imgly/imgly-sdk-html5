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
import ImageResizer from '../lib/image-resizer'
import HeaderComponent from './header-component'
import SplashScreenComponent from './screens/splash/splash-screen-component'
import WebcamScreenComponent from './screens/webcam/webcam-screen-component'
import EditorScreenComponent from './screens/editor/editor-screen-component'
import EmptyScreenComponent from './screens/screen-component'
import ModalContainerComponent from './modal-container-component'
import ModalManager from '../lib/modal-manager'

class EditorComponent extends React.Component {
  constructor (...args) {
    super(...args)

    this._screens = {
      splash: SplashScreenComponent,
      webcam: WebcamScreenComponent,
      editor: EditorScreenComponent,
      empty: EmptyScreenComponent
    }

    this._onModalManagerUpdate = this._onModalManagerUpdate.bind(this)

    this.state = {}
    this._init()
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the modal manager has triggered an update
   * @private
   */
  _onModalManagerUpdate () {
    this.forceUpdate()
  }

  /**
   * Sets the initial screen and handles the initially set image
   * @private
   */
  _init () {
    // If the SDK has an image, remove it and pass it through
    // our image resizing if necessary
    let initialScreen = this._screens.splash
    if (this.props.ui.hasImage()) {
      const image = this.props.kit.getImage()
      this.props.kit.setImage(null)
      this.setImage(image)

      // Show empty screen while performing initial resize
      initialScreen = this._screens.empty
    }
    this.state.screen = initialScreen
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
    const translate = this.props.ui.translate.bind(this.props.ui)

    const done = (image) => {
      this.props.kit.setImage(image)
      this.props.kit.reset()

      // Forces reinitialization
      this.setState({ screen: null })
      this.setState({ screen: this._screens.editor })
    }

    const maxPixels = this.props.options.maxMegaPixels * 1000000
    if (image.width * image.height > maxPixels) {
      const loadingModal = ModalManager.instance.displayLoading(translate('loading.resizing'))
      const imageResizer = new ImageResizer(image, maxPixels)

      imageResizer.resize()
        .then(({ canvas, dimensions }) => {
          loadingModal.close()
          ModalManager.instance.displayWarning(
            translate('warnings.imageResized.title'),
            translate('warnings.imageResized.text', {
              maxMegaPixels: this.props.options.maxMegaPixels,
              width: dimensions.x,
              height: dimensions.y
            })
          )
          done(canvas)
        })
    } else {
      done(image)
    }
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
