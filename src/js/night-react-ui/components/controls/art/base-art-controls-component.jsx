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

import {
  ReactBEM,
  BaseComponent,
  Constants
} from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'

export default class BaseArtControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._bindAll(
      '_onBackClick',
      '_onItemClick',
      '_onOperationUpdated'
    )
    this._items = []
    this._operation = this.getSharedState('operation')
    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an operation has been updated
   * @param  {Operation} operation
   * @private
   */
  _onOperationUpdated (operation) {
    if (operation === this._operation) {
      this.forceUpdate()
    }
  }

  /**
   * Gets called when the user clicks an item
   * @param {Filter} filter
   * @param {Event} e
   * @private
   */
  _onItemClick (object, e) {
    this._createOperation(object)
    if (object.options.filter) {
      this._handleTableuOperation(object)
    } else if (object.options.imageURL) {
      this._handleBrushMarkOperation(object)
    }
  }

  /**
   * When the user chooses an effect that is realized via
   * tableu-operation this code gets called. I will setup the
   * operation with the information given by the object
   * @param  {object} object
   * @private
   */
  _handleTableuOperation (object) {
    this._operation.setFilter(object.options.filter)
    this.setSharedState({
      operation: this._operation,
      operationExistedBefore: false,
      initialOptions: {}
    })
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  /**
   * When the user chooses an effect that is realized via
   * brush-mark-operation this code gets called. I will setup the
   * operation with the information given by the object
   * @param  {object} object
   * @private
   */
   _handleBrushMarkOperation (object) {
     const ui = this.context.ui
     const absoluteImageURL = `${ui.getAssetPath(object.options.imageURL)}`
     this._uploadImage(absoluteImageURL).then((image) => {
       this._operation.setImage(image)
       this._operation._imageURL = object.options.imageURL
       this.setSharedState({
         operation: this._operation,
         operationExistedBefore: false,
         initialOptions: {}
       })
       this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
     })
   }

  /**
   * Creates an operation based on the type defined by the object.
   * @private
   */
  _createOperation (object) {
    const ui = this.context.ui
    if (this._operation) {
      ui.removeOperation(this._operation)
    }
    this._operation = ui.getOrCreateOperation(object.identifier)
  }

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')
    const initialOptions = this.getSharedState('initialOptions')
    const filter = this._operation.getFilter()
    const intensity = this._operation.getIntensity()
    if (filter !== initialOptions.filter ||
      intensity !== initialOptions.intensity) {
      const { editor } = this.props
      editor.addHistory(this._operation,
        initialOptions,
        this.getSharedState('operationExistedBefore'))
    }

    if (filter.isIdentity) {
      const { ui } = this.context
      ui.removeOperation(this._operation)
    }
  }

  /**
   * Uploads the given image
   * @return {Promise}
   * @private
   */
  _uploadImage (imageURL) {
    return new Promise((resolve, reject) => {
      const image = new window.Image()
      image.addEventListener('load', () => {
        resolve(image)
      })

      image.crossOrigin = 'Anonymous'
      image.src = imageURL
    })
  }

  setItems (items) {
    this._items = items
  }

  getItems () {
    return this._items
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui
    const listItems = this._items.map((item) => {
      const i18nKey = item.i18nKey
      const currentOperation = this.getSharedState('operation')
      const isCurrentOperation = currentOperation.constructor.identifier === item.identifier

      let optionsMatch = currentOperation.optionsEqual(item.options)
      if (item.options.imageURL) {
        optionsMatch = currentOperation._imageURL === item.options.imageURL
      }

      const isActive = isCurrentOperation && optionsMatch
      return (<li
        bem='e:item'
        key={i18nKey}
        onClick={this._onItemClick.bind(this, item)}>
          <bem specifier='$b:controls'>
            <div
              bem='$e:button m:withInlineLabel'
              className={isActive ? 'is-active' : null}>
              <img bem='e:icon' src={ui.getAssetPath(`controls/filters/${i18nKey}.png`, true)} />
              <div bem='e:label'>{this._t(`controls.art.${i18nKey}`)}</div>
            </div>
          </bem>
        </li>)
    })
    return (<div bem='$b:controls e:table'>
      <div bem='e:cell m:button m:withBorderRight m:narrow'>
        <div bem='$e:button m:narrow' onClick={this._onBackClick}>
          <img bem='e:icon' src={ui.getAssetPath(`controls/back@2x.png`, true)} />
        </div>
      </div>
      <div bem='e:cell m:list'>
        <ScrollbarComponent>
          <ul bem='$e:list'>
            {listItems}
          </ul>
        </ScrollbarComponent>
      </div>
    </div>)
  }
}
