/** @jsx ReactBEM.createElement **/
/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { ReactBEM, Constants } from '../../../globals'
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'

export default class FiltersControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onItemClick',
      '_onOperationUpdated'
    )
    this._operation = this.getSharedState('operation')

    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated
    }

    this._initFilters()
  }

  // -------------------------------------------------------------------------- INITIALIZATION

  /**
   * Initializes the available filters
   * @private
   */
  _initFilters () {
    const filtersMap = PhotoEditorSDK.Filters
    const filters = []
    for (let key in filtersMap) {
      filters.push(filtersMap[key])
    }
    const additionalFilters = this.props.options.filters || []
    this._filters = filters.concat(additionalFilters)
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
  _onItemClick (filter, e) {
    this._operation.setFilter(filter)
    this._operation.setIntensity(1)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    super._onBackClick(e)

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
   * Renders the list items for this control
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    const currentFilter = this._operation.getFilter()

    return this._filters.map((filter) => {
      const identifier = filter.identifier
      return (<li
        bem='e:item'
        key={identifier}
        onClick={this._onItemClick.bind(this, filter)}>
        <bem specifier='$b:controls'>
          <div
            bem='$e:button m:withInlineLabel'
            className={filter === currentFilter ? 'is-active' : null}>
            <img bem='e:icon' src={this._getAssetPath(`controls/filters/${identifier}.png`, true)} />
            <div bem='e:label'>{filter.prototype.name}</div>
          </div>
        </bem>
      </li>)
    })
  }

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const listItems = this._renderListItems()

    return (<div bem='e:cell m:list'>
      <ScrollbarComponent>
        <ul bem='$e:list'>
          {listItems}
        </ul>
      </ScrollbarComponent>
    </div>)
  }
}
