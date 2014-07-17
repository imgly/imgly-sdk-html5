###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveToneCurveFilter extends Filter
  constructor: (@app, options = {}) ->
    super

    if @rgbControlPoints || options.rgbControlPoints?
      # @todo: Clone options.rgbControlPoints in case
      # the user wants to change the values later
      rgb = @rgbControlPoints || options.rgbControlPoints

      @redControlPoints ?= rgb
      @greenControlPoints ?= rgb
      @blueControlPoints ?= rgb
    else
      @redControlPoints ?= options.redControlPoints
      @greenControlPoints ?= options.greenControlPoints
      @blueControlPoints ?= options.blueControlPoints

    # Update the tone curve texture
    if @redControlPoints and @greenControlPoints and @blueControlPoints
      @updateToneCurveTexture()

  render: (context, w, h) ->
    context.putImageData @apply(context.getImageData(0, 0, w, h)), 0, 0

  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        imageData.data[index] = imageData.data[index] + @preparedRed[imageData.data[index]]
        imageData.data[index + 1] = imageData.data[index + 1] + @preparedGreen[imageData.data[index + 1]]
        imageData.data[index + 2] = imageData.data[index + 2] + @preparedBlue[imageData.data[index + 2]]
        imageData.data[index + 3] = 255
    imageData

  updateToneCurveTexture: ->
    @preparedRed = @getPreparedSplineCurve @redControlPoints
    @preparedBlue = @getPreparedSplineCurve @blueControlPoints
    @preparedGreen = @getPreparedSplineCurve @greenControlPoints

  # Code borrowed from GPUImage
  getPreparedSplineCurve: (points) ->
    sortedPoints = points.sort (a, b) ->
      x1 = a[0]
      x2 = b[0]
      return x1 > x2

    # Convert from (0, 1) to (0, 255)
    convertedPoints = []
    for point in points
      newPoint = [
        point[0] * 255,
        point[1] * 255
      ]

      convertedPoints.push newPoint

    splinePoints = @splineCurve convertedPoints

    firstSplinePoint = splinePoints[0]

    if firstSplinePoint[0] > 0
      for i in [0...firstSplinePoint[0]]
        splinePoints.unshift [0, 0]

    preparedSplinePoints = []
    for i in [0...splinePoints.length]
      newPoint = splinePoints[i]
      origPoint = [newPoint[0], newPoint[0]]

      distance = Math.sqrt(Math.pow(origPoint[0] - newPoint[0], 2) + Math.pow(origPoint[1] - newPoint[1], 2))

      if origPoint[1] > newPoint[1]
        distance = -distance

      preparedSplinePoints.push distance

    return preparedSplinePoints

  splineCurve: (points) ->
    sdA = @secondDerivative points

    n = sdA.length
    sd = []

    for i in [0...n]
      sd[i] = sdA[i]

    output = []

    for i in [0...n-1]
      cur = points[i]
      next = points[i+1]

      for x in [cur[0]...next[0]]
        t = (x - cur[0]) / (next[0] - cur[0])

        a = 1 - t
        b = t
        h = next[0] - cur[0]

        y = a * cur[1] + b * next[1] + (h*h/6) * ( (a*a*a-a)*sd[i]+(b*b*b-b)*sd[i+1])

        if y > 255
          y = 255
        else if y < 0
          y = 0

        output.push [x, y]

    if output.length is 255
      output.push points.pop()

    return output

  secondDerivative: (points) ->
    n = points.length
    if n <= 0 or n is 1
      return null

    matrix = []
    result = []

    matrix[0] = [0, 1, 0]

    for i in [1...n-1]
      P1 = points[i - 1]
      P2 = points[i]
      P3 = points[i + 1]

      matrix[i] ?= []
      matrix[i][0] = (P2[0] - P1[0]) / 6
      matrix[i][1] = (P3[0] - P1[0]) / 3
      matrix[i][2] = (P3[0] - P2[0]) / 6
      result[i] = (P3[1] - P2[1]) / (P3[0] - P2[0]) - (P2[1] - P1[1]) / (P2[0] - P1[0])

    result[0] = 0
    result[n - 1] = 0

    matrix[n-1] = [0, 1, 0]

    # solving pass1
    for i in [1...n]
      k = matrix[1][0] / matrix[i-1][1]
      matrix[i][1] -= k * matrix[i-1][2]
      matrix[i][0] = 0
      result[i] -= k * result[i-1]

    # solving pass2
    for i in [n-2...0]
      k = matrix[i][2] / matrix[i+1][1]
      matrix[i][1] -= k * matrix[i+1][0]
      matrix[i][2] = 0
      result[i] -= k * result[i+1]

    y2 = []
    for i in [0...n]
      y2[i] = result[i] / matrix[i][1]

    return y2

  setRedControlPoints: (controlPoints) ->
    @redControlPoints = controlPoints
  setGreenControlPoints: (controlPoints) ->
    @greenControlPoints = controlPoints
  setBlueControlPoints: (controlPoints) ->
    @blueControlPoints = controlPoints

module.exports = PrimitiveToneCurveFilter
