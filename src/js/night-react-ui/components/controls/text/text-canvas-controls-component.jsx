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

import { ReactBEM, BaseChildComponent, Vector2, Constants } from '../../../globals'
import DraggableComponent from '../../draggable-component.jsx'

export default class TextCanvasControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onRemoveClick',
      '_onCanvasClick',
      '_onTextDragStart',
      '_onTextDrag',
      '_onTextChange',
      '_onResizeKnobDragStart',
      '_onResizeKnobDrag',
      '_onResizeKnobDragStop',
      '_onRotationKnobDragStart',
      '_onRotationKnobDrag',
      '_onRotationKnobDragStop'
    )

    this._operation = this.getSharedState('operation')
    this._texts = this.getSharedState('texts')
    this._selectedTextMoved = false
    this._dragging = false
    this.state = { editMode: false }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the currently edited text changes
   * @param  {Event} e
   * @private
   */
  _onTextChange (e) {
    const selectedText = this.getSharedState('selectedText')
    selectedText.setText(e.target.value)
    this.forceUpdate()
  }

  /**
   * Gets called when the user clicks on a text
   * @param  {Text} text
   * @param  {Event} e
   * @private
   */
  _onTextClick (text, e) {
    const selectedText = this.getSharedState('selectedText')
    if (text !== selectedText) return
    if (this._selectedTextMoved) return

    this.setState({ editMode: true }, () => {
      this.refs.textArea.getDOMNode().focus()
    })
  }

  /**
   * Gets called when the user clicks the remove button
   * @param  {Event} e
   * @private
   */
  _onRemoveClick (e) {
    const selectedText = this.getSharedState('selectedText')
    if (!selectedText) return

    const texts = this.getSharedState('texts')
    const index = texts.indexOf(selectedText)
    if (index !== -1) {
      texts.splice(index, 1)
      this._texts = texts

      this._operation.setTexts(this._texts)
      this._operation.setDirty(true)
      this._emitEvent(Constants.EVENTS.CANVAS_RENDER, undefined, () => {
        this.props.onSwitchControls('back')
      })

      this.setSharedState({
        texts,
        selectedText: null
      })
    }
  }

  /**
   * Gets called when the user clicks somewhere on the canvas
   * @param  {Event} e
   * @private
   */
  _onCanvasClick (e) {
    console.log(this._dragging)
    if (this._dragging) return
    if (e.target !== this.refs.container.getDOMNode()) return

    if (this.state.editMode) {
      this.setState({ editMode: false })
    } else {
      this._operation.setTexts(this._texts)
      this._emitEvent(Constants.EVENTS.CANVAS_RENDER, undefined, () => {
        this.props.onSwitchControls('back')
      })
    }
  }

  // -------------------------------------------------------------------------- TEXT DRAGGING

  /**
   * Gets called when the user starts to drag the text
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onTextDragStart (position, e) {
    this._selectedTextMoved = false

    const selectedText = this.getSharedState('selectedText')
    this._initialPosition = selectedText.getPosition()
  }

  /**
   * Gets called when the user drags the text
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onTextDrag (offset, e) {
    // Move more than 5 pixels? Flag as moved
    // This will result in a click event on this element not being handled
    if (offset.len() > 5) {
      this._selectedTextMoved = true
    }

    const selectedText = this.getSharedState('selectedText')
    const { kit } = this.context

    const canvasDimensions = kit.getOutputDimensions()
    const newPosition = this._initialPosition.clone()
      .add(offset.clone().divide(canvasDimensions))

    selectedText.setPosition(newPosition)
    this.forceUpdate()
  }

  // -------------------------------------------------------------------------- RESIZE DRAGGING

  /**
   * Gets called when the user starts resizing the text
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onResizeKnobDragStart (position, e) {
    const selectedText = this.getSharedState('selectedText')
    this._dragging = true
    this._initialMaxWidth = selectedText.getMaxWidth()
  }

  /**
   * Gets called while the user resizes the text
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onResizeKnobDrag (offset, e) {
    const selectedText = this.getSharedState('selectedText')
    const { kit } = this.context

    const canvasDimensions = kit.getOutputDimensions()
    const newMaxWidth = this._initialMaxWidth + (offset.x / canvasDimensions.x * 2)

    selectedText.setMaxWidth(newMaxWidth)
    this.forceUpdate()
  }

  /**
   * Gets called when the user stops resizing the text
   * @param  {Event} e
   * @private
   */
  _onResizeKnobDragStop (e) {
    // Allow clicks on canvas 100ms after dragging has stopped
    setTimeout(() => {
      this._dragging = false
    }, 100)
  }

  // -------------------------------------------------------------------------- ROTATION

  /**
   * Gets called when the user starts dragging the resize knob
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onRotationKnobDragStart (position, e) {
    this._dragging = true
    this._initialPosition = this._getRotationKnobPosition()
  }

  /**
   * Gets called while the user rotates the text
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onRotationKnobDrag (offset, e) {
    const selectedText = this.getSharedState('selectedText')
    const { kit } = this.context

    const textPosition = this._getAbsoluteTextPosition(selectedText)
    const newKnobPosition = this._initialPosition
      .clone()
      .add(offset)

    // Calculate new rotation and scale from new knob position
    const knobDistanceFromCenter = newKnobPosition
      .clone()
      .subtract(textPosition)

    const boundingBox = selectedText.getBoundingBox(kit.getRenderer())
    const radians = Math.atan2(
      knobDistanceFromCenter.y,
      knobDistanceFromCenter.x
    ) - Math.atan2(boundingBox.y, boundingBox.x / 2)

    selectedText.setRotation(radians)
    this.forceUpdate()
  }

  /**
   * Gets called when the user stops rotating the text
   * @param  {Event} e
   * @private
   */
  _onRotationKnobDragStop (e) {
    // Allow clicks on canvas 100ms after dragging has stopped
    setTimeout(() => {
      this._dragging = false
    }, 100)
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the style object for the rotation knob
   * @return {Object}
   * @private
   */
  _getRotationKnobStyle () {
    const position = this._getRotationKnobPosition()
    return {
      left: position.x,
      top: position.y
    }
  }

  /**
   * Returns the style object for the resize knob
   * @return {Object}
   * @private
   */
  _getResizeKnobStyle () {
    const selectedText = this.getSharedState('selectedText')
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const sin = Math.sin(selectedText.getRotation())
    const cos = Math.cos(selectedText.getRotation())

    const boundingBox = selectedText.getBoundingBox(kit.getRenderer())
    const halfDimensions = boundingBox.clone().divide(2)
    const position = selectedText.getPosition()
      .clone()
      .multiply(canvasDimensions)
      .add(
        halfDimensions.x * cos,
        halfDimensions.x * sin
      )

    return {
      left: position.x,
      top: position.y
    }
  }

  /**
   * Returns the style object for the remove knob
   * @return {Object}
   * @private
   */
  _getRemoveKnobStyle () {
    const selectedText = this.getSharedState('selectedText')
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const sin = Math.sin(selectedText.getRotation())
    const cos = Math.cos(selectedText.getRotation())

    const boundingBox = selectedText.getBoundingBox(kit.getRenderer())
    const halfDimensions = boundingBox.clone().divide(2)
    const position = selectedText.getPosition()
      .clone()
      .multiply(canvasDimensions)
      .add(
        -halfDimensions.x * cos,
        -halfDimensions.x * sin
      )

    return {
      left: position.x,
      top: position.y
    }
  }

  /**
   * Returns the style object for the given text object
   * @param  {Text} text
   * @return {Object}
   * @private
   */
  _getTextStyle (text) {
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()
    let style = text.getStyle(canvasDimensions)

    const boundingBox = text.getBoundingBox(kit.getRenderer())
    style.width = boundingBox.x
    style.height = boundingBox.y

    return style
  }

  /**
   * Returns the style object for the text container
   * @param  {Text} text
   * @return {Object}
   * @private
   */
  _getContainerStyle (text) {
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const textPosition = text.getPosition()
      .clone()
      .multiply(canvasDimensions)

    const degrees = text.getRotation() * 180 / Math.PI
    const transform = `rotateZ(${degrees.toFixed(2)}deg)`
    const transformOrigin = '50% 0'

    const maxWidth = text.getMaxWidth() * canvasDimensions.x
    return {
      width: maxWidth,
      left: textPosition.x,
      top: textPosition.y,
      marginLeft: maxWidth * -0.5,
      transform: transform,
      MozTransform: transform,
      msTransform: transform,
      WebkitTransform: transform,
      transformOrigin: transformOrigin,
      MozTransformOrigin: transformOrigin,
      msTransformOrigin: transformOrigin,
      WebkitTransformOrigin: transformOrigin
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the sticker items
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderTextItems () {
    const selectedText = this.getSharedState('selectedText')

    return this._texts
      .map((text, i) => {
        const textStyle = this._getTextStyle(text)
        const containerStyle = this._getContainerStyle(text)
        const isSelected = selectedText === text
        const className = isSelected ? 'is-selected' : null

        let content = (<div bem='e:content' style={textStyle} onClick={this._onTextClick.bind(this, text)}>
          {text.getText()}
        </div>)

        if (this.state.editMode) {
          content = (<textarea
            bem='e:content'
            style={textStyle}
            defaultValue={text.getText()}
            ref='textArea'
            onChange={this._onTextChange} />)
        }

        return (<DraggableComponent
          onStart={this._onTextDragStart.bind(this, text)}
          onDrag={this._onTextDrag}
          disabled={this.state.editMode}>
            <div bem='$e:text' style={containerStyle} className={className}>
              {content}
            </div>
        </DraggableComponent>)
      })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { ui } = this.context
    const selectedText = this.getSharedState('selectedText')
    const stickerItems = this._renderTextItems()

    let knobs = []
    if (selectedText) {
      knobs = [
        (<DraggableComponent
          onStart={this._onRotationKnobDragStart}
          onDrag={this._onRotationKnobDrag}
          onStop={this._onRotationKnobDragStop}>
          <div bem='e:knob m:rotate $b:knob' style={this._getRotationKnobStyle()}>
            <img bem='e:icon m:larger' src={ui.getHelpers().assetPath('controls/knobs/rotate@2x.png', true)} />
          </div>
        </DraggableComponent>),
        (<DraggableComponent
          onStart={this._onResizeKnobDragStart}
          onDrag={this._onResizeKnobDrag}
          onStop={this._onResizeKnobDragStop}>
          <div bem='e:knob m:resize $b:knob' style={this._getResizeKnobStyle()}>
            <img bem='e:icon' src={ui.getHelpers().assetPath('controls/knobs/resize-diagonal-up@2x.png', true)} />
          </div>
        </DraggableComponent>),
        (<div bem='e:knob $b:knob' style={this._getRemoveKnobStyle()} onClick={this._onRemoveClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath('controls/knobs/remove@2x.png', true)} />
        </div>)
      ]
    }

    return (<div
      bem='b:canvasControls e:container m:full'
      ref='root'
      onClick={this._onCanvasClick}>
        <div
          bem='$b:textCanvasControls'
          ref='container'>
          {stickerItems}
          {knobs}
        </div>
      </div>)
  }

  // -------------------------------------------------------------------------- MATHS

  /**
   * Returns the position of the rotation knob
   * @return {Vector2}
   * @private
   */
  _getRotationKnobPosition () {
    const selectedText = this.getSharedState('selectedText')
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    const sin = Math.sin(selectedText.getRotation())
    const cos = Math.cos(selectedText.getRotation())

    const boundingBox = selectedText.getBoundingBox(kit.getRenderer())
    const halfDimensions = boundingBox.clone().divide(2)
    const position = selectedText.getPosition()
      .clone()
      .multiply(canvasDimensions)
      .add(
        halfDimensions.x * cos - boundingBox.y * sin,
        halfDimensions.x * sin + boundingBox.y * cos
      )
    return position
  }

  /**
   * Returns the absolute position for the given text
   * @param  {Text} text
   * @return {Vector2}
   * @private
   */
  _getAbsoluteTextPosition (text) {
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()

    return text.getPosition()
      .clone()
      .multiply(canvasDimensions)
  }
}
