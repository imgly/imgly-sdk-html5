/* global Image */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import EventEmitter from '../../../lib/event-emitter'
import Utils from '../../../lib/utils'
import Vector2 from '../../../lib/math/vector2'

export default class WebcamHandler extends EventEmitter {
  constructor (kit, ui) {
    super()
    this._kit = kit
    this._ui = ui

    const { container } = this._ui
    this._canvasContainer = container.querySelector('.imglykit-canvas-container')

    this._video = container.querySelector('.imglykit-webcam-video')
    this._webcamButton = container.querySelector('.imglykit-webcam-button')
    this._webcamButton.addEventListener('click', this._onWebcamButtonClick.bind(this))
    this._initVideoStream()
  }

  /**
   * Gets called when the user clicked the shutter button. Draws the current
   * video frame to a canvas, creates an image from it and emits the `image`
   * event
   * @param  {Event} e
   * @private
   */
  _onWebcamButtonClick (e) {
    e.preventDefault()
    const canvas = document.createElement('canvas')
    canvas.width = this._video.videoWidth
    canvas.height = this._video.videoHeight
    const context = canvas.getContext('2d')
    context.drawImage(this._video, 0, 0)

    // Deprecated MediaStream API
    if (this._stream.stop) {
      this._stream.stop()
    }

    // New MediaStreamTrack API, stopping all tracks
    if (this._tracks) {
      this._tracks.forEach((track) => {
        track.stop()
      })
    }

    this._video.pause()

    delete this._stream
    delete this._video

    const image = new Image()
    image.addEventListener('load', () => {
      this.emit('image', image)
    })
    image.src = canvas.toDataURL('image/png')
  }

  /**
   * Initializes the video stream
   * @private
   */
  _initVideoStream () {
    const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia
    if (!getUserMedia) {
      throw new Error('Webcam feature not supported! :(')
    }

    getUserMedia.call(navigator, { video: true }, (stream) => {
      this._stream = stream
      if (stream.getTracks) {
        this._tracks = stream.getTracks()
      }
      this._video.onloadedmetadata = this._onVideoReady.bind(this)
      this._video.src = window.URL.createObjectURL(stream)
    }, (err) => {
      throw err
    })
  }

  _onVideoReady () {
    this._resizeVideo()
  }

  _resizeVideo () {
    const { videoWidth, videoHeight } = this._video
    const size = new Vector2(videoWidth, videoHeight)
    const maxSize = new Vector2(this._canvasContainer.offsetWidth, this._canvasContainer.offsetHeight)

    const finalSize = Utils.resizeVectorToFit(size, maxSize)
    this._video.style.width = `${finalSize.x}px`
    this._video.style.height = `${finalSize.y}px`

    const diff = maxSize.clone()
      .subtract(finalSize)
      .divide(2)

    this._video.style.marginLeft = `${diff.x}px`
    this._video.style.marginTop = `${diff.y}px`
  }

  get getUserMedia () {
    return
  }
}
