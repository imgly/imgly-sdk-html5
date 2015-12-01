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
} from '../../../../globals'
import ScrollbarComponent from '../../../scrollbar-component'

const ITEMS = [
  { identifier: 'tableau', i18nKey: 'identity', options: { } },
  { identifier: 'tableau', i18nKey: 'watercolor', options: { filter: 'water-color' } },
  { identifier: 'tableau', i18nKey: 'oil', options: { filter: 'oil' } },
  { identifier: 'brush-mark', i18nKey: 'brush1', options: { image: '/build/assets/art/Test_04.jpg' } }
]

export default class PaintControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick',
      '_onItemClick',
      '_onOperationUpdated'
    )
    this._operation = this.getSharedState('operation')

    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated
    }
  }

  // -------------------------------------------------------------------------- INITIALIZATION

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
    const ui = this.context.ui
    if (this._operation) {
      ui.removeOperation(this._operation)
    }
    console.log(object.identifier)
    this._operation = ui.getOrCreateOperation(object.identifier)
    if (object.options.filter) {
      this._operation.setFilter(object.options.filter)
    }
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
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

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui
    const listItems = ITEMS.map((item) => {
      const identifier = item.identifier
      const i18nKey = item.i18nKey
      return (<li
        bem='e:item'
        key={i18nKey}
        onClick={this._onItemClick.bind(this, item)}>
          <bem specifier='$b:controls'>
            <div
              bem='$e:button m:withInlineLabel'
              className={null}>
              <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/filters/${identifier}.png`, true)} />
              <div bem='e:label'>{this._t(`controls.tableau.${i18nKey}`)}</div>
            </div>
          </bem>
        </li>)
    })
    return (<div bem='$b:controls e:table'>
      <div bem='e:cell m:button m:withBorderRight m:narrow'>
        <div bem='$e:button m:narrow' onClick={this._onBackClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/back@2x.png`, true)} />
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
