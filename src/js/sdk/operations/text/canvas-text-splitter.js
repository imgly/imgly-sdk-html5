/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class CanvasTextSplitter {
  constructor (context) {
    this._context = context
    this._lastFontStyle = {}
    this._characterWidthCache = {}
  }

  /**
   * Returns the lines that fit the maxWidth
   * @return {Array.<String>}
   */
  getLines () {
    if (this._fontStyleChanged()) {
      this._characterWidthCache = {}
    }

    let lines = []
    let newLine = []

    // Iterate over lines
    const linesCount = this._lines.length
    for (let l = 0; l < linesCount; l++) {
      const line = this._lines[l]

      // Iterate over words
      const words = line.split(' ')
      const wordsCount = words.length
      for (let w = 0; w < wordsCount; w++) {
        const word = words[w]

        // Check if line is too wide for the maxwidth
        const width = this._getWidth(newLine.concat(word).join(' '))
        if (width > this._maxWidth) {
          // If there have been words before this one, start
          // a new line
          if (newLine.length > 0) {
            // Line too long -> line ended
            lines.push(newLine.join(' '))

            // Start a new line with the word
            newLine = [word]
          }

          // If the next word is too long, split it up
          if (this._getWidth(word) > this._maxWidth) {
            const splitWord = this._splitWord(word)
            lines = lines.concat(splitWord.lines)
            if (splitWord.rest) {
              newLine = [splitWord.rest]
            }
          }
        } else {
          newLine.push(word)
        }
      }

      lines.push(newLine.join(' '))
      newLine = []
    }

    return lines
  }

  /**
   * Splits up the given word to fit the max width
   * @param  {String} word
   * @return {Object}
   * @private
   */
  _splitWord (word) {
    let response = {
      lines: [],
      rest: null
    }

    const wordLength = word.length
    let chars = []
    for (let c = 0; c < wordLength; c++) {
      const char = word[c]
      if (this._getWidth(chars.concat(char).join('')) > this._maxWidth) {
        if (chars.length > 0) {
          response.lines.push(chars.join(''))
        }
        chars = [char]
      } else {
        chars.push(char)
      }

      if (c === wordLength - 1 && chars.length > 0) {
        response.rest = chars.join('')
      }
    }

    return response
  }

  /**
   * Checks if the font style changed from the last call
   * @return {Boolean}
   * @private
   */
  _fontStyleChanged () {
    if (this._context.font !== this._lastFontStyle) {
      this._lastFontStyle = this._context.font
      return true
    }
    return false
  }

  /**
   * Returns the measured width for the given string
   * @param  {String} string
   * @return {Number}
   * @private
   */
  _getWidth (string) {
    let width = 0
    const stringLength = string.length
    for (let c = 0; c < stringLength; c++) {
      const char = string[c]
      if (!this._characterWidthCache[char]) {
        const charWidth = this._context.measureText(char).width
        this._characterWidthCache[char] = charWidth
      }
      width += this._characterWidthCache[char]
    }
    return width
  }

  /**
   * Sets the text
   * @param {String} text
   */
  setText (text) {
    this._text = text
    this._lines = text.split('\n')
  }

  /**
   * Sets the max width
   * @param {Number} maxWidth
   */
  setMaxWidth (maxWidth) { this._maxWidth = maxWidth }
}
