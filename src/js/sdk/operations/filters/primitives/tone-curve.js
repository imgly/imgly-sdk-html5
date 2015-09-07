/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Utils from '../../../lib/utils'
import LookupTable from './lookup-table'

/**
 * Tone curve primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.ToneCurve
 * @extends {ImglyKit.Filter.Primitives.LookupTable}
 */
class ToneCurve extends LookupTable {
  constructor (...args) {
    super(...args)

    this._options = Utils.defaults(this._options, {
      rgbControlPoints: {
        red: this._options.controlPoints,
        green: this._options.controlPoints,
        blue: this._options.controlPoints
      }
    })

    if (typeof this._options.rgbControlPoints !== 'undefined') {
      this._updateLookupTable()
    }
  }

  /**
   * Calculates the lookup table
   * @private
   */
  _updateLookupTable () {
    var r = this._calculateSplineCurve(this._options.rgbControlPoints.red)
    var g = this._calculateSplineCurve(this._options.rgbControlPoints.green)
    var b = this._calculateSplineCurve(this._options.rgbControlPoints.blue)

    this._options.data = this._buildLookupTable(r, g, b)
  }

  /**
   * Builds the lookup table
   * @param  {Array} r
   * @param  {Array} g
   * @param  {Array} b
   * @return {Array}
   * @private
   */
  _buildLookupTable (r, g, b) {
    var data = []

    for (var i = 0; i < 256; i++) {
      data.push(Math.min(Math.max(i + r[i], 0), 255))
      data.push(Math.min(Math.max(i + g[i], 0), 255))
      data.push(Math.min(Math.max(i + b[i], 0), 255))
      data.push(255)
    }

    return data
  }

  /**
   * Calculates the spline curve data for the given points
   * @param  {Array.<Array.<Number>>} points
   * @return {Array.<Number>}
   */
  _calculateSplineCurve (points) {
    points = points.sort(function (a, b) {
      return a[0] > b[0]
    })

    var splinePoints = this._getSplineCurve(points)
    var firstSplinePoint = splinePoints[0]
    var i

    if (firstSplinePoint[0] > 0) {
      for (i = 0; i < firstSplinePoint[0]; i++) {
        splinePoints.unshift([0, 0])
      }
    }

    var preparedPoints = []
    for (i = 0; i < splinePoints.length; i++) {
      var newPoint = splinePoints[i]
      var origPoint = [newPoint[0], newPoint[0]]

      var distance = Math.sqrt(
        Math.pow(origPoint[0] - newPoint[0], 2) +
        Math.pow(origPoint[1] - newPoint[1], 2)
      )

      if (origPoint[1] > newPoint[1]) {
        distance = -distance
      }

      preparedPoints.push(distance)
    }

    return preparedPoints
  }

  _getSplineCurve (points) {
    var sdA = this._secondDerivative(points)

    var n = sdA.length
    var sd = []
    var i

    for (i = 0; i < n; i++) {
      sd[i] = sdA[i]
    }

    var output = []

    for (i = 0; i < n - 1; i++) {
      var cur = points[i]
      var next = points[i + 1]

      for (var x = cur[0]; x < next[0]; x++) {
        var t = (x - cur[0]) / (next[0] - cur[0])

        var a = 1 - t
        var b = t
        var h = next[0] - cur[0]

        var y = a * cur[1] + b * next[1] + (h * h / 6) *
          ((a * a * a - a) * sd[i] + (b * b * b - b) * sd[i + 1])

        if (y > 255) {
          y = 255
        } else if (y < 0) {
          y = 0
        }

        output.push([x, y])
      }
    }

    if (output.length === 255) {
      output.push(points[points.length - 1])
    }

    return output
  }

  _secondDerivative (points) {
    var n = points.length
    if (n <= 0 || n === 1) {
      return null
    }

    var matrix = []
    var result = []
    var i, k

    matrix[0] = [0, 1, 0]

    for (i = 1; i < n - 1; i++) {
      var P1 = points[i - 1]
      var P2 = points[i]
      var P3 = points[i + 1]

      matrix[i] = matrix[i] || []
      matrix[i][0] = (P2[0] - P1[0]) / 6
      matrix[i][1] = (P3[0] - P1[0]) / 3
      matrix[i][2] = (P3[0] - P2[0]) / 6
      result[i] = (P3[1] - P2[1]) / (P3[0] - P2[0]) - (P2[1] - P1[1]) / (P2[0] - P1[0])
    }

    result[0] = 0
    result[n - 1] = 0

    matrix[n - 1] = [0, 1, 0]

    // Pass 1
    for (i = 1; i < n; i++) {
      k = matrix[1][0] / matrix[i - 1][1]
      matrix[i][1] -= k * matrix[i - 1][2]
      matrix[i][0] = 0
      result[i] -= k * result[i - 1]
    }

    // Pass 2
    for (i = n - 2; i > 0; i--) {
      k = matrix[i][2] / matrix[i + 1][1]
      matrix[i][1] -= k * matrix[i + 1][0]
      matrix[i][2] = 0
      result[i] -= k * result[i + 1]
    }

    var y2 = []
    for (i = 0; i < n; i++) {
      y2[i] = result[i] / matrix[i][1]
    }

    return y2
  }
}

export default ToneCurve
