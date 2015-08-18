var fs = require('fs')
var path = require('path')
var dot = require('dot')

var dotFunctionName = '__DOTJS_TEMPLATE'

module.exports = function (content) {
  var lines = content.split('\n')
  var newLines = []

  var regexStr = '' + dotFunctionName + '\\\([\'\"](.*?)[\'\"]\\\)'
  var regexSingle = new RegExp(regexStr)
  var regexAll = new RegExp(regexStr, 'g')
  var self = this

  lines.forEach(function (line) {
    if (regexAll.test(line)) {
      var matches = line.match(regexAll)

      matches.forEach(function (str) {
        var match = str.match(regexSingle)
        var fileName = match[1]

        var templatePath = path.resolve(self.context, fileName)

        self.addDependency(templatePath)

        var content = fs.readFileSync(templatePath, 'utf-8').toString()
        var code = dot.template(content, undefined).toString()
        code = code.replace('function anonymous', 'function')

        line = line.replace(regexSingle, code)
      })

      newLines.push(line)
    } else {
      newLines.push(line)
    }
  })
  return newLines.join('\n')
}
