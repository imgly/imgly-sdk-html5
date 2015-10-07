/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import React from 'react'
import ReactBEM from '../lib/react-bem'

export default class BaseChildComponent extends React.Component {
  constructor (...args) {
    super(...args)
    this._events = {}

    this._bindAll(
      '_onSharedStateUpdate'
    )
  }

  /**
   * Binds the instance methods with the given names
   * to the class context
   * @param  {Array.<String>} ...fnNames
   * @protected
   */
  _bindAll (...fnNames) {
    fnNames.forEach((name) => {
      if (typeof this[name] !== 'function') {
        throw new Error(`_bindAll: ${this.constructor.name}.${name} is not a function.`)
      }
      this[name] = this[name].bind(this)
    })
  }

  /**
   * Returns the translation for `key`
   * @param  {String} key
   * @param  {Object} [interpolationOptions]
   * @return {String}
   */
  _t (key, interpolationOptions) {
    return this.context.ui.translate(key, interpolationOptions)
  }

  /**
   * A helper method for UI.helpers.assetPath
   * @param {?} ...args
   * @protected
   */
  _getAssetPath (...args) {
    return this.context.ui.getHelpers().assetPath(...args)
  }

  /**
   * Method we are using for rendering
   * @return {ReactBEM.element}
   */
  renderWithBEM () {

  }

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    this._bindEvents()
    if (this.props.sharedState) {
      this.props.sharedState.on('update', this._onSharedStateUpdate)
    }
  }

  /**
   * Gets called when the shared state did change
   * @param  {Object} newState
   * @private
   */
  _onSharedStateUpdate (newState) {
    this.sharedStateDidChange(newState)
    this.forceUpdate()
  }

  /**
   * Gets called when the shared state did change
   * @param {Object} newState
   */
  sharedStateDidChange (newState) {

  }

  /**
   * Gets called before this component is unmounted
   */
  componentWillUnmount () {
    this._unbindEvents()

    if (this.props.sharedState) {
      this.props.sharedState.off('update', this._onSharedStateUpdate)
    }
  }

  /**
   * Sets the given state on the shared state
   * @param {Object} state
   * @param {Boolean} update
   */
  setSharedState (state, update) {
    this.props.sharedState.set(state, update)
  }

  /**
   * Returns the shared state value for the given property
   * @param {String} prop
   * @return {*}
   */
  getSharedState (prop) {
    return this.props.sharedState.get(prop)
  }

  /**
   * Binds the events in _events
   * @protected
   */
  _bindEvents () {
    for (let eventName in this._events) {
      const handler = this._events[eventName]
      this.context.mediator.on(eventName, handler)
    }
  }

  /**
   * Unbinds the events in _events
   * @protected
   */
  _unbindEvents () {
    for (let eventName in this._events) {
      const handler = this._events[eventName]
      this.context.mediator.off(eventName, handler)
    }
  }

  /**
   * Emits an event with the given event name and arguments through
   * the mediator
   * @param  {String} eventName
   * @param  {Array.<*>} ...args
   * @protected
   */
  _emitEvent (eventName, ...args) {
    this.context.mediator.emit(eventName, ...args)
  }

  /**
   * Transforms the ReactBEM.element returned by `renderWithBEM` into
   * React.Element objects with proper class names
   * @return {React.Element}
   */
  render () {
    return ReactBEM.transform(this.renderWithBEM())
  }
}

BaseChildComponent.contextTypes = {
  ui: React.PropTypes.object,
  kit: React.PropTypes.object,
  options: React.PropTypes.object,
  operationsStack: React.PropTypes.object,
  mediator: React.PropTypes.object
}
