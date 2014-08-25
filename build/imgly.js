;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
require=(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

},{"util":2,"buffer":3}],2:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":4}],5:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":6}],"buffer-browserify":[function(require,module,exports){
module.exports=require('q9TxCC');
},{}],"q9TxCC":[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

SlowBuffer.prototype.fill = function(value, start, end) {
  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this.parent[i + this.offset] = subject.readUInt8(i);
        }
        else {
          this.parent[i + this.offset] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1];
    }
  } else {
    val = buffer.parent[buffer.offset + offset];
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer.parent[buffer.offset + offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":5,"base64-js":7}],7:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],8:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],3:[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        this.parent[i + this.offset] = subject[i];
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    val |= buffer.parent[buffer.offset + offset + 1];
  } else {
    val = buffer.parent[buffer.offset + offset];
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset + 1] << 16;
    val |= buffer.parent[buffer.offset + offset + 2] << 8;
    val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    val = buffer.parent[buffer.offset + offset + 2] << 16;
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  buffer.parent[buffer.offset + offset] = value;
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset + 1] = value & 0x00ff;
  } else {
    buffer.parent[buffer.offset + offset + 1] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset] = value & 0x00ff;
  }
}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset + 3] = value & 0xff;
  } else {
    buffer.parent[buffer.offset + offset + 3] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset] = value & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":8,"base64-js":9}],9:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}]},{},[])
;;module.exports=require("buffer-browserify")

},{}],3:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/imgly.coffee",__dirname="/";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var ImglyKit, PhotoProcessor, UI, Utils,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PhotoProcessor = require("./photoprocessor.coffee");

UI = require("./ui/ui.coffee");

Utils = require("./utils.coffee");

window.after = function(t, f) {
  return setTimeout(f, t);
};

window.every = function(t, f) {
  return setInterval(f, t);
};

ImglyKit = (function() {
  ImglyKit.classPrefix = "imgly-";

  ImglyKit.canvasContainerPadding = 15;

  /*
    @param options.container The container we ImglyKit will run in
    @param options.additionalFonts Array with objects like to specify additional fonts [{
          name: "Lobster",
          cssClass: "lobster"
        },
        {
          name: "Titillium Web",
          cssClass: "titillium-web"
        }]
  */


  function ImglyKit(options) {
    var _base, _base1;
    this.options = options != null ? options : {};
    this.onImageLoaded = __bind(this.onImageLoaded, this);
    if ((_base = this.options).debug == null) {
      _base.debug = false;
    }
    if ((_base1 = this.options).assetsPath == null) {
      _base1.assetsPath = "/build/assets";
    }
    if (this.options.container == null) {
      throw new Error("No container given");
    }
    this.options.container = $(this.options.container);
    this.options.container.addClass(ImglyKit.classPrefix + "container");
    this.photoProcessor = new PhotoProcessor(this);
    this.ui = new UI(this);
  }

  /*
    @returns {Boolean} Whether Canvas and Canvastext is supported or not
  */


  ImglyKit.prototype.checkSupport = function() {
    var error;
    if (Modernizr.canvas && Modernizr.canvastext) {
      return true;
    }
    error = new Error("Canvas and / or Canvas Text drawing not supported");
    error.name = "NoSupportError";
    error.description = "No Canvas support";
    throw error;
  };

  /*
    @returns {jQuery.Object} The jQuery object for the app container
  */


  ImglyKit.prototype.getContainer = function() {
    return this.options.container;
  };

  /*
    @returns {Integer} The height of the app container
  */


  ImglyKit.prototype.getHeight = function() {
    return this.options.container.height();
  };

  /*
    @returns {ImglyKit.PhotoProcessor}
  */


  ImglyKit.prototype.getPhotoProcessor = function() {
    return this.photoProcessor;
  };

  /*
    @param {String} file path
    @returns {String} assets file path
  */


  ImglyKit.prototype.buildAssetsPath = function(path) {
    return this.options.assetsPath + "/" + path;
  };

  /*
    @param {Image|String} image Data URL or Image object
  */


  ImglyKit.prototype.run = function(image) {
    var dataUrl, error,
      _this = this;
    this.image = image;
    this.checkSupport();
    if (this.options.ratio != null) {
      this.options.initialControls = require("./ui/controls/crop.coffee");
      this.options.forceInitialControls = true;
      this.options.operationOptionsHook = function(operation) {
        return operation.setRatio(_this.options.ratio);
      };
    }
    if (!(typeof this.image === "string" || this.image instanceof Image)) {
      throw new Error("First parameter needs to be a String or an Image");
    }
    if (typeof this.image === "string") {
      if (this.image.slice(0, 10) !== "data:image") {
        error = new Error("First parameter is a string, but not an image data URL");
        error.name = "InvalidError";
        throw error;
      }
      dataUrl = this.image;
      this.image = new Image();
      this.image.src = dataUrl;
    }
    if (this.image.width > 0 && this.image.height > 0) {
      return this.onImageLoaded();
    } else {
      return this.image.onload = this.onImageLoaded;
    }
  };

  /*
    Gets called as soon as the image has been loaded
    and the image dimensions are available
  */


  ImglyKit.prototype.onImageLoaded = function() {
    var _this = this;
    console.log("onImageLoaded");
    /*
      Set up the user interface
    */

    if (!this.ui.initialized) {
      console.log("Initializing UI");
      this.ui.init();
      this.photoProcessor.setCanvas(this.ui.getCanvas());
      this.ui.on("preview_operation", function(operation) {
        var _ref;
        console.log("Setting operation");
        if ((_ref = _this.ui.getCurrentControls()) != null) {
          _ref.setOperation(operation);
        }
        return _this.photoProcessor.setPreviewOperation(operation);
      });
      this.ui.on("back", function() {
        _this.photoProcessor.unsetPreviewOperation();
        return _this.ui.resetControls();
      });
      this.ui.on("done", function() {
        _this.photoProcessor.acceptPreviewOperation();
        return _this.ui.resetControls();
      });
    } else {
      this.photoProcessor.reset();
      this.ui.resetControls();
    }
    /*
      Reset everything
    */

    this.reset();
    /*
      Set source image of the photo processor and tell
      it to render it
    */

    this.photoProcessor.setSourceImage(this.image);
    return this.photoProcessor.renderPreview(function(err) {
      /*
        Do we have controls that have to be shown
        on startup?
      */

      var controls;
      if (_this.options.initialControls) {
        controls = _this.ui.controls;
        controls.switchToControls(_this.options.initialControls, controls.getCurrentControls(), {
          backButton: !_this.options.forceInitialControls,
          showList: !_this.options.forceInitialControls
        });
        if (_this.options.operationOptionsHook != null) {
          return _this.options.operationOptionsHook(controls.getCurrentControls().operation);
        }
      }
    });
  };

  /*
    Resets everything
  */


  ImglyKit.prototype.reset = function() {
    return this.photoProcessor.reset();
  };

  /*
    Renders the image and returns a data url
  */


  ImglyKit.prototype.renderToDataURL = function(format, options, callback) {
    var _this = this;
    if (options == null) {
      options = {};
    }
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    return this.photoProcessor.renderImage(options, function(err, imageData) {
      var canvas;
      canvas = Utils.newCanvasFromImageData(imageData);
      return callback(null, canvas.toDataURL(format));
    });
  };

  return ImglyKit;

})();

window.ImglyKit = ImglyKit;


},{"./photoprocessor.coffee":4,"./ui/controls/crop.coffee":7,"./ui/ui.coffee":5,"./utils.coffee":6,"__browserify_Buffer":2,"__browserify_process":1}],6:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/utils.coffee",__dirname="/";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Utils;

Utils = {};

Utils.sharedCanvas = document.createElement("canvas");

if (Modernizr.canvas) {
  Utils.sharedContext = Utils.sharedCanvas.getContext("2d");
}

/*
  @param options Options
  @param options.image Dimensions (width, height) of the image
  @param options.container Dimensions (width, height) of the container
  @returns {Object} An object containing the final canvas dimensions (width, height)
*/


Utils.calculateCanvasSize = function(options) {
  var result, scale;
  scale = Math.min(options.container.width / options.image.width, options.container.height / options.image.height);
  result = {
    width: options.image.width * scale,
    height: options.image.height * scale
  };
  return result;
};

/*
  Creates a number as a fingerprint for an array of numbers.

  Based on http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery.

  @param {Array} data
  @returns {Number}
*/


Utils.fingerprint = function(data) {
  var hash, point, _i, _len;
  hash = 0;
  if (!data.length) {
    return hash;
  }
  for (_i = 0, _len = data.length; _i < _len; _i++) {
    point = data[_i];
    hash = ((hash << 5) - hash) + point;
    hash |= 0;
  }
  return hash;
};

/*
  @param {Image} image
  @returns {ImageData}
*/


Utils.getImageDataForImage = function(image) {
  var canvas, context;
  canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

/*
  @param {Image} image
  @param {CanvasRenderingContext2d} context
*/


Utils.resizeImageSmooth = function(image, context) {
  var destHeight, destImageData, destPixels, destWidth, i, resized, resizedBuffer, resizedBufferLength, sourceImageData, sourcePixels, _i;
  sourceImageData = Utils.getImageDataForImage(image);
  destImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  sourcePixels = sourceImageData.data;
  destPixels = destImageData.data;
  destWidth = context.canvas.width;
  destHeight = context.canvas.height;
  resized = new Resize(image.width, image.height, destWidth, destHeight, true, true, false);
  resizedBuffer = resized.resize(sourcePixels);
  resizedBufferLength = resizedBuffer.length;
  for (i = _i = 0; 0 <= resizedBufferLength ? _i < resizedBufferLength : _i > resizedBufferLength; i = 0 <= resizedBufferLength ? ++_i : --_i) {
    destPixels[i] = resizedBuffer[i] & 0xFF;
  }
  return context.putImageData(destImageData, 0, 0);
};

/*
  @param {Image} image
  @param {} dimensions
  @returns {ImageData}
*/


Utils.getResizedImageDataForImage = function(image, dimensions, options) {
  var canvas, context;
  if (options == null) {
    options = {};
  }
  if (options.smooth == null) {
    options.smooth = false;
  }
  canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  context = canvas.getContext("2d");
  if (!options.smooth) {
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
  } else {
    Utils.resizeImageSmooth(image, context);
  }
  return context.getImageData(0, 0, canvas.width, canvas.height);
};

/*
  @param {ImageData} imageData
  @returns {ImageData}
*/


Utils.cloneImageData = function(imageData) {
  var i, newImageData, _i, _ref;
  newImageData = this.sharedContext.createImageData(imageData.width, imageData.height);
  for (i = _i = 0, _ref = imageData.data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    newImageData.data[i] = imageData.data[i];
  }
  return newImageData;
};

/*
  @param {Object} dimensions
  @param {Integer} dimensions.width
  @param {Integer} dimensions.height
  @returns {HTMLCanvasElement}
*/


Utils.newCanvasWithDimensions = function(dimensions) {
  var canvas;
  canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  return canvas;
};

/*
  @param {imageData} imageData
  @returns {HTMLCanvasElement}
*/


Utils.newCanvasFromImageData = function(imageData) {
  var canvas, context;
  canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context = canvas.getContext("2d");
  context.putImageData(imageData, 0, 0);
  return canvas;
};

/*
  @param {String} str Input String
  @returns {String} Output Stirng
*/


Utils.dasherize = function(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/[-_\s]+/g, '-');
};

/*
  @param {Integer} number
  @param {Integer} min
  @param {Integer} max
  @returns {Integer}
*/


Utils.clamp = function(number, min, max) {
  return Math.min(Math.max(number, min), max);
};

/*
  @param {Integer} number
  @param {Integer} min
  @param {Integer} max
  @returns {Integer}
*/


Utils.within = function(number, min, max) {
  return (min < number && number < max);
};

/*
  @param {Object} x/y coordinates
  @param [Object] minimum and maximum x/y coordinates
  @returns {Boolean}
*/


Utils.withinBoundaries = function(coords, boundaries) {
  if (boundaries == null) {
    boundaries = {
      x: {
        min: 0,
        max: 1
      },
      y: {
        min: 0,
        max: 1
      }
    };
  }
  return !(coords.x < boundaries.x.min || coords.x > boundaries.x.max || coords.y < boundaries.y.min || coords.y > boundaries.y.max);
};

/*
  @param {String} string
  @returns {String}
*/


Utils.truncate = function(string, length) {
  if (length == null) {
    length = 10;
  }
  if (string.length > length) {
    return string.substr(0, length - 3) + "...";
  } else {
    return string;
  }
};

module.exports = Utils;


},{"__browserify_Buffer":2,"__browserify_process":1}],4:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/photoprocessor.coffee",__dirname="/";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var IdentityFilter, Perf, PhotoProcessor, Queue, Utils;

Perf = require("./vendor/perf.coffee");

Queue = require("./vendor/queue.coffee");

Utils = require("./utils.coffee");

IdentityFilter = require("./operations/filters/primitives/identity.coffee");

PhotoProcessor = (function() {
  /*
    @param {imglyUtil} app
  */

  function PhotoProcessor(app) {
    this.app = app;
    this.canvas = null;
    this.operationChain = new IdentityFilter;
    this.operationChainNeedsRender = true;
    this.cachedPreviewImageData = null;
    this.previewOperation = null;
    this.rendering = false;
  }

  PhotoProcessor.prototype.setCanvas = function(canvas) {
    this.canvas = canvas;
  };

  PhotoProcessor.prototype.setSourceImage = function(sourceImage) {
    this.sourceImage = sourceImage;
  };

  /*
    @params {ImglyKit.Operations.Operation} operation
  */


  PhotoProcessor.prototype.setPreviewOperation = function(operation) {
    operation.setContext(this.canvas.getContext());
    this.previewOperation = operation;
    if (!operation.renderPreview) {
      return;
    }
    return this.renderPreview();
  };

  PhotoProcessor.prototype.unsetPreviewOperation = function() {
    this.previewOperation = null;
    return this.renderPreview();
  };

  PhotoProcessor.prototype.acceptPreviewOperation = function() {
    if (!this.previewOperation) {
      return;
    }
    this.operationChainNeedsRender = true;
    this.operationChain = this.operationChain.compose(this.previewOperation);
    this.previewOperation = null;
    return this.renderPreview();
  };

  /*
    Render the full size final image
  */


  PhotoProcessor.prototype.renderImage = function(options, callback) {
    var dimensions, height, imageData, p, scale, width, _ref, _ref1;
    p = new Perf("imglyPhotoProcessor#renderFullImage()", {
      debug: this.app.options.debug
    });
    p.start();
    if (!(options.maxSize || options.size)) {
      dimensions = {
        width: this.sourceImage.width,
        height: this.sourceImage.height
      };
      imageData = Utils.getImageDataForImage(this.sourceImage);
    } else if (options.maxSize) {
      _ref = options.maxSize.split("x"), width = _ref[0], height = _ref[1];
      options = {
        image: {
          width: this.sourceImage.width,
          height: this.sourceImage.height
        },
        container: {
          width: width - ImglyKit.canvasContainerPadding * 2,
          height: height - ImglyKit.canvasContainerPadding * 2
        }
      };
      dimensions = Utils.calculateCanvasSize(options);
      imageData = Utils.getResizedImageDataForImage(this.sourceImage, dimensions, {
        smooth: true
      });
    } else if (options.size) {
      _ref1 = options.size.split("x"), width = _ref1[0], height = _ref1[1];
      if (width && !height) {
        scale = this.sourceImage.height / this.sourceImage.width;
        height = width * scale;
      } else if (height && !width) {
        scale = this.sourceImage.width / this.sourceImage.height;
        width = height * scale;
      }
      dimensions = {
        width: parseInt(width),
        height: parseInt(height)
      };
      imageData = Utils.getResizedImageDataForImage(this.sourceImage, dimensions, {
        smooth: true
      });
    }
    return this.render(imageData, {
      preview: false
    }, callback);
  };

  /*
    Renders a preview
  */


  PhotoProcessor.prototype.renderPreview = function(callback) {
    return this.render(null, {
      preview: true
    }, callback);
  };

  /*
    Render preview or image
  */


  PhotoProcessor.prototype.render = function(imageData, options, callback) {
    /*
      Make sure we are not rendering multiple previews at a time
    */

    var p,
      _this = this;
    if (this.rendering) {
      return;
    }
    this.rendering = true;
    p = new Perf("imglyPhotoProcessor#render({ preview: " + options.preview + " })", {
      debug: this.app.options.debug
    });
    p.start();
    imageData = options.preview ? this.renderOperationChainPreview(imageData) : this.operationChain.apply(imageData);
    return Queue(imageData).then(function(imageData) {
      if (options.preview && _this.operationChainNeedsRender) {
        _this.cachedPreviewImageData = imageData;
        _this.operationChainNeedsRender = false;
      }
      if (_this.previewOperation && options.preview) {
        return _this.previewOperation.apply(imageData);
      } else {
        return imageData;
      }
    }).then(function(imageData) {
      if (options.preview) {
        _this.canvas.renderImageData(imageData);
      }
      if (typeof callback === "function") {
        callback(null, imageData);
      }
      _this.rendering = false;
      p.stop(true);
      return imageData;
    });
  };

  PhotoProcessor.prototype.renderOperationChainPreview = function(imageData) {
    var dimensions, imageDimensions;
    if (!this.operationChainNeedsRender) {
      return Utils.cloneImageData(this.cachedPreviewImageData);
    } else {
      dimensions = this.canvas.getDimensionsForImage(this.sourceImage);
      if (this.resizedPreviewImageData == null) {
        imageDimensions = {
          width: dimensions.width * (window.devicePixelRatio || 1),
          height: dimensions.height * (window.devicePixelRatio || 1)
        };
        this.resizedPreviewImageData = imageData = Utils.getResizedImageDataForImage(this.sourceImage, imageDimensions, {
          smooth: true
        });
      } else {
        imageData = Utils.cloneImageData(this.resizedPreviewImageData);
      }
      return this.operationChain.apply(imageData);
    }
  };

  /*
    Resets all UI elements
  */


  PhotoProcessor.prototype.reset = function() {
    this.operationChain = new IdentityFilter;
    this.previewOperation = null;
    this.rendering = false;
    this.operationChainNeedsRender = true;
    return this.resizedPreviewImageData = null;
  };

  return PhotoProcessor;

})();

module.exports = PhotoProcessor;


},{"./operations/filters/primitives/identity.coffee":10,"./utils.coffee":6,"./vendor/perf.coffee":8,"./vendor/queue.coffee":9,"__browserify_Buffer":2,"__browserify_process":1}],5:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/ui.coffee",__dirname="/ui";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Canvas, Controls, EventEmitter, UI,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controls = require("./controls.coffee");

Canvas = require("./canvas.coffee");

EventEmitter = require("events").EventEmitter;

UI = (function(_super) {
  __extends(UI, _super);

  /*
    @param {imglyUtil} app
  */


  function UI(app) {
    this.app = app;
    this.initialized = false;
  }

  /*
    @returns {ImglyKit.UI.Canvas}
  */


  UI.prototype.getCanvas = function() {
    return this.canvas;
  };

  /*
    @returns ImglyKit.UI.Controls.Base
  */


  UI.prototype.getCurrentControls = function() {
    return this.controls.getCurrentControls();
  };

  /*
    Initializes all UI elements
  */


  UI.prototype.init = function() {
    var _this = this;
    this.controls = new Controls(this.app, this);
    this.controls.on("preview_operation", function(operation) {
      return _this.emit("preview_operation", operation);
    });
    this.controls.on("back", function() {
      return _this.emit("back");
    });
    this.controls.on("done", function() {
      return _this.emit("done");
    });
    this.canvas = new Canvas(this.app, this, {
      height: this.controls.getHeight()
    });
    return this.initialized = true;
  };

  /*
    Resets the controls
  */


  UI.prototype.resetControls = function() {
    return this.controls.reset();
  };

  return UI;

})(EventEmitter);

module.exports = UI;


},{"./canvas.coffee":13,"./controls.coffee":12,"__browserify_Buffer":2,"__browserify_process":1,"events":11}],7:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/crop.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var List, Rect, UIControlsCrop, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

UIControlsCrop = (function(_super) {
  __extends(UIControlsCrop, _super);

  UIControlsCrop.prototype.displayButtons = true;

  UIControlsCrop.prototype.minimumCropSize = 50;

  UIControlsCrop.prototype.singleOperation = true;

  /*
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
  */


  function UIControlsCrop(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsCrop.__super__.constructor.apply(this, arguments);
    this.operationClass = require("../../operations/crop.coffee");
    this.listItems = [
      {
        name: "Custom",
        cssClass: "custom",
        method: "setSize",
        "arguments": ["free"],
        tooltip: "Freeform crop",
        "default": true,
        options: {
          size: "free"
        }
      }, {
        name: "Square",
        cssClass: "square",
        method: "setSize",
        "arguments": ["square"],
        tooltip: "Squared crop",
        options: {
          size: "square"
        }
      }, {
        name: "4:3",
        cssClass: "4-3",
        method: "setSize",
        "arguments": ["4:3"],
        tooltip: "4:3 crop",
        options: {
          size: "4:3"
        }
      }, {
        name: "16:9",
        cssClass: "16-9",
        method: "setSize",
        "arguments": ["16:9"],
        tooltip: "16:9 crop",
        options: {
          size: "16:9"
        }
      }
    ];
  }

  UIControlsCrop.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
    return this.resizeCanvasControls();
  };

  /*
    @param {jQuery.Object} canvasControlsContainer
  */


  UIControlsCrop.prototype.hasCanvasControls = true;

  UIControlsCrop.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var div, position, _i, _j, _len, _len1, _ref, _ref1;
    this.canvasControlsContainer = canvasControlsContainer;
    /*
      Create the dark parts around the cropped area
    */

    this.spotlightDivs = {};
    _ref = ["tl", "tc", "tr", "lc", "rc", "bl", "bc", "br"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      position = _ref[_i];
      div = $("<div>").addClass(ImglyKit.classPrefix + "canvas-cropping-spotlight").addClass(ImglyKit.classPrefix + "canvas-cropping-spotlight-" + position).appendTo(this.canvasControlsContainer);
      this.spotlightDivs[position] = div;
    }
    /*
      Create the center div (cropped area)
    */

    this.centerDiv = $("<div>").addClass(ImglyKit.classPrefix + "canvas-cropping-center").appendTo(this.canvasControlsContainer);
    /*
      Create the knobs the user can use to resize the cropped area
    */

    this.knobs = {};
    _ref1 = ["tl", "tr", "bl", "br"];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      position = _ref1[_j];
      div = $("<div>").addClass(ImglyKit.classPrefix + "canvas-knob").appendTo(this.canvasControlsContainer);
      this.knobs[position] = div;
    }
    this.handleCenterDragging();
    this.handleTopLeftKnob();
    this.handleBottomRightKnob();
    this.handleBottomLeftKnob();
    return this.handleTopRightKnob();
  };

  /*
    Handles the dragging of the upper right knob
  */


  UIControlsCrop.prototype.handleTopRightKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.tr;
    return knob.mousedown(function(e) {
      var canvasRect, initialEnd, initialMousePosition, initialStart, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = _this.operationOptions.start.clone();
      initialEnd = _this.operationOptions.end.clone();
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
        startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.start.copy(startInPixels);
          _this.operationOptions.start.y += diffMousePosition.y;
          _this.operationOptions.start.clamp(new Vector2(startInPixels.x, 1), new Vector2(startInPixels.x, endInPixels.y - 50)).divideByRect(canvasRect);
          _this.operationOptions.end.copy(endInPixels);
          _this.operationOptions.end.x += diffMousePosition.x;
          _this.operationOptions.end.clamp(new Vector2(startInPixels.x + 50, endInPixels.y), new Vector2(canvasRect.width - 1, endInPixels.y)).divideByRect(canvasRect);
        } else {
          endInPixels.x += (diffMousePosition.x - diffMousePosition.y) / 2;
          endInPixels.clamp(startInPixels.x + 50, canvasRect.width - 1);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (endInPixels.y - heightInPixels < 1) {
            heightInPixels = _this.operationOptions.end.y * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.end.x = (startInPixels.x + widthInPixels) / canvasRect.width;
          _this.operationOptions.start.y = (endInPixels.y - heightInPixels) / canvasRect.height;
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the lower left knob
  */


  UIControlsCrop.prototype.handleBottomLeftKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.bl;
    return knob.mousedown(function(e) {
      var canvasRect, initialEnd, initialMousePosition, initialStart, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = _this.operationOptions.start.clone();
      initialEnd = _this.operationOptions.end.clone();
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
        startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.end.copy(endInPixels);
          _this.operationOptions.end.y += diffMousePosition.y;
          _this.operationOptions.end.clamp(new Vector2(endInPixels.x, startInPixels.y + 50), new Vector2(endInPixels.x, canvasRect.height - 1)).divideByRect(canvasRect);
          _this.operationOptions.start.copy(startInPixels);
          _this.operationOptions.start.x += diffMousePosition.x;
          _this.operationOptions.start.clamp(new Vector2(1, 1), new Vector2(endInPixels.x - 50, endInPixels.y - 50)).divideByRect(canvasRect);
        } else {
          startInPixels.x += (diffMousePosition.x - diffMousePosition.y) / 2;
          startInPixels.clamp(1, endInPixels.x - 50);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (startInPixels.y + heightInPixels > canvasRect.height - 1) {
            heightInPixels = (1 - _this.operationOptions.start.y) * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.start.x = (endInPixels.x - widthInPixels) / canvasRect.width;
          _this.operationOptions.end.y = (startInPixels.y + heightInPixels) / canvasRect.height;
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the lower right knob
  */


  UIControlsCrop.prototype.handleBottomRightKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.br;
    return knob.mousedown(function(e) {
      var canvasRect, initialEnd, initialMousePosition, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialEnd = new Vector2().copy(_this.operationOptions.end);
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, height, heightInPixels, startInPixels, width, widthInPixels, _ref;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
        startInPixels = new Vector2().copy(_this.operationOptions.start).multiplyWithRect(canvasRect);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.end.copy(endInPixels).add(diffMousePosition).clamp(new Vector2(startInPixels.x + 50, startInPixels.y + 50), new Vector2(canvasRect.width - 1, canvasRect.height - 1)).divideByRect(canvasRect);
          _ref = _this.app.ui.getCanvas().getImageData(), width = _ref.width, height = _ref.height;
          widthInPixels = endInPixels.x - startInPixels.x;
        } else {
          endInPixels.x += (diffMousePosition.x + diffMousePosition.y) / 2;
          endInPixels.clamp(startInPixels.x + 50, canvasRect.width - 1);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (startInPixels.y + heightInPixels > canvasRect.height - 1) {
            heightInPixels = (1 - _this.operationOptions.start.y) * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.end.copy(_this.operationOptions.start).multiplyWithRect(canvasRect).add(new Vector2(widthInPixels, heightInPixels)).divideByRect(canvasRect);
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the upper left knob
  */


  UIControlsCrop.prototype.handleTopLeftKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.tl;
    return knob.mousedown(function(e) {
      var canvasRect, initialMousePosition, initialStart, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = new Vector2().copy(_this.operationOptions.start);
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.start.copy(initialStart).multiplyWithRect(canvasRect).add(diffMousePosition).divideByRect(canvasRect);
        } else {
          endInPixels = new Vector2().copy(_this.operationOptions.end).multiplyWithRect(canvasRect);
          startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
          startInPixels.x += (diffMousePosition.x + diffMousePosition.y) / 2;
          startInPixels.clamp(1, endInPixels.x - 50);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (endInPixels.y - heightInPixels < 1) {
            heightInPixels = _this.operationOptions.end.y * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.start.copy(_this.operationOptions.end).multiplyWithRect(canvasRect).substract(new Vector2(widthInPixels, heightInPixels)).divideByRect(canvasRect);
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the visible, cropped part
  */


  UIControlsCrop.prototype.handleCenterDragging = function() {
    var _this = this;
    return this.centerDiv.mousedown(function(e) {
      var canvasRect, centerRect, initialEnd, initialMousePosition, initialStart, max, min;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      min = new Vector2(1, 1);
      max = new Vector2(canvasRect.width - _this.centerDiv.width() - 1, canvasRect.height - _this.centerDiv.height() - 1);
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = new Vector2().copy(_this.operationOptions.start);
      initialEnd = new Vector2().copy(_this.operationOptions.end);
      centerRect = new Rect(0, 0, _this.centerDiv.width(), _this.centerDiv.height());
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var currentMousePosition, diffMousePosition;
        currentMousePosition = new Vector2(e.clientX, e.clientY);
        diffMousePosition = new Vector2().copy(currentMousePosition).substract(initialMousePosition);
        _this.operationOptions.start.copy(initialStart).multiplyWithRect(canvasRect).add(diffMousePosition).clamp(min, max).divideByRect(canvasRect);
        _this.operationOptions.end.copy(_this.operationOptions.start).multiplyWithRect(canvasRect).addRect(centerRect).divideByRect(canvasRect);
        return _this.resizeCanvasControls();
      });
    });
  };

  UIControlsCrop.prototype.updateOperationOptions = function() {
    var canvasHeight, canvasWidth;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    this.operation.setStart(this.operationOptions.start.x / canvasWidth, this.operationOptions.start.y / canvasHeight);
    return this.operation.setEnd(this.operationOptions.end.x / canvasWidth, this.operationOptions.end.y / canvasHeight);
  };

  UIControlsCrop.prototype.resizeCanvasControls = function() {
    var $el, bottomHeight, canvasRect, centerHeight, centerWidth, el, leftWidth, rightWidth, scaledEnd, scaledStart, topHeight, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    scaledStart = new Vector2().copy(this.operationOptions.start).multiplyWithRect(canvasRect);
    scaledEnd = new Vector2().copy(this.operationOptions.end).multiplyWithRect(canvasRect);
    /*
      Set fragment widths
    */

    leftWidth = scaledStart.x;
    _ref = ["tl", "lc", "bl"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      $el = this.spotlightDivs[el];
      $el.css({
        width: leftWidth,
        left: 0
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          left: leftWidth
        });
      }
    }
    centerWidth = scaledEnd.x - scaledStart.x;
    _ref1 = ["tc", "bc"];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      el = _ref1[_j];
      $el = this.spotlightDivs[el];
      $el.css({
        width: centerWidth,
        left: leftWidth
      });
    }
    rightWidth = canvasRect.width - centerWidth - leftWidth;
    _ref2 = ["tr", "rc", "br"];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      el = _ref2[_k];
      $el = this.spotlightDivs[el];
      $el.css({
        width: rightWidth,
        left: leftWidth + centerWidth
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          left: leftWidth + centerWidth
        });
      }
    }
    /*
      Set fragment heights
    */

    topHeight = scaledStart.y;
    _ref3 = ["tl", "tc", "tr"];
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      el = _ref3[_l];
      $el = this.spotlightDivs[el];
      $el.css({
        height: topHeight,
        top: 0
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          top: topHeight
        });
      }
    }
    centerHeight = scaledEnd.y - scaledStart.y;
    _ref4 = ["lc", "rc"];
    for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
      el = _ref4[_m];
      $el = this.spotlightDivs[el];
      $el.css({
        height: centerHeight,
        top: topHeight
      });
    }
    bottomHeight = canvasRect.height - topHeight - centerHeight;
    _ref5 = ["bl", "bc", "br"];
    for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
      el = _ref5[_n];
      $el = this.spotlightDivs[el];
      $el.css({
        height: bottomHeight,
        top: topHeight + centerHeight
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          top: topHeight + centerHeight
        });
      }
    }
    /*
      Set center fragment dimensions and position
    */

    return this.centerDiv.css({
      height: centerHeight,
      width: centerWidth,
      left: leftWidth,
      top: topHeight
    });
  };

  return UIControlsCrop;

})(List);

module.exports = UIControlsCrop;


},{"../../math/rect.coffee":16,"../../math/vector2.coffee":15,"../../operations/crop.coffee":17,"./base/list.coffee":14,"__browserify_Buffer":2,"__browserify_process":1}],8:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/vendor/perf.coffee",__dirname="/vendor";var Perf;

Perf = (function() {
  function Perf(name, options) {
    var _base, _base1, _base2;
    this.name = name;
    this.options = options != null ? options : {};
    if ((_base = this.options).good == null) {
      _base.good = 100;
    }
    if ((_base1 = this.options).bad == null) {
      _base1.bad = 500;
    }
    if ((_base2 = this.options).debug == null) {
      _base2.debug = true;
    }
    this.started = false;
  }

  Perf.prototype.start = function() {
    if (this.started || !this.options.debug) {
      return;
    }
    this.start = +new Date();
    return this.started = true;
  };

  Perf.prototype.stop = function(printLine) {
    var background, color, duration, end, message;
    if (!this.started || !this.options.debug) {
      return;
    }
    end = +new Date();
    duration = end - this.start;
    if (this.name != null) {
      message = this.name + ' took';
    } else {
      message = 'Code execution time:';
    }
    if (typeof window !== "undefined" && window !== null) {
      if (duration < this.options.good) {
        background = 'darkgreen';
        color = 'white';
      } else if (duration > this.options.good && duration < this.options.bad) {
        background = 'orange';
        color = 'black';
      } else {
        background = 'darkred';
        color = 'white';
      }
      console.log('%c perf %c ' + message + ' %c ' + duration.toFixed(2) + 'ms ', 'background: #222; color: #bada55', '', 'background: ' + background + '; color: ' + color);
    } else {
      console.log('[perf] ' + message + ' ' + duration.toFixed(2) + 'ms');
    }
    this.started = false;
    if (printLine && (typeof window !== "undefined" && window !== null)) {
      return console.log('%c perf %c -- END --                                                                          ', 'background: #222; color: #bada55', 'background: #222; color: #ffffff');
    }
  };

  return Perf;

})();

module.exports = Perf;


},{"__browserify_Buffer":2,"__browserify_process":1}],9:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/vendor/queue.coffee",__dirname="/vendor";/*
  Common interface for promises.

  Use jQuery's Deferreds when in browser environment,
  otherwise assume node environment and load kriskowal's q.
*/

var Queue, provider;

provider = typeof window !== "undefined" ? window.jQuery : require("q");

/*
  Creates a thenable value from the given value.

  @param value
  @returns {Promise}
*/


Queue = function() {
  return provider.when.apply(provider, arguments);
};

/*
  Creates a new promise.

  Calls the resolver which takes as arguments three functions `resolve`,
  `reject` and `progress`.

  @param {function} resolver
  @returns {Promise}
*/


Queue.promise = (function() {
  if (typeof window !== "undefined") {
    return function(resolver) {
      var d;
      d = provider.Deferred();
      resolver(d.resolve, d.reject, d.progress);
      return d;
    };
  } else {
    return function() {
      return provider.promise.apply(provider, arguments);
    };
  }
})();

module.exports = Queue;


},{"__browserify_Buffer":2,"__browserify_process":1,"q":18}],11:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/../node_modules/grunt-watchify/node_modules/browserify/node_modules/browser-builtins/builtin/events.js",__dirname="/../node_modules/grunt-watchify/node_modules/browserify/node_modules/browser-builtins/builtin";if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (typeof emitter._events[type] === 'function')
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

},{"__browserify_Buffer":2,"__browserify_process":1}],15:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/math/vector2.coffee",__dirname="/math";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Vector2;

Vector2 = (function() {
  function Vector2(x, y) {
    this.x = x;
    this.y = y;
    if (this.x == null) {
      this.x = 0;
    }
    if (this.y == null) {
      this.y = 0;
    }
  }

  /*
    @param {Integer} x
    @param {Integer} y
  */


  Vector2.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
  };

  /*
    @returns {Vector2} A clone of this vector
  */


  Vector2.prototype.clone = function() {
    return new Vector2(this.x, this.y);
  };

  /*
    @param {ImglyKit.Vector2} The vector we want to copy
  */


  Vector2.prototype.copy = function(other) {
    this.x = other.x;
    this.y = other.y;
    return this;
  };

  /*
    @param {Integer|Vector2} Minimum value
    @param {Integer|Vector2} Maximum value
  */


  Vector2.prototype.clamp = function(minimum, maximum) {
    if (!(minimum instanceof Vector2)) {
      minimum = new Vector2(minimum, minimum);
    }
    if (!(maximum instanceof Vector2)) {
      maximum = new Vector2(maximum, maximum);
    }
    this.x = Math.max(minimum.x, Math.min(maximum.x, this.x));
    this.y = Math.max(minimum.y, Math.min(maximum.y, this.y));
    return this;
  };

  /*
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
  */


  Vector2.prototype.multiplyWithRect = function(multiplier) {
    this.x *= multiplier.width;
    this.y *= multiplier.height;
    return this;
  };

  /*
    @param {Integer|Vector2}
  */


  Vector2.prototype.divide = function(divisor) {
    if (divisor instanceof Vector2) {
      this.x /= divisor.x;
      this.y /= divisor.y;
    } else {
      this.x /= divisor;
      this.y /= divisor;
    }
    return this;
  };

  /*
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
  */


  Vector2.prototype.divideByRect = function(divisor) {
    this.x /= divisor.width;
    this.y /= divisor.height;
    return this;
  };

  /*
    @param {Integer|Vector2}
  */


  Vector2.prototype.substract = function(subtrahend) {
    if (subtrahend instanceof Vector2) {
      this.x -= subtrahend.x;
      this.y -= subtrahend.y;
    } else {
      this.x -= subtrahend;
      this.y -= subtrahend;
    }
    return this;
  };

  /*
    @param {Rect} The object to substract
  */


  Vector2.prototype.substractRect = function(subtrahend) {
    this.x -= subtrahend.width;
    this.y -= subtrahend.height;
    return this;
  };

  /*
    @param {Rect} The object to add
  */


  Vector2.prototype.addRect = function(addend) {
    this.x += addend.width;
    this.y += addend.height;
    return this;
  };

  /*
    @param {Integer|Vector2}
  */


  Vector2.prototype.add = function(addend) {
    if (addend instanceof Vector2) {
      this.x += addend.x;
      this.y += addend.y;
    } else {
      this.x += addend;
      this.y += addend;
    }
    return this;
  };

  Vector2.prototype.toString = function() {
    return "Vector2({ x: " + this.x + ", y: " + this.y + " })";
  };

  return Vector2;

})();

module.exports = Vector2;


},{"__browserify_Buffer":2,"__browserify_process":1}],16:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/math/rect.coffee",__dirname="/math";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Rect;

Rect = (function() {
  function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (this.x == null) {
      this.x = 0;
    }
    if (this.y == null) {
      this.y = 0;
    }
    if (this.width == null) {
      this.width = 0;
    }
    if (this.height == null) {
      this.height = 0;
    }
  }

  /*
    @param {Integer} x
    @param {Integer} y
    @param {Integer} width
    @param {Integer} height
  */


  Rect.prototype.set = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  /*
    @param {Integer} x
    @param {Integer} y
  */


  Rect.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
  };

  /*
    @param {Integer} width
    @param {Integer} height
  */


  Rect.prototype.setDimensions = function(width, height) {
    this.width = width;
    this.height = height;
  };

  /*
    @param {ImglyKit.Rect} The vector we want to copy
  */


  Rect.prototype.copy = function(other) {
    this.x = other.x;
    this.y = other.y;
    this.width = other.width;
    this.height = other.height;
    return this;
  };

  Rect.prototype.toString = function() {
    return "Rect({ x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + " })";
  };

  return Rect;

})();

module.exports = Rect;


},{"__browserify_Buffer":2,"__browserify_process":1}],18:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/../node_modules/grunt-watchify/node_modules/browserify/_empty.js",__dirname="/../node_modules/grunt-watchify/node_modules/browserify";
},{"__browserify_Buffer":2,"__browserify_process":1}],12:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls.coffee",__dirname="/ui";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var EventEmitter, Overview, UIControls,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Overview = require("./controls/overview.coffee");

EventEmitter = require("events").EventEmitter;

UIControls = (function(_super) {
  __extends(UIControls, _super);

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function UIControls(app, ui) {
    this.app = app;
    this.ui = ui;
    this.container = this.app.getContainer();
    this.init();
  }

  /*
    @returns {Integer} Height of the controls container
  */


  UIControls.prototype.getHeight = function() {
    return this.controlsContainer.height();
  };

  /*
    @returns {jQuery.Object} The controls container
  */


  UIControls.prototype.getContainer = function() {
    return this.controlsContainer;
  };

  /*
    @returns {ImglyKit.UI.Controls.Base}
  */


  UIControls.prototype.getCurrentControls = function() {
    return this.currentControls;
  };

  /*
    Initializes the container
  */


  UIControls.prototype.init = function() {
    this.controlsContainer = $("<div>").addClass(ImglyKit.classPrefix + "controls-container").appendTo(this.container);
    return this.initOverview();
  };

  /*
    Initialize the overview
  */


  UIControls.prototype.initOverview = function() {
    this.currentControls = this.overview = new Overview(this.app, this.ui, this);
    this.attachEvents(this.currentControls);
    this.overview.init();
    if (this.app.options.initialControls == null) {
      return this.overview.show();
    }
  };

  /*
    Attach select events
  */


  UIControls.prototype.attachEvents = function(controls) {
    var _this = this;
    controls.on("select", function(option) {
      if (option.controls != null) {
        _this.switchToControls(option.controls, controls);
      }
      if (option.operation != null) {
        return _this.emit("preview_operation", new option.operation(_this.app, option.options));
      }
    });
    controls.on("back", function() {
      return _this.emit("back");
    });
    controls.on("done", function() {
      return _this.emit("done");
    });
    return controls.on("renderPreview", function() {
      return _this.app.getPhotoProcessor().renderPreview();
    });
  };

  /*
    Switch to another controls instance
  */


  UIControls.prototype.switchToControls = function(controlsClass, oldControls, options) {
    var canvasControlsContainer, key, value,
      _this = this;
    if (options == null) {
      options = {};
    }
    this.currentControls = new controlsClass(this.app, this.ui, this);
    for (key in options) {
      value = options[key];
      this.currentControls.options[key] = value;
    }
    this.attachEvents(this.currentControls);
    if (this.currentControls.hasCanvasControls) {
      canvasControlsContainer = this.ui.getCanvas().getControlsContainer();
      this.currentControls.setupCanvasControls(canvasControlsContainer);
      canvasControlsContainer.fadeIn("slow");
    }
    this.currentControls.init();
    return oldControls.hide(function() {
      return _this.currentControls.show();
    });
  };

  /*
    Returns to the default view
  */


  UIControls.prototype.reset = function() {
    var _ref,
      _this = this;
    this.overview.reset();
    this.ui.getCanvas().getControlsContainer().hide().html("");
    return (_ref = this.currentControls) != null ? _ref.hide(function() {
      _this.currentControls.remove();
      return _this.overview.show();
    }) : void 0;
  };

  return UIControls;

})(EventEmitter);

module.exports = UIControls;


},{"./controls/overview.coffee":19,"__browserify_Buffer":2,"__browserify_process":1,"events":11}],13:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/canvas.coffee",__dirname="/ui";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var UICanvas, Utils;

Utils = require("../utils.coffee");

UICanvas = (function() {
  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
    @param {Integer} options.height Height of the controls
  
    @todo Get controls height from elsewhere. The options hash
          is probably not a good place for that.
  */

  function UICanvas(app, ui, options) {
    this.app = app;
    this.ui = ui;
    this.options = options;
    this.container = this.app.getContainer();
    this.init();
  }

  /*
    @returns {CanvasRenderingContext2d}
  */


  UICanvas.prototype.getContext = function() {
    return this.context;
  };

  /*
    @returns {ImageData}
  */


  UICanvas.prototype.getImageData = function() {
    return this.context.getImageData(0, 0, this.canvasDom.width, this.canvasDom.height);
  };

  /*
    Initializes the container, creates
    the canvas object
  */


  UICanvas.prototype.init = function() {
    this.canvasContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-container").css({
      height: this.app.getHeight() - this.options.height
    }).appendTo(this.container);
    this.canvas = $("<canvas>").addClass(ImglyKit.classPrefix + "canvas").appendTo(this.canvasContainer);
    this.canvasDom = this.canvas.get(0);
    this.controlsContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-controls-container").appendTo(this.canvasContainer);
    return this.context = this.canvasDom.getContext("2d");
  };

  /*
    Resizes the canvas and renders the given imageData
  
    @param {ImageData} imageData
  */


  UICanvas.prototype.renderImageData = function(imageData) {
    var imageDataCanvas;
    this.resizeAndPositionCanvasToMatch(imageData);
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    this.context.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
    return this.context.drawImage(imageDataCanvas, 0, 0, imageData.width, imageData.height, 0, 0, this.canvasDom.width, this.canvasDom.height);
  };

  /*
    Resizes the canvas and renders the given image
  
    @param {Image} image
  */


  UICanvas.prototype.renderImage = function(image) {
    this.resizeAndPositionCanvasToMatch(image);
    this.context.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
    return this.context.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.canvasDom.width, this.canvasDom.height);
  };

  /*
    Takes an image and returns the new dimensions
    so that it fits into the UI
  
    @param {Image} image
    @returns {Object} dimensions
    @returns {Integer} dimensions.width
    @returns {Integer} dimensions.height
  */


  UICanvas.prototype.getDimensionsForImage = function(image) {
    var options;
    options = {
      image: {
        width: image.width,
        height: image.height
      },
      container: {
        width: this.canvasContainer.width() - ImglyKit.canvasContainerPadding * 2,
        height: this.canvasContainer.height() - ImglyKit.canvasContainerPadding * 2
      }
    };
    return Utils.calculateCanvasSize(options);
  };

  /*
    @returns {jQuery.Object}
  */


  UICanvas.prototype.getControlsContainer = function() {
    return this.controlsContainer;
  };

  /*
    @param {Mixed} object
    @param {Integer} object.height
    @param {Integer} object.width
  */


  UICanvas.prototype.resizeAndPositionCanvasToMatch = function(obj) {
    var newCanvasSize, options;
    options = {
      image: {
        width: obj.width,
        height: obj.height
      },
      container: {
        width: this.canvasContainer.width() - ImglyKit.canvasContainerPadding * 2,
        height: this.canvasContainer.height() - ImglyKit.canvasContainerPadding * 2
      }
    };
    newCanvasSize = Utils.calculateCanvasSize(options);
    this.canvas.css({
      width: newCanvasSize.width,
      height: newCanvasSize.height,
      top: Math.round((this.canvasContainer.height() - newCanvasSize.height) / 2),
      left: Math.round((this.canvasContainer.width() - newCanvasSize.width) / 2)
    });
    this.controlsContainer.css({
      width: newCanvasSize.width,
      height: newCanvasSize.height,
      top: this.canvas.position().top,
      left: this.canvas.position().left
    });
    this.canvasDom.width = newCanvasSize.width * (window.devicePixelRatio || 1);
    return this.canvasDom.height = newCanvasSize.height * (window.devicePixelRatio || 1);
  };

  /*
    Clears the context
  */


  UICanvas.prototype.reset = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this.controlsContainer.html("");
  };

  return UICanvas;

})();

module.exports = UICanvas;


},{"../utils.coffee":6,"__browserify_Buffer":2,"__browserify_process":1}],10:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/identity.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveIdentityFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveIdentityFilter = (function(_super) {
  __extends(PrimitiveIdentityFilter, _super);

  function PrimitiveIdentityFilter() {
    _ref = PrimitiveIdentityFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimitiveIdentityFilter.prototype.apply = function(imageData) {
    return imageData;
  };

  return PrimitiveIdentityFilter;

})(Filter);

module.exports = PrimitiveIdentityFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],17:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/crop.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var CropOperation, Operation, Utils, Vector2,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Vector2 = require("../math/vector2.coffee");

CropOperation = (function(_super) {
  __extends(CropOperation, _super);

  CropOperation.prototype.renderPreview = false;

  function CropOperation(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    this.setRatio = __bind(this.setRatio, this);
    CropOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).start == null) {
      _base.start = new Vector2(0.1, 0.1);
    }
    if ((_base1 = this.options).end == null) {
      _base1.end = new Vector2(0.9, 0.9);
    }
    if ((_base2 = this.options).ratio == null) {
      _base2.ratio = 0;
    }
  }

  CropOperation.prototype.setRatio = function(ratio) {
    this.options.ratio = ratio;
    return this.setSize("custom");
  };

  CropOperation.prototype.setSize = function(size) {
    var h, height, w, width, _ref;
    _ref = this.app.ui.getCanvas().getImageData(), width = _ref.width, height = _ref.height;
    this.options.size = size;
    this.options.start.set(0.1, 0.1);
    this.options.end.set(0.9, 0.9);
    switch (size) {
      case "square":
        this.options.ratio = 1;
        break;
      case "4:3":
        this.options.ratio = 4 / 3;
        break;
      case "16:9":
        this.options.ratio = 16 / 9;
        break;
      case "free":
        this.options.ratio = 0;
    }
    if (this.options.ratio) {
      if (width / height <= this.options.ratio) {
        this.options.start.x = 0.1;
        this.options.end.x = 0.9;
        h = 1 / height * (width / this.options.ratio * 0.8);
        this.options.start.y = (1 - h) / 2;
        this.options.end.y = 1 - this.options.start.y;
      } else {
        this.options.start.y = 0.1;
        this.options.end.y = 0.9;
        w = 1 / width * (this.options.ratio * height * 0.8);
        this.options.start.x = (1 - w) / 2;
        this.options.end.x = 1 - this.options.start.x;
      }
    }
    return this.emit("updateOptions", this.options);
  };

  CropOperation.prototype.setStart = function(x, y) {
    this.options.start.x = x;
    return this.options.start.y = y;
  };

  CropOperation.prototype.setEnd = function(x, y) {
    this.options.end.x = x;
    return this.options.end.y = y;
  };

  CropOperation.prototype.apply = function(imageData) {
    var canvas, context, h, height, w, width, x, y;
    width = imageData.width, height = imageData.height;
    canvas = Utils.newCanvasFromImageData(imageData);
    context = canvas.getContext("2d");
    x = width * this.options.start.x;
    y = height * this.options.start.y;
    w = width * (this.options.end.x - this.options.start.x);
    h = height * (this.options.end.y - this.options.start.y);
    return context.getImageData(x, y, w, h);
  };

  return CropOperation;

})(Operation);

module.exports = CropOperation;


},{"../math/vector2.coffee":15,"../utils.coffee":6,"./operation.coffee":21,"__browserify_Buffer":2,"__browserify_process":1}],14:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/base/list.coffee",__dirname="/ui/controls/base";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Base, UIControlsBaseList, Utils, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require("./base.coffee");

Utils = require("../../../utils.coffee");

UIControlsBaseList = (function(_super) {
  __extends(UIControlsBaseList, _super);

  function UIControlsBaseList() {
    _ref = UIControlsBaseList.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsBaseList.prototype.displayButtons = false;

  UIControlsBaseList.prototype.singleOperation = false;

  UIControlsBaseList.prototype.init = function() {
    var option, _i, _len, _ref1, _results,
      _this = this;
    this.createList();
    if (!this.allowMultipleClick) {
      this.optionSelected = false;
    }
    if (!this.options.showList) {
      this.list.hide();
    }
    /*
      Add the list elements
    */

    _ref1 = this.listItems;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      option = _ref1[_i];
      _results.push((function(option) {
        var cssClass, item;
        if (option.name == null) {
          return $("<li>").addClass(ImglyKit.classPrefix + "controls-item-space").appendTo(_this.list);
        }
        cssClass = option.cssClass || Utils.dasherize(option.name);
        item = $("<li>").addClass(ImglyKit.classPrefix + "controls-item").addClass(ImglyKit.classPrefix + "controls-item-" + cssClass).appendTo(_this.list);
        if (option.pixmap != null) {
          item.attr("style", "background-image: url('" + (_this.app.buildAssetsPath(option.pixmap)) + "'); background-size: 42px;");
        }
        if (option.tooltip != null) {
          item.attr("title", option.tooltip);
        }
        item.click(function(e) {
          if (!_this.allowMultipleClick) {
            if (_this.optionSelected) {
              return;
            }
            _this.optionSelected = true;
          }
          return _this.handleOptionSelect(option, item);
        });
        if (option["default"] != null) {
          return item.click();
        }
      })(option));
    }
    return _results;
  };

  /*
    @param {ImglyKit.Operations.Operation}
  */


  UIControlsBaseList.prototype.setOperation = function(operation) {
    var _this = this;
    this.operation = operation;
    console.log("setOperation");
    this.updateOptions(this.operation.options);
    return this.operation.on("updateOptions", function(o) {
      return _this.updateOptions(o);
    });
  };

  /*
    @params {Object} options
  */


  UIControlsBaseList.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
  };

  /*
    @param {Object} option
    @param {jQuery.Object} item
  */


  UIControlsBaseList.prototype.handleOptionSelect = function(option, item) {
    var activeClass;
    this.setAllItemsInactive();
    activeClass = ImglyKit.classPrefix + "controls-list-item-active";
    item.addClass(activeClass);
    if (this.singleOperation) {
      option.operation = this.operationClass;
    }
    if (!this.singleOperation || (this.singleOperation && !this.sentSelected)) {
      this.emit("select", option);
      this.sentSelected = true;
    }
    if (option.method) {
      this.operation[option.method].apply(this.operation, option["arguments"]);
    }
    if ((this.operation != null) && this.operation.renderPreview) {
      return this.emit("renderPreview");
    }
  };

  /*
    Create controls DOM tree
  */


  UIControlsBaseList.prototype.createList = function() {
    this.wrapper = $("<div>").addClass(ImglyKit.classPrefix + "controls-wrapper").attr("data-control", this.constructor.name).appendTo(this.controls.getContainer());
    this.list = $("<ul>").addClass(ImglyKit.classPrefix + "controls-list").appendTo(this.wrapper);
    if (this.cssClassIdentifier != null) {
      this.list.addClass(ImglyKit.classPrefix + "controls-list-" + this.cssClassIdentifier);
    }
    if (this.displayButtons) {
      this.list.addClass(ImglyKit.classPrefix + "controls-list-with-buttons");
      this.list.css("margin-right", this.controls.getHeight());
      return this.createButtons();
    }
  };

  /*
    Reset active states
  */


  UIControlsBaseList.prototype.reset = function() {
    if (!this.allowMultipleClick) {
      this.optionSelected = false;
    }
    return this.setAllItemsInactive();
  };

  /*
    Sets all list items to inactive state
  */


  UIControlsBaseList.prototype.setAllItemsInactive = function() {
    var activeClass;
    activeClass = ImglyKit.classPrefix + "controls-list-item-active";
    return this.list.find("li").removeClass(activeClass);
  };

  return UIControlsBaseList;

})(Base);

module.exports = UIControlsBaseList;


},{"../../../utils.coffee":6,"./base.coffee":22,"__browserify_Buffer":2,"__browserify_process":1}],19:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/overview.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var List, UIControlsOverview,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

UIControlsOverview = (function(_super) {
  __extends(UIControlsOverview, _super);

  /*
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
  */


  UIControlsOverview.prototype.allowMultipleClick = false;

  function UIControlsOverview(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsOverview.__super__.constructor.apply(this, arguments);
    this.listItems = [
      {
        name: "Filters",
        cssClass: "filters",
        controls: require("./filters.coffee"),
        tooltip: "Filters"
      }, {
        name: "Stickers",
        cssClass: "stickers",
        controls: require("./stickers_control.coffee"),
        tooltip: "Stickers"
      }, {
        name: "Orientation",
        cssClass: "orientation",
        controls: require("./orientation.coffee"),
        tooltip: "Orientation"
      }, {
        name: "Focus",
        cssClass: "focus",
        controls: require("./focus.coffee"),
        tooltip: "Focus"
      }, {
        name: "Crop",
        cssClass: "crop",
        controls: require("./crop.coffee"),
        operation: require("../../operations/crop.coffee"),
        tooltip: "Crop"
      }, {
        name: "Brightness",
        cssClass: "brightness",
        controls: require("./brightness.coffee"),
        operation: require("../../operations/brightness.coffee"),
        tooltip: "Brightness"
      }, {
        name: "Contrast",
        cssClass: "contrast",
        controls: require("./contrast.coffee"),
        operation: require("../../operations/contrast.coffee"),
        tooltip: "Contrast"
      }, {
        name: "Saturation",
        cssClass: "saturation",
        controls: require("./saturation.coffee"),
        operation: require("../../operations/saturation.coffee"),
        tooltip: "Saturation"
      }, {
        name: "Text",
        cssClass: "text",
        controls: require("./text.coffee"),
        operation: require("../../operations/text.coffee"),
        tooltip: "Text"
      }, {
        name: "Frames",
        cssClass: "frames",
        controls: require("./frames.coffee"),
        operation: require("../../operations/frames.coffee"),
        tooltip: "Frames"
      }
    ];
  }

  return UIControlsOverview;

})(List);

module.exports = UIControlsOverview;


},{"../../operations/brightness.coffee":28,"../../operations/contrast.coffee":30,"../../operations/crop.coffee":17,"../../operations/frames.coffee":36,"../../operations/saturation.coffee":32,"../../operations/text.coffee":34,"./base/list.coffee":14,"./brightness.coffee":27,"./contrast.coffee":29,"./crop.coffee":7,"./filters.coffee":23,"./focus.coffee":26,"./frames.coffee":35,"./orientation.coffee":25,"./saturation.coffee":31,"./stickers_control.coffee":24,"./text.coffee":33,"__browserify_Buffer":2,"__browserify_process":1}],21:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/operation.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var EventEmitter, Operation, Queue,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Queue = require("../vendor/queue.coffee");

EventEmitter = require("events").EventEmitter;

Operation = (function(_super) {
  var buildComposition;

  __extends(Operation, _super);

  Operation.prototype.renderPreview = true;

  /*
    @param {ImglyKit} app
    @param {Object} options
  */


  function Operation(app, options) {
    var apply;
    this.app = app;
    this.options = options != null ? options : {};
    apply = this.apply;
    this.apply = function(dataOrPromise) {
      var _this = this;
      return Queue(dataOrPromise).then(function(imageData) {
        return apply.call(_this, imageData);
      });
    };
  }

  /*
    @param {CanvasRenderingContext2d} context
  */


  Operation.prototype.setContext = function(context) {
    this.context = context;
  };

  /*
    @param {Object} options
  */


  Operation.prototype.setOptions = function(options) {
    var key, val;
    for (key in options) {
      val = options[key];
      this.options[key] = val;
    }
    return this.emit("updateOptions", options);
  };

  /*
    This applies this operation to the image in the editor. However, it is not
    responsible for storing the result in any way. It receives imageData and
    returns a modified version. 
    @param {ImageData} imageData
    @param {Function} callback
    @returns {ImageData}
  */


  Operation.prototype.apply = function() {
    throw Error("Abstract: Filter#apply");
  };

  buildComposition = function(direction, filter, args) {
    var composition, self;
    if (args == null) {
      args = [];
    }
    self = this;
    if (filter.prototype instanceof Operation) {
      filter = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(filter, [this.app].concat(__slice.call(args)), function(){});
    }
    composition = direction === "pre" ? function(imageData) {
      return self.apply(filter.apply(imageData || this));
    } : direction === "post" ? function(imageData) {
      return filter.apply(self.apply(imageData || this));
    } : void 0;
    composition.compose = Operation.prototype.compose;
    composition.precompose = Operation.prototype.precompose;
    return composition;
  };

  /*
    @param {Operation} filter
    @returns {Function}
  */


  Operation.prototype.compose = function() {
    var args, filter;
    filter = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return buildComposition.call(this, "post", filter, args);
  };

  /*
    @param {Operation} filter
    @returns {Function}
  */


  Operation.prototype.precompose = function() {
    var args, filter;
    filter = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return buildComposition.call(this, "pre", filter, args);
  };

  return Operation;

})(EventEmitter);

module.exports = Operation;


},{"../vendor/queue.coffee":9,"__browserify_Buffer":2,"__browserify_process":1,"events":11}],20:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/filter.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, Operation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("../operation.coffee");

Filter = (function(_super) {
  __extends(Filter, _super);

  function Filter() {
    _ref = Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Filter.preview = null;

  Filter.displayName = null;

  return Filter;

})(Operation);

module.exports = Filter;


},{"../operation.coffee":21,"__browserify_Buffer":2,"__browserify_process":1}],22:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/base/base.coffee",__dirname="/ui/controls/base";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var EventEmitter, UIControlsBase,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require("events").EventEmitter;

UIControlsBase = (function(_super) {
  __extends(UIControlsBase, _super);

  UIControlsBase.prototype.allowMultipleClick = true;

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function UIControlsBase(app, ui, controls) {
    var _base, _base1;
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    this.domCreated = false;
    if (this.options == null) {
      this.options = {};
    }
    if ((_base = this.options).backButton == null) {
      _base.backButton = true;
    }
    if ((_base1 = this.options).showList == null) {
      _base1.showList = true;
    }
  }

  /*
    @param {imglyUtil.Operations.Operation}
  */


  UIControlsBase.prototype.setOperation = function(operation) {
    this.operation = operation;
  };

  /*
    @param {Object} options
  */


  UIControlsBase.prototype.init = function(options) {};

  /*
    Handle visibility
  */


  UIControlsBase.prototype.show = function(cb) {
    return this.wrapper.fadeIn("fast", cb);
  };

  UIControlsBase.prototype.hide = function(cb) {
    return this.wrapper.fadeOut("fast", cb);
  };

  /*
    Returns to the default view
  */


  UIControlsBase.prototype.reset = function() {};

  /*
    Create "Back" and "Done" buttons
  */


  UIControlsBase.prototype.createButtons = function() {
    var back, done,
      _this = this;
    if (this.buttons == null) {
      this.buttons = {};
    }
    /*
      "Back" Button
    */

    if (this.options.backButton) {
      back = $("<div>").addClass(ImglyKit.classPrefix + "controls-button-back").appendTo(this.wrapper);
      back.click(function() {
        return _this.emit("back");
      });
      this.buttons.back = back;
    }
    /*
      "Done" Button
    */

    done = $("<div>").addClass(ImglyKit.classPrefix + "controls-button-done").appendTo(this.wrapper);
    done.click(function() {
      return _this.emit("done");
    });
    return this.buttons.done = done;
  };

  UIControlsBase.prototype.remove = function() {
    return this.wrapper.remove();
  };

  return UIControlsBase;

})(EventEmitter);

module.exports = UIControlsBase;


},{"__browserify_Buffer":2,"__browserify_process":1,"events":11}],28:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/brightness.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Brightness, BrightnessOperation, Filter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filters/filter.coffee");

Brightness = require("./filters/primitives/brightness.coffee");

BrightnessOperation = (function(_super) {
  __extends(BrightnessOperation, _super);

  /*
    @param {ImglyKit} app
    @param {Object} options
  */


  function BrightnessOperation(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    BrightnessOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).amount == null) {
      _base.amount = 0;
    }
    this.filter = new Brightness({
      brightness: this.options.amount
    });
  }

  BrightnessOperation.prototype.apply = function(imageData) {
    return this.filter.apply(imageData);
  };

  /*
    @param {Integer} brightness
  */


  BrightnessOperation.prototype.setBrightness = function(brightness) {
    this.options.amount = brightness;
    return this.filter.setBrightness(brightness);
  };

  return BrightnessOperation;

})(Filter);

module.exports = BrightnessOperation;


},{"./filters/filter.coffee":20,"./filters/primitives/brightness.coffee":37,"__browserify_Buffer":2,"__browserify_process":1}],30:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/contrast.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Contrast, ContrastOperation, Filter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filters/filter.coffee");

Contrast = require("./filters/primitives/contrast.coffee");

ContrastOperation = (function(_super) {
  __extends(ContrastOperation, _super);

  /*
    @param {ImglyKit} app
    @param {Object} options
  */


  function ContrastOperation(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    ContrastOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).amount == null) {
      _base.amount = 0;
    }
    this.filter = new Contrast(this.app, {
      contrast: this.options.amount
    });
  }

  ContrastOperation.prototype.apply = function(imageData) {
    return this.filter.apply(imageData);
  };

  /*
    @param {Integer} contrast
  */


  ContrastOperation.prototype.setContrast = function(contrast) {
    this.options.amount = contrast;
    return this.filter.setContrast(contrast);
  };

  return ContrastOperation;

})(Filter);

module.exports = ContrastOperation;


},{"./filters/filter.coffee":20,"./filters/primitives/contrast.coffee":38,"__browserify_Buffer":2,"__browserify_process":1}],32:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/saturation.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, Saturation, SaturationOperation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filters/filter.coffee");

Saturation = require("./filters/primitives/saturation.coffee");

SaturationOperation = (function(_super) {
  __extends(SaturationOperation, _super);

  /*
    @param {ImglyKit} app
    @param {Object} options
  */


  function SaturationOperation(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    SaturationOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).amount == null) {
      _base.amount = 0;
    }
    this.filter = new Saturation(this.app, {
      saturation: this.options.amount
    });
  }

  SaturationOperation.prototype.apply = function(imageData) {
    return this.filter.apply(imageData);
  };

  /*
    @param {Integer} saturation
  */


  SaturationOperation.prototype.setSaturation = function(saturation) {
    this.options.amount = saturation;
    return this.filter.setSaturation(saturation);
  };

  return SaturationOperation;

})(Filter);

module.exports = SaturationOperation;


},{"./filters/filter.coffee":20,"./filters/primitives/saturation.coffee":39,"__browserify_Buffer":2,"__browserify_process":1}],34:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/text.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var FontOperation, Operation, Rect, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Vector2 = require("../math/vector2.coffee");

Rect = require("../math/rect.coffee");

FontOperation = (function(_super) {
  __extends(FontOperation, _super);

  FontOperation.prototype.renderPreview = false;

  function FontOperation(app, options) {
    this.app = app;
    this.options = options != null ? options : {};
    FontOperation.__super__.constructor.apply(this, arguments);
    this.options.start = new Vector2(0.2, 0.2);
    this.options.width = 300;
    this.options.font = "Helvetica";
    this.options.text = "Text";
    this.options.color = "rgba(255, 255, 255, 1.0)";
    this.options.backgroundColor = "rgba(0, 0, 0, 0.5)";
    this.options.fontSize = 0.1;
    this.options.lineHeight = 1.1;
    this.options.paddingLeft = 0;
    this.options.paddingTop = 0;
  }

  /*
    @param {String} font
  */


  FontOperation.prototype.setFont = function(font) {
    this.options.font = font;
    return this.emit("updateOptions", this.options);
  };

  FontOperation.prototype.apply = function(imageData) {
    var boundingBoxHeight, boundingBoxWidth, canvas, context, line, lineHeight, lineNum, lineOffset, lineWidth, padding, paddingVector, scaledFontSize, scaledStart, _i, _j, _len, _len1, _ref, _ref1;
    scaledFontSize = this.options.fontSize * imageData.height;
    paddingVector = new Vector2(this.options.paddingLeft, this.options.paddingTop);
    scaledStart = new Vector2().copy(this.options.start).add(paddingVector).multiplyWithRect(imageData);
    canvas = Utils.newCanvasFromImageData(imageData);
    context = canvas.getContext("2d");
    context.font = "normal " + scaledFontSize + "px " + this.options.font;
    context.textBaseline = "hanging";
    lineHeight = this.options.lineHeight;
    boundingBoxWidth = 0;
    boundingBoxHeight = 0;
    _ref = this.options.text.split("\n");
    for (lineNum = _i = 0, _len = _ref.length; _i < _len; lineNum = ++_i) {
      line = _ref[lineNum];
      lineWidth = context.measureText(line).width;
      if (lineWidth > boundingBoxWidth) {
        boundingBoxWidth = lineWidth;
      }
      boundingBoxHeight += scaledFontSize * lineHeight;
    }
    context.fillStyle = this.options.backgroundColor;
    padding = 10;
    context.fillRect(scaledStart.x - padding, scaledStart.y - padding, boundingBoxWidth + padding * 2, boundingBoxHeight + padding);
    context.fillStyle = this.options.color;
    _ref1 = this.options.text.split("\n");
    for (lineNum = _j = 0, _len1 = _ref1.length; _j < _len1; lineNum = ++_j) {
      line = _ref1[lineNum];
      lineOffset = lineNum * scaledFontSize * lineHeight;
      context.fillText(line, scaledStart.x, scaledStart.y + this.options.paddingLeft + lineOffset);
    }
    return context.getImageData(0, 0, imageData.width, imageData.height);
  };

  return FontOperation;

})(Operation);

module.exports = FontOperation;


},{"../math/rect.coffee":16,"../math/vector2.coffee":15,"../utils.coffee":6,"./operation.coffee":21,"__browserify_Buffer":2,"__browserify_process":1}],36:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/frames.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var FramesOperation, Operation, Queue, Rect, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Queue = require("../vendor/queue.coffee");

Vector2 = require("../math/vector2.coffee");

Rect = require("../math/rect.coffee");

FramesOperation = (function(_super) {
  __extends(FramesOperation, _super);

  FramesOperation.prototype.renderPreview = true;

  function FramesOperation(app, options) {
    var _base, _base1;
    this.app = app;
    this.options = options != null ? options : {};
    FramesOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).frame == null) {
      _base.frame = "black";
    }
    if ((_base1 = this.options).scale == null) {
      _base1.scale = 0.1;
    }
  }

  /*
    @param {Integer} frame
    @param {Float} scale
  */


  FramesOperation.prototype.setFrameOptions = function(frame, scale) {
    this.options.frame = frame;
    return this.options.scale = scale;
  };

  /*
    @param {ImageData} imageData
    @returns {ImageData}
  */


  FramesOperation.prototype.apply = function(imageData) {
    var _this = this;
    return Queue.promise(function(resolve, reject) {
      var frameImage;
      frameImage = new Image();
      frameImage.onload = function() {
        return resolve(frameImage);
      };
      return frameImage.src = _this.app.buildAssetsPath("frames/" + _this.options.frame + ".png");
    }).then(function(frameImage) {
      var bottomHeight, canvas, context, frameCanvas, height, i, leftWidth, lowerHeight, maxHeight, originalHeight, originalWidth, repeatCount, rightWidth, scaledMaxHeight, topHeight, upperHeight, width, xRepeatAreaEnd, xRepeatAreaStart, xRepeatMode, yRepeatAreaEnd, yRepeatAreaStart, yRepeatMode, _i, _j, _ref;
      _ref = _this.analyzeFrameImage(frameImage), xRepeatAreaStart = _ref.xRepeatAreaStart, xRepeatAreaEnd = _ref.xRepeatAreaEnd, xRepeatMode = _ref.xRepeatMode, yRepeatAreaStart = _ref.yRepeatAreaStart, yRepeatAreaEnd = _ref.yRepeatAreaEnd, yRepeatMode = _ref.yRepeatMode, frameCanvas = _ref.frameCanvas;
      /*
        Create a canvas and a drawing context out of
        the image data
      */

      canvas = Utils.newCanvasFromImageData(imageData);
      context = canvas.getContext("2d");
      upperHeight = yRepeatAreaStart;
      lowerHeight = frameCanvas.height - yRepeatAreaEnd;
      maxHeight = Math.max(lowerHeight, upperHeight);
      scaledMaxHeight = imageData.height * _this.options.scale;
      leftWidth = Math.round(xRepeatAreaStart * (scaledMaxHeight / maxHeight));
      topHeight = Math.round(scaledMaxHeight * (maxHeight / upperHeight));
      rightWidth = Math.round((frameCanvas.width - xRepeatAreaEnd) * (scaledMaxHeight / maxHeight));
      bottomHeight = Math.round(scaledMaxHeight * (maxHeight / lowerHeight));
      /*
        Draw corners
      */

      context.drawImage(frameCanvas, 0, 0, xRepeatAreaStart, yRepeatAreaStart, 0, 0, leftWidth, topHeight);
      context.drawImage(frameCanvas, xRepeatAreaEnd, 0, frameCanvas.width - xRepeatAreaEnd, yRepeatAreaStart, imageData.width - rightWidth, 0, rightWidth, topHeight);
      context.drawImage(frameCanvas, 0, yRepeatAreaEnd, xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd, 0, imageData.height - bottomHeight, leftWidth, bottomHeight);
      context.drawImage(frameCanvas, xRepeatAreaEnd, yRepeatAreaEnd, frameCanvas.width - xRepeatAreaEnd, frameCanvas.height - yRepeatAreaEnd, imageData.width - rightWidth, imageData.height - bottomHeight, rightWidth, bottomHeight);
      /*
        Draw edges
      */

      if (xRepeatMode === "stretch") {
        context.drawImage(frameCanvas, xRepeatAreaStart, 0, xRepeatAreaEnd - xRepeatAreaStart, yRepeatAreaStart, leftWidth, 0, imageData.width - leftWidth - rightWidth, topHeight);
        context.drawImage(frameCanvas, xRepeatAreaStart, yRepeatAreaEnd, xRepeatAreaEnd - xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd, leftWidth, imageData.height - bottomHeight, imageData.width - leftWidth - rightWidth, bottomHeight);
      } else if (xRepeatMode === "repeat") {
        originalWidth = xRepeatAreaEnd - xRepeatAreaStart;
        originalHeight = yRepeatAreaStart;
        height = topHeight;
        width = Math.round(height * (originalWidth / originalHeight));
        repeatCount = Math.ceil(imageData.width / width);
        for (i = _i = 0; 0 <= repeatCount ? _i < repeatCount : _i > repeatCount; i = 0 <= repeatCount ? ++_i : --_i) {
          context.drawImage(frameCanvas, xRepeatAreaStart, 0, xRepeatAreaEnd - xRepeatAreaStart, yRepeatAreaStart, leftWidth + i * width, 0, width, height);
        }
        originalHeight = frameCanvas.height - yRepeatAreaEnd;
        height = bottomHeight;
        width = Math.round(bottomHeight * (originalWidth / originalHeight));
        for (i = _j = 0; 0 <= repeatCount ? _j < repeatCount : _j > repeatCount; i = 0 <= repeatCount ? ++_j : --_j) {
          context.drawImage(frameCanvas, xRepeatAreaStart, yRepeatAreaEnd, xRepeatAreaEnd - xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd, leftWidth + i * width, imageData.height - bottomHeight, width, height);
        }
      }
      if (yRepeatMode === "stretch") {
        context.drawImage(frameCanvas, 0, yRepeatAreaStart, xRepeatAreaStart, yRepeatAreaEnd - yRepeatAreaStart, 0, topHeight, leftWidth, imageData.height - topHeight - bottomHeight);
        context.drawImage(frameCanvas, xRepeatAreaEnd, yRepeatAreaStart, frameCanvas.width - xRepeatAreaEnd, yRepeatAreaEnd - yRepeatAreaStart, imageData.width - rightWidth, topHeight, rightWidth, imageData.height - topHeight - bottomHeight);
      }
      return context.getImageData(0, 0, imageData.width, imageData.height);
    });
  };

  FramesOperation.prototype.analyzeFrameImage = function(frameImage) {
    var a, b, canvas, context, frameImageData, g, index, r, x, xRepeatAreaEnd, xRepeatAreaStart, xRepeatMode, y, yRepeatAreaEnd, yRepeatAreaStart, yRepeatMode, _i, _j, _ref, _ref1;
    frameImageData = Utils.getImageDataForImage(frameImage);
    xRepeatAreaStart = null;
    xRepeatAreaEnd = null;
    xRepeatMode = null;
    for (x = _i = 0, _ref = frameImageData.width; 0 <= _ref ? _i < _ref : _i > _ref; x = 0 <= _ref ? ++_i : --_i) {
      index = x * 4;
      r = frameImageData.data[index];
      g = frameImageData.data[index + 1];
      b = frameImageData.data[index + 2];
      a = frameImageData.data[index + 3];
      if (r === 255 && g === 255 && b === 255 && a === 255) {
        if (xRepeatAreaStart == null) {
          xRepeatAreaStart = x - 1;
        }
        xRepeatMode = "stretch";
      }
      if (r === 0 && g === 0 && b === 0 && a === 255) {
        if (xRepeatAreaStart == null) {
          xRepeatAreaStart = x - 1;
        }
        xRepeatMode = "repeat";
      }
      if (a !== 255 && (xRepeatAreaStart != null) && (xRepeatAreaEnd == null)) {
        xRepeatAreaEnd = x - 1;
      }
    }
    yRepeatAreaStart = null;
    yRepeatAreaEnd = null;
    yRepeatMode = null;
    for (y = _j = 0, _ref1 = frameImageData.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
      index = (frameImageData.width * y) * 4;
      r = frameImageData.data[index];
      g = frameImageData.data[index + 1];
      b = frameImageData.data[index + 2];
      a = frameImageData.data[index + 3];
      if (r === 255 && g === 255 && b === 255 && a === 255) {
        if (yRepeatAreaStart == null) {
          yRepeatAreaStart = y - 1;
        }
        yRepeatMode = "stretch";
      }
      if (r === 0 && g === 0 && b === 0 && a === 255) {
        if (yRepeatAreaStart == null) {
          yRepeatAreaStart = y - 1;
        }
        yRepeatMode = "repeat";
      }
      if (a !== 255 && (yRepeatAreaStart != null) && (yRepeatAreaEnd == null)) {
        yRepeatAreaEnd = y - 1;
      }
    }
    canvas = Utils.newCanvasWithDimensions({
      width: frameImage.width - 1,
      height: frameImage.height - 1
    });
    context = canvas.getContext("2d");
    context.putImageData(frameImageData, -1, -1);
    return {
      xRepeatAreaStart: xRepeatAreaStart,
      xRepeatAreaEnd: xRepeatAreaEnd,
      xRepeatMode: xRepeatMode,
      yRepeatAreaStart: yRepeatAreaStart,
      yRepeatAreaEnd: yRepeatAreaEnd,
      yRepeatMode: yRepeatMode,
      frameCanvas: canvas
    };
  };

  return FramesOperation;

})(Operation);

module.exports = FramesOperation;


},{"../math/rect.coffee":16,"../math/vector2.coffee":15,"../utils.coffee":6,"../vendor/queue.coffee":9,"./operation.coffee":21,"__browserify_Buffer":2,"__browserify_process":1}],23:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/filters.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var List, UIControlsFilters, Utils, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

Utils = require("../../utils.coffee");

UIControlsFilters = (function(_super) {
  __extends(UIControlsFilters, _super);

  function UIControlsFilters() {
    _ref = UIControlsFilters.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsFilters.prototype.displayButtons = true;

  UIControlsFilters.prototype.cssClassIdentifier = "filters";

  /*
    Initializes the container
  */


  UIControlsFilters.prototype.init = function() {
    var filter, _i, _len, _ref1, _results,
      _this = this;
    this.createList();
    _ref1 = [require("../../operations/filters/default.coffee"), require("../../operations/filters/k1.coffee"), require("../../operations/filters/k2.coffee"), require("../../operations/filters/k6.coffee"), require("../../operations/filters/kdynamic.coffee"), require("../../operations/filters/fridge.coffee"), require("../../operations/filters/breeze.coffee"), require("../../operations/filters/orchid.coffee"), require("../../operations/filters/chest.coffee"), require("../../operations/filters/front.coffee"), require("../../operations/filters/fixie.coffee"), require("../../operations/filters/x400.coffee"), require("../../operations/filters/bw.coffee"), require("../../operations/filters/bwhard.coffee"), require("../../operations/filters/lenin.coffee"), require("../../operations/filters/quozi.coffee"), require("../../operations/filters/pola669.coffee"), require("../../operations/filters/pola.coffee"), require("../../operations/filters/food.coffee"), require("../../operations/filters/glam.coffee"), require("../../operations/filters/celsius.coffee"), require("../../operations/filters/texas.coffee"), require("../../operations/filters/morning.coffee"), require("../../operations/filters/lomo.coffee"), require("../../operations/filters/gobblin.coffee"), require("../../operations/filters/mellow.coffee"), require("../../operations/filters/sunny.coffee"), require("../../operations/filters/a15.coffee"), require("../../operations/filters/semired.coffee")];
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      filter = _ref1[_i];
      _results.push((function(filter) {
        var item, preview;
        item = $("<li>").addClass(ImglyKit.classPrefix + "controls-item").appendTo(_this.list);
        preview = $("<div>").addClass(ImglyKit.classPrefix + "controls-preview-" + Utils.dasherize(filter.displayName)).appendTo(item);
        return item.click(function(e) {
          var activeClass;
          _this.reset();
          activeClass = ImglyKit.classPrefix + "controls-list-item-active";
          item.addClass(activeClass);
          return _this.emit("select", {
            operation: filter
          });
        });
      })(filter));
    }
    return _results;
  };

  return UIControlsFilters;

})(List);

module.exports = UIControlsFilters;


},{"../../operations/filters/a15.coffee":67,"../../operations/filters/breeze.coffee":46,"../../operations/filters/bw.coffee":52,"../../operations/filters/bwhard.coffee":53,"../../operations/filters/celsius.coffee":60,"../../operations/filters/chest.coffee":48,"../../operations/filters/default.coffee":40,"../../operations/filters/fixie.coffee":50,"../../operations/filters/food.coffee":58,"../../operations/filters/fridge.coffee":45,"../../operations/filters/front.coffee":49,"../../operations/filters/glam.coffee":59,"../../operations/filters/gobblin.coffee":64,"../../operations/filters/k1.coffee":41,"../../operations/filters/k2.coffee":42,"../../operations/filters/k6.coffee":43,"../../operations/filters/kdynamic.coffee":44,"../../operations/filters/lenin.coffee":54,"../../operations/filters/lomo.coffee":63,"../../operations/filters/mellow.coffee":65,"../../operations/filters/morning.coffee":62,"../../operations/filters/orchid.coffee":47,"../../operations/filters/pola.coffee":57,"../../operations/filters/pola669.coffee":56,"../../operations/filters/quozi.coffee":55,"../../operations/filters/semired.coffee":68,"../../operations/filters/sunny.coffee":66,"../../operations/filters/texas.coffee":61,"../../operations/filters/x400.coffee":51,"../../utils.coffee":6,"./base/list.coffee":14,"__browserify_Buffer":2,"__browserify_process":1}],24:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/stickers_control.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var List, Rect, UIControlsStickers, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

UIControlsStickers = (function(_super) {
  __extends(UIControlsStickers, _super);

  UIControlsStickers.prototype.singleOperation = true;

  UIControlsStickers.prototype.displayButtons = true;

  UIControlsStickers.prototype.hasCanvasControls = true;

  UIControlsStickers.prototype.cssClassIdentifier = "sticker";

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function UIControlsStickers(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsStickers.__super__.constructor.apply(this, arguments);
    this.operationClass = require("../../operations/draw_image.coffee");
    this.listItems = [
      {
        name: "Nerd glasses",
        cssClass: "sticker-glasses-nerd",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-nerd.png"],
        pixmap: "stickers/sticker-glasses-nerd.png",
        tooltip: "Nerd glasses",
        "default": true
      }, {
        name: "Normal glasses",
        cssClass: "sticker-glasses-normal",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-normal.png"],
        pixmap: "stickers/sticker-glasses-normal.png",
        tooltip: "Normal glasses"
      }, {
        name: "Green shutter glasses",
        cssClass: "sticker-glasses-shutter-green",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-shutter-green.png"],
        pixmap: "stickers/sticker-glasses-shutter-green.png",
        tooltip: "Green shutter glasses"
      }, {
        name: "Yellow shutter glasses",
        cssClass: "sticker-glasses-shutter-yellow",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-shutter-yellow.png"],
        pixmap: "stickers/sticker-glasses-shutter-yellow.png",
        tooltip: "Yellow shutter glasses"
      }, {
        name: "Sunglasses",
        cssClass: "sticker-glasses-sun",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-sun.png"],
        pixmap: "stickers/sticker-glasses-sun.png",
        tooltip: "Sunglasses"
      }, {
        name: "Cap",
        cssClass: "sticker-hat-cap",
        method: "useSticker",
        "arguments": ["stickers/sticker-hat-cap.png"],
        pixmap: "stickers/sticker-hat-cap.png",
        tooltip: "Cap"
      }, {
        name: "Party hat",
        cssClass: "sticker-hat-party",
        method: "useSticker",
        "arguments": ["stickers/sticker-hat-party.png"],
        pixmap: "stickers/sticker-hat-party.png",
        tooltip: "Party hat"
      }, {
        name: "Sheriff's' hat",
        cssClass: "sticker-hat-sheriff",
        method: "useSticker",
        "arguments": ["stickers/sticker-hat-sheriff.png"],
        pixmap: "stickers/sticker-hat-sheriff.png",
        tooltip: "Sheriff's hat'"
      }, {
        name: "Cylinder",
        cssClass: "sticker-hat-cylinder",
        method: "useSticker",
        "arguments": ["stickers/sticker-hat-cylinder.png"],
        pixmap: "stickers/sticker-hat-cylinder.png",
        tooltip: "Cylinder"
      }, {
        name: "Heart",
        cssClass: "sticker-heart",
        method: "useSticker",
        "arguments": ["stickers/sticker-heart.png"],
        pixmap: "stickers/sticker-heart.png",
        tooltip: "Heart"
      }, {
        name: "Mustache 1",
        cssClass: "sticker-mustache1",
        method: "useSticker",
        "arguments": ["stickers/sticker-mustache1.png"],
        pixmap: "stickers/sticker-mustache1.png",
        tooltip: "Mustache 1"
      }, {
        name: "Mustache 2",
        cssClass: "sticker-mustache2",
        method: "useSticker",
        "arguments": ["stickers/sticker-mustache2.png"],
        pixmap: "stickers/sticker-mustache2.png",
        tooltip: "Mustache 2"
      }, {
        name: "Mustache 3",
        cssClass: "sticker-mustache3",
        method: "useSticker",
        "arguments": ["stickers/sticker-mustache3.png"],
        pixmap: "stickers/sticker-mustache3.png",
        tooltip: "Mustache 3"
      }, {
        name: "Long mustache",
        cssClass: "sticker-mustache-long",
        method: "useSticker",
        "arguments": ["stickers/sticker-mustache-long.png"],
        pixmap: "stickers/sticker-mustache-long.png",
        tooltip: "Long mustache"
      }, {
        name: "Pipe",
        cssClass: "sticker-pipe",
        method: "useSticker",
        "arguments": ["stickers/sticker-pipe.png"],
        pixmap: "stickers/sticker-pipe.png",
        tooltip: "Pipe"
      }, {
        name: "Snowflake",
        cssClass: "sticker-snowflake",
        method: "useSticker",
        "arguments": ["stickers/sticker-snowflake.png"],
        pixmap: "stickers/sticker-snowflake.png",
        tooltip: "Snowflake"
      }, {
        name: "Star",
        cssClass: "sticker-star",
        method: "useSticker",
        "arguments": ["stickers/sticker-star.png"],
        pixmap: "stickers/sticker-star.png",
        tooltip: "Star"
      }
    ];
  }

  /*
    @param {jQuery.Object} canvasControlsContainer
  */


  UIControlsStickers.prototype.hasCanvasControls = true;

  UIControlsStickers.prototype.setupCanvasControls = function(canvasControlsContainer) {
    this.canvasControlsContainer = canvasControlsContainer;
    this.stickerContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-sticker-container").appendTo(this.canvasControlsContainer);
    this.crosshair = $("<div>").addClass(ImglyKit.classPrefix + "canvas-crosshair " + ImglyKit.classPrefix + "canvas-sticker-crosshair").appendTo(this.stickerContainer);
    this.resizeKnob = $("<div>").addClass(ImglyKit.classPrefix + "canvas-knob").css({
      left: 120
    }).appendTo(this.stickerContainer);
    this.handleCrosshair();
    return this.handleResizeKnob();
  };

  /*
    Move the sticker around by dragging the crosshair
  */


  UIControlsStickers.prototype.handleCrosshair = function() {
    var canvasRect, maxContainerPosition, minContainerPosition, minimumHeight, minimumWidth,
      _this = this;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    minimumWidth = 0;
    minimumHeight = 0;
    minContainerPosition = new Vector2(0, -20);
    maxContainerPosition = new Vector2(canvasRect.width - minimumWidth, canvasRect.height - minimumHeight);
    return this.crosshair.mousedown(function(e) {
      var currentContainerPosition, currentMousePosition, initialContainerPosition, initialMousePosition;
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      currentMousePosition = new Vector2().copy(initialMousePosition);
      initialContainerPosition = new Vector2(_this.stickerContainer.position().left, _this.stickerContainer.position().top);
      currentContainerPosition = new Vector2().copy(initialContainerPosition);
      $(document).mousemove(function(e) {
        var mousePositionDifference;
        currentMousePosition.set(e.clientX, e.clientY);
        mousePositionDifference = new Vector2().copy(currentMousePosition).substract(initialMousePosition);
        currentContainerPosition.copy(initialContainerPosition).add(mousePositionDifference).clamp(minContainerPosition, maxContainerPosition);
        _this.stickerContainer.css({
          left: currentContainerPosition.x,
          top: currentContainerPosition.y,
          width: _this.operationOptions.stickerImageWidth,
          height: _this.operationOptions.stickerImageHeight
        });
        _this.resizeKnob.css({
          left: _this.operationOptions.scale
        });
        if (_this.stickerContainer.position().left + _this.operationOptions.scale > _this.canvasControlsContainer.width() + 20) {
          _this.operationOptions.scale = _this.canvasControlsContainer.width() - _this.stickerContainer.position().left + 20;
        }
        _this.operationOptions.stickerPosition = new Vector2().copy(currentContainerPosition);
        _this.operationOptions.widthRange = _this.canvasControlsContainer.width();
        _this.operationOptions.heightRange = _this.canvasControlsContainer.height();
        _this.operation.setOptions(_this.operationOptions);
        return _this.emit("renderPreview");
      });
      return $(document).mouseup(function() {
        $(document).off("mousemove");
        return $(document).off("mouseup");
      });
    });
  };

  /*
    Handles the dragging of resize knob
  */


  UIControlsStickers.prototype.handleResizeKnob = function() {
    var canvasRect, maxContainerPosition, minContainerPosition,
      _this = this;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    minContainerPosition = new Vector2(20, 0);
    maxContainerPosition = new Vector2(canvasRect.width, canvasRect.height);
    return this.resizeKnob.mousedown(function(e) {
      var initialContainerPosition, initialKnobPosition, initialMousePosition;
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialKnobPosition = new Vector2(_this.resizeKnob.position().left, _this.resizeKnob.position().top);
      initialContainerPosition = new Vector2(_this.stickerContainer.position().left, _this.stickerContainer.position().top);
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var ajdustedMaxContainerPosition, currentKnobPosition, currentMousePosition, mousePositionDifference;
        currentMousePosition = new Vector2(e.clientX, e.clientY);
        mousePositionDifference = new Vector2().copy(currentMousePosition).substract(initialMousePosition);
        ajdustedMaxContainerPosition = new Vector2().copy(maxContainerPosition).substract(new Vector2(_this.stickerContainer.position().left - 20, 0));
        currentKnobPosition = new Vector2().copy(initialKnobPosition).add(mousePositionDifference).clamp(minContainerPosition, ajdustedMaxContainerPosition);
        _this.resizeKnob.css({
          left: currentKnobPosition.x
        });
        _this.operationOptions.scale = _this.resizeKnob.position().left;
        _this.operation.setOptions(_this.operationOptions);
        return _this.emit("renderPreview");
      });
    });
  };

  return UIControlsStickers;

})(List);

module.exports = UIControlsStickers;


},{"../../math/rect.coffee":16,"../../math/vector2.coffee":15,"../../operations/draw_image.coffee":69,"./base/list.coffee":14,"__browserify_Buffer":2,"__browserify_process":1}],25:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/orientation.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var List, UIControlsOrientation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

UIControlsOrientation = (function(_super) {
  __extends(UIControlsOrientation, _super);

  UIControlsOrientation.prototype.displayButtons = true;

  UIControlsOrientation.prototype.singleOperation = true;

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function UIControlsOrientation(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsOrientation.__super__.constructor.apply(this, arguments);
    this.operationClass = require("../../operations/orientation.coffee");
    this.listItems = [
      {
        name: "Rotate L",
        cssClass: "rotate-l",
        method: "rotateLeft",
        tooltip: "Rotate left"
      }, {
        name: "Rotate R",
        cssClass: "rotate-r",
        method: "rotateRight",
        tooltip: "Rotate right"
      }, {
        name: "Flip V",
        cssClass: "flip-v",
        method: "flipVertically",
        tooltip: "Flip vertically"
      }, {
        name: "Flip H",
        cssClass: "flip-h",
        method: "flipHorizontally",
        tooltip: "Flip horizontally"
      }
    ];
  }

  return UIControlsOrientation;

})(List);

module.exports = UIControlsOrientation;


},{"../../operations/orientation.coffee":70,"./base/list.coffee":14,"__browserify_Buffer":2,"__browserify_process":1}],26:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/focus.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var List, UIControlsFocus, Utils, Vector2, linearOperation, radialOperation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

Utils = require("../../utils.coffee");

Vector2 = require("../../math/vector2.coffee");

radialOperation = require("../../operations/focus/radial.coffee");

linearOperation = require("../../operations/focus/linear.coffee");

UIControlsFocus = (function(_super) {
  __extends(UIControlsFocus, _super);

  UIControlsFocus.prototype.displayButtons = true;

  /*
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
  */


  function UIControlsFocus(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsFocus.__super__.constructor.apply(this, arguments);
    this.listItems = [
      {
        name: "Radial",
        cssClass: "radial",
        operation: radialOperation,
        tooltip: "Radial blur",
        "default": true
      }, {
        name: "Linear",
        cssClass: "linear",
        operation: linearOperation,
        tooltip: "Linear blur"
      }
    ];
  }

  /*
    @params {Object} options
  */


  UIControlsFocus.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
    return this.rerenderCanvas();
  };

  /*
    We call this every time we change the options, e.g.
    when the user drags a knob or a crosshair
  */


  UIControlsFocus.prototype.onOptionsUpdated = function() {
    this.operation.setOptions(this.operationOptions);
    this.rerenderCanvas();
    this.repositionControls();
    return this.emit("renderPreview");
  };

  /*
    @param {jQuery.Object} canvasControlsContainer
  */


  UIControlsFocus.prototype.hasCanvasControls = true;

  UIControlsFocus.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var height, width;
    this.canvasControlsContainer = canvasControlsContainer;
    width = this.canvasControlsContainer.width();
    height = this.canvasControlsContainer.height();
    this.canvas = $("<canvas>").css({
      width: width,
      height: height
    }).appendTo(this.canvasControlsContainer);
    this.canvas = this.canvas.get(0);
    this.canvas.width = $(this.canvas).width();
    this.canvas.height = $(this.canvas).height();
    this.context = this.canvas.getContext("2d");
    if (window.devicePixelRatio > 1) {
      this.canvas.width *= window.devicePixelRatio;
      return this.canvas.height *= window.devicePixelRatio;
    }
  };

  /*
    @param {Object} option
    @param {jQuery.Object} item
  */


  UIControlsFocus.prototype.handleOptionSelect = function(option, item) {
    UIControlsFocus.__super__.handleOptionSelect.apply(this, arguments);
    switch (option.operation) {
      case radialOperation:
        this.setControlsMode("radial");
        break;
      case linearOperation:
        this.setControlsMode("linear");
    }
    return this.onOptionsUpdated();
  };

  /*
    @param {String} mode
  */


  UIControlsFocus.prototype.setControlsMode = function(mode) {
    var i, knob, _i;
    this.controlsMode = mode;
    this.canvasControlsContainer.find("div").remove();
    this.knobs = [];
    for (i = _i = 0; _i <= 1; i = ++_i) {
      knob = $("<div>").addClass(ImglyKit.classPrefix + "canvas-knob");
      knob.appendTo(this.canvasControlsContainer);
      this.knobs.push(knob);
    }
    this.crosshair = $("<div>").addClass(ImglyKit.classPrefix + "canvas-crosshair");
    this.crosshair.appendTo(this.canvasControlsContainer);
    this.handleKnobControl();
    return this.handleCrosshairControl();
  };

  /*
    We call this everytime the user dragged a knob
    or a crosshair to reposition the controls
  */


  UIControlsFocus.prototype.repositionControls = function() {
    var canvasSize, controlPoint1, controlPoint2, diff, i, knob, position, _i;
    canvasSize = {
      width: this.canvasControlsContainer.width(),
      height: this.canvasControlsContainer.height()
    };
    for (i = _i = 0; _i <= 1; i = ++_i) {
      knob = this.knobs[i];
      position = this.operationOptions["controlPoint" + (i + 1) + "Position"];
      knob.css({
        left: canvasSize.width * position.x,
        top: canvasSize.height * position.y
      });
    }
    /*
      Multiply the control points with the canvas
      size to get real pixel information
    */

    controlPoint1 = new Vector2().copy(this.operationOptions.controlPoint1Position).multiplyWithRect(canvasSize);
    controlPoint2 = new Vector2().copy(this.operationOptions.controlPoint2Position).multiplyWithRect(canvasSize);
    diff = new Vector2().copy(controlPoint2).substract(controlPoint1).divide(2);
    return this.crosshair.css({
      left: controlPoint1.x + diff.x,
      top: controlPoint1.y + diff.y
    });
  };

  /*
    Handle dragging of the crosshair
  */


  UIControlsFocus.prototype.handleCrosshairControl = function() {
    var canvasSize,
      _this = this;
    canvasSize = new Vector2(this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    return this.crosshair.mousedown(function(e) {
      var lastPos;
      lastPos = new Vector2(e.clientX, e.clientY);
      $(document).mousemove(function(e) {
        var i, knobPositions, newKnobPositions, normalizedDiff, _i, _j;
        normalizedDiff = new Vector2(e.clientX, e.clientY).substract(lastPos).divide(canvasSize);
        newKnobPositions = {};
        knobPositions = {};
        for (i = _i = 1; _i <= 2; i = ++_i) {
          knobPositions[i] = _this.operationOptions["controlPoint" + i + "Position"];
          newKnobPositions[i] = new Vector2().copy(knobPositions[i]).add(normalizedDiff);
          if (!Utils.withinBoundaries(newKnobPositions[i])) {
            return;
          }
        }
        for (i = _j = 1; _j <= 2; i = ++_j) {
          knobPositions[i].copy(newKnobPositions[i]);
        }
        lastPos.set(e.clientX, e.clientY);
        return _this.onOptionsUpdated();
      });
      return $(document).mouseup(function(e) {
        $(document).off("mousemove");
        return $(document).off("mouseup");
      });
    });
  };

  /*
    Handle dragging of the knobs
  */


  UIControlsFocus.prototype.handleKnobControl = function() {
    var canvasSize, index, knob, _i, _len, _ref, _results,
      _this = this;
    canvasSize = new Vector2(this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    _ref = this.knobs;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      knob = _ref[index];
      _results.push((function(knob, index) {
        return knob.mousedown(function(e) {
          var lastPos;
          lastPos = new Vector2(e.clientX, e.clientY);
          $(document).mousemove(function(e) {
            var currentKnobIndex, currentKnobPosition, newKnobPosition, newOppositeKnobPosition, normalizedDiff, oppositeKnobIndex, oppositeKnobPosition;
            normalizedDiff = new Vector2(e.clientX, e.clientY).substract(lastPos).divide(canvasSize);
            currentKnobIndex = index + 1;
            currentKnobPosition = _this.operationOptions["controlPoint" + currentKnobIndex + "Position"];
            oppositeKnobIndex = index === 0 ? 2 : 1;
            oppositeKnobPosition = _this.operationOptions["controlPoint" + oppositeKnobIndex + "Position"];
            newKnobPosition = new Vector2().copy(currentKnobPosition).add(normalizedDiff);
            newOppositeKnobPosition = new Vector2().copy(oppositeKnobPosition).substract(normalizedDiff);
            if (!(Utils.withinBoundaries(newKnobPosition) && Utils.withinBoundaries(newOppositeKnobPosition))) {
              return;
            }
            currentKnobPosition.copy(newKnobPosition);
            oppositeKnobPosition.copy(newOppositeKnobPosition);
            _this.onOptionsUpdated();
            return lastPos.set(e.clientX, e.clientY);
          });
          return $(document).mouseup(function() {
            $(document).off("mouseup");
            return $(document).off("mousemove");
          });
        });
      })(knob, index));
    }
    return _results;
  };

  /*
    Re-renders the canvas controls
  */


  UIControlsFocus.prototype.rerenderCanvas = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    switch (this.controlsMode) {
      case "radial":
        return this.drawRadialControl();
      case "linear":
        return this.drawLinearControl();
    }
  };

  /*
    Renders the radial indicator for the currently blurred area
  */


  UIControlsFocus.prototype.drawRadialControl = function() {
    var center, circle, circleProperties, controlPoint1, controlPoint2, halfDiff, radius, _i, _len, _results;
    controlPoint1 = new Vector2().copy(this.operationOptions.controlPoint1Position).multiplyWithRect(this.canvas);
    controlPoint2 = new Vector2().copy(this.operationOptions.controlPoint2Position).multiplyWithRect(this.canvas);
    halfDiff = new Vector2().copy(controlPoint2).substract(controlPoint1).divide(2);
    radius = Math.sqrt(Math.pow(halfDiff.x, 2) + Math.pow(halfDiff.y, 2));
    center = new Vector2().copy(controlPoint1).add(halfDiff);
    circleProperties = [["#FFFFFF", 2 * (window.devicePixelRatio || 1), 0], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), 2], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), -1]];
    _results = [];
    for (_i = 0, _len = circleProperties.length; _i < _len; _i++) {
      circle = circleProperties[_i];
      this.context.beginPath();
      this.context.arc(center.x, center.y, radius + circle[2], 0, 2 * Math.PI, false);
      this.context.lineWidth = circle[1];
      this.context.strokeStyle = circle[0];
      this.context.stroke();
      _results.push(this.context.closePath());
    }
    return _results;
  };

  /*
    Renders the line indicators for the currently blurred area
  */


  UIControlsFocus.prototype.drawLinearControl = function() {
    var controlPoint, controlPoint1, controlPoint2, controlPoints, diagonal, diff, line, lines, point, _i, _results;
    controlPoint1 = new Vector2().copy(this.operationOptions.controlPoint1Position).multiplyWithRect(this.canvas);
    controlPoint2 = new Vector2().copy(this.operationOptions.controlPoint2Position).multiplyWithRect(this.canvas);
    controlPoints = [controlPoint1, controlPoint2];
    diff = new Vector2().copy(controlPoint2).substract(controlPoint1);
    diagonal = Math.sqrt(Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2));
    _results = [];
    for (point = _i = 0; _i <= 1; point = ++_i) {
      controlPoint = controlPoints[point];
      lines = [["#FFFFFF", 2 * (window.devicePixelRatio || 1), 0], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), 2], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), -1]];
      _results.push((function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = lines.length; _j < _len; _j++) {
          line = lines[_j];
          this.context.beginPath();
          this.context.moveTo(controlPoint.x + diff.y * diagonal + line[2], controlPoint.y - diff.x * diagonal + line[2]);
          this.context.lineTo(controlPoint.x - diff.y * diagonal + line[2], controlPoint.y + diff.x * diagonal + line[2]);
          this.context.strokeStyle = line[0];
          this.context.lineWidth = line[1];
          this.context.stroke();
          _results1.push(this.context.closePath());
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  return UIControlsFocus;

})(List);

module.exports = UIControlsFocus;


},{"../../math/vector2.coffee":15,"../../operations/focus/linear.coffee":72,"../../operations/focus/radial.coffee":71,"../../utils.coffee":6,"./base/list.coffee":14,"__browserify_Buffer":2,"__browserify_process":1}],27:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/brightness.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Slider, UIControlsBrightness, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Slider = require("./base/slider.coffee");

UIControlsBrightness = (function(_super) {
  __extends(UIControlsBrightness, _super);

  function UIControlsBrightness() {
    _ref = UIControlsBrightness.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsBrightness.prototype.name = "Brightness";

  UIControlsBrightness.prototype.cssClass = "brightness";

  UIControlsBrightness.prototype.valueSetMethod = "setBrightness";

  UIControlsBrightness.prototype.displayButtons = true;

  return UIControlsBrightness;

})(Slider);

module.exports = UIControlsBrightness;


},{"./base/slider.coffee":73,"__browserify_Buffer":2,"__browserify_process":1}],29:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/contrast.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Slider, UIControlsContrast, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Slider = require("./base/slider.coffee");

UIControlsContrast = (function(_super) {
  __extends(UIControlsContrast, _super);

  function UIControlsContrast() {
    _ref = UIControlsContrast.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsContrast.prototype.name = "Contrast";

  UIControlsContrast.prototype.cssClass = "contrast";

  UIControlsContrast.prototype.valueSetMethod = "setContrast";

  UIControlsContrast.prototype.displayButtons = true;

  return UIControlsContrast;

})(Slider);

module.exports = UIControlsContrast;


},{"./base/slider.coffee":73,"__browserify_Buffer":2,"__browserify_process":1}],31:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/saturation.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Slider, UIControlsSaturation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Slider = require("./base/slider.coffee");

UIControlsSaturation = (function(_super) {
  __extends(UIControlsSaturation, _super);

  function UIControlsSaturation() {
    _ref = UIControlsSaturation.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsSaturation.prototype.name = "Saturation";

  UIControlsSaturation.prototype.cssClass = "saturation";

  UIControlsSaturation.prototype.valueSetMethod = "setSaturation";

  UIControlsSaturation.prototype.displayButtons = true;

  return UIControlsSaturation;

})(Slider);

module.exports = UIControlsSaturation;


},{"./base/slider.coffee":73,"__browserify_Buffer":2,"__browserify_process":1}],33:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/text.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var List, Rect, UIControlsText, Vector2,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

UIControlsText = (function(_super) {
  __extends(UIControlsText, _super);

  UIControlsText.prototype.displayButtons = true;

  UIControlsText.prototype.singleOperation = true;

  UIControlsText.prototype.hasCanvasControls = true;

  UIControlsText.prototype.cssClassIdentifier = "text";

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function UIControlsText(app, ui, controls) {
    var additionalFont, _i, _len, _ref;
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    this.autoResizeTextInput = __bind(this.autoResizeTextInput, this);
    this.onFontsizeSmallerClick = __bind(this.onFontsizeSmallerClick, this);
    this.onFontsizeBiggerClick = __bind(this.onFontsizeBiggerClick, this);
    UIControlsText.__super__.constructor.apply(this, arguments);
    this.initialized = false;
    this.fontResizePerClick = 3;
    this.operationClass = require("../../operations/text.coffee");
    this.listItems = [
      {
        name: "Helvetica",
        method: "setFont",
        cssClass: "helvetica",
        "arguments": ["Helvetica"],
        tooltip: "Helvetica",
        "default": true
      }, {
        name: "Lucida Grande",
        method: "setFont",
        cssClass: "lucida-grande",
        "arguments": ["Lucida Grande"],
        tooltip: "Lucida Grande"
      }, {
        name: "Times New Roman",
        method: "setFont",
        cssClass: "times-new-roman",
        "arguments": ["Times New Roman"],
        tooltip: "Times New Roman"
      }
    ];
    if (this.app.options.additionalFonts != null) {
      _ref = this.app.options.additionalFonts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        additionalFont = _ref[_i];
        this.listItems.push({
          name: additionalFont.name,
          method: "setFont",
          cssClass: additionalFont.cssClass,
          "arguments": [additionalFont.name]
        });
      }
    }
  }

  /*
    Create controls DOM tree
  */


  UIControlsText.prototype.createList = function() {
    UIControlsText.__super__.createList.apply(this, arguments);
    /*
      Color control
    */

    this.textColorControl = $("<div>").addClass(ImglyKit.classPrefix + "controls-text-color-button " + ImglyKit.classPrefix + "controls-button-right").appendTo(this.wrapper);
    this.textColorPreview = $("<div>").addClass(ImglyKit.classPrefix + "controls-text-color").appendTo(this.textColorControl);
    /*
      Background color control
    */

    this.backgroundColorControl = $("<div>").addClass(ImglyKit.classPrefix + "controls-background-color-button " + ImglyKit.classPrefix + "controls-button-right").appendTo(this.wrapper);
    this.backgroundColorPreview = $("<div>").addClass(ImglyKit.classPrefix + "controls-background-color").appendTo(this.backgroundColorControl);
    this.list.css("margin-right", this.controls.getHeight() * 3);
    return this.handleColorsControl();
  };

  /*
    Handle the colors control
  */


  UIControlsText.prototype.handleColorsControl = function() {
    var defaultBackgroundColor, defaultForegroundColor,
      _this = this;
    defaultForegroundColor = "rgba(255, 255, 255, 1.0)";
    defaultBackgroundColor = "rgba(0, 0, 0, 0.5)";
    this.textColorControl.spectrum({
      color: defaultForegroundColor,
      showAlpha: true,
      showPalette: true,
      showSelectionPalette: true,
      palette: [],
      showButtons: false,
      localStorageKey: "imgly.palette",
      move: function(color) {
        var colorComponents, rgbaString;
        colorComponents = color.toRgb();
        rgbaString = "rgba(" + colorComponents.r + "," + colorComponents.g + "," + colorComponents.b + "," + colorComponents.a + ")";
        _this.textColorPreview.css({
          backgroundColor: rgbaString
        });
        _this.operationOptions.color = rgbaString;
        return _this.operation.setOptions(_this.operationOptions);
      }
    });
    this.backgroundColorControl.spectrum({
      color: defaultBackgroundColor,
      showAlpha: true,
      showPalette: true,
      showSelectionPalette: true,
      palette: [],
      showButtons: false,
      localStorageKey: "imgly.palette",
      move: function(color) {
        var colorComponents, rgbaString;
        colorComponents = color.toRgb();
        rgbaString = "rgba(" + colorComponents.r + "," + colorComponents.g + "," + colorComponents.b + "," + colorComponents.a + ")";
        _this.backgroundColorPreview.css({
          backgroundColor: rgbaString
        });
        _this.textContainer.css({
          backgroundColor: rgbaString
        });
        _this.operationOptions.backgroundColor = rgbaString;
        return _this.operation.setOptions(_this.operationOptions);
      }
    });
    this.textColorPreview.css({
      backgroundColor: defaultForegroundColor
    });
    this.backgroundColorPreview.css({
      backgroundColor: defaultBackgroundColor
    });
    this.textContainer.css({
      backgroundColor: defaultBackgroundColor
    });
  };

  /*
    @param {jQuery.Object} canvasControlsContainer
  */


  UIControlsText.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var control, _i, _len, _ref,
      _this = this;
    this.canvasControlsContainer = canvasControlsContainer;
    this.textContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-text-container").appendTo(this.canvasControlsContainer);
    this.fontsizeButtonsContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-text-size-container").appendTo(this.textContainer);
    _ref = ["Smaller", "Bigger"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      control = _ref[_i];
      this["fontsize" + control + "Button"] = $("<div>").addClass(ImglyKit.classPrefix + "canvas-text-size-" + control.toLowerCase()).appendTo(this.fontsizeButtonsContainer);
      this["fontsize" + control + "Button"].on("click", this["onFontsize" + control + "Click"]);
    }
    this.crosshair = $("<div>").addClass(ImglyKit.classPrefix + "canvas-crosshair " + ImglyKit.classPrefix + "canvas-text-crosshair").appendTo(this.textContainer);
    this.handleCrosshair();
    this.textInput = $("<textarea>").addClass(ImglyKit.classPrefix + "canvas-text-input").appendTo(this.textContainer).attr({
      placeholder: "Text"
    }).focus();
    this.textInputDummy = $("<div>").addClass(ImglyKit.classPrefix + "canvas-text-input-dummy").appendTo(this.canvasControlsContainer);
    this.textInput.keyup(function(e) {
      _this.operationOptions.text = _this.textInput.val();
      _this.operation.setOptions(_this.operationOptions);
      return _this.autoResizeTextInput();
    });
    return after(100, function() {
      return _this.autoResizeTextInput();
    });
  };

  /*
    Gets called as soon as the user clicks the button
    to increase font size
  */


  UIControlsText.prototype.onFontsizeBiggerClick = function(e) {
    var canvasHeight, newFontSize, resizeFactor;
    canvasHeight = this.canvasControlsContainer.height();
    resizeFactor = this.fontResizePerClick / canvasHeight;
    newFontSize = Math.min(this.operationOptions.fontSize + resizeFactor, 1);
    this.operationOptions.fontSize = newFontSize;
    this.operation.setOptions(this.operationOptions);
    return this.updateCanvasControls();
  };

  /*
    Gets called as soon as the user clicks the button
    to reduce font size
  */


  UIControlsText.prototype.onFontsizeSmallerClick = function(e) {
    var canvasHeight, newFontSize, resizeFactor;
    canvasHeight = this.canvasControlsContainer.height();
    resizeFactor = this.fontResizePerClick / canvasHeight;
    newFontSize = Math.max(this.operationOptions.fontSize - resizeFactor, 0.05);
    this.operationOptions.fontSize = newFontSize;
    this.operation.setOptions(this.operationOptions);
    return this.updateCanvasControls();
  };

  /*
    Update input position
  */


  UIControlsText.prototype.updateCanvasControls = function() {
    var canvasHeight, canvasWidth;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    this.textContainer.css({
      left: this.operationOptions.start.x * canvasWidth,
      top: this.operationOptions.start.y * canvasHeight
    });
    return this.autoResizeTextInput();
  };

  /*
    Move the text input around by dragging the crosshair
  */


  UIControlsText.prototype.handleCrosshair = function() {
    var canvasRect, maxContainerPosition, minContainerPosition, minimumHeight, minimumWidth,
      _this = this;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    minimumWidth = 50;
    minimumHeight = 50;
    minContainerPosition = new Vector2(0, 0);
    maxContainerPosition = new Vector2(canvasRect.width - minimumWidth, canvasRect.height - minimumHeight);
    return this.crosshair.mousedown(function(e) {
      var currentContainerPosition, currentMousePosition, initialContainerPosition, initialMousePosition;
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      currentMousePosition = new Vector2().copy(initialMousePosition);
      initialContainerPosition = new Vector2(_this.textContainer.position().left, _this.textContainer.position().top);
      currentContainerPosition = new Vector2().copy(initialContainerPosition);
      $(document).mousemove(function(e) {
        var mousePositionDifference;
        currentMousePosition.set(e.clientX, e.clientY);
        mousePositionDifference = new Vector2().copy(currentMousePosition).substract(initialMousePosition);
        currentContainerPosition.copy(initialContainerPosition).add(mousePositionDifference).clamp(minContainerPosition, maxContainerPosition);
        _this.textContainer.css({
          left: currentContainerPosition.x,
          top: currentContainerPosition.y
        });
        _this.operationOptions.start = new Vector2().copy(currentContainerPosition).divideByRect(canvasRect);
        _this.operation.setOptions(_this.operationOptions);
        return _this.updateCanvasControls();
      });
      return $(document).mouseup(function() {
        $(document).off("mousemove");
        return $(document).off("mouseup");
      });
    });
  };

  /*
    Automatically resizes the text input
  */


  UIControlsText.prototype.autoResizeTextInput = function() {
    var canvasHeight, canvasWidth, comfortZoneX, comfortZoneY, fontSize, inputWidth, maxHeight, maxWidth, paddingX, paddingY, text;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    inputWidth = this.textInput.width();
    fontSize = parseInt(this.textInput.css("font-size"));
    comfortZoneX = fontSize * 3;
    comfortZoneY = fontSize * 2;
    paddingX = parseInt(this.textInputDummy.css("padding-left")) + parseInt(this.textInputDummy.css("padding-right"));
    paddingY = parseInt(this.textInputDummy.css("padding-top")) + parseInt(this.textInputDummy.css("padding-bottom"));
    this.operationOptions.paddingLeft = (parseInt(this.textInputDummy.css("padding-left")) + parseInt(this.textContainer.css("border-left-width"))) / canvasWidth;
    this.operationOptions.paddingTop = (parseInt(this.textInputDummy.css("padding-top")) + parseInt(this.textContainer.css("border-top-width"))) / canvasHeight;
    maxWidth = canvasWidth - this.operationOptions.start.x * canvasWidth;
    maxHeight = canvasHeight - this.operationOptions.start.y * canvasHeight;
    text = this.textInput.val();
    if (text.match(/\n$/i)) {
      text = text + "&nbsp;";
    }
    text = text.replace(/\n/g, "<br />");
    if (!text) {
      text = "&nbsp;";
    }
    this.textInputDummy.css({
      width: "auto",
      height: "auto"
    }).html(text);
    if (this.textInputDummy.width() >= maxWidth) {
      this.textInputDummy.css({
        width: maxWidth
      });
      comfortZoneX = 0;
    }
    if (this.textInputDummy.height() >= maxHeight) {
      this.textInputDummy.css({
        height: maxHeight
      });
      comfortZoneY = 0;
    }
    return this.textInput.css({
      width: Math.min(this.textInputDummy.width() + comfortZoneX, maxWidth),
      height: Math.min(this.textInputDummy.height() + comfortZoneY, maxHeight)
    });
  };

  /*
    @params {Object} options
  */


  UIControlsText.prototype.updateOptions = function(operationOptions) {
    var canvasHeight;
    this.operationOptions = operationOptions;
    canvasHeight = this.canvasControlsContainer.height();
    $([this.textInput.get(0), this.textInputDummy.get(0)]).css({
      fontSize: this.operationOptions.fontSize * canvasHeight,
      color: this.operationOptions.color,
      fontFamily: this.operationOptions.font,
      lineHeight: this.operationOptions.lineHeight
    });
    return this.updateCanvasControls();
  };

  return UIControlsText;

})(List);

module.exports = UIControlsText;


},{"../../math/rect.coffee":16,"../../math/vector2.coffee":15,"../../operations/text.coffee":34,"./base/list.coffee":14,"__browserify_Buffer":2,"__browserify_process":1}],35:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/frames.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var List, Rect, UIControlsFrames, Utils, Vector2, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

Utils = require("../../utils.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

UIControlsFrames = (function(_super) {
  __extends(UIControlsFrames, _super);

  function UIControlsFrames() {
    _ref = UIControlsFrames.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsFrames.prototype.displayButtons = true;

  UIControlsFrames.prototype.singleOperation = true;

  UIControlsFrames.prototype.init = function() {
    var option, options, _i, _len, _results,
      _this = this;
    this.createList();
    this.operationClass = require("../../operations/frames.coffee");
    options = [
      {
        id: "black",
        name: "Black",
        cssClass: "black",
        method: "setFrameOptions",
        "arguments": ["black", 0.1],
        tooltip: "Black",
        "default": true
      }, {
        id: "blackwood",
        name: "Black Wood",
        cssClass: "black-wood",
        method: "setFrameOptions",
        "arguments": ["blackwood", 0.1],
        tooltip: "Black wood"
      }, {
        id: "dia",
        name: "Dia",
        cssClass: "dia",
        method: "setFrameOptions",
        "arguments": ["dia", 0.1],
        tooltip: "Dia"
      }
    ];
    _results = [];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      option = options[_i];
      _results.push((function(option) {
        var item, preview;
        item = $("<li>").addClass(ImglyKit.classPrefix + "controls-item").appendTo(_this.list);
        preview = $("<div>").addClass(ImglyKit.classPrefix + "controls-frame-preview-" + Utils.dasherize(option.id)).appendTo(item);
        if (option.tooltip != null) {
          preview.attr("title", option.tooltip);
        }
        item.click(function(e) {
          return _this.handleOptionSelect(option, item);
        });
        if (option["default"] != null) {
          return item.click();
        }
      })(option));
    }
    return _results;
  };

  return UIControlsFrames;

})(List);

module.exports = UIControlsFrames;


},{"../../math/rect.coffee":16,"../../math/vector2.coffee":15,"../../operations/frames.coffee":36,"../../utils.coffee":6,"./base/list.coffee":14,"__browserify_Buffer":2,"__browserify_process":1}],69:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/draw_image.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var DrawImageOperation, Operation, Queue, Rect, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Queue = require("../vendor/queue.coffee");

Vector2 = require("../math/vector2.coffee");

Rect = require("../math/rect.coffee");

module.exports = DrawImageOperation = (function(_super) {
  __extends(DrawImageOperation, _super);

  function DrawImageOperation(app, options) {
    this.app = app;
    this.options = options != null ? options : {};
    DrawImageOperation.__super__.constructor.apply(this, arguments);
    this.options.resizeButtonOffset = 20;
    this.options.scale = this.options.resizeButtonOffset + 100;
    this.options.stickerImageWidth = 100;
    this.options.stickerImageHeight = 100;
    this.options.sticker = "stickers/sticker-glasses-nerd.png";
    this.options.widthRange = 570;
    this.options.heightRange = 427;
  }

  /*
    @param {String} sticker
  */


  DrawImageOperation.prototype.useSticker = function(sticker) {
    this.options.sticker = sticker;
    return this.emit("updateOptions", this.options);
  };

  DrawImageOperation.prototype.apply = function(imageData) {
    var _this = this;
    return Queue.promise(function(resolve, reject) {
      var stickerImage;
      stickerImage = new Image();
      stickerImage.onload = function() {
        return resolve(stickerImage);
      };
      return stickerImage.src = _this.app.buildAssetsPath(_this.options.sticker);
    }).then(function(stickerImage) {
      var canvas, context, ratio, scaling;
      ratio = stickerImage.height / stickerImage.width;
      _this.options.stickerImageWidth = _this.options.scale - _this.options.resizeButtonOffset;
      _this.options.stickerImageHeight = (_this.options.scale - _this.options.resizeButtonOffset) * ratio;
      canvas = Utils.newCanvasFromImageData(imageData);
      context = canvas.getContext("2d");
      if (_this.options.stickerPosition == null) {
        _this.options.stickerPosition = new Vector2(canvas.width / 2, canvas.height / 2);
      }
      scaling = canvas.width / _this.options.widthRange;
      context.drawImage(stickerImage, _this.options.stickerPosition.x * scaling, _this.options.stickerPosition.y * scaling, _this.options.stickerImageWidth * scaling, _this.options.stickerImageHeight * scaling);
      return context.getImageData(0, 0, imageData.width, imageData.height);
    });
  };

  return DrawImageOperation;

})(Operation);


},{"../math/rect.coffee":16,"../math/vector2.coffee":15,"../utils.coffee":6,"../vendor/queue.coffee":9,"./operation.coffee":21,"__browserify_Buffer":2,"__browserify_process":1}],70:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/orientation.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Operation, OrientationOperation, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

OrientationOperation = (function(_super) {
  __extends(OrientationOperation, _super);

  /*
    @param {ImglyKit} app
    @param {Object} options
  */


  function OrientationOperation(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    OrientationOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).rotation == null) {
      _base.rotation = 0;
    }
    if ((_base1 = this.options).flipVertically == null) {
      _base1.flipVertically = false;
    }
    if ((_base2 = this.options).flipHorizontally == null) {
      _base2.flipHorizontally = false;
    }
  }

  OrientationOperation.prototype.flipVertically = function() {
    return this.options.flipVertically = !this.options.flipVertically;
  };

  OrientationOperation.prototype.flipHorizontally = function() {
    return this.options.flipHorizontally = !this.options.flipHorizontally;
  };

  OrientationOperation.prototype.rotateRight = function() {
    this.options.rotation += 90;
    if (this.options.rotation === 360) {
      this.options.rotation = 0;
    }
    if (this.options.flipHorizontally !== this.options.flipVertically) {
      this.options.flipHorizontally = !this.options.flipHorizontally;
      return this.options.flipVertically = !this.options.flipVertically;
    }
  };

  OrientationOperation.prototype.rotateLeft = function() {
    this.options.rotation -= 90;
    if (this.options.rotation === -360) {
      this.options.rotation = 0;
    }
    if (this.options.flipHorizontally !== this.options.flipVertically) {
      this.options.flipHorizontally = !this.options.flipHorizontally;
      return this.options.flipVertically = !this.options.flipVertically;
    }
  };

  OrientationOperation.prototype.apply = function(imageData) {
    var canvas, context, flipped, h, rotated, w;
    if (Math.abs(this.options.rotation) === 90 || Math.abs(this.options.rotation) === 270) {
      w = imageData.height;
      h = imageData.width;
    } else {
      w = imageData.width;
      h = imageData.height;
    }
    canvas = Utils.newCanvasWithDimensions({
      width: w,
      height: h
    });
    context = canvas.getContext("2d");
    rotated = false;
    flipped = false;
    if (this.options.rotation !== 0) {
      imageData = this.rotateImageData(context, imageData);
      rotated = true;
    }
    if (this.options.flipHorizontally || this.options.flipVertically) {
      imageData = this.flipImageData(context, imageData);
      flipped = true;
    }
    if (rotated || flipped) {
      return context.getImageData(0, 0, w, h);
    } else {
      return imageData;
    }
  };

  /*
    @param {CanvasRenderingContext2d}
    @param {ImageData}
    @returns {ImageData}
  */


  OrientationOperation.prototype.flipImageData = function(context, imageData) {
    var imageDataCanvas, scaleX, scaleY, translateX, translateY;
    context.save();
    scaleX = 1;
    scaleY = 1;
    translateX = 0;
    translateY = 0;
    if (this.options.flipHorizontally) {
      scaleX = -1;
      translateX = context.canvas.width;
    }
    if (this.options.flipVertically) {
      scaleY = -1;
      translateY = context.canvas.height;
    }
    context.translate(translateX, translateY);
    context.scale(scaleX, scaleY);
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    context.drawImage(imageDataCanvas, 0, 0);
    context.restore();
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  };

  /*
    @param {CanvasRenderingContext2d}
    @param {ImageData}
    @returns {ImageData}
  */


  OrientationOperation.prototype.rotateImageData = function(context, imageData) {
    var imageDataCanvas;
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    context.rotate(this.options.rotation * (Math.PI / 180));
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    context.drawImage(imageDataCanvas, -imageData.width / 2, -imageData.height / 2);
    context.restore();
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  };

  return OrientationOperation;

})(Operation);

module.exports = OrientationOperation;


},{"../utils.coffee":6,"./operation.coffee":21,"__browserify_Buffer":2,"__browserify_process":1}],40:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/default.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var DefaultFilter, IdentityFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

IdentityFilter = require("./primitives/identity.coffee");

DefaultFilter = (function(_super) {
  __extends(DefaultFilter, _super);

  function DefaultFilter() {
    _ref = DefaultFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  DefaultFilter.preview = 'default.png';

  DefaultFilter.displayName = 'Default';

  return DefaultFilter;

})(IdentityFilter);

module.exports = DefaultFilter;


},{"./primitives/identity.coffee":10,"__browserify_Buffer":2,"__browserify_process":1}],41:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/k1.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, K1Filter, Saturation, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Saturation = require("./primitives/saturation.coffee");

K1Filter = (function(_super) {
  __extends(K1Filter, _super);

  function K1Filter() {
    _ref = K1Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  K1Filter.preview = 'k1.png';

  K1Filter.displayName = 'K1';

  K1Filter.prototype.apply = (new ToneCurve(K1Filter.app, {
    rgbControlPoints: [[0, 0], [53 / 255, 32 / 255], [91 / 255, 80 / 255], [176 / 255, 205 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: 0.9
  });

  return K1Filter;

})(Filter);

module.exports = K1Filter;


},{"./filter.coffee":20,"./primitives/saturation.coffee":39,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],42:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/k2.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, K2Filter, SoftColorOverlay, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

SoftColorOverlay = require("./primitives/softcoloroverlay.coffee");

K2Filter = (function(_super) {
  __extends(K2Filter, _super);

  function K2Filter() {
    _ref = K2Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  K2Filter.preview = "k2.png";

  K2Filter.displayName = "K2";

  K2Filter.prototype.apply = (new ToneCurve(K2Filter.app, {
    rgbControlPoints: [[0, 0], [54 / 255, 33 / 255], [77 / 255, 82 / 255], [94 / 255, 103 / 255], [122 / 255, 126 / 255], [177 / 255, 193 / 255], [229 / 255, 232 / 255], [1, 1]]
  })).compose(SoftColorOverlay, {
    r: 40,
    g: 40,
    b: 40
  });

  return K2Filter;

})(Filter);

module.exports = K2Filter;


},{"./filter.coffee":20,"./primitives/softcoloroverlay.coffee":75,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],43:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/k6.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var K6Filter, SaturationFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SaturationFilter = require("./primitives/saturation.coffee");

K6Filter = (function(_super) {
  __extends(K6Filter, _super);

  function K6Filter() {
    _ref = K6Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  K6Filter.preview = "k6.png";

  K6Filter.displayName = "K6";

  K6Filter.prototype.saturation = 0.5;

  return K6Filter;

})(SaturationFilter);

module.exports = K6Filter;


},{"./primitives/saturation.coffee":39,"__browserify_Buffer":2,"__browserify_process":1}],44:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/kdynamic.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, KDynamicFilter, Saturation, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Saturation = require("./primitives/saturation.coffee");

KDynamicFilter = (function(_super) {
  __extends(KDynamicFilter, _super);

  function KDynamicFilter() {
    _ref = KDynamicFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  KDynamicFilter.preview = "kdynamic.png";

  KDynamicFilter.displayName = "KDynamic";

  KDynamicFilter.prototype.apply = (new ToneCurve(KDynamicFilter.app, {
    rgbControlPoints: [[0, 0], [17 / 255, 27 / 255], [46 / 255, 69 / 255], [90 / 255, 112 / 255], [156 / 255, 200 / 255], [203 / 255, 243 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: 0.7
  });

  return KDynamicFilter;

})(Filter);

module.exports = KDynamicFilter;


},{"./filter.coffee":20,"./primitives/saturation.coffee":39,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],45:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/fridge.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var FridgeFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

FridgeFilter = (function(_super) {
  __extends(FridgeFilter, _super);

  function FridgeFilter() {
    _ref = FridgeFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FridgeFilter.preview = "fridge.png";

  FridgeFilter.displayName = "Fridge";

  FridgeFilter.prototype.redControlPoints = [[0, 9 / 255], [21 / 255, 11 / 255], [45 / 255, 24 / 255], [1, 220 / 255]];

  FridgeFilter.prototype.greenControlPoints = [[0, 12 / 255], [21 / 255, 21 / 255], [42 / 255, 42 / 255], [150 / 255, 150 / 255], [170 / 255, 173 / 255], [1, 210 / 255]];

  FridgeFilter.prototype.blueControlPoints = [[0, 28 / 255], [43 / 255, 72 / 255], [128 / 255, 185 / 255], [1, 220 / 255]];

  return FridgeFilter;

})(ToneCurve);

module.exports = FridgeFilter;


},{"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],46:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/breeze.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var BreezeFilter, Desaturation, Filter, ToneCurveFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurveFilter = require("./primitives/tonecurve.coffee");

Desaturation = require("./primitives/desaturation.coffee");

BreezeFilter = (function(_super) {
  __extends(BreezeFilter, _super);

  function BreezeFilter() {
    _ref = BreezeFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BreezeFilter.preview = "breeze.png";

  BreezeFilter.displayName = "Breeze";

  BreezeFilter.prototype.apply = (new Desaturation(BreezeFilter.app, {
    desaturation: 0.5
  })).compose(ToneCurveFilter, {
    redControlPoints: [[0, 0], [170 / 255, 170 / 255], [212 / 255, 219 / 255], [234 / 255, 242 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [170 / 255, 168 / 255], [234 / 255, 231 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [170 / 255, 170 / 255], [212 / 255, 208 / 255], [1, 1]]
  });

  return BreezeFilter;

})(Filter);

module.exports = BreezeFilter;


},{"./filter.coffee":20,"./primitives/desaturation.coffee":76,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],47:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/orchid.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Desaturation, Filter, OrchidFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Desaturation = require("./primitives/desaturation.coffee");

OrchidFilter = (function(_super) {
  __extends(OrchidFilter, _super);

  function OrchidFilter() {
    _ref = OrchidFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OrchidFilter.preview = "orchid.png";

  OrchidFilter.displayName = "Orchid";

  OrchidFilter.prototype.apply = (new ToneCurve(OrchidFilter.app, {
    redControlPoints: [[0, 0], [115 / 255, 130 / 255], [195 / 255, 215 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [148 / 255, 153 / 255], [172 / 255, 215 / 255], [1, 1]],
    blueControlPoints: [[0, 46 / 255], [58 / 255, 75 / 255], [178 / 255, 205 / 255], [1, 1]]
  })).compose(ToneCurve, {
    rgbControlPoints: [[0, 0], [117 / 255, 151 / 255], [189 / 255, 217 / 255], [1, 1]]
  }).compose(Desaturation, {
    desaturation: 0.65
  });

  return OrchidFilter;

})(Filter);

module.exports = OrchidFilter;


},{"./filter.coffee":20,"./primitives/desaturation.coffee":76,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],48:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/chest.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var ChestFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

ChestFilter = (function(_super) {
  __extends(ChestFilter, _super);

  function ChestFilter() {
    _ref = ChestFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ChestFilter.preview = 'chest.png';

  ChestFilter.displayName = 'Chest';

  ChestFilter.prototype.redControlPoints = [[0, 0], [44 / 255, 44 / 255], [124 / 255, 143 / 255], [221 / 255, 204 / 255], [1, 1]];

  ChestFilter.prototype.greenControlPoints = [[0, 0], [130 / 255, 127 / 255], [213 / 255, 199 / 255], [1, 1]];

  ChestFilter.prototype.blueControlPoints = [[0, 0], [51 / 255, 52 / 255], [219 / 255, 204 / 255], [1, 1]];

  return ChestFilter;

})(ToneCurve);

module.exports = ChestFilter;


},{"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],49:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/front.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var FrontFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

FrontFilter = (function(_super) {
  __extends(FrontFilter, _super);

  function FrontFilter() {
    _ref = FrontFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FrontFilter.preview = 'front.png';

  FrontFilter.displayName = 'Front';

  FrontFilter.prototype.redControlPoints = [[0, 65 / 255], [28 / 255, 67 / 255], [67 / 255, 113 / 255], [125 / 255, 183 / 255], [187 / 255, 217 / 255], [1, 229 / 255]];

  FrontFilter.prototype.greenControlPoints = [[0, 52 / 255], [42 / 255, 59 / 255], [104 / 255, 134 / 255], [169 / 255, 209 / 255], [1, 240 / 255]];

  FrontFilter.prototype.blueControlPoints = [[0, 52 / 255], [65 / 255, 68 / 255], [93 / 255, 104 / 255], [150 / 255, 153 / 255], [1, 198 / 255]];

  return FrontFilter;

})(ToneCurve);

module.exports = FrontFilter;


},{"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],50:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/fixie.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var FixieFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

FixieFilter = (function(_super) {
  __extends(FixieFilter, _super);

  function FixieFilter() {
    _ref = FixieFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FixieFilter.preview = 'fixie.png';

  FixieFilter.displayName = 'Fixie';

  FixieFilter.prototype.redControlPoints = [[0, 0], [44 / 255, 28 / 255], [63 / 255, 48 / 255], [128 / 255, 132 / 255], [235 / 255, 248 / 255], [1, 1]];

  FixieFilter.prototype.greenControlPoints = [[0, 0], [20 / 255, 10 / 255], [60 / 255, 45 / 255], [190 / 255, 209 / 255], [211 / 255, 231 / 255], [1, 1]];

  FixieFilter.prototype.blueControlPoints = [[0, 31 / 255], [41 / 255, 62 / 255], [150 / 255, 142 / 255], [234 / 255, 212 / 255], [1, 224 / 255]];

  return FixieFilter;

})(ToneCurve);

module.exports = FixieFilter;


},{"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],51:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/x400.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var X400Filter, x400, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

x400 = require("./primitives/x400.coffee");

X400Filter = (function(_super) {
  __extends(X400Filter, _super);

  function X400Filter() {
    _ref = X400Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  X400Filter.preview = 'x400.png';

  X400Filter.displayName = 'X400';

  return X400Filter;

})(x400);

module.exports = X400Filter;


},{"./primitives/x400.coffee":77,"__browserify_Buffer":2,"__browserify_process":1}],52:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/bw.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var BWFilter, Grayscale, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Grayscale = require("./primitives/grayscale.coffee");

BWFilter = (function(_super) {
  __extends(BWFilter, _super);

  function BWFilter() {
    _ref = BWFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BWFilter.preview = 'bw.png';

  BWFilter.displayName = 'B&W';

  return BWFilter;

})(Grayscale);

module.exports = BWFilter;


},{"./primitives/grayscale.coffee":78,"__browserify_Buffer":2,"__browserify_process":1}],53:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/bwhard.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var BWHardFilter, Contrast, Filter, Grayscale, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Grayscale = require("./primitives/grayscale.coffee");

Contrast = require("./primitives/contrast.coffee");

BWHardFilter = (function(_super) {
  __extends(BWHardFilter, _super);

  function BWHardFilter() {
    _ref = BWHardFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BWHardFilter.preview = '1920.png';

  BWHardFilter.displayName = '1920';

  BWHardFilter.prototype.apply = (new Grayscale).compose(Contrast, {
    contrast: 0.5
  });

  return BWHardFilter;

})(Filter);

module.exports = BWHardFilter;


},{"./filter.coffee":20,"./primitives/contrast.coffee":38,"./primitives/grayscale.coffee":78,"__browserify_Buffer":2,"__browserify_process":1}],54:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/lenin.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Desaturation, Filter, LeninFilter, ToneCurveFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurveFilter = require("./primitives/tonecurve.coffee");

Desaturation = require("./primitives/desaturation.coffee");

LeninFilter = (function(_super) {
  __extends(LeninFilter, _super);

  function LeninFilter() {
    _ref = LeninFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  LeninFilter.preview = "lenin.png";

  LeninFilter.displayName = "Lenin";

  LeninFilter.prototype.apply = (new Desaturation(LeninFilter.app, {
    desaturation: 0.4
  })).compose(ToneCurveFilter, {
    redControlPoints: [[0, 20 / 255], [40 / 255, 20 / 255], [106 / 255, 111 / 255], [129 / 255, 153 / 255], [190 / 255, 223 / 255], [1, 1]],
    greenControlPoints: [[0, 20 / 255], [40 / 255, 20 / 255], [62 / 255, 41 / 255], [106 / 255, 108 / 255], [132 / 255, 159 / 255], [203 / 255, 237 / 255], [1, 1]],
    blueControlPoints: [[0, 40 / 255], [40 / 255, 40 / 255], [73 / 255, 60 / 255], [133 / 255, 160 / 255], [191 / 255, 297 / 255], [203 / 255, 237 / 255], [237 / 255, 239 / 255], [1, 1]]
  });

  return LeninFilter;

})(Filter);

module.exports = LeninFilter;


},{"./filter.coffee":20,"./primitives/desaturation.coffee":76,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],55:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/quozi.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Desaturation, Filter, QuoziFilter, ToneCurveFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurveFilter = require("./primitives/tonecurve.coffee");

Desaturation = require("./primitives/desaturation.coffee");

QuoziFilter = (function(_super) {
  __extends(QuoziFilter, _super);

  function QuoziFilter() {
    _ref = QuoziFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  QuoziFilter.preview = "breeze.png";

  QuoziFilter.displayName = "Breeze";

  QuoziFilter.prototype.apply = (new Desaturation(QuoziFilter.app, {
    desaturation: 0.65
  })).compose(ToneCurveFilter, {
    redControlPoints: [[0, 50 / 255], [40 / 255, 78 / 255], [118 / 255, 170 / 255], [181 / 255, 211 / 255], [1, 1]],
    greenControlPoints: [[0, 27 / 255], [28 / 255, 45 / 255], [109 / 255, 157 / 255], [157 / 255, 195 / 255], [179 / 255, 208 / 255], [206 / 255, 212 / 255], [1, 240 / 255]],
    blueControlPoints: [[0, 50 / 255], [12 / 255, 55 / 255], [46 / 255, 103 / 255], [103 / 255, 162 / 255], [194 / 255, 182 / 255], [241 / 255, 201 / 255], [1, 219 / 255]]
  });

  return QuoziFilter;

})(Filter);

module.exports = QuoziFilter;


},{"./filter.coffee":20,"./primitives/desaturation.coffee":76,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],56:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/pola669.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Contrast, Filter, Pola669Filter, Saturation, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Contrast = require("./primitives/contrast.coffee");

Saturation = require("./primitives/saturation.coffee");

Pola669Filter = (function(_super) {
  __extends(Pola669Filter, _super);

  function Pola669Filter() {
    _ref = Pola669Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Pola669Filter.preview = 'pola669.png';

  Pola669Filter.displayName = 'Pola 669';

  Pola669Filter.prototype.apply = (new ToneCurve(Pola669Filter.app, {
    redControlPoints: [[0, 0], [56 / 255, 18 / 255], [196 / 255, 209 / 255], [1, 1]],
    greenControlPoints: [[0, 38 / 255], [71 / 255, 84 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [131 / 255, 133 / 255], [204 / 255, 211 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: -0.2
  }).compose(Contrast, {
    contrast: 0.5
  });

  return Pola669Filter;

})(Filter);

module.exports = Pola669Filter;


},{"./filter.coffee":20,"./primitives/contrast.coffee":38,"./primitives/saturation.coffee":39,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],57:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/pola.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Contrast, Filter, PolaFilter, Saturation, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Contrast = require("./primitives/contrast.coffee");

Saturation = require("./primitives/saturation.coffee");

PolaFilter = (function(_super) {
  __extends(PolaFilter, _super);

  function PolaFilter() {
    _ref = PolaFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PolaFilter.preview = 'pola.png';

  PolaFilter.displayName = 'Pola';

  PolaFilter.prototype.apply = (new ToneCurve(PolaFilter.app, {
    redControlPoints: [[0, 0], [94 / 255, 74 / 255], [181 / 255, 205 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [34 / 255, 34 / 255], [99 / 255, 76 / 255], [176 / 255, 190 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [102 / 255, 73 / 255], [227 / 255, 213 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: -0.2
  }).compose(Contrast, {
    contrast: 0.5
  });

  return PolaFilter;

})(Filter);

module.exports = PolaFilter;


},{"./filter.coffee":20,"./primitives/contrast.coffee":38,"./primitives/saturation.coffee":39,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],58:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/food.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Contrast, Filter, FoodFilter, Saturation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Saturation = require("./primitives/saturation.coffee");

Contrast = require("./primitives/contrast.coffee");

FoodFilter = (function(_super) {
  __extends(FoodFilter, _super);

  function FoodFilter() {
    _ref = FoodFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FoodFilter.preview = 'food.png';

  FoodFilter.displayName = 'Food';

  FoodFilter.prototype.apply = (new Saturation(FoodFilter.app, {
    saturation: 0.35
  })).compose(Contrast, {
    contrast: 0.1
  });

  return FoodFilter;

})(Filter);

module.exports = FoodFilter;


},{"./filter.coffee":20,"./primitives/contrast.coffee":38,"./primitives/saturation.coffee":39,"__browserify_Buffer":2,"__browserify_process":1}],59:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/glam.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Contrast, Filter, GlamFilter, Grayscale, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Grayscale = require("./primitives/grayscale.coffee");

Contrast = require("./primitives/contrast.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

GlamFilter = (function(_super) {
  __extends(GlamFilter, _super);

  function GlamFilter() {
    _ref = GlamFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  GlamFilter.preview = 'glam.png';

  GlamFilter.displayName = 'Glam';

  GlamFilter.prototype.apply = (new Grayscale).compose(Contrast, {
    contrast: 0.1
  }).compose(ToneCurve, {
    redControlPoints: [[0, 0], [94 / 255, 74 / 255], [181 / 255, 205 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [0.5, 0.5], [1, 1]],
    blueControlPoints: [[0, 0], [102 / 255, 73 / 255], [227 / 255, 213 / 255], [1, 1]]
  });

  return GlamFilter;

})(Filter);

module.exports = GlamFilter;


},{"./filter.coffee":20,"./primitives/contrast.coffee":38,"./primitives/grayscale.coffee":78,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],60:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/celsius.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var CelsiusFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

CelsiusFilter = (function(_super) {
  __extends(CelsiusFilter, _super);

  function CelsiusFilter() {
    _ref = CelsiusFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  CelsiusFilter.preview = 'celsius.png';

  CelsiusFilter.displayName = 'Celsius';

  CelsiusFilter.prototype.redControlPoints = [[0, 69 / 255], [55 / 255, 110 / 255], [202 / 255, 230 / 255], [1, 1]];

  CelsiusFilter.prototype.greenControlPoints = [[0, 44 / 255], [89 / 255, 93 / 255], [185 / 255, 141 / 255], [1, 189 / 255]];

  CelsiusFilter.prototype.blueControlPoints = [[0, 76 / 255], [39 / 255, 82 / 255], [218 / 255, 138 / 255], [1, 171 / 255]];

  return CelsiusFilter;

})(ToneCurve);

module.exports = CelsiusFilter;


},{"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],61:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/texas.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var TexasFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

TexasFilter = (function(_super) {
  __extends(TexasFilter, _super);

  function TexasFilter() {
    _ref = TexasFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  TexasFilter.preview = 'texas.png';

  TexasFilter.displayName = 'Texas';

  TexasFilter.prototype.redControlPoints = [[0, 72 / 255], [89 / 255, 99 / 255], [176 / 255, 212 / 255], [1, 237 / 255]];

  TexasFilter.prototype.greenControlPoints = [[0, 49 / 255], [1, 192 / 255]];

  TexasFilter.prototype.blueControlPoints = [[0, 72 / 255], [1, 151 / 255]];

  return TexasFilter;

})(ToneCurve);

module.exports = TexasFilter;


},{"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],62:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/morning.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, Glow, MorningFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Glow = require("./primitives/glow.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

MorningFilter = (function(_super) {
  __extends(MorningFilter, _super);

  function MorningFilter() {
    _ref = MorningFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  MorningFilter.preview = 'morning.png';

  MorningFilter.displayName = 'Morning';

  MorningFilter.prototype.apply = (new ToneCurve(MorningFilter.app, {
    redControlPoints: [[0, 40 / 255], [1, 230 / 255]],
    greenControlPoints: [[0, 10 / 255], [1, 225 / 255]],
    blueControlPoints: [[0, 20 / 255], [1, 181 / 255]]
  })).compose(Glow);

  return MorningFilter;

})(Filter);

module.exports = MorningFilter;


},{"./filter.coffee":20,"./primitives/glow.coffee":79,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],63:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/lomo.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var LomoFilter, ToneCurve, controlPoints, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

controlPoints = [[0, 0], [87 / 255, 20 / 255], [131 / 255, 156 / 255], [183 / 255, 205 / 255], [1, 183 / 208]];

LomoFilter = (function(_super) {
  __extends(LomoFilter, _super);

  function LomoFilter() {
    _ref = LomoFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  LomoFilter.preview = 'lomo.png';

  LomoFilter.displayName = 'Lomo';

  LomoFilter.prototype.redControlPoints = controlPoints;

  LomoFilter.prototype.greenControlPoints = controlPoints;

  LomoFilter.prototype.blueControlPoints = controlPoints;

  return LomoFilter;

})(ToneCurve);

module.exports = LomoFilter;


},{"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],64:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/gobblin.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Gobblin, GobblinFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Gobblin = require("./primitives/gobblin.coffee");

GobblinFilter = (function(_super) {
  __extends(GobblinFilter, _super);

  function GobblinFilter() {
    _ref = GobblinFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  GobblinFilter.preview = 'gobblin.png';

  GobblinFilter.displayName = 'Gobblin';

  return GobblinFilter;

})(Gobblin);

module.exports = GobblinFilter;


},{"./primitives/gobblin.coffee":80,"__browserify_Buffer":2,"__browserify_process":1}],65:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/mellow.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var MellowFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

MellowFilter = (function(_super) {
  __extends(MellowFilter, _super);

  function MellowFilter() {
    _ref = MellowFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  MellowFilter.preview = 'mellow.png';

  MellowFilter.displayName = 'Mellow';

  MellowFilter.prototype.redControlPoints = [[0, 0], [41 / 255, 84 / 255], [87 / 255, 134 / 255], [1, 1]];

  MellowFilter.prototype.greenControlPoints = [[0, 0], [1, 216 / 255]];

  MellowFilter.prototype.blueControlPoints = [[0, 0], [1, 131 / 255]];

  return MellowFilter;

})(ToneCurve);

module.exports = MellowFilter;


},{"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],66:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/sunny.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, SunnyFilter, ToneCurve, contrastPoints, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

contrastPoints = [[0, 0], [55 / 255, 20 / 255], [158 / 255, 191 / 255], [1, 1]];

SunnyFilter = (function(_super) {
  __extends(SunnyFilter, _super);

  function SunnyFilter() {
    _ref = SunnyFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SunnyFilter.preview = 'sunny.png';

  SunnyFilter.displayName = 'Sunny';

  SunnyFilter.prototype.apply = (new ToneCurve(SunnyFilter.app, {
    redControlPoints: [[0, 0], [62 / 255, 82 / 255], [141 / 255, 154 / 255], [1, 1]],
    greenControlPoints: [[0, 39 / 255], [56 / 255, 96 / 255], [192 / 255, 176 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [174 / 255, 99 / 255], [1, 235 / 255]]
  })).compose(ToneCurve, {
    redControlPoints: contrastPoints,
    greenControlPoints: contrastPoints,
    blueControlPoints: contrastPoints
  });

  return SunnyFilter;

})(Filter);

module.exports = SunnyFilter;


},{"./filter.coffee":20,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],67:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/a15.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var A15Filter, Brightness, Contrast, Filter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Contrast = require("./primitives/contrast.coffee");

Brightness = require("./primitives/brightness.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

A15Filter = (function(_super) {
  __extends(A15Filter, _super);

  function A15Filter() {
    _ref = A15Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  A15Filter.preview = '15.png';

  A15Filter.displayName = '15';

  A15Filter.prototype.apply = (new Contrast(A15Filter.app, {
    contrast: -0.37
  })).compose(Brightness, {
    brightness: 0.12
  }).compose(ToneCurve, {
    redControlPoints: [[0, 38 / 255], [94 / 255, 94 / 255], [148 / 255, 142 / 255], [175 / 255, 187 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [77 / 255, 53 / 255], [171 / 255, 190 / 255], [1, 1]],
    blueControlPoints: [[0, 10 / 255], [48 / 255, 85 / 255], [174 / 255, 228 / 255], [1, 1]]
  });

  return A15Filter;

})(Filter);

module.exports = A15Filter;


},{"./filter.coffee":20,"./primitives/brightness.coffee":37,"./primitives/contrast.coffee":38,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],68:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/semired.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, Glow, SemiRedFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Glow = require("./primitives/glow.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

SemiRedFilter = (function(_super) {
  __extends(SemiRedFilter, _super);

  function SemiRedFilter() {
    _ref = SemiRedFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SemiRedFilter.preview = 'semired.png';

  SemiRedFilter.displayName = 'SemiRed';

  SemiRedFilter.prototype.apply = (new ToneCurve(SemiRedFilter.app, {
    redControlPoints: [[0, 129 / 255], [75 / 255, 153 / 255], [181 / 255, 227 / 255], [1, 1]],
    greenControlPoints: [[0, 8 / 255], [111 / 255, 85 / 255], [212 / 255, 158 / 255], [1, 226 / 255]],
    blueControlPoints: [[0, 5 / 255], [75 / 255, 22 / 255], [193 / 255, 90 / 255], [1, 229 / 255]]
  })).compose(Glow);

  return SemiRedFilter;

})(Filter);

module.exports = SemiRedFilter;


},{"./filter.coffee":20,"./primitives/glow.coffee":79,"./primitives/tonecurve.coffee":74,"__browserify_Buffer":2,"__browserify_process":1}],71:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/focus/radial.coffee",__dirname="/operations/focus";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Focus, RadialFocus, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Focus = require("./focus.coffee");

Vector2 = require("../../math/vector2.coffee");

RadialFocus = (function(_super) {
  __extends(RadialFocus, _super);

  /*
    @param {ImglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
  */


  function RadialFocus(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    RadialFocus.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).radius == null) {
      _base.radius = 5;
    }
    if ((_base1 = this.options).controlPoint1Position == null) {
      _base1.controlPoint1Position = new Vector2(0.5, 0.4);
    }
    if ((_base2 = this.options).controlPoint2Position == null) {
      _base2.controlPoint2Position = new Vector2(0.5, 0.6);
    }
  }

  /*
    @param {HTMLCanvasElement} canvas
    @param {CanvasRenderingContext2d} context
  */


  RadialFocus.prototype.drawMask = function(canvas, context) {
    /*
      Multiply the control points with the canvas
      size to get real pixel information
    */

    var center, controlPoint1, controlPoint2, gradient, halfDiff, innerRadius, outerRadius;
    controlPoint1 = new Vector2().copy(this.options.controlPoint1Position).multiplyWithRect(canvas);
    controlPoint2 = new Vector2().copy(this.options.controlPoint2Position).multiplyWithRect(canvas);
    /*
      Calculate the difference between the two points
      and divide it by two
    */

    halfDiff = new Vector2().copy(controlPoint2).substract(controlPoint1).divide(2);
    /*
      The of the circle is the center of the two points
    */

    center = new Vector2().copy(controlPoint1).add(halfDiff);
    innerRadius = Math.sqrt(Math.pow(halfDiff.x, 2) + Math.pow(halfDiff.y, 2));
    outerRadius = innerRadius * 3 / 2;
    /*
      Finally draw the gradient
    */

    gradient = context.createRadialGradient(center.x, center.y, outerRadius, center.x, center.y, innerRadius);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#FFFFFF');
    context.fillStyle = gradient;
    return context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return RadialFocus;

})(Focus);

module.exports = RadialFocus;


},{"../../math/vector2.coffee":15,"./focus.coffee":81,"__browserify_Buffer":2,"__browserify_process":1}],72:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/focus/linear.coffee",__dirname="/operations/focus";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Focus, LinearFocus, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Focus = require("./focus.coffee");

Vector2 = require("../../math/vector2.coffee");

LinearFocus = (function(_super) {
  __extends(LinearFocus, _super);

  /*
    @param {ImglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
  */


  function LinearFocus(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    LinearFocus.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).radius == null) {
      _base.radius = 5;
    }
    if ((_base1 = this.options).controlPoint1Position == null) {
      _base1.controlPoint1Position = new Vector2(0.5, 0.4);
    }
    if ((_base2 = this.options).controlPoint2Position == null) {
      _base2.controlPoint2Position = new Vector2(0.5, 0.6);
    }
  }

  /*
    @param {HTMLCanvasElement} canvas
    @param {CanvasRenderingContext2d} context
  */


  LinearFocus.prototype.drawMask = function(canvas, context) {
    /*
      Multiply the control points with the canvas
      size to get real pixel information
    */

    var controlPoint1, controlPoint2, end, gradient, halfDiff, start;
    controlPoint1 = new Vector2().copy(this.options.controlPoint1Position).multiplyWithRect(canvas);
    controlPoint2 = new Vector2().copy(this.options.controlPoint2Position).multiplyWithRect(canvas);
    /*
      Calculate the difference between the two points
      and divide it by two
    */

    halfDiff = new Vector2().copy(controlPoint2).substract(controlPoint1).divide(2);
    /*
      Calculate start and end of the gradient
      We want the gradient to start 50% before
      and 50% after the control points, so that
      the gradient is outside of our control points
    */

    start = new Vector2().copy(controlPoint1).substract(halfDiff);
    end = new Vector2().copy(controlPoint2).add(halfDiff);
    /*
      Finally draw the gradient
    */

    gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.25, '#FFFFFF');
    gradient.addColorStop(0.75, '#FFFFFF');
    gradient.addColorStop(1, '#000000');
    context.fillStyle = gradient;
    return context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return LinearFocus;

})(Focus);

module.exports = LinearFocus;


},{"../../math/vector2.coffee":15,"./focus.coffee":81,"__browserify_Buffer":2,"__browserify_process":1}],37:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/brightness.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveBrightnessFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveBrightnessFilter = (function(_super) {
  __extends(PrimitiveBrightnessFilter, _super);

  function PrimitiveBrightnessFilter(options) {
    if (options == null) {
      options = {};
    }
    PrimitiveBrightnessFilter.__super__.constructor.apply(this, arguments);
    this.setBrightness(options.brightness);
  }

  PrimitiveBrightnessFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index] = Math.min(imageData.data[index] + this.brightness * 255, 255);
        imageData.data[index + 1] = Math.min(imageData.data[index + 1] + this.brightness * 255, 255);
        imageData.data[index + 2] = Math.min(imageData.data[index + 2] + this.brightness * 255, 255);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  PrimitiveBrightnessFilter.prototype.setBrightness = function(brightness) {
    return this.brightness = typeof brightness === 'number' ? brightness : 0.0;
  };

  return PrimitiveBrightnessFilter;

})(Filter);

module.exports = PrimitiveBrightnessFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],38:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/contrast.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveContrastFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveContrastFilter = (function(_super) {
  __extends(PrimitiveContrastFilter, _super);

  function PrimitiveContrastFilter(app, options) {
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveContrastFilter.__super__.constructor.apply(this, arguments);
    this.setContrast(options.contrast);
  }

  PrimitiveContrastFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        if (this.contrast > 0) {
          imageData.data[index] = (imageData.data[index] - 128) / (1 - this.contrast) + 128;
          imageData.data[index + 1] = (imageData.data[index + 1] - 128) / (1 - this.contrast) + 128;
          imageData.data[index + 2] = (imageData.data[index + 2] - 128) / (1 - this.contrast) + 128;
          imageData.data[index + 3] = 255;
        } else {
          imageData.data[index] = (imageData.data[index] - 128) * (1 + this.contrast) + 128;
          imageData.data[index + 1] = (imageData.data[index + 1] - 128) * (1 + this.contrast) + 128;
          imageData.data[index + 2] = (imageData.data[index + 2] - 128) * (1 + this.contrast) + 128;
          imageData.data[index + 3] = 255;
        }
      }
    }
    return imageData;
  };

  PrimitiveContrastFilter.prototype.setContrast = function(contrast) {
    return this.contrast = typeof contrast === 'number' ? contrast : 1.0;
  };

  return PrimitiveContrastFilter;

})(Filter);

module.exports = PrimitiveContrastFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],39:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/saturation.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveSaturationFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveSaturationFilter = (function(_super) {
  __extends(PrimitiveSaturationFilter, _super);

  function PrimitiveSaturationFilter(app, options) {
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveSaturationFilter.__super__.constructor.apply(this, arguments);
    if (options.saturation != null) {
      this.setSaturation(options.saturation);
    }
  }

  PrimitiveSaturationFilter.prototype.setSaturation = function(saturation) {
    return this.saturation = typeof saturation === 'number' ? saturation + 1 : 1;
  };

  PrimitiveSaturationFilter.prototype.apply = function(imageData) {
    var h, index, luminance, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;
        imageData.data[index] = luminance * (1 - this.saturation) + (imageData.data[index] * this.saturation);
        imageData.data[index + 1] = luminance * (1 - this.saturation) + (imageData.data[index + 1] * this.saturation);
        imageData.data[index + 2] = luminance * (1 - this.saturation) + (imageData.data[index + 2] * this.saturation);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveSaturationFilter;

})(Filter);

module.exports = PrimitiveSaturationFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],73:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/base/slider.coffee",__dirname="/ui/controls/base";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Base, UIControlsBaseSlider, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require("./base.coffee");

UIControlsBaseSlider = (function(_super) {
  __extends(UIControlsBaseSlider, _super);

  function UIControlsBaseSlider() {
    this.onMouseUp = __bind(this.onMouseUp, this);
    this.onMouseMove = __bind(this.onMouseMove, this);
    _ref = UIControlsBaseSlider.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsBaseSlider.prototype.init = function() {
    var spaceForPlusAndMinus, width;
    spaceForPlusAndMinus = 60;
    width = this.controls.getContainer().width();
    width -= this.controls.getHeight() * 2;
    width -= spaceForPlusAndMinus;
    this.wrapper = $("<div>").addClass(ImglyKit.classPrefix + "controls-wrapper").attr("data-control", this.constructor.name).appendTo(this.controls.getContainer());
    this.sliderWrapper = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-wrapper").width(width).appendTo(this.wrapper);
    this.sliderCenterDot = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-dot").appendTo(this.sliderWrapper);
    this.sliderBar = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-bar").appendTo(this.sliderWrapper);
    this.slider = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider").css({
      left: width / 2
    }).appendTo(this.sliderWrapper);
    /*
      Plus / Minus images
    */

    $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-plus").appendTo(this.sliderWrapper);
    $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-minus").appendTo(this.sliderWrapper);
    this.handleSliderControl();
    return this.createButtons();
  };

  /*
    Handles slider dragging
  */


  UIControlsBaseSlider.prototype.handleSliderControl = function() {
    var _this = this;
    this.sliderWidth = this.sliderWrapper.width();
    return this.slider.mousedown(function(e) {
      _this.lastX = e.clientX;
      _this.currentSliderLeft = parseInt(_this.slider.css("left"));
      $(document).mousemove(_this.onMouseMove);
      return $(document).mouseup(_this.onMouseUp);
    });
  };

  /*
    Is called when the slider has been moved
  
    @param {Integer} left
  */


  UIControlsBaseSlider.prototype.setSliderLeft = function(left) {
    var barWidth, normalized;
    this.slider.css({
      left: left
    });
    if (left < this.sliderWidth / 2) {
      barWidth = this.sliderWidth / 2 - left;
      this.sliderBar.css({
        left: left,
        width: barWidth
      });
    } else {
      barWidth = left - this.sliderWidth / 2;
      this.sliderBar.css({
        left: this.sliderWidth / 2,
        width: barWidth
      });
    }
    normalized = (left - this.sliderWidth / 2) / this.sliderWidth * 2;
    this.operation[this.valueSetMethod].apply(this.operation, [normalized]);
    return this.app.getPhotoProcessor().renderPreview();
  };

  /*
    Is called when the slider has been pressed and is being dragged
  
    @param {MouseEvent} e
  */


  UIControlsBaseSlider.prototype.onMouseMove = function(e) {
    var curX, deltaX, sliderLeft;
    curX = e.clientX;
    deltaX = curX - this.lastX;
    sliderLeft = Math.min(Math.max(0, this.currentSliderLeft + deltaX), this.sliderWidth);
    if (sliderLeft < this.sliderWidth && sliderLeft > 0) {
      this.lastX = curX;
      this.currentSliderLeft = sliderLeft;
    }
    return this.setSliderLeft(sliderLeft);
  };

  /*
    Is called when the slider has been pressed and is being dragged
  
    @param {MouseEvent} e
  */


  UIControlsBaseSlider.prototype.onMouseUp = function(e) {
    $(document).off("mouseup", this.onMouseUp);
    return $(document).off("mousemove", this.onMouseMove);
  };

  return UIControlsBaseSlider;

})(Base);

module.exports = UIControlsBaseSlider;


},{"./base.coffee":22,"__browserify_Buffer":2,"__browserify_process":1}],81:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/focus/focus.coffee",__dirname="/operations/focus";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

/*
  Helpers for the Stack Blur
*/

var BlurStack, Focus, Operation, Utils, mul_table, shg_table,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BlurStack = (function() {
  function BlurStack() {}

  BlurStack.r = 0;

  BlurStack.g = 0;

  BlurStack.b = 0;

  BlurStack.a = 0;

  BlurStack.next = null;

  return BlurStack;

})();

mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

Operation = require("../operation.coffee");

Utils = require("../../utils.coffee");

Focus = (function(_super) {
  __extends(Focus, _super);

  Focus.prototype.cache = null;

  Focus.prototype.fingerprint = null;

  /*
    @param {ImglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
  */


  function Focus(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    Focus.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).radius == null) {
      _base.radius = 1;
    }
  }

  Focus.prototype.apply = function(imageData) {
    var alpha, fingerprint, index, maskImageData, _i, _ref;
    fingerprint = Utils.fingerprint(imageData.data);
    if (fingerprint !== this.fingerprint) {
      this.cache = this.blur(Utils.cloneImageData(imageData));
      this.fingerprint = fingerprint;
    }
    maskImageData = this.createMaskImageData(imageData);
    for (index = _i = 0, _ref = imageData.data.length; _i < _ref; index = _i += 4) {
      alpha = maskImageData.data[index] / 255;
      imageData.data[index] = alpha * imageData.data[index] + (1 - alpha) * this.cache.data[index];
      imageData.data[index + 1] = alpha * imageData.data[index + 1] + (1 - alpha) * this.cache.data[index + 1];
      imageData.data[index + 2] = alpha * imageData.data[index + 2] + (1 - alpha) * this.cache.data[index + 2];
      imageData.data[index + 3] = 255;
    }
    return imageData;
  };

  /*
    @param {ImageData} originalImageData
    @returns {ImageData}
  */


  Focus.prototype.createMaskImageData = function(originalImageData) {
    var canvas, context;
    canvas = Utils.newCanvasWithDimensions({
      width: originalImageData.width,
      height: originalImageData.height
    });
    context = canvas.getContext("2d");
    this.drawMask(canvas, context);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  };

  /*
    Uses quasimondo's StackBlur algorithm to blur
    the image
  
    @param {ImageData} imageData
    @returns {ImageData}
  */


  Focus.prototype.blur = function(imageData) {
    var b_in_sum, b_out_sum, b_sum, div, g_in_sum, g_out_sum, g_sum, height, heightMinus1, i, mul_sum, p, pb, pg, pixels, pr, r_in_sum, r_out_sum, r_sum, radius, radiusPlus1, rbs, shg_sum, stack, stackEnd, stackIn, stackOut, stackStart, sumFactor, w4, width, widthMinus1, x, y, yi, yp, yw, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    radius = this.options.radius;
    width = imageData.width;
    height = imageData.height;
    pixels = imageData.data;
    div = radius + radius + 1;
    w4 = width << 2;
    widthMinus1 = width - 1;
    heightMinus1 = height - 1;
    radiusPlus1 = radius + 1;
    sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
    stackStart = new BlurStack();
    stack = stackStart;
    for (i = _i = 1; 1 <= div ? _i < div : _i > div; i = 1 <= div ? ++_i : --_i) {
      stack = stack.next = new BlurStack();
      if (i === radiusPlus1) {
        stackEnd = stack;
      }
    }
    stack.next = stackStart;
    stackIn = null;
    stackOut = null;
    yw = yi = 0;
    mul_sum = mul_table[radius];
    shg_sum = shg_table[radius];
    for (y = _j = 0; 0 <= height ? _j < height : _j > height; y = 0 <= height ? ++_j : --_j) {
      r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
      r_out_sum = radiusPlus1 * (pr = pixels[yi]);
      g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
      b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
      r_sum += sumFactor * pr;
      g_sum += sumFactor * pg;
      b_sum += sumFactor * pb;
      stack = stackStart;
      for (i = _k = 0; 0 <= radiusPlus1 ? _k < radiusPlus1 : _k > radiusPlus1; i = 0 <= radiusPlus1 ? ++_k : --_k) {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }
      for (i = _l = 1; 1 <= radiusPlus1 ? _l < radiusPlus1 : _l > radiusPlus1; i = 1 <= radiusPlus1 ? ++_l : --_l) {
        p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
        r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
        g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
        b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
        r_in_sum += pr;
        g_in_sum += pg;
        b_in_sum += pb;
        stack = stack.next;
      }
      stackIn = stackStart;
      stackOut = stackEnd;
      for (x = _m = 0; 0 <= width ? _m < width : _m > width; x = 0 <= width ? ++_m : --_m) {
        pixels[yi] = (r_sum * mul_sum) >> shg_sum;
        pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
        pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;
        r_sum -= r_out_sum;
        g_sum -= g_out_sum;
        b_sum -= b_out_sum;
        r_out_sum -= stackIn.r;
        g_out_sum -= stackIn.g;
        b_out_sum -= stackIn.b;
        p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
        r_in_sum += (stackIn.r = pixels[p]);
        g_in_sum += (stackIn.g = pixels[p + 1]);
        b_in_sum += (stackIn.b = pixels[p + 2]);
        r_sum += r_in_sum;
        g_sum += g_in_sum;
        b_sum += b_in_sum;
        stackIn = stackIn.next;
        r_out_sum += (pr = stackOut.r);
        g_out_sum += (pg = stackOut.g);
        b_out_sum += (pb = stackOut.b);
        r_in_sum -= pr;
        g_in_sum -= pg;
        b_in_sum -= pb;
        stackOut = stackOut.next;
        yi += 4;
      }
      yw += width;
    }
    for (x = _n = 0; 0 <= width ? _n < width : _n > width; x = 0 <= width ? ++_n : --_n) {
      g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
      yi = x << 2;
      r_out_sum = radiusPlus1 * (pr = pixels[yi]);
      g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
      b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
      r_sum += sumFactor * pr;
      g_sum += sumFactor * pg;
      b_sum += sumFactor * pb;
      stack = stackStart;
      for (i = _o = 0; 0 <= radiusPlus1 ? _o < radiusPlus1 : _o > radiusPlus1; i = 0 <= radiusPlus1 ? ++_o : --_o) {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }
      yp = width;
      for (i = _p = 1; 1 <= radius ? _p <= radius : _p >= radius; i = 1 <= radius ? ++_p : --_p) {
        yi = (yp + x) << 2;
        r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
        g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
        b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
        r_in_sum += pr;
        g_in_sum += pg;
        b_in_sum += pb;
        stack = stack.next;
        if (i < heightMinus1) {
          yp += width;
        }
      }
      yi = x;
      stackIn = stackStart;
      stackOut = stackEnd;
      for (y = _q = 0; 0 <= height ? _q < height : _q > height; y = 0 <= height ? ++_q : --_q) {
        p = yi << 2;
        pixels[p] = (r_sum * mul_sum) >> shg_sum;
        pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
        pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;
        r_sum -= r_out_sum;
        g_sum -= g_out_sum;
        b_sum -= b_out_sum;
        r_out_sum -= stackIn.r;
        g_out_sum -= stackIn.g;
        b_out_sum -= stackIn.b;
        p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
        r_sum += (r_in_sum += (stackIn.r = pixels[p]));
        g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
        b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
        stackIn = stackIn.next;
        r_out_sum += (pr = stackOut.r);
        g_out_sum += (pg = stackOut.g);
        b_out_sum += (pb = stackOut.b);
        r_in_sum -= pr;
        g_in_sum -= pg;
        b_in_sum -= pb;
        stackOut = stackOut.next;
        yi += width;
      }
    }
    return imageData;
  };

  return Focus;

})(Operation);

module.exports = Focus;


},{"../../utils.coffee":6,"../operation.coffee":21,"__browserify_Buffer":2,"__browserify_process":1}],74:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/tonecurve.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveToneCurveFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveToneCurveFilter = (function(_super) {
  __extends(PrimitiveToneCurveFilter, _super);

  function PrimitiveToneCurveFilter(app, options) {
    var rgb;
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveToneCurveFilter.__super__.constructor.apply(this, arguments);
    if (this.rgbControlPoints || (options.rgbControlPoints != null)) {
      rgb = this.rgbControlPoints || options.rgbControlPoints;
      if (this.redControlPoints == null) {
        this.redControlPoints = rgb;
      }
      if (this.greenControlPoints == null) {
        this.greenControlPoints = rgb;
      }
      if (this.blueControlPoints == null) {
        this.blueControlPoints = rgb;
      }
    } else {
      if (this.redControlPoints == null) {
        this.redControlPoints = options.redControlPoints;
      }
      if (this.greenControlPoints == null) {
        this.greenControlPoints = options.greenControlPoints;
      }
      if (this.blueControlPoints == null) {
        this.blueControlPoints = options.blueControlPoints;
      }
    }
    if (this.redControlPoints && this.greenControlPoints && this.blueControlPoints) {
      this.updateToneCurveTexture();
    }
  }

  PrimitiveToneCurveFilter.prototype.render = function(context, w, h) {
    return context.putImageData(this.apply(context.getImageData(0, 0, w, h)), 0, 0);
  };

  PrimitiveToneCurveFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index] = imageData.data[index] + this.preparedRed[imageData.data[index]];
        imageData.data[index + 1] = imageData.data[index + 1] + this.preparedGreen[imageData.data[index + 1]];
        imageData.data[index + 2] = imageData.data[index + 2] + this.preparedBlue[imageData.data[index + 2]];
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  PrimitiveToneCurveFilter.prototype.updateToneCurveTexture = function() {
    this.preparedRed = this.getPreparedSplineCurve(this.redControlPoints);
    this.preparedBlue = this.getPreparedSplineCurve(this.blueControlPoints);
    return this.preparedGreen = this.getPreparedSplineCurve(this.greenControlPoints);
  };

  PrimitiveToneCurveFilter.prototype.getPreparedSplineCurve = function(points) {
    var convertedPoints, distance, firstSplinePoint, i, newPoint, origPoint, point, preparedSplinePoints, sortedPoints, splinePoints, _i, _j, _k, _len, _ref, _ref1;
    sortedPoints = points.sort(function(a, b) {
      var x1, x2;
      x1 = a[0];
      x2 = b[0];
      return x1 > x2;
    });
    convertedPoints = [];
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      point = points[_i];
      newPoint = [point[0] * 255, point[1] * 255];
      convertedPoints.push(newPoint);
    }
    splinePoints = this.splineCurve(convertedPoints);
    firstSplinePoint = splinePoints[0];
    if (firstSplinePoint[0] > 0) {
      for (i = _j = 0, _ref = firstSplinePoint[0]; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
        splinePoints.unshift([0, 0]);
      }
    }
    preparedSplinePoints = [];
    for (i = _k = 0, _ref1 = splinePoints.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
      newPoint = splinePoints[i];
      origPoint = [newPoint[0], newPoint[0]];
      distance = Math.sqrt(Math.pow(origPoint[0] - newPoint[0], 2) + Math.pow(origPoint[1] - newPoint[1], 2));
      if (origPoint[1] > newPoint[1]) {
        distance = -distance;
      }
      preparedSplinePoints.push(distance);
    }
    return preparedSplinePoints;
  };

  PrimitiveToneCurveFilter.prototype.splineCurve = function(points) {
    var a, b, cur, h, i, n, next, output, sd, sdA, t, x, y, _i, _j, _k, _ref, _ref1, _ref2;
    sdA = this.secondDerivative(points);
    n = sdA.length;
    sd = [];
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      sd[i] = sdA[i];
    }
    output = [];
    for (i = _j = 0, _ref = n - 1; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
      cur = points[i];
      next = points[i + 1];
      for (x = _k = _ref1 = cur[0], _ref2 = next[0]; _ref1 <= _ref2 ? _k < _ref2 : _k > _ref2; x = _ref1 <= _ref2 ? ++_k : --_k) {
        t = (x - cur[0]) / (next[0] - cur[0]);
        a = 1 - t;
        b = t;
        h = next[0] - cur[0];
        y = a * cur[1] + b * next[1] + (h * h / 6) * ((a * a * a - a) * sd[i] + (b * b * b - b) * sd[i + 1]);
        if (y > 255) {
          y = 255;
        } else if (y < 0) {
          y = 0;
        }
        output.push([x, y]);
      }
    }
    if (output.length === 255) {
      output.push(points.pop());
    }
    return output;
  };

  PrimitiveToneCurveFilter.prototype.secondDerivative = function(points) {
    var P1, P2, P3, i, k, matrix, n, result, y2, _i, _j, _k, _l, _ref, _ref1;
    n = points.length;
    if (n <= 0 || n === 1) {
      return null;
    }
    matrix = [];
    result = [];
    matrix[0] = [0, 1, 0];
    for (i = _i = 1, _ref = n - 1; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
      P1 = points[i - 1];
      P2 = points[i];
      P3 = points[i + 1];
      if (matrix[i] == null) {
        matrix[i] = [];
      }
      matrix[i][0] = (P2[0] - P1[0]) / 6;
      matrix[i][1] = (P3[0] - P1[0]) / 3;
      matrix[i][2] = (P3[0] - P2[0]) / 6;
      result[i] = (P3[1] - P2[1]) / (P3[0] - P2[0]) - (P2[1] - P1[1]) / (P2[0] - P1[0]);
    }
    result[0] = 0;
    result[n - 1] = 0;
    matrix[n - 1] = [0, 1, 0];
    for (i = _j = 1; 1 <= n ? _j < n : _j > n; i = 1 <= n ? ++_j : --_j) {
      k = matrix[1][0] / matrix[i - 1][1];
      matrix[i][1] -= k * matrix[i - 1][2];
      matrix[i][0] = 0;
      result[i] -= k * result[i - 1];
    }
    for (i = _k = _ref1 = n - 2; _ref1 <= 0 ? _k < 0 : _k > 0; i = _ref1 <= 0 ? ++_k : --_k) {
      k = matrix[i][2] / matrix[i + 1][1];
      matrix[i][1] -= k * matrix[i + 1][0];
      matrix[i][2] = 0;
      result[i] -= k * result[i + 1];
    }
    y2 = [];
    for (i = _l = 0; 0 <= n ? _l < n : _l > n; i = 0 <= n ? ++_l : --_l) {
      y2[i] = result[i] / matrix[i][1];
    }
    return y2;
  };

  PrimitiveToneCurveFilter.prototype.setRedControlPoints = function(controlPoints) {
    return this.redControlPoints = controlPoints;
  };

  PrimitiveToneCurveFilter.prototype.setGreenControlPoints = function(controlPoints) {
    return this.greenControlPoints = controlPoints;
  };

  PrimitiveToneCurveFilter.prototype.setBlueControlPoints = function(controlPoints) {
    return this.blueControlPoints = controlPoints;
  };

  return PrimitiveToneCurveFilter;

})(Filter);

module.exports = PrimitiveToneCurveFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],75:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/softcoloroverlay.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveSoftColorOverlayFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveSoftColorOverlayFilter = (function(_super) {
  __extends(PrimitiveSoftColorOverlayFilter, _super);

  function PrimitiveSoftColorOverlayFilter() {
    _ref = PrimitiveSoftColorOverlayFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimitiveSoftColorOverlayFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index] = Math.max(this.options.r, imageData.data[index]);
        imageData.data[index + 1] = Math.max(this.options.g, imageData.data[index + 1]);
        imageData.data[index + 2] = Math.max(this.options.b, imageData.data[index + 2]);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveSoftColorOverlayFilter;

})(Filter);

module.exports = PrimitiveSoftColorOverlayFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],76:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/desaturation.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveDesaturationFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveDesaturationFilter = (function(_super) {
  __extends(PrimitiveDesaturationFilter, _super);

  function PrimitiveDesaturationFilter(app, options) {
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveDesaturationFilter.__super__.constructor.apply(this, arguments);
    if (this.desaturation == null) {
      this.desaturation = options != null ? options.desaturation : void 0;
    }
  }

  PrimitiveDesaturationFilter.prototype.apply = function(imageData) {
    var h, index, luminance, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        luminance = imageData.data[index] * 0.3 + imageData.data[index + 1] * 0.59 + imageData.data[index + 2] * 0.11;
        imageData.data[index] = luminance * (1 - this.desaturation) + (imageData.data[index] * this.desaturation);
        imageData.data[index + 1] = luminance * (1 - this.desaturation) + (imageData.data[index + 1] * this.desaturation);
        imageData.data[index + 2] = luminance * (1 - this.desaturation) + (imageData.data[index + 2] * this.desaturation);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveDesaturationFilter;

})(Filter);

module.exports = PrimitiveDesaturationFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],77:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/x400.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveX400Filter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveX400Filter = (function(_super) {
  __extends(PrimitiveX400Filter, _super);

  function PrimitiveX400Filter() {
    _ref = PrimitiveX400Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimitiveX400Filter.prototype.apply = function(imageData) {
    var gray, h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        gray = imageData.data[index] / 255 * 0.3 + imageData.data[index + 1] / 255 * 0.3 + imageData.data[index + 2] / 255 * 0.3;
        gray -= 0.2;
        gray = Math.max(0.0, Math.min(1.0, gray));
        gray += 0.15;
        gray *= 1.4;
        gray *= 255;
        imageData.data[index] = gray;
        imageData.data[index + 1] = gray;
        imageData.data[index + 2] = gray;
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveX400Filter;

})(Filter);

module.exports = PrimitiveX400Filter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],78:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/grayscale.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimtiveGrayscaleFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimtiveGrayscaleFilter = (function(_super) {
  __extends(PrimtiveGrayscaleFilter, _super);

  function PrimtiveGrayscaleFilter() {
    _ref = PrimtiveGrayscaleFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimtiveGrayscaleFilter.prototype.apply = function(imageData) {
    var h, index, luminance, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;
        imageData.data[index] = luminance;
        imageData.data[index + 1] = luminance;
        imageData.data[index + 2] = luminance;
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimtiveGrayscaleFilter;

})(Filter);

module.exports = PrimtiveGrayscaleFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],79:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/glow.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveGlowFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveGlowFilter = (function(_super) {
  __extends(PrimitiveGlowFilter, _super);

  function PrimitiveGlowFilter(options) {
    if (options == null) {
      options = {};
    }
    PrimitiveGlowFilter.__super__.constructor.apply(this, arguments);
    this.setColorToAdd(options.r, options.g, options.b);
  }

  PrimitiveGlowFilter.prototype.apply = function(imageData) {
    var d, h, index, nx, ny, scalarX, scalarY, w, x, x01, y, y01, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        x01 = x / w;
        y01 = y / h;
        nx = (x01 - 0.5) / 0.75;
        ny = (y01 - 0.5) / 0.75;
        scalarX = nx * nx;
        scalarY = ny * ny;
        d = 1 - (scalarX + scalarY);
        d = Math.min(Math.max(d, 0.1), 1.0);
        imageData.data[index] = imageData.data[index] * (d * this.colorToAdd[0]);
        imageData.data[index + 1] = imageData.data[index + 1] * (d * this.colorToAdd[1]);
        imageData.data[index + 2] = imageData.data[index + 2] * (d * this.colorToAdd[2]);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  PrimitiveGlowFilter.prototype.setColorToAdd = function(r, g, b) {
    return this.colorToAdd = [typeof r === 'number' ? r : 1.0, typeof g === 'number' ? g : 1.0, typeof b === 'number' ? b : 1.0];
  };

  return PrimitiveGlowFilter;

})(Filter);

module.exports = PrimitiveGlowFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}],80:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/gobblin.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, PrimitiveGobblinFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveGobblinFilter = (function(_super) {
  __extends(PrimitiveGobblinFilter, _super);

  function PrimitiveGobblinFilter() {
    _ref = PrimitiveGobblinFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimitiveGobblinFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index + 2] = imageData.data[index + 1] * 0.33;
        imageData.data[index] = imageData.data[index] * 0.6;
        imageData.data[index + 2] += imageData.data[index] * 0.33;
        imageData.data[index + 1] = imageData.data[index + 1] * 0.7;
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveGobblinFilter;

})(Filter);

module.exports = PrimitiveGobblinFilter;


},{"../filter.coffee":20,"__browserify_Buffer":2,"__browserify_process":1}]},{},[3])
;