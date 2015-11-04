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

import { Promise, Utils, React, ReactBEM, BaseComponent } from '../../../globals'
import ModalManager from '../../../lib/modal-manager'

export default class WebcamComponent extends BaseComponent {
  constructor () {
    super()
    this._bindAll('_onWebcamReady')

    this.state = { webcamReady: false }
  }

  /**
   * Gets called when the webcam is ready to serve a video
   * @private
   */
  _onWebcamReady () {
    this.props.onReady && this.props.onReady()
    this.setState({ webcamReady: true })
  }

  /**
   * Checks whether this component needs an update
   * @param {Object} nextProps
   * @param {Object} nextState
   */
  shouldComponentUpdate (nextProps, nextState) {
    // This component never updates
    return false
  }

  /**
   * Public method that makes a photo from the current video stream
   * @return {Promise}
   */
  makePhoto () {
    if (!this.state.webcamReady) {
      return Promise.reject(new Error('UserMedia stream not ready'))
    }

    const video = React.findDOMNode(this.refs.video)

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      context.drawImage(video, 0, 0)

      const image = new window.Image()
      image.addEventListener('load', () => {
        resolve(image)
      })
      image.src = canvas.toDataURL('image/png')
    })
  }

  /**
   * Gets called when the component is about to unmount. Stops the video
   * stream and kills the video
   */
  componentWillUnmount () {
    super.componentWillUnmount()

    const video = React.findDOMNode(this.refs.video)
    if (this._stream) {
      const track = this._stream.getTracks()[0]
      track && track.stop()
      this._stream.stop && this._stream.stop()
    }
    video.pause()
  }

  /**
   * Gets called after the component has been mounted
   */
  componentDidMount () {
    this._resizeVideo()
    this._initVideoStream()
  }

  /**
   * Resizes the video to fit the container
   * @return {[type]} [description]
   */
  _resizeVideo () {
    const video = React.findDOMNode(this.refs.video)
    const container = React.findDOMNode(this.refs.container)
    const innerDimensions = Utils.getInnerDimensionsForElement(container)

    video.width = innerDimensions.x
    video.height = innerDimensions.y
  }

  /**
   * Initializes the video stream
   * @private
   */
  _initVideoStream () {
    const { ui } = this.context
    const translate = ui.translate.bind(ui)

    const video = React.findDOMNode(this.refs.video)
    const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia

    if (!getUserMedia) {
      const errorModal = ModalManager.instance.displayError(
        translate('errors.webcamNotSupported.title'),
        translate('errors.webcamNotSupported.text')
      )
      errorModal.on('close', () => this.props.onBack())
      return
    }

    getUserMedia.call(navigator, { video: true }, (stream) => {
      this._stream = stream
      video.onloadedmetadata = this._onWebcamReady
      video.src = window.URL.createObjectURL(stream)
    }, (err) => {
      console.error && console.error(err)

      const errorModal = ModalManager.instance.displayError(
        translate('errors.webcamUnavailable.title'),
        translate('errors.webcamUnavailable.text', { error: err.name }),
        true
      )

      errorModal.on('close', () => this.props.onBack())
    })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (
      <div bem='$b:webcam' ref='container'>
        <video bem='e:video' ref='video' autoPlay></video>
      </div>
    )
  }
}

WebcamComponent.propTypes = {
  onReady: React.PropTypes.func
}
