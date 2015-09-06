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
import { Log, ReactBEM } from '../../../globals'
import ScreenComponent from '../screen-component'
import SubHeaderComponent from '../../sub-header-component'
import WebcamComponent from './webcam-component'

export default class WebcamScreenComponent extends ScreenComponent {
  constructor () {
    super()
    this._bindAll('_onCancel', '_onWebcamReady', '_onShutterClicked')
    this.state = { webcamReady: false }
  }

  /**
   * Gets called when the webcam is ready
   * @private
   */
  _onWebcamReady () {
    this.setState({ webcamReady: true })
  }

  /**
   * Gets called when the user clicks the cancel button in the subheader
   * @private
   */
  _onCancel () {
    this.props.editor.switchToSplashScreen()
  }

  /**
   * Gets called when the shutter button has been clicked
   * @private
   */
  _onShutterClicked () {
    const webcam = this.refs.webcam
    webcam.makePhoto()
      .then((image) => {
        this.props.editor.setImage(image)
      })
      .catch((e) => {
        Log.error(e)
      })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='b:screen $b:webcamScreen'>
      <SubHeaderComponent
        label={this._t('webcam.headline')}>
        <bem specifier='$b:subHeader'>
          <div bem='e:cancelButton' onClick={this._onCancel}>
            {this._t('generic.cancel')}
          </div>
          <div bem='e:label'>
            {this._t('webcam.headline')}
          </div>
        </bem>
      </SubHeaderComponent>

      <div bem='$b:canvasContainer e:row'>
        <div bem='e:cell'>
          <WebcamComponent ref='webcam' onReady={this._onWebcamReady} />
        </div>
      </div>

      <div bem='$b:controls e:row'>
        <div bem='e:cell'>
          <bem specifier='b:webcamScreen'>
            <div
              bem='e:shutterButton'
              onClick={this._onShutterClicked}
              className={this.state.webcamReady ? 'is-active' : false}></div>
          </bem>
        </div>
      </div>
    </div>)
  }
}
