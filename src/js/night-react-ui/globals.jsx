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

import React from 'react'
import BEM from './lib/bem'
import ReactBEM from './lib/react-bem'
import Classnames from 'classnames'
import BaseChildComponent from './components/base-child-component'
import Utils from './lib/utils'

const Promise = PhotoEditorSDK.Promise
const Log = PhotoEditorSDK.Log
const Vector2 = PhotoEditorSDK.Vector2
const SDKUtils = PhotoEditorSDK.Utils

export {
  Log, Promise, Utils, React, BEM, Classnames, BaseChildComponent, ReactBEM, Vector2,
  SDKUtils
}
