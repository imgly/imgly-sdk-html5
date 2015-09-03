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

import { BaseChildComponent, React, ReactBEM } from '../../../globals'
import ButtonComponent from '../../button-component'

export default class UploadComponent extends BaseChildComponent {
  constructor () {
    super()
    this._bindAll('_onClick', '_onFileChange')
    this._bindAll(
      '_onDragEnter', '_onDragOver', '_onDragLeave', '_onDrop'
    )

    this._dragCounter = 0
    this.state = { dragAreaHovered: false }
  }

  /**
   * Gets called when the cell emits a `dragEnter` event. Highlights
   * the cell
   * @param {Event} e
   * @private
   */
  _onDragEnter (e) {
    e.preventDefault()

    this._dragCounter++
    this.setState({ dragAreaHovered: true })
  }

  /**
   * Gets called when the cell emits a `dragOver` event. We need to
   * override the default behavior to get a drop event.
   * @param  {Event} e
   * @private
   */
  _onDragOver (e) {
    e.preventDefault()
  }

  _onDragLeave (e) {
    e.preventDefault()

    this._dragCounter--
    if (this._dragCounter === 0) {
      this.setState({ dragAreaHovered: false })
    }
  }

  _onDrop (e) {
    e.stopPropagation()
    e.preventDefault()
    e = e.nativeEvent
    e.returnValue = false

    this.setState({ dragAreaHovered: false }, () => {
      if (!e.dataTransfer) return

      this._handleFile(e.dataTransfer.files[0])
    })
  }

  /**
   * Gets called when the user clicks the button
   * @param  {Event} e
   * @private
   */
  _onClick (e) {
    const input = React.findDOMNode(this.refs.fileInput)
    input.click()
  }

  /**
   * Creates an image from the given file and passes it to the UI
   * @param  {File} file
   * @private
   */
  _handleFile (file) {
    const reader = new window.FileReader()
    reader.onload = (() => {
      return (e) => {
        const data = e.target.result
        const image = new window.Image()

        image.addEventListener('load', () => {
          this.props.onImage(image)
        })

        image.src = data
      }
    })(file)
    reader.readAsDataURL(file)
  }

  /**
   * Gets called when the file input has changed
   * @private
   */
  _onFileChange () {
    const input = React.findDOMNode(this.refs.fileInput)
    const file = input.files[0]
    this._handleFile(file)
  }

  renderWithBEM () {
    const cellProps = {
      onDragEnter: this._onDragEnter,
      onDragOver: this._onDragOver,
      onDragLeave: this._onDragLeave,
      onDrop: this._onDrop
    }

    if (this.state.dragAreaHovered) {
      cellProps.className = 'is-hovered'
    }

    return (<bem specifier='b:splashScreen'>
      <div bem='e:row m:withContent m:upload'>
        <div bem='$e:cell m:upload' {...cellProps}>
          <bem specifier='m:upload'>
            <input type='file' bem='e:hiddenFileInput' ref='fileInput' onChange={this._onFileChange} />
            <div bem='e:or'>{this._t('splash.or')}</div>
          </bem>
          <img bem='e:image'
            src={this._getAssetPath('splash/add-photo@2x.png', true)} />
          <ButtonComponent bem='e:button'
            onClick={this._onClick}>
              {this._t('splash.upload.button')}
          </ButtonComponent>
          <div bem='e:description'>
            {this._t('splash.upload.description')}
          </div>
        </div>
      </div>
    </bem>)
  }
}

UploadComponent.propTypes = {
  onImage: React.PropTypes.func.isRequired
}
