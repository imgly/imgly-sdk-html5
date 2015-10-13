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

import { ReactBEM, BaseChildComponent } from '../../../globals'

export default class FontPreviewComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after the component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()
    this._renderCanvas()
  }

  /**
   * Gets called after this component has been updated
   */
  componentDidUpdate () {
    this._renderCanvas()
  }

  // -------------------------------------------------------------------------- CANVAS RENDERING

  /**
   * Renders the current font family onto the canvas
   * @private
   */
  _renderCanvas () {
    const canvas = this.refs.canvas.getDOMNode()

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const context = canvas.getContext('2d')

    context.fillStyle = 'red'
    context.clearRect(0, 0, canvas.width, canvas.height)

    context.font = `${this.props.fontWeight} 24px ${this.props.fontFamily}`
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.fillStyle = 'white'

    context.fillText('Abc', canvas.width / 2, canvas.height / 2)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<canvas bem='b:fontFamily e:canvas' ref='canvas' />)
  }
}
