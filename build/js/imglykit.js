require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var ImglyKit = _interopRequire(require("./src/js/imglykit"));

/* istanbul ignore next */
(function () {
  if (typeof window !== "undefined") {
    window.ImglyKit = ImglyKit;
  } else if (typeof module !== "undefined") {
    module.exports = ImglyKit;
  } else if (typeof global !== "undefined") {
    global.ImglyKit = ImglyKit;
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/js/imglykit":43}],2:[function(require,module,exports){
"use strict";
module.exports = function(Promise) {
var SomePromiseArray = Promise._SomePromiseArray;
function any(promises) {
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    if (promise.isRejected()) {
        return promise;
    }
    ret.setHowMany(1);
    ret.setUnwrap();
    ret.init();
    return promise;
}

Promise.any = function (promises) {
    return any(promises);
};

Promise.prototype.any = function () {
    return any(this);
};

};

},{}],3:[function(require,module,exports){
(function (process){
"use strict";
var firstLineError;
try {throw new Error(); } catch (e) {firstLineError = e;}
var schedule = require("./schedule.js");
var Queue = require("./queue.js");
var _process = typeof process !== "undefined" ? process : undefined;

function Async() {
    this._isTickUsed = false;
    this._lateQueue = new Queue(16);
    this._normalQueue = new Queue(16);
    var self = this;
    this.drainQueues = function () {
        self._drainQueues();
    };
    this._schedule =
        schedule.isStatic ? schedule(this.drainQueues) : schedule;
}

Async.prototype.haveItemsQueued = function () {
    return this._normalQueue.length() > 0;
};

Async.prototype._withDomain = function(fn) {
    if (_process !== undefined &&
        _process.domain != null &&
        !fn.domain) {
        fn = _process.domain.bind(fn);
    }
    return fn;
};

Async.prototype.throwLater = function(fn, arg) {
    if (arguments.length === 1) {
        arg = fn;
        fn = function () { throw arg; };
    }
    fn = this._withDomain(fn);
    if (typeof setTimeout !== "undefined") {
        setTimeout(function() {
            fn(arg);
        }, 0);
    } else try {
        this._schedule(function() {
            fn(arg);
        });
    } catch (e) {
        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/m3OTXk\u000a");
    }
};

Async.prototype.invokeLater = function (fn, receiver, arg) {
    fn = this._withDomain(fn);
    this._lateQueue.push(fn, receiver, arg);
    this._queueTick();
};

Async.prototype.invokeFirst = function (fn, receiver, arg) {
    fn = this._withDomain(fn);
    this._normalQueue.unshift(fn, receiver, arg);
    this._queueTick();
};

Async.prototype.invoke = function (fn, receiver, arg) {
    fn = this._withDomain(fn);
    this._normalQueue.push(fn, receiver, arg);
    this._queueTick();
};

Async.prototype.settlePromises = function(promise) {
    this._normalQueue._pushOne(promise);
    this._queueTick();
};

Async.prototype._drainQueue = function(queue) {
    while (queue.length() > 0) {
        var fn = queue.shift();
        if (typeof fn !== "function") {
            fn._settlePromises();
            continue;
        }
        var receiver = queue.shift();
        var arg = queue.shift();
        fn.call(receiver, arg);
    }
};

Async.prototype._drainQueues = function () {
    this._drainQueue(this._normalQueue);
    this._reset();
    this._drainQueue(this._lateQueue);
};

Async.prototype._queueTick = function () {
    if (!this._isTickUsed) {
        this._isTickUsed = true;
        this._schedule(this.drainQueues);
    }
};

Async.prototype._reset = function () {
    this._isTickUsed = false;
};

module.exports = new Async();
module.exports.firstLineError = firstLineError;

}).call(this,require('_process'))
},{"./queue.js":26,"./schedule.js":29,"_process":39}],4:[function(require,module,exports){
"use strict";
var old;
if (typeof Promise !== "undefined") old = Promise;
function noConflict() {
    try { if (Promise === bluebird) Promise = old; }
    catch (e) {}
    return bluebird;
}
var bluebird = require("./promise.js")();
bluebird.noConflict = noConflict;
module.exports = bluebird;

},{"./promise.js":21}],5:[function(require,module,exports){
"use strict";
var cr = Object.create;
if (cr) {
    var callerCache = cr(null);
    var getterCache = cr(null);
    callerCache[" size"] = getterCache[" size"] = 0;
}

module.exports = function(Promise) {
var util = require("./util.js");
var canEvaluate = util.canEvaluate;
var isIdentifier = util.isIdentifier;

function makeMethodCaller (methodName) {
    return new Function("obj", "                                             \n\
        'use strict'                                                         \n\
        var len = this.length;                                               \n\
        switch(len) {                                                        \n\
            case 1: return obj.methodName(this[0]);                          \n\
            case 2: return obj.methodName(this[0], this[1]);                 \n\
            case 3: return obj.methodName(this[0], this[1], this[2]);        \n\
            case 0: return obj.methodName();                                 \n\
            default: return obj.methodName.apply(obj, this);                 \n\
        }                                                                    \n\
        ".replace(/methodName/g, methodName));
}

function makeGetter (propertyName) {
    return new Function("obj", "                                             \n\
        'use strict';                                                        \n\
        return obj.propertyName;                                             \n\
        ".replace("propertyName", propertyName));
}

function getCompiled(name, compiler, cache) {
    var ret = cache[name];
    if (typeof ret !== "function") {
        if (!isIdentifier(name)) {
            return null;
        }
        ret = compiler(name);
        cache[name] = ret;
        cache[" size"]++;
        if (cache[" size"] > 512) {
            var keys = Object.keys(cache);
            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
            cache[" size"] = keys.length - 256;
        }
    }
    return ret;
}

function getMethodCaller(name) {
    return getCompiled(name, makeMethodCaller, callerCache);
}

function getGetter(name) {
    return getCompiled(name, makeGetter, getterCache);
}

function caller(obj) {
    return obj[this.pop()].apply(obj, this);
}
Promise.prototype.call = function (methodName) {
    var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
    if (canEvaluate) {
        var maybeCaller = getMethodCaller(methodName);
        if (maybeCaller !== null) {
            return this._then(
                maybeCaller, undefined, undefined, args, undefined);
        }
    }
    args.push(methodName);
    return this._then(caller, undefined, undefined, args, undefined);
};

function namedGetter(obj) {
    return obj[this];
}
function indexedGetter(obj) {
    var index = +this;
    if (index < 0) index = Math.max(0, index + obj.length);
    return obj[index];
}
Promise.prototype.get = function (propertyName) {
    var isIndex = (typeof propertyName === "number");
    var getter;
    if (!isIndex) {
        if (canEvaluate) {
            var maybeGetter = getGetter(propertyName);
            getter = maybeGetter !== null ? maybeGetter : namedGetter;
        } else {
            getter = namedGetter;
        }
    } else {
        getter = indexedGetter;
    }
    return this._then(getter, undefined, undefined, propertyName, undefined);
};
};

},{"./util.js":36}],6:[function(require,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var errors = require("./errors.js");
var async = require("./async.js");
var CancellationError = errors.CancellationError;

Promise.prototype._cancel = function (reason) {
    if (!this.isCancellable()) return this;
    var parent;
    var promiseToReject = this;
    while ((parent = promiseToReject._cancellationParent) !== undefined &&
        parent.isCancellable()) {
        promiseToReject = parent;
    }
    this._unsetCancellable();
    var trace = errors.ensureErrorObject(reason);
    promiseToReject._attachExtraTrace(trace);
    promiseToReject._target()._rejectUnchecked(reason, trace);
};

Promise.prototype.cancel = function (reason) {
    if (!this.isCancellable()) return this;
    if (reason === undefined) reason = new CancellationError();
    async.invokeLater(this._cancel, this, reason);
    return this;
};

Promise.prototype.cancellable = function () {
    if (this._cancellable()) return this;
    this._setCancellable();
    this._cancellationParent = undefined;
    return this;
};

Promise.prototype.uncancellable = function () {
    var ret = new Promise(INTERNAL);
    ret._propagateFrom(this, 4);
    ret._follow(this);
    ret._unsetCancellable();
    return ret;
};

Promise.prototype.fork = function (didFulfill, didReject, didProgress) {
    var ret = this._then(didFulfill, didReject, didProgress,
                         undefined, undefined);

    ret._setCancellable();
    ret._cancellationParent = undefined;
    return ret;
};
};

},{"./async.js":3,"./errors.js":11}],7:[function(require,module,exports){
(function (process){
"use strict";
module.exports = function() {
var async = require("./async.js");
var inherits = require("./util.js").inherits;
var bluebirdFramePattern = /[\\\/]bluebird[\\\/]js[\\\/](main|debug|zalgo)/;
var stackFramePattern = null;
var formatStack = null;

function CapturedTrace(parent) {
    this._parent = parent;
    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
    captureStackTrace(this, CapturedTrace);
    if (length > 32) this.uncycle();
}
inherits(CapturedTrace, Error);

CapturedTrace.prototype.uncycle = function() {
    var length = this._length;
    if (length < 2) return;
    var nodes = [];
    var stackToIndex = {};

    for (var i = 0, node = this; node !== undefined; ++i) {
        nodes.push(node);
        node = node._parent;
    }
    length = this._length = i;
    for (var i = length - 1; i >= 0; --i) {
        var stack = nodes[i].stack;
        if (stackToIndex[stack] === undefined) {
            stackToIndex[stack] = i;
        }
    }
    for (var i = 0; i < length; ++i) {
        var currentStack = nodes[i].stack;
        var index = stackToIndex[currentStack];
        if (index !== undefined && index !== i) {
            if (index > 0) {
                nodes[index - 1]._parent = undefined;
                nodes[index - 1]._length = 1;
            }
            nodes[i]._parent = undefined;
            nodes[i]._length = 1;
            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

            if (index < length - 1) {
                cycleEdgeNode._parent = nodes[index + 1];
                cycleEdgeNode._parent.uncycle();
                cycleEdgeNode._length =
                    cycleEdgeNode._parent._length + 1;
            } else {
                cycleEdgeNode._parent = undefined;
                cycleEdgeNode._length = 1;
            }
            var currentChildLength = cycleEdgeNode._length + 1;
            for (var j = i - 2; j >= 0; --j) {
                nodes[j]._length = currentChildLength;
                currentChildLength++;
            }
            return;
        }
    }
};

CapturedTrace.prototype.parent = function() {
    return this._parent;
};

CapturedTrace.prototype.hasParent = function() {
    return this._parent !== undefined;
};

CapturedTrace.prototype.attachExtraTrace = function(error) {
    if (error.__stackCleaned__) return;
    this.uncycle();
    var trace = this;
    var stack = CapturedTrace.cleanStack(error, false);
    var headerLineCount = 1;
    var combinedTraces = 1;
    do {
        stack = trace.combine(stack);
        combinedTraces++;
    } while ((trace = trace.parent()) != null);

    stack = unProtectNewlines(stack);

    if (stack.length <= headerLineCount) {
        error.stack = "(No stack trace)";
    } else {
        error.stack = stack.join("\n");
    }
};

CapturedTrace.prototype.combine = function(current) {
    var prev = clean(this.stack.split("\n"), 0);
    var currentLastIndex = current.length - 1;
    var currentLastLine = current[currentLastIndex];
    var commonRootMeetPoint = -1;
    for (var i = prev.length - 1; i >= 0; --i) {
        if (prev[i] === currentLastLine) {
            commonRootMeetPoint = i;
            break;
        }
    }

    for (var i = commonRootMeetPoint; i >= 0; --i) {
        var line = prev[i];
        if (current[currentLastIndex] === line) {
            current.pop();
            currentLastIndex--;
        } else {
            break;
        }
    }

    if (current[current.length - 1] !== "From previous event:") {
        current.push("From previous event:");
    }
    return current.concat(prev);
};

function protectErrorMessageNewlines (stack) {
    for (var i = 0; i < stack.length; ++i) {
        var line = stack[i];
        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
            break;
        }
    }

    if (i <= 1) return 1;

    var errorMessageLines = [];
    for (var j = 0; j < i; ++j) {
        errorMessageLines.push(stack.shift());
    }
    stack.unshift(errorMessageLines.join("\u0002\u0000\u0001"));
    return i;
}

function unProtectNewlines(stack) {
    if (stack.length > 0) {
        stack[0] = stack[0].split("\u0002\u0000\u0001").join("\n");
        if (stack[stack.length - 1] === "From previous event:") {
            stack.pop();
        }
    }
    return stack;
}

function clean(stack, initialIndex) {
    var ret = stack.slice(0, initialIndex);
    for (var i = initialIndex; i < stack.length; ++i) {
        var line = stack[i];
        var isTraceLine = stackFramePattern.test(line) ||
            "    (No stack trace)" === line;
        var isInternalFrame = isTraceLine && shouldIgnore(line);
        if (isTraceLine && !isInternalFrame) {
            ret.push(line);
        }
    }
    return ret;
}

CapturedTrace.cleanStack = function(error, shouldUnProtectNewlines) {
    if (error.__stackCleaned__) return;
    error.__stackCleaned__ = true;
    var stack = error.stack;
    stack = typeof stack === "string"
        ? stack.split("\n")
        : [error.toString(), "    (No stack trace)"];
    var initialIndex = protectErrorMessageNewlines(stack);
    stack = clean(stack, initialIndex);
    if (shouldUnProtectNewlines) stack = unProtectNewlines(stack);
    error.stack = stack.join("\n");
    return stack;
};

CapturedTrace.formatAndLogError = function(error, title) {
    if (typeof console === "object") {
        var message;
        if (typeof error === "object" || typeof error === "function") {
            var stack = error.stack;
            message = title + formatStack(stack, error);
        } else {
            message = title + String(error);
        }
        if (typeof console.warn === "function" ||
            typeof console.warn === "object") {
            console.warn(message);
        } else if (typeof console.log === "function" ||
            typeof console.log === "object") {
            console.log(message);
        }
    }
};

CapturedTrace.unhandledRejection = function (reason) {
    CapturedTrace.formatAndLogError(reason, "^--- With additional stack trace: ");
};

CapturedTrace.isSupported = function () {
    return typeof captureStackTrace === "function";
};

CapturedTrace.fireRejectionEvent =
function(name, localHandler, reason, promise) {
    var localEventFired = false;
    try {
        if (typeof localHandler === "function") {
            localEventFired = true;
            if (name === "rejectionHandled") {
                localHandler(promise);
            } else {
                localHandler(reason, promise);
            }
        }
    } catch (e) {
        async.throwLater(e);
    }

    var globalEventFired = false;
    try {
        globalEventFired = fireGlobalEvent(name, reason, promise);
    } catch (e) {
        globalEventFired = true;
        async.throwLater(e);
    }

    if (!globalEventFired && !localEventFired &&
        name === "unhandledRejection") {
        CapturedTrace.formatAndLogError(reason, "Possibly unhandled ");
    }
};

function formatNonError(obj) {
    var str;
    if (typeof obj === "function") {
        str = "[function " +
            (obj.name || "anonymous") +
            "]";
    } else {
        str = obj.toString();
        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
        if (ruselessToString.test(str)) {
            try {
                var newStr = JSON.stringify(obj);
                str = newStr;
            }
            catch(e) {

            }
        }
        if (str.length === 0) {
            str = "(empty array)";
        }
    }
    return ("(<" + snip(str) + ">, no stack trace)");
}

function snip(str) {
    var maxChars = 41;
    if (str.length < maxChars) {
        return str;
    }
    return str.substr(0, maxChars - 3) + "...";
}

var shouldIgnore = function() { return false; };
var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
function parseLineInfo(line) {
    var matches = line.match(parseLineInfoRegex);
    if (matches) {
        return {
            fileName: matches[1],
            line: parseInt(matches[2], 10)
        };
    }
}
CapturedTrace.setBounds = function(firstLineError, lastLineError) {
    if (!CapturedTrace.isSupported()) return;
    var firstStackLines = firstLineError.stack.split("\n");
    var lastStackLines = lastLineError.stack.split("\n");
    var firstIndex = -1;
    var lastIndex = -1;
    var firstFileName;
    var lastFileName;
    for (var i = 0; i < firstStackLines.length; ++i) {
        var result = parseLineInfo(firstStackLines[i]);
        if (result) {
            firstFileName = result.fileName;
            firstIndex = result.line;
            break;
        }
    }
    for (var i = 0; i < lastStackLines.length; ++i) {
        var result = parseLineInfo(lastStackLines[i]);
        if (result) {
            lastFileName = result.fileName;
            lastIndex = result.line;
            break;
        }
    }
    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
        firstFileName !== lastFileName || firstIndex >= lastIndex) {
        return;
    }

    shouldIgnore = function(line) {
        if (bluebirdFramePattern.test(line)) return true;
        var info = parseLineInfo(line);
        if (info) {
            if (info.fileName === firstFileName &&
                (firstIndex <= info.line && info.line <= lastIndex)) {
                return true;
            }
        }
        return false;
    };
};

var captureStackTrace = (function stackDetection() {
    var v8stackFramePattern = /^\s*at\s*/;
    var v8stackFormatter = function(stack, error) {
        if (typeof stack === "string") return stack;

        if (error.name !== undefined &&
            error.message !== undefined) {
            return error.name + ". " + error.message;
        }
        return formatNonError(error);
    };

    if (typeof Error.stackTraceLimit === "number" &&
        typeof Error.captureStackTrace === "function") {
        stackFramePattern = v8stackFramePattern;
        formatStack = v8stackFormatter;
        var captureStackTrace = Error.captureStackTrace;

        shouldIgnore = function(line) {
            return bluebirdFramePattern.test(line);
        };
        return function(receiver, ignoreUntil) {
            captureStackTrace(receiver, ignoreUntil);
        };
    }
    var err = new Error();

    if (typeof err.stack === "string" &&
        typeof "".startsWith === "function" &&
        (err.stack.startsWith("stackDetection@")) &&
        stackDetection.name === "stackDetection") {

        stackFramePattern = /@/;
        var rline = /[@\n]/;

        formatStack = function(stack, error) {
            if (typeof stack === "string") {
                return (error.name + ". " + error.message + "\n" + stack);
            }

            if (error.name !== undefined &&
                error.message !== undefined) {
                return error.name + ". " + error.message;
            }
            return formatNonError(error);
        };

        return function captureStackTrace(o) {
            var stack = new Error().stack;
            var split = stack.split(rline);
            var len = split.length;
            var ret = "";
            for (var i = 0; i < len; i += 2) {
                ret += split[i];
                ret += "@";
                ret += split[i + 1];
                ret += "\n";
            }
            o.stack = ret;
        };
    }

    var hasStackAfterThrow;
    try { throw new Error(); }
    catch(e) {
        hasStackAfterThrow = ("stack" in e);
    }
    if (!("stack" in err) && hasStackAfterThrow) {
        stackFramePattern = v8stackFramePattern;
        formatStack = v8stackFormatter;
        return function captureStackTrace(o) {
            try { throw new Error(); }
            catch(e) { o.stack = e.stack; }
        };
    }

    formatStack = function(stack, error) {
        if (typeof stack === "string") return stack;

        if ((typeof error === "object" ||
            typeof error === "function") &&
            error.name !== undefined &&
            error.message !== undefined) {
            return error.name + ". " + error.message;
        }
        return formatNonError(error);
    };

    return null;

})();

var fireGlobalEvent = (function() {
    if (typeof process !== "undefined" &&
        typeof process.version === "string" &&
        typeof window === "undefined") {
        return function(name, reason, promise) {
            if (name === "rejectionHandled") {
                return process.emit(name, promise);
            } else {
                return process.emit(name, reason, promise);
            }
        };
    } else {
        var toWindowMethodNameMap = {};
        toWindowMethodNameMap["unhandledRejection"] = ("on" +
            "unhandledRejection").toLowerCase();
        toWindowMethodNameMap["rejectionHandled"] = ("on" +
            "rejectionHandled").toLowerCase();

        return function(name, reason, promise) {
            var methodName = toWindowMethodNameMap[name];
            var method = window[methodName];
            if (!method) return false;
            if (name === "rejectionHandled") {
                method.call(window, promise);
            } else {
                method.call(window, reason, promise);
            }
            return true;
        };
    }
})();

return CapturedTrace;
};

}).call(this,require('_process'))
},{"./async.js":3,"./util.js":36,"_process":39}],8:[function(require,module,exports){
"use strict";
module.exports = function(NEXT_FILTER) {
var util = require("./util.js");
var errors = require("./errors.js");
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;
var keys = require("./es5.js").keys;
var TypeError = errors.TypeError;

function CatchFilter(instances, callback, promise) {
    this._instances = instances;
    this._callback = callback;
    this._promise = promise;
}

function safePredicate(predicate, e) {
    var safeObject = {};
    var retfilter = tryCatch1(predicate, safeObject, e);

    if (retfilter === errorObj) return retfilter;

    var safeKeys = keys(safeObject);
    if (safeKeys.length) {
        errorObj.e = new TypeError("Catch filter must inherit from Error or be a simple predicate function\u000a\u000a    See http://goo.gl/o84o68\u000a");
        return errorObj;
    }
    return retfilter;
}

CatchFilter.prototype.doFilter = function (e) {
    var cb = this._callback;
    var promise = this._promise;
    var boundTo = promise._boundTo;
    for (var i = 0, len = this._instances.length; i < len; ++i) {
        var item = this._instances[i];
        var itemIsErrorType = item === Error ||
            (item != null && item.prototype instanceof Error);

        if (itemIsErrorType && e instanceof item) {
            var ret = tryCatch1(cb, boundTo, e);
            if (ret === errorObj) {
                NEXT_FILTER.e = ret.e;
                return NEXT_FILTER;
            }
            return ret;
        } else if (typeof item === "function" && !itemIsErrorType) {
            var shouldHandle = safePredicate(item, e);
            if (shouldHandle === errorObj) {
                var trace = errors.canAttachTrace(errorObj.e)
                    ? errorObj.e
                    : new Error(util.toString(errorObj.e));
                this._promise._attachExtraTrace(trace);
                e = errorObj.e;
                break;
            } else if (shouldHandle) {
                var ret = tryCatch1(cb, boundTo, e);
                if (ret === errorObj) {
                    NEXT_FILTER.e = ret.e;
                    return NEXT_FILTER;
                }
                return ret;
            }
        }
    }
    NEXT_FILTER.e = e;
    return NEXT_FILTER;
};

return CatchFilter;
};

},{"./errors.js":11,"./es5.js":13,"./util.js":36}],9:[function(require,module,exports){
"use strict";
var util = require("./util.js");
var isPrimitive = util.isPrimitive;
var wrapsPrimitiveReceiver = util.wrapsPrimitiveReceiver;

module.exports = function(Promise) {
var returner = function () {
    return this;
};
var thrower = function () {
    throw this;
};

var wrapper = function (value, action) {
    if (action === 1) {
        return function () {
            throw value;
        };
    } else if (action === 2) {
        return function () {
            return value;
        };
    }
};


Promise.prototype["return"] =
Promise.prototype.thenReturn = function (value) {
    if (wrapsPrimitiveReceiver && isPrimitive(value)) {
        return this._then(
            wrapper(value, 2),
            undefined,
            undefined,
            undefined,
            undefined
       );
    }
    return this._then(returner, undefined, undefined, value, undefined);
};

Promise.prototype["throw"] =
Promise.prototype.thenThrow = function (reason) {
    if (wrapsPrimitiveReceiver && isPrimitive(reason)) {
        return this._then(
            wrapper(reason, 1),
            undefined,
            undefined,
            undefined,
            undefined
       );
    }
    return this._then(thrower, undefined, undefined, reason, undefined);
};
};

},{"./util.js":36}],10:[function(require,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseReduce = Promise.reduce;

Promise.prototype.each = function (fn) {
    return PromiseReduce(this, fn, null, INTERNAL);
};

Promise.each = function (promises, fn) {
    return PromiseReduce(promises, fn, null, INTERNAL);
};
};

},{}],11:[function(require,module,exports){
"use strict";
var Objectfreeze = require("./es5.js").freeze;
var propertyIsWritable = require("./es5.js").propertyIsWritable;
var util = require("./util.js");
var inherits = util.inherits;
var notEnumerableProp = util.notEnumerableProp;

function markAsOriginatingFromRejection(e) {
    try {
        notEnumerableProp(e, "isOperational", true);
    }
    catch(ignore) {}
}

function originatesFromRejection(e) {
    if (e == null) return false;
    return ((e instanceof OperationalError) ||
        e["isOperational"] === true);
}

function isError(obj) {
    return obj instanceof Error;
}

function canAttachTrace(obj) {
    return isError(obj) && propertyIsWritable(obj, "stack");
}

function subError(nameProperty, defaultMessage) {
    function SubError(message) {
        if (!(this instanceof SubError)) return new SubError(message);
        notEnumerableProp(this, "message",
            typeof message === "string" ? message : defaultMessage);
        notEnumerableProp(this, "name", nameProperty);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    inherits(SubError, Error);
    return SubError;
}

var _TypeError, _RangeError;
var CancellationError = subError("CancellationError", "cancellation error");
var TimeoutError = subError("TimeoutError", "timeout error");
var AggregateError = subError("AggregateError", "aggregate error");
try {
    _TypeError = TypeError;
    _RangeError = RangeError;
} catch(e) {
    _TypeError = subError("TypeError", "type error");
    _RangeError = subError("RangeError", "range error");
}

var methods = ("join pop push shift unshift slice filter forEach some " +
    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

for (var i = 0; i < methods.length; ++i) {
    if (typeof Array.prototype[methods[i]] === "function") {
        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
    }
}

AggregateError.prototype.length = 0;
AggregateError.prototype["isOperational"] = true;
var level = 0;
AggregateError.prototype.toString = function() {
    var indent = Array(level * 4 + 1).join(" ");
    var ret = "\n" + indent + "AggregateError of:" + "\n";
    level++;
    indent = Array(level * 4 + 1).join(" ");
    for (var i = 0; i < this.length; ++i) {
        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
        var lines = str.split("\n");
        for (var j = 0; j < lines.length; ++j) {
            lines[j] = indent + lines[j];
        }
        str = lines.join("\n");
        ret += str + "\n";
    }
    level--;
    return ret;
};

function OperationalError(message) {
    notEnumerableProp(this, "name", "OperationalError");
    notEnumerableProp(this, "message", message);
    this.cause = message;
    this["isOperational"] = true;

    if (message instanceof Error) {
        notEnumerableProp(this, "message", message.message);
        notEnumerableProp(this, "stack", message.stack);
    } else if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

}
inherits(OperationalError, Error);

var key = "__BluebirdErrorTypes__";
var errorTypes = Error[key];
if (!errorTypes) {
    errorTypes = Objectfreeze({
        CancellationError: CancellationError,
        TimeoutError: TimeoutError,
        OperationalError: OperationalError,
        RejectionError: OperationalError,
        AggregateError: AggregateError
    });
    notEnumerableProp(Error, key, errorTypes);
}

var ensureErrorObject = (function() {
    if (!("stack" in new Error())) {
        return function(value) {
            if (canAttachTrace(value)) return value;
            try {throw new Error(util.toString(value));}
            catch(err) {return err;}
        };
    } else {
        return function(value) {
            if (canAttachTrace(value)) return value;
            return new Error(util.toString(value));
        };
    }
})();

module.exports = {
    Error: Error,
    TypeError: _TypeError,
    RangeError: _RangeError,
    CancellationError: errorTypes.CancellationError,
    OperationalError: errorTypes.OperationalError,
    TimeoutError: errorTypes.TimeoutError,
    AggregateError: errorTypes.AggregateError,
    originatesFromRejection: originatesFromRejection,
    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
    canAttachTrace: canAttachTrace,
    ensureErrorObject: ensureErrorObject
};

},{"./es5.js":13,"./util.js":36}],12:[function(require,module,exports){
"use strict";
module.exports = function(Promise) {
var TypeError = require("./errors.js").TypeError;

function apiRejection(msg) {
    var error = new TypeError(msg);
    var ret = Promise.reject(error);
    var parent = ret._peekContext();
    if (parent != null) {
        parent.attachExtraTrace(error);
    }
    return ret;
}

return apiRejection;
};

},{"./errors.js":11}],13:[function(require,module,exports){
var isES5 = (function(){
    "use strict";
    return this === undefined;
})();

if (isES5) {
    module.exports = {
        freeze: Object.freeze,
        defineProperty: Object.defineProperty,
        keys: Object.keys,
        getPrototypeOf: Object.getPrototypeOf,
        isArray: Array.isArray,
        isES5: isES5,
        propertyIsWritable: function(obj, prop) {
            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
            return !!(!descriptor || descriptor.writable || descriptor.set);
        }
    };
} else {
    var has = {}.hasOwnProperty;
    var str = {}.toString;
    var proto = {}.constructor.prototype;

    var ObjectKeys = function (o) {
        var ret = [];
        for (var key in o) {
            if (has.call(o, key)) {
                ret.push(key);
            }
        }
        return ret;
    };

    var ObjectDefineProperty = function (o, key, desc) {
        o[key] = desc.value;
        return o;
    };

    var ObjectFreeze = function (obj) {
        return obj;
    };

    var ObjectGetPrototypeOf = function (obj) {
        try {
            return Object(obj).constructor.prototype;
        }
        catch (e) {
            return proto;
        }
    };

    var ArrayIsArray = function (obj) {
        try {
            return str.call(obj) === "[object Array]";
        }
        catch(e) {
            return false;
        }
    };

    module.exports = {
        isArray: ArrayIsArray,
        keys: ObjectKeys,
        defineProperty: ObjectDefineProperty,
        freeze: ObjectFreeze,
        getPrototypeOf: ObjectGetPrototypeOf,
        isES5: isES5,
        propertyIsWritable: function() {
            return true;
        }
    };
}

},{}],14:[function(require,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseMap = Promise.map;

Promise.prototype.filter = function (fn, options) {
    return PromiseMap(this, fn, options, INTERNAL);
};

Promise.filter = function (promises, fn, options) {
    return PromiseMap(promises, fn, options, INTERNAL);
};
};

},{}],15:[function(require,module,exports){
"use strict";
module.exports = function(Promise, NEXT_FILTER, tryConvertToPromise) {
var util = require("./util.js");
var wrapsPrimitiveReceiver = util.wrapsPrimitiveReceiver;
var isPrimitive = util.isPrimitive;
var thrower = util.thrower;

function returnThis() {
    return this;
}
function throwThis() {
    throw this;
}
function return$(r) {
    return function() {
        return r;
    };
}
function throw$(r) {
    return function() {
        throw r;
    };
}
function promisedFinally(ret, reasonOrValue, isFulfilled) {
    var then;
    if (wrapsPrimitiveReceiver && isPrimitive(reasonOrValue)) {
        then = isFulfilled ? return$(reasonOrValue) : throw$(reasonOrValue);
    } else {
        then = isFulfilled ? returnThis : throwThis;
    }
    return ret._then(then, thrower, undefined, reasonOrValue, undefined);
}

function finallyHandler(reasonOrValue) {
    var promise = this.promise;
    var handler = this.handler;

    var ret = promise._isBound()
                    ? handler.call(promise._boundTo)
                    : handler();

    if (ret !== undefined) {
        var maybePromise = tryConvertToPromise(ret, undefined);
        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            return promisedFinally(maybePromise, reasonOrValue,
                                    promise.isFulfilled());
        }
    }

    if (promise.isRejected()) {
        NEXT_FILTER.e = reasonOrValue;
        return NEXT_FILTER;
    } else {
        return reasonOrValue;
    }
}

function tapHandler(value) {
    var promise = this.promise;
    var handler = this.handler;

    var ret = promise._isBound()
                    ? handler.call(promise._boundTo, value)
                    : handler(value);

    if (ret !== undefined) {
        var maybePromise = tryConvertToPromise(ret, undefined);
        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            return promisedFinally(maybePromise, value, true);
        }
    }
    return value;
}

Promise.prototype._passThroughHandler = function (handler, isFinally) {
    if (typeof handler !== "function") return this.then();

    var promiseAndHandler = {
        promise: this,
        handler: handler
    };

    return this._then(
            isFinally ? finallyHandler : tapHandler,
            isFinally ? finallyHandler : undefined, undefined,
            promiseAndHandler, undefined);
};

Promise.prototype.lastly =
Promise.prototype["finally"] = function (handler) {
    return this._passThroughHandler(handler, true);
};

Promise.prototype.tap = function (handler) {
    return this._passThroughHandler(handler, false);
};
};

},{"./util.js":36}],16:[function(require,module,exports){
"use strict";
module.exports = function(Promise,
                          apiRejection,
                          INTERNAL,
                          tryConvertToPromise) {
var errors = require("./errors.js");
var TypeError = errors.TypeError;
var deprecated = require("./util.js").deprecated;
var util = require("./util.js");
var errorObj = util.errorObj;
var tryCatch1 = util.tryCatch1;
var yieldHandlers = [];

function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
    var _errorObj = errorObj;
    var _Promise = Promise;
    var len = yieldHandlers.length;
    for (var i = 0; i < len; ++i) {
        traceParent._pushContext();
        var result = tryCatch1(yieldHandlers[i], undefined, value);
        traceParent._popContext();
        if (result === _errorObj) {
            return _Promise.reject(_errorObj.e);
        }
        var maybePromise = tryConvertToPromise(result, traceParent);
        if (maybePromise instanceof _Promise) return maybePromise;
    }
    return null;
}

function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
    var promise = this._promise = new Promise(INTERNAL);
    promise._captureStackTrace();
    this._stack = stack;
    this._generatorFunction = generatorFunction;
    this._receiver = receiver;
    this._generator = undefined;
    this._yieldHandlers = typeof yieldHandler === "function"
        ? [yieldHandler].concat(yieldHandlers)
        : yieldHandlers;
}

PromiseSpawn.prototype.promise = function () {
    return this._promise;
};

PromiseSpawn.prototype._run = function () {
    this._generator = this._generatorFunction.call(this._receiver);
    this._receiver =
        this._generatorFunction = undefined;
    this._next(undefined);
};

PromiseSpawn.prototype._continue = function (result) {
    if (result === errorObj) {
        this._generator = undefined;
        var trace = errors.canAttachTrace(result.e)
            ? result.e : new Error(util.toString(result.e));
        this._promise._attachExtraTrace(trace);
        this._promise._reject(result.e, trace);
        return;
    }

    var value = result.value;
    if (result.done === true) {
        this._generator = undefined;
        if (!this._promise._tryFollow(value)) {
            this._promise._fulfill(value);
        }
    } else {
        var maybePromise = tryConvertToPromise(value, this._promise);
        if (!(maybePromise instanceof Promise)) {
            maybePromise =
                promiseFromYieldHandler(maybePromise,
                                        this._yieldHandlers,
                                        this._promise);
            if (maybePromise === null) {
                this._throw(
                    new TypeError(
                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/4Y4pDk\u000a\u000a".replace("%s", value) +
                        "From coroutine:\u000a" +
                        this._stack.split("\n").slice(1, -7).join("\n")
                    )
                );
                return;
            }
        }
        maybePromise._then(
            this._next,
            this._throw,
            undefined,
            this,
            null
       );
    }
};

PromiseSpawn.prototype._throw = function (reason) {
    if (errors.canAttachTrace(reason))
        this._promise._attachExtraTrace(reason);
    this._promise._pushContext();
    var result = tryCatch1(this._generator["throw"], this._generator, reason);
    this._promise._popContext();
    this._continue(result);
};

PromiseSpawn.prototype._next = function (value) {
    this._promise._pushContext();
    var result = tryCatch1(this._generator.next, this._generator, value);
    this._promise._popContext();
    this._continue(result);
};

Promise.coroutine = function (generatorFunction, options) {
    if (typeof generatorFunction !== "function") {
        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/6Vqhm0\u000a");
    }
    var yieldHandler = Object(options).yieldHandler;
    var PromiseSpawn$ = PromiseSpawn;
    var stack = new Error().stack;
    return function () {
        var generator = generatorFunction.apply(this, arguments);
        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
                                      stack);
        spawn._generator = generator;
        spawn._next(undefined);
        return spawn.promise();
    };
};

Promise.coroutine.addYieldHandler = function(fn) {
    if (typeof fn !== "function") throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
    yieldHandlers.push(fn);
};

Promise.spawn = function (generatorFunction) {
    deprecated("Promise.spawn is deprecated. Use Promise.coroutine instead.");
    if (typeof generatorFunction !== "function") {
        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/6Vqhm0\u000a");
    }
    var spawn = new PromiseSpawn(generatorFunction, this);
    var ret = spawn.promise();
    spawn._run(Promise.spawn);
    return ret;
};
};

},{"./errors.js":11,"./util.js":36}],17:[function(require,module,exports){
"use strict";
module.exports =
function(Promise, PromiseArray, tryConvertToPromise, INTERNAL) {
var util = require("./util.js");
var canEvaluate = util.canEvaluate;
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;
var errors = require("./errors.js");

if (canEvaluate) {
    var thenCallback = function(i) {
        return new Function("value", "holder", "                             \n\
            'use strict';                                                    \n\
            holder.pIndex = value;                                           \n\
            holder.checkFulfillment(this);                                   \n\
            ".replace(/Index/g, i));
    };

    var caller = function(count) {
        var values = [];
        for (var i = 1; i <= count; ++i) values.push("holder.p" + i);
        return new Function("holder", "                                      \n\
            'use strict';                                                    \n\
            var callback = holder.fn;                                        \n\
            return callback(values);                                         \n\
            ".replace(/values/g, values.join(", ")));
    };
    var thenCallbacks = [];
    var callers = [undefined];
    for (var i = 1; i <= 5; ++i) {
        thenCallbacks.push(thenCallback(i));
        callers.push(caller(i));
    }

    var Holder = function(total, fn) {
        this.p1 = this.p2 = this.p3 = this.p4 = this.p5 = null;
        this.fn = fn;
        this.total = total;
        this.now = 0;
    };

    Holder.prototype.callers = callers;
    Holder.prototype.checkFulfillment = function(promise) {
        var now = this.now;
        now++;
        var total = this.total;
        if (now >= total) {
            var handler = this.callers[total];
            promise._pushContext();
            var ret = tryCatch1(handler, undefined, this);
            promise._popContext();
            if (ret === errorObj) {
                var reason = ret.e;
                var trace = errors.ensureErrorObject(reason);
                promise._attachExtraTrace(trace);
                promise._rejectUnchecked(reason,
                    trace === reason ? undefined : trace);
            } else if (!promise._tryFollow(ret)) {
                promise._fulfillUnchecked(ret);
            }
        } else {
            this.now = now;
        }
    };
}

function reject(reason) {
    this._reject(reason);
}

Promise.join = function () {
    var last = arguments.length - 1;
    var fn;
    if (last > 0 && typeof arguments[last] === "function") {
        fn = arguments[last];
        if (last < 6 && canEvaluate) {
            var ret = new Promise(INTERNAL);
            ret._captureStackTrace();
            var holder = new Holder(last, fn);
            var callbacks = thenCallbacks;
            for (var i = 0; i < last; ++i) {
                var maybePromise = tryConvertToPromise(arguments[i], undefined);
                if (maybePromise instanceof Promise) {
                    maybePromise = maybePromise._target();
                    if (maybePromise._isPending()) {
                        maybePromise._then(callbacks[i], reject,
                                           undefined, ret, holder);
                    } else if (maybePromise._isFulfilled()) {
                        callbacks[i].call(ret,
                                          maybePromise._value(), holder);
                    } else {
                        ret._reject(maybePromise._reason());
                        maybePromise._unsetRejectionIsUnhandled();
                    }
                } else {
                    callbacks[i].call(ret, maybePromise, holder);
                }
            }
            return ret;
        }
    }
    var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
    var ret = new PromiseArray(args).promise();
    return fn !== undefined ? ret.spread(fn) : ret;
};

};

},{"./errors.js":11,"./util.js":36}],18:[function(require,module,exports){
"use strict";
module.exports = function(Promise,
                          PromiseArray,
                          apiRejection,
                          tryConvertToPromise,
                          INTERNAL) {
var util = require("./util.js");
var tryCatch3 = util.tryCatch3;
var errorObj = util.errorObj;
var PENDING = {};
var EMPTY_ARRAY = [];

function MappingPromiseArray(promises, fn, limit, _filter) {
    this.constructor$(promises);
    this._promise._setIsSpreadable();
    this._promise._captureStackTrace();
    this._callback = fn;
    this._preservedValues = _filter === INTERNAL
        ? new Array(this.length())
        : null;
    this._limit = limit;
    this._inFlight = 0;
    this._queue = limit >= 1 ? [] : EMPTY_ARRAY;
    this._init$(undefined, -2);
}
util.inherits(MappingPromiseArray, PromiseArray);

MappingPromiseArray.prototype._init = function () {};

MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
    var values = this._values;
    var length = this.length();
    var preservedValues = this._preservedValues;
    var limit = this._limit;
    if (values[index] === PENDING) {
        values[index] = value;
        if (limit >= 1) {
            this._inFlight--;
            this._drainQueue();
            if (this._isResolved()) return;
        }
    } else {
        if (limit >= 1 && this._inFlight >= limit) {
            values[index] = value;
            this._queue.push(index);
            return;
        }
        if (preservedValues !== null) preservedValues[index] = value;

        var callback = this._callback;
        var receiver = this._promise._boundTo;
        this._promise._pushContext();
        var ret = tryCatch3(callback, receiver, value, index, length);
        this._promise._popContext();
        if (ret === errorObj) return this._reject(ret.e);

        var maybePromise = tryConvertToPromise(ret, this._promise);
        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            if (maybePromise._isPending()) {
                if (limit >= 1) this._inFlight++;
                values[index] = PENDING;
                return maybePromise._proxyPromiseArray(this, index);
            } else if (maybePromise._isFulfilled()) {
                ret = maybePromise._value();
            } else {
                maybePromise._unsetRejectionIsUnhandled();
                return this._reject(maybePromise._reason());
            }
        }
        values[index] = ret;
    }
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= length) {
        if (preservedValues !== null) {
            this._filter(values, preservedValues);
        } else {
            this._resolve(values);
        }

    }
};

MappingPromiseArray.prototype._drainQueue = function () {
    var queue = this._queue;
    var limit = this._limit;
    var values = this._values;
    while (queue.length > 0 && this._inFlight < limit) {
        if (this._isResolved()) return;
        var index = queue.pop();
        this._promiseFulfilled(values[index], index);
    }
};

MappingPromiseArray.prototype._filter = function (booleans, values) {
    var len = values.length;
    var ret = new Array(len);
    var j = 0;
    for (var i = 0; i < len; ++i) {
        if (booleans[i]) ret[j++] = values[i];
    }
    ret.length = j;
    this._resolve(ret);
};

MappingPromiseArray.prototype.preservedValues = function () {
    return this._preservedValues;
};

function map(promises, fn, options, _filter) {
    var limit = typeof options === "object" && options !== null
        ? options.concurrency
        : 0;
    limit = typeof limit === "number" &&
        isFinite(limit) && limit >= 1 ? limit : 0;
    return new MappingPromiseArray(promises, fn, limit, _filter);
}

Promise.prototype.map = function (fn, options) {
    if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");

    return map(this, fn, options, null).promise();
};

Promise.map = function (promises, fn, options, _filter) {
    if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
    return map(promises, fn, options, _filter).promise();
};


};

},{"./util.js":36}],19:[function(require,module,exports){
"use strict";
module.exports = function(Promise) {
var util = require("./util.js");
var async = require("./async.js");
var tryCatch2 = util.tryCatch2;
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;

function spreadAdapter(val, nodeback) {
    var promise = this;
    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
    var ret = util.tryCatchApply(nodeback,
                                 [null].concat(val), promise._boundTo);
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}

function successAdapter(val, nodeback) {
    var promise = this;
    var receiver = promise._boundTo;
    var ret = val === undefined
        ? tryCatch1(nodeback, receiver, null)
        : tryCatch2(nodeback, receiver, null, val);
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}
function errorAdapter(reason, nodeback) {
    var promise = this;
    if (!reason) {
        var target = promise._target();
        var newReason = target._getCarriedStackTrace();
        newReason.cause = reason;
        reason = newReason;
    }
    var ret = tryCatch1(nodeback, promise._boundTo, reason);
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}

Promise.prototype.nodeify = function (nodeback, options) {
    if (typeof nodeback == "function") {
        var adapter = successAdapter;
        if (options !== undefined && Object(options).spread) {
            adapter = spreadAdapter;
        }
        this._then(
            adapter,
            errorAdapter,
            undefined,
            this,
            nodeback
        );
    }
    return this;
};
};

},{"./async.js":3,"./util.js":36}],20:[function(require,module,exports){
"use strict";
module.exports = function(Promise, PromiseArray) {
var util = require("./util.js");
var async = require("./async.js");
var errors = require("./errors.js");
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;

Promise.prototype.progressed = function (handler) {
    return this._then(undefined, undefined, handler, undefined, undefined);
};

Promise.prototype._progress = function (progressValue) {
    if (this._isFollowingOrFulfilledOrRejected()) return;
    this._target()._progressUnchecked(progressValue);

};

Promise.prototype._progressHandlerAt = function (index) {
    return index === 0
        ? this._progressHandler0
        : this[(index << 2) + index - 5 + 2];
};

Promise.prototype._doProgressWith = function (progression) {
    var progressValue = progression.value;
    var handler = progression.handler;
    var promise = progression.promise;
    var receiver = progression.receiver;

    var ret = tryCatch1(handler, receiver, progressValue);
    if (ret === errorObj) {
        if (ret.e != null &&
            ret.e.name !== "StopProgressPropagation") {
            var trace = errors.canAttachTrace(ret.e)
                ? ret.e : new Error(util.toString(ret.e));
            promise._attachExtraTrace(trace);
            promise._progress(ret.e);
        }
    } else if (ret instanceof Promise) {
        ret._then(promise._progress, null, null, promise, undefined);
    } else {
        promise._progress(ret);
    }
};


Promise.prototype._progressUnchecked = function (progressValue) {
    var len = this._length();
    var progress = this._progress;
    for (var i = 0; i < len; i++) {
        var handler = this._progressHandlerAt(i);
        var promise = this._promiseAt(i);
        if (!(promise instanceof Promise)) {
            var receiver = this._receiverAt(i);
            if (typeof handler === "function") {
                handler.call(receiver, progressValue, promise);
            } else if (receiver instanceof PromiseArray &&
                       !receiver._isResolved()) {
                receiver._promiseProgressed(progressValue, promise);
            }
            continue;
        }

        if (typeof handler === "function") {
            async.invoke(this._doProgressWith, this, {
                handler: handler,
                promise: promise,
                receiver: this._receiverAt(i),
                value: progressValue
            });
        } else {
            async.invoke(progress, promise, progressValue);
        }
    }
};
};

},{"./async.js":3,"./errors.js":11,"./util.js":36}],21:[function(require,module,exports){
(function (process){
"use strict";
module.exports = function() {
var makeSelfResolutionError = function () {
    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/LhFpo0\u000a");
};
var reflect = function() {
    return new Promise.PromiseInspection(this._target());
};
var util = require("./util.js");
var async = require("./async.js");
var errors = require("./errors.js");
var INTERNAL = function(){};
var APPLY = {};
var NEXT_FILTER = {e: null};
var apiRejection = require("./errors_api_rejection")(Promise);
var tryConvertToPromise = require("./thenables.js")(Promise, INTERNAL);
var PromiseArray =
    require("./promise_array.js")(Promise, INTERNAL,
                                    tryConvertToPromise, apiRejection);
var CapturedTrace = require("./captured_trace.js")();
var CatchFilter = require("./catch_filter.js")(NEXT_FILTER);
var PromiseResolver = require("./promise_resolver.js");
var isArray = util.isArray;
var errorObj = util.errorObj;
var tryCatch0 = util.tryCatch0;
var tryCatch1 = util.tryCatch1;
var tryCatch2 = util.tryCatch2;
var tryCatchApply = util.tryCatchApply;
var RangeError = errors.RangeError;
var TypeError = errors.TypeError;
var CancellationError = errors.CancellationError;
var TimeoutError = errors.TimeoutError;
var OperationalError = errors.OperationalError;
var originatesFromRejection = errors.originatesFromRejection;
var markAsOriginatingFromRejection = errors.markAsOriginatingFromRejection;
var canAttachTrace = errors.canAttachTrace;
var unhandledRejectionHandled;
var possiblyUnhandledRejection;

var debugging = false || !!(
    typeof process !== "undefined" &&
    typeof process.execPath === "string" &&
    typeof process.env === "object" &&
    (process.env["BLUEBIRD_DEBUG"] ||
        process.env["NODE_ENV"] === "development")
);
function Promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("the promise constructor requires a resolver function\u000a\u000a    See http://goo.gl/EC22Yn\u000a");
    }
    if (this.constructor !== Promise) {
        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/KsIlge\u000a");
    }
    this._bitField = 0;
    this._fulfillmentHandler0 = undefined;
    this._rejectionHandler0 = undefined;
    this._progressHandler0 = undefined;
    this._promise0 = undefined;
    this._receiver0 = undefined;
    this._settledValue = undefined;
    this._boundTo = undefined;
    if (resolver !== INTERNAL) this._resolveFromResolver(resolver);
}

Promise.prototype.bind = function (thisArg) {
    var maybePromise = tryConvertToPromise(thisArg, this);
    var ret = new Promise(INTERNAL);
    ret._propagateFrom(this, 1);
    var target = this._target();
    if (maybePromise instanceof Promise) {
        target._then(INTERNAL, ret._reject, ret._progress, ret, null);
        maybePromise._then(function(thisArg) {
            if (ret._isPending()) {
                ret._setBoundTo(thisArg);
                ret._follow(target);
            }
        }, ret._reject, ret._progress, ret, null);
    } else {
        ret._setBoundTo(thisArg);
        ret._follow(target);
    }

    return ret;
};

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
    var len = arguments.length;
    if (len > 1) {
        var catchInstances = new Array(len - 1),
            j = 0, i;
        for (i = 0; i < len - 1; ++i) {
            var item = arguments[i];
            if (typeof item === "function") {
                catchInstances[j++] = item;
            } else {
                var error = new TypeError("Catch filter must inherit from Error or be a simple predicate function\u000a\u000a    See http://goo.gl/o84o68\u000a");
                this._attachExtraTrace(error);
                return Promise.reject(error);
            }
        }
        catchInstances.length = j;
        fn = arguments[i];
        var catchFilter = new CatchFilter(catchInstances, fn, this);
        return this._then(undefined, catchFilter.doFilter, undefined,
            catchFilter, undefined);
    }
    return this._then(undefined, fn, undefined, undefined, undefined);
};

Promise.prototype.reflect = function () {
    return this._then(reflect, reflect, undefined, this, undefined);
};

Promise.prototype.then = function (didFulfill, didReject, didProgress) {
    return this._then(didFulfill, didReject, didProgress,
        undefined, undefined);
};


Promise.prototype.done = function (didFulfill, didReject, didProgress) {
    var promise = this._then(didFulfill, didReject, didProgress,
        undefined, undefined);
    promise._setIsFinal();
};

Promise.prototype.spread = function (didFulfill, didReject) {
    var followee = this._target();
    var target = followee._isSpreadable()
        ? (followee === this ? this : this.then())
        : this.all();
    return target._then(didFulfill, didReject, undefined, APPLY, undefined);
};

Promise.prototype.isCancellable = function () {
    return !this.isResolved() &&
        this._cancellable();
};

Promise.prototype.toJSON = function () {
    var ret = {
        isFulfilled: false,
        isRejected: false,
        fulfillmentValue: undefined,
        rejectionReason: undefined
    };
    if (this.isFulfilled()) {
        ret.fulfillmentValue = this.value();
        ret.isFulfilled = true;
    } else if (this.isRejected()) {
        ret.rejectionReason = this.reason();
        ret.isRejected = true;
    }
    return ret;
};

Promise.prototype.all = function () {
    var ret = new PromiseArray(this).promise();
    ret._setIsSpreadable();
    return ret;
};

Promise.prototype.error = function (fn) {
    return this.caught(originatesFromRejection, fn);
};

Promise.is = function (val) {
    return val instanceof Promise;
};

Promise.all = function (promises) {
    var ret = new PromiseArray(promises).promise();
    ret._setIsSpreadable();
    return ret;
};

Promise.method = function (fn) {
    if (typeof fn !== "function") {
        throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
    }
    return function () {
        var ret = new Promise(INTERNAL);
        ret._captureStackTrace();
        var value;
        ret._pushContext();
        switch(arguments.length) {
        case 0: value = tryCatch0(fn, this); break;
        case 1: value = tryCatch1(fn, this, arguments[0]); break;
        case 2: value = tryCatch2(fn, this, arguments[0], arguments[1]); break;
        default:
            var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
            value = tryCatchApply(fn, args, this); break;
        }
        ret._popContext();
        ret._resolveFromSyncValue(value);
        return ret;
    };
};

Promise.attempt = Promise["try"] = function (fn, args, ctx) {
    if (typeof fn !== "function") {
        return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
    }
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    ret._pushContext();
    var value = isArray(args)
        ? tryCatchApply(fn, args, ctx)
        : tryCatch1(fn, ctx, args);
    ret._popContext();
    ret._resolveFromSyncValue(value);
    return ret;
};

Promise.defer = Promise.pending = function () {
    var promise = new Promise(INTERNAL);
    return new PromiseResolver(promise);
};

Promise.bind = function (thisArg) {
    var maybePromise = tryConvertToPromise(thisArg, undefined);
    var ret = new Promise(INTERNAL);

    if (maybePromise instanceof Promise) {
        maybePromise._then(function(thisArg) {
            ret._setBoundTo(thisArg);
            ret._fulfill(undefined);
        }, ret._reject, ret._progress, ret, null);
    } else {
        ret._setBoundTo(thisArg);
        ret._setFulfilled();
    }
    return ret;
};

Promise.cast = function (obj) {
    var ret = tryConvertToPromise(obj, undefined);
    if (!(ret instanceof Promise)) {
        var val = ret;
        ret = new Promise(INTERNAL);
        ret._setFulfilled();
        ret._settledValue = val;
        ret._cleanValues();
    }
    return ret;
};

Promise.resolve = Promise.fulfilled = Promise.cast;

Promise.reject = Promise.rejected = function (reason) {
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    markAsOriginatingFromRejection(reason);
    var hasStack = canAttachTrace(reason) && typeof reason.stack === "string";
    var trace = errors.ensureErrorObject(reason);
    ret._attachExtraTrace(reason, hasStack);
    ret._rejectUnchecked(reason, trace === reason ? undefined : trace);
    return ret;
};

Promise.onPossiblyUnhandledRejection = function (fn) {
    possiblyUnhandledRejection = typeof fn === "function" ? fn : undefined;
};

Promise.onUnhandledRejectionHandled = function (fn) {
    unhandledRejectionHandled = typeof fn === "function" ? fn : undefined;
};

Promise.longStackTraces = function () {
    if (async.haveItemsQueued() &&
        debugging === false
   ) {
        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/DT1qyG\u000a");
    }
    debugging = CapturedTrace.isSupported();
};

Promise.hasLongStackTraces = function () {
    return debugging && CapturedTrace.isSupported();
};

Promise.setScheduler = function(fn) {
    if (typeof fn !== "function") throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
    async._schedule = fn;
};

Promise.prototype._then = function (
    didFulfill,
    didReject,
    didProgress,
    receiver,
    internalData
) {
    var haveInternalData = internalData !== undefined;
    var ret = haveInternalData ? internalData : new Promise(INTERNAL);

    if (!haveInternalData) {
        ret._propagateFrom(this, 4 | 1);
        ret._captureStackTrace();
    }

    var target = this._target();
    if (target !== this) {
        if (receiver === undefined) receiver = this._boundTo;
        if (!haveInternalData) ret._setIsMigrated();
    }

    var callbackIndex =
        target._addCallbacks(didFulfill, didReject, didProgress, ret, receiver);

    if (target._isResolved() && !target._isSettlePromisesQueued()) {
        async.invoke(
            target._settlePromiseAtPostResolution, target, callbackIndex);
    }

    return ret;
};

Promise.prototype._settlePromiseAtPostResolution = function (index) {
    if (this._isRejectionUnhandled()) this._unsetRejectionIsUnhandled();
    this._settlePromiseAt(index);
};

Promise.prototype._length = function () {
    return this._bitField & 131071;
};

Promise.prototype._isFollowingOrFulfilledOrRejected = function () {
    return (this._bitField & 939524096) > 0;
};

Promise.prototype._isFollowing = function () {
    return (this._bitField & 536870912) === 536870912;
};

Promise.prototype._setLength = function (len) {
    this._bitField = (this._bitField & -131072) |
        (len & 131071);
};

Promise.prototype._setFulfilled = function () {
    this._bitField = this._bitField | 268435456;
};

Promise.prototype._setRejected = function () {
    this._bitField = this._bitField | 134217728;
};

Promise.prototype._setFollowing = function () {
    this._bitField = this._bitField | 536870912;
};

Promise.prototype._setIsFinal = function () {
    this._bitField = this._bitField | 33554432;
};

Promise.prototype._isFinal = function () {
    return (this._bitField & 33554432) > 0;
};

Promise.prototype._cancellable = function () {
    return (this._bitField & 67108864) > 0;
};

Promise.prototype._setCancellable = function () {
    this._bitField = this._bitField | 67108864;
};

Promise.prototype._unsetCancellable = function () {
    this._bitField = this._bitField & (~67108864);
};

Promise.prototype._setRejectionIsUnhandled = function () {
    this._bitField = this._bitField | 2097152;
};

Promise.prototype._unsetRejectionIsUnhandled = function () {
    this._bitField = this._bitField & (~2097152);
    if (this._isUnhandledRejectionNotified()) {
        this._unsetUnhandledRejectionIsNotified();
        this._notifyUnhandledRejectionIsHandled();
    }
};

Promise.prototype._isRejectionUnhandled = function () {
    return (this._bitField & 2097152) > 0;
};

Promise.prototype._isSpreadable = function () {
    return (this._bitField & 131072) > 0;
};

Promise.prototype._setIsSpreadable = function () {
    this._bitField = this._bitField | 131072;
};

Promise.prototype._setIsMigrated = function () {
    this._bitField = this._bitField | 4194304;
};

Promise.prototype._unsetIsMigrated = function () {
    this._bitField = this._bitField & (~4194304);
};

Promise.prototype._isMigrated = function () {
    return (this._bitField & 4194304) > 0;
};

Promise.prototype._setUnhandledRejectionIsNotified = function () {
    this._bitField = this._bitField | 524288;
};

Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
    this._bitField = this._bitField & (~524288);
};

Promise.prototype._isUnhandledRejectionNotified = function () {
    return (this._bitField & 524288) > 0;
};

Promise.prototype._setCarriedStackTrace = function (capturedTrace) {
    this._bitField = this._bitField | 1048576;
    this._fulfillmentHandler0 = capturedTrace;
};

Promise.prototype._isCarryingStackTrace = function () {
    return (this._bitField & 1048576) > 0;
};

Promise.prototype._getCarriedStackTrace = function () {
    return this._isCarryingStackTrace()
        ? this._fulfillmentHandler0
        : undefined;
};

Promise.prototype._receiverAt = function (index) {
    var ret = index === 0
        ? this._receiver0
        : this[
            index * 5 - 5 + 4];
    if (this._isBound() && ret === undefined) {
        return this._boundTo;
    }
    return ret;
};

Promise.prototype._promiseAt = function (index) {
    return index === 0
        ? this._promise0
        : this[index * 5 - 5 + 3];
};

Promise.prototype._fulfillmentHandlerAt = function (index) {
    return index === 0
        ? this._fulfillmentHandler0
        : this[index * 5 - 5 + 0];
};

Promise.prototype._rejectionHandlerAt = function (index) {
    return index === 0
        ? this._rejectionHandler0
        : this[index * 5 - 5 + 1];
};

Promise.prototype._migrateCallbacks = function (
    fulfill,
    reject,
    progress,
    promise,
    receiver
) {
    if (promise instanceof Promise) promise._setIsMigrated();
    this._addCallbacks(fulfill, reject, progress, promise, receiver);
};

Promise.prototype._addCallbacks = function (
    fulfill,
    reject,
    progress,
    promise,
    receiver
) {
    var index = this._length();

    if (index >= 131071 - 5) {
        index = 0;
        this._setLength(0);
    }

    if (index === 0) {
        this._promise0 = promise;
        if (receiver !== undefined) this._receiver0 = receiver;
        if (typeof fulfill === "function" && !this._isCarryingStackTrace())
            this._fulfillmentHandler0 = fulfill;
        if (typeof reject === "function") this._rejectionHandler0 = reject;
        if (typeof progress === "function") this._progressHandler0 = progress;
    } else {
        var base = index * 5 - 5;
        this[base + 3] = promise;
        this[base + 4] = receiver;
        if (typeof fulfill === "function")
            this[base + 0] = fulfill;
        if (typeof reject === "function")
            this[base + 1] = reject;
        if (typeof progress === "function")
            this[base + 2] = progress;
    }
    this._setLength(index + 1);
    return index;
};

Promise.prototype._setProxyHandlers = function (receiver, promiseSlotValue) {
    var index = this._length();

    if (index >= 131071 - 5) {
        index = 0;
        this._setLength(0);
    }
    if (index === 0) {
        this._promise0 = promiseSlotValue;
        this._receiver0 = receiver;
    } else {
        var base = index * 5 - 5;
        this[base + 3] = promiseSlotValue;
        this[base + 4] = receiver;
    }
    this._setLength(index + 1);
};

Promise.prototype._proxyPromiseArray = function (promiseArray, index) {
    this._setProxyHandlers(promiseArray, index);
};

Promise.prototype._setBoundTo = function (obj) {
    if (obj !== undefined) {
        this._bitField = this._bitField | 8388608;
        this._boundTo = obj;
    } else {
        this._bitField = this._bitField & (~8388608);
    }
};

Promise.prototype._isBound = function () {
    return (this._bitField & 8388608) === 8388608;
};

Promise.prototype._resolveFromResolver = function (resolver) {
    var promise = this;
    var synchronous = true;

    this._captureStackTrace();
    this._pushContext();
    var r = tryCatch2(resolver, undefined, function(value) {
        if (promise._tryFollow(value)) {
            return;
        }
        promise._fulfill(value);
    }, function (reason) {
        markAsOriginatingFromRejection(reason);
        var trace = errors.ensureErrorObject(reason);
        var hasStack = canAttachTrace(reason) &&
            typeof trace.stack === "string";
        promise._attachExtraTrace(trace, synchronous ? hasStack : false);
        promise._reject(reason, trace === reason ? undefined : trace);
    });
    synchronous = false;
    this._popContext();

    if (r !== undefined && r === errorObj) {
        var reason = r.e;
        var hasStack = canAttachTrace(reason) &&
            typeof reason.stack === "string";
        var trace = errors.ensureErrorObject(reason);
        promise._attachExtraTrace(reason, hasStack);
        promise._reject(reason, trace === reason ? undefined : trace);
    }
};

Promise.prototype._settlePromiseFromHandler = function (
    handler, receiver, value, promise
) {
    if (promise._isRejected()) return;
    promise._pushContext();
    var x;
    if (receiver === APPLY && !this._isRejected()) {
        x = tryCatchApply(handler, value, this._boundTo);
    } else {
        x = tryCatch1(handler, receiver, value);
    }
    promise._popContext();

    if (x === errorObj || x === promise || x === NEXT_FILTER) {
        var err = x === promise
                    ? makeSelfResolutionError()
                    : x.e;
        var trace = canAttachTrace(err) ? err : new Error(util.toString(err));
        if (x !== NEXT_FILTER) promise._attachExtraTrace(trace);
        promise._rejectUnchecked(err, trace);
    } else {
        x = tryConvertToPromise(x, promise);
        if (x instanceof Promise) {
            x = x._target();
            if (x._isRejected() &&
                !x._isCarryingStackTrace() &&
                !canAttachTrace(x._reason())) {
                var trace = new Error(util.toString(x._reason()));
                promise._attachExtraTrace(trace);
                x._setCarriedStackTrace(trace);
            }
            promise._follow(x);
        } else {
            promise._fulfillUnchecked(x);
        }
    }
};

Promise.prototype._target = function() {
    var ret = this;
    while (ret._isFollowing()) ret = ret._followee();
    return ret;
};

Promise.prototype._followee = function() {
    return this._rejectionHandler0;
};

Promise.prototype._setFollowee = function(promise) {
    this._rejectionHandler0 = promise;
};

Promise.prototype._follow = function (promise) {
    if (promise._isPending()) {
        var len = this._length();
        for (var i = 0; i < len; ++i) {
            promise._migrateCallbacks(
                this._fulfillmentHandlerAt(i),
                this._rejectionHandlerAt(i),
                this._progressHandlerAt(i),
                this._promiseAt(i),
                this._receiverAt(i)
            );
        }
        this._setFollowing();
        this._setLength(0);
        this._setFollowee(promise);
        this._propagateFrom(promise, 1);
    } else if (promise._isFulfilled()) {
        this._fulfillUnchecked(promise._value());
    } else {
        this._rejectUnchecked(promise._reason(),
            promise._getCarriedStackTrace());
    }
    if (promise._isRejectionUnhandled()) promise._unsetRejectionIsUnhandled();
};

Promise.prototype._tryFollow = function (value) {
    if (this._isFollowingOrFulfilledOrRejected() ||
        value === this) {
        return false;
    }
    var maybePromise = tryConvertToPromise(value, this);
    if (!(maybePromise instanceof Promise)) {
        return false;
    }
    this._follow(maybePromise._target());
    return true;
};

Promise.prototype._captureStackTrace = function () {
    if (debugging) {
        this._trace = new CapturedTrace(this._peekContext());
    }
    return this;
};

Promise.prototype._canAttachTrace = function(error) {
    return debugging && canAttachTrace(error);
};

Promise.prototype._attachExtraTraceIgnoreSelf = function (error) {
    if (this._canAttachTrace(error) && this._trace._parent !== undefined) {
        this._trace._parent.attachExtraTrace(error);
    }
};

Promise.prototype._attachExtraTrace = function (error, ignoreSelf) {
    if (debugging && canAttachTrace(error)) {
        var trace = this._trace;
        if (trace !== undefined) {
            if (ignoreSelf) trace = trace._parent;
        }
        if (trace !== undefined) {
            trace.attachExtraTrace(error);
        } else {
            CapturedTrace.cleanStack(error, true);
        }
    }
};

Promise.prototype._cleanValues = function () {
    if (this._cancellable()) {
        this._cancellationParent = undefined;
    }
};

Promise.prototype._propagateFrom = function (parent, flags) {
    if ((flags & 1) > 0 && parent._cancellable()) {
        this._setCancellable();
        this._cancellationParent = parent;
    }
    if ((flags & 4) > 0) {
        this._setBoundTo(parent._boundTo);
    }
};

Promise.prototype._fulfill = function (value) {
    if (this._isFollowingOrFulfilledOrRejected()) return;
    this._fulfillUnchecked(value);
};

Promise.prototype._reject = function (reason, carriedStackTrace) {
    if (this._isFollowingOrFulfilledOrRejected()) return;
    this._rejectUnchecked(reason, carriedStackTrace);
};

Promise.prototype._settlePromiseAt = function (index) {
    var promise = this._promiseAt(index);
    var isPromise = promise instanceof Promise;

    if (isPromise && promise._isMigrated()) {
        promise._unsetIsMigrated();
        return async.invoke(this._settlePromiseAt, this, index);
    }
    var handler = this._isFulfilled()
        ? this._fulfillmentHandlerAt(index)
        : this._rejectionHandlerAt(index);

    var carriedStackTrace =
        this._isCarryingStackTrace() ? this._getCarriedStackTrace() : undefined;
    var value = this._settledValue;
    var receiver = this._receiverAt(index);


    this._clearCallbackDataAtIndex(index);

    if (typeof handler === "function") {
        if (!isPromise) {
            handler.call(receiver, value, promise);
        } else {
            this._settlePromiseFromHandler(handler, receiver, value, promise);
        }
    } else if (receiver instanceof PromiseArray) {
        if (!receiver._isResolved()) {
            if (this._isFulfilled()) {
                receiver._promiseFulfilled(value, promise);
            }
            else {
                receiver._promiseRejected(value, promise);
            }
        }
    } else if (isPromise) {
        if (this._isFulfilled()) {
            promise._fulfill(value);
        } else {
            promise._reject(value, carriedStackTrace);
        }
    }

    if (index >= 4 && (index & 31) === 4)
        async.invokeLater(this._setLength, this, 0);
};

Promise.prototype._clearCallbackDataAtIndex = function(index) {
    if (index === 0) {
        if (!this._isCarryingStackTrace()) {
            this._fulfillmentHandler0 = undefined;
        }
        this._rejectionHandler0 =
        this._progressHandler0 =
        this._receiver0 =
        this._promise0 = undefined;
    } else {
        var base = index * 5 - 5;
        this[base + 3] =
        this[base + 4] =
        this[base + 0] =
        this[base + 1] =
        this[base + 2] = undefined;
    }
};

Promise.prototype._isSettlePromisesQueued = function () {
    return (this._bitField &
            -1073741824) === -1073741824;
};

Promise.prototype._setSettlePromisesQueued = function () {
    this._bitField = this._bitField | -1073741824;
};

Promise.prototype._unsetSettlePromisesQueued = function () {
    this._bitField = this._bitField & (~-1073741824);
};

Promise.prototype._queueSettlePromises = function() {
    if (!this._isSettlePromisesQueued()) {
        async.settlePromises(this);
        this._setSettlePromisesQueued();
    }
};

Promise.prototype._fulfillUnchecked = function (value) {
    if (value === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._rejectUnchecked(err, undefined);
    }
    this._setFulfilled();
    this._settledValue = value;
    this._cleanValues();

    if (this._length() > 0) {
        this._queueSettlePromises();
    }
};

Promise.prototype._rejectUncheckedCheckError = function (reason) {
    var trace = errors.ensureErrorObject(reason);
    this._rejectUnchecked(reason, trace === reason ? undefined : trace);
};

Promise.prototype._rejectUnchecked = function (reason, trace) {
    if (reason === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._rejectUnchecked(err);
    }
    this._setRejected();
    this._settledValue = reason;
    this._cleanValues();

    if (this._isFinal()) {
        async.throwLater(function(e) {
            if ("stack" in e) {
                async.invokeFirst(
                    CapturedTrace.unhandledRejection, undefined, e);
            }
            throw e;
        }, trace === undefined ? reason : trace);
        return;
    }

    if (trace !== undefined && trace !== reason) {
        this._setCarriedStackTrace(trace);
    }

    if (this._length() > 0) {
        this._queueSettlePromises();
    } else {
        this._ensurePossibleRejectionHandled();
    }
};

Promise.prototype._settlePromises = function () {
    this._unsetSettlePromisesQueued();
    var len = this._length();
    for (var i = 0; i < len; i++) {
        this._settlePromiseAt(i);
    }
};

Promise.prototype._ensurePossibleRejectionHandled = function () {
    this._setRejectionIsUnhandled();
    async.invokeLater(this._notifyUnhandledRejection, this, undefined);
};

Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
    CapturedTrace.fireRejectionEvent("rejectionHandled",
                                  unhandledRejectionHandled, undefined, this);
};

Promise.prototype._notifyUnhandledRejection = function () {
    if (this._isRejectionUnhandled()) {
        var reason = this._getCarriedStackTrace() || this._settledValue;
        this._setUnhandledRejectionIsNotified();
        CapturedTrace.fireRejectionEvent("unhandledRejection",
                                      possiblyUnhandledRejection, reason, this);
    }
};

var contextStack = [];
function Context() {
    this._trace = new CapturedTrace(peekContext());
}
Context.prototype._pushContext = function () {
    if (!debugging) return;
    contextStack.push(this._trace);
};

Context.prototype._popContext = function () {
    if (!debugging) return;
    contextStack.pop();
};

 /*jshint unused:false*/
function createContext() {
    if (debugging) return new Context();
}

function peekContext() {
    var lastIndex = contextStack.length - 1;
    if (lastIndex >= 0) {
        return contextStack[lastIndex];
    }
    return undefined;
}

Promise.prototype._peekContext = peekContext;
Promise.prototype._pushContext = Context.prototype._pushContext;
Promise.prototype._popContext = Context.prototype._popContext;

Promise.prototype._resolveFromSyncValue = function (value) {
    if (value === errorObj) {
        this._setRejected();
        var reason = value.e;
        this._settledValue = reason;
        this._cleanValues();
        this._attachExtraTrace(reason);
        this._ensurePossibleRejectionHandled();
    } else {
        var maybePromise = tryConvertToPromise(value, this);
        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            this._follow(maybePromise);
        } else {
            this._setFulfilled();
            this._settledValue = value;
            this._cleanValues();
        }
    }
};



if (!CapturedTrace.isSupported()) {
    Promise.longStackTraces = function(){};
    debugging = false;
}

Promise._makeSelfResolutionError = makeSelfResolutionError;
require("./finally.js")(Promise, NEXT_FILTER, tryConvertToPromise);
require("./direct_resolve.js")(Promise);
require("./synchronous_inspection.js")(Promise);
require("./join.js")(Promise, PromiseArray, tryConvertToPromise, INTERNAL);
Promise.RangeError = RangeError;
Promise.CancellationError = CancellationError;
Promise.TimeoutError = TimeoutError;
Promise.TypeError = TypeError;
Promise.OperationalError = OperationalError;
Promise.RejectionError = OperationalError;
Promise.AggregateError = errors.AggregateError;

util.toFastProperties(Promise);
util.toFastProperties(Promise.prototype);
Promise.Promise = Promise;
CapturedTrace.setBounds(async.firstLineError, util.lastLineError);
require('./nodeify.js')(Promise);
require('./using.js')(Promise, apiRejection, tryConvertToPromise, createContext);
require('./generators.js')(Promise, apiRejection, INTERNAL, tryConvertToPromise);
require('./map.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL);
require('./cancel.js')(Promise, INTERNAL);
require('./promisify.js')(Promise, INTERNAL);
require('./props.js')(Promise, PromiseArray, tryConvertToPromise);
require('./race.js')(Promise, INTERNAL, tryConvertToPromise);
require('./reduce.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL);
require('./settle.js')(Promise, PromiseArray);
require('./call_get.js')(Promise);
require('./some.js')(Promise, PromiseArray, apiRejection);
require('./progress.js')(Promise, PromiseArray);
require('./any.js')(Promise);
require('./each.js')(Promise, INTERNAL);
require('./timers.js')(Promise, INTERNAL, tryConvertToPromise);
require('./filter.js')(Promise, INTERNAL);

Promise.prototype = Promise.prototype;
return Promise;

};

}).call(this,require('_process'))
},{"./any.js":2,"./async.js":3,"./call_get.js":5,"./cancel.js":6,"./captured_trace.js":7,"./catch_filter.js":8,"./direct_resolve.js":9,"./each.js":10,"./errors.js":11,"./errors_api_rejection":12,"./filter.js":14,"./finally.js":15,"./generators.js":16,"./join.js":17,"./map.js":18,"./nodeify.js":19,"./progress.js":20,"./promise_array.js":22,"./promise_resolver.js":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection.js":32,"./thenables.js":33,"./timers.js":34,"./using.js":35,"./util.js":36,"_process":39}],22:[function(require,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, tryConvertToPromise,
    apiRejection) {
var util = require("./util.js");
var errors = require("./errors.js");
var isArray = util.isArray;

function toResolutionValue(val) {
    switch(val) {
    case -1: return undefined;
    case -2: return [];
    case -3: return {};
    }
}

function PromiseArray(values) {
    var promise = this._promise = new Promise(INTERNAL);
    var parent;
    if (values instanceof Promise) {
        parent = values;
        promise._propagateFrom(parent, 1 | 4);
    }
    this._values = values;
    this._length = 0;
    this._totalResolved = 0;
    this._init(undefined, -2);
}
PromiseArray.prototype.length = function () {
    return this._length;
};

PromiseArray.prototype.promise = function () {
    return this._promise;
};

PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {

    var values = tryConvertToPromise(this._values, undefined);
    if (values instanceof Promise) {
        values._setBoundTo(this._promise._boundTo);
        values = values._target();
        this._values = values;
        if (values._isFulfilled()) {
            values = values._value();
            if (!isArray(values)) {
                var err = new Promise.TypeError("expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a");
                this.__hardReject__(err);
                return;
            }
        } else if (values._isPending()) {
            values._then(
                init,
                this._reject,
                undefined,
                this,
                resolveValueIfEmpty
           );
            return;
        } else {
            values._unsetRejectionIsUnhandled();
            this._reject(values._reason());
            return;
        }
    } else if (!isArray(values)) {
        this._promise._follow(apiRejection("expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a"));
        return;
    }

    if (values.length === 0) {
        if (resolveValueIfEmpty === -5) {
            this._resolveEmptyArray();
        }
        else {
            this._resolve(toResolutionValue(resolveValueIfEmpty));
        }
        return;
    }
    var len = this.getActualLength(values.length);
    this._length = len;
    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
    var promise = this._promise;
    for (var i = 0; i < len; ++i) {
        var isResolved = this._isResolved();
        var maybePromise = tryConvertToPromise(values[i], promise);
        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            if (isResolved) {
                maybePromise._unsetRejectionIsUnhandled();
            } else if (maybePromise._isPending()) {
                maybePromise._proxyPromiseArray(this, i);
            } else if (maybePromise._isFulfilled()) {
                this._promiseFulfilled(maybePromise._value(), i);
            } else {
                maybePromise._unsetRejectionIsUnhandled();
                this._promiseRejected(maybePromise._reason(), i);
            }
        } else if (!isResolved) {
            this._promiseFulfilled(maybePromise, i);
        }
    }
};

PromiseArray.prototype._isResolved = function () {
    return this._values === null;
};

PromiseArray.prototype._resolve = function (value) {
    this._values = null;
    this._promise._fulfill(value);
};

PromiseArray.prototype.__hardReject__ =
PromiseArray.prototype._reject = function (reason) {
    this._values = null;
    var trace = errors.ensureErrorObject(reason);
    this._promise._attachExtraTrace(trace);
    this._promise._reject(reason, trace);
};

PromiseArray.prototype._promiseProgressed = function (progressValue, index) {
    this._promise._progress({
        index: index,
        value: progressValue
    });
};


PromiseArray.prototype._promiseFulfilled = function (value, index) {
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
    }
};

PromiseArray.prototype._promiseRejected = function (reason, index) {
    this._totalResolved++;
    this._reject(reason);
};

PromiseArray.prototype.shouldCopyValues = function () {
    return true;
};

PromiseArray.prototype.getActualLength = function (len) {
    return len;
};

return PromiseArray;
};

},{"./errors.js":11,"./util.js":36}],23:[function(require,module,exports){
"use strict";
var util = require("./util.js");
var maybeWrapAsError = util.maybeWrapAsError;
var errors = require("./errors.js");
var TimeoutError = errors.TimeoutError;
var OperationalError = errors.OperationalError;
var async = require("./async.js");
var haveGetters = util.haveGetters;
var es5 = require("./es5.js");

function isUntypedError(obj) {
    return obj instanceof Error &&
        es5.getPrototypeOf(obj) === Error.prototype;
}

var rErrorKey = /^(?:name|message|stack|cause)$/;
function wrapAsOperationalError(obj) {
    var ret;
    if (isUntypedError(obj)) {
        ret = new OperationalError(obj);
        ret.name = obj.name;
        ret.message = obj.message;
        ret.stack = obj.stack;
        var keys = es5.keys(obj);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            if (!rErrorKey.test(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    errors.markAsOriginatingFromRejection(obj);
    return obj;
}

function nodebackForPromise(promise) {
    return function(err, value) {
        if (promise === null) return;

        if (err) {
            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
            promise._attachExtraTrace(wrapped);
            promise._reject(wrapped);
        } else if (arguments.length > 2) {
            var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
            promise._fulfill(args);
        } else {
            promise._fulfill(value);
        }

        promise = null;
    };
}


var PromiseResolver;
if (!haveGetters) {
    PromiseResolver = function (promise) {
        this.promise = promise;
        this.asCallback = nodebackForPromise(promise);
        this.callback = this.asCallback;
    };
}
else {
    PromiseResolver = function (promise) {
        this.promise = promise;
    };
}
if (haveGetters) {
    var prop = {
        get: function() {
            return nodebackForPromise(this.promise);
        }
    };
    es5.defineProperty(PromiseResolver.prototype, "asCallback", prop);
    es5.defineProperty(PromiseResolver.prototype, "callback", prop);
}

PromiseResolver._nodebackForPromise = nodebackForPromise;

PromiseResolver.prototype.toString = function () {
    return "[object PromiseResolver]";
};

PromiseResolver.prototype.resolve =
PromiseResolver.prototype.fulfill = function (value) {
    if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a");
    }

    var promise = this.promise;
    if (promise._tryFollow(value)) {
        return;
    }
    async.invoke(promise._fulfill, promise, value);
};

PromiseResolver.prototype.reject = function (reason) {
    if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a");
    }

    var promise = this.promise;
    errors.markAsOriginatingFromRejection(reason);
    var trace = errors.ensureErrorObject(reason);
    async.invoke(promise._reject, promise, reason);
    if (trace !== reason) {
        async.invoke(this._setCarriedStackTrace, this, trace);
    }
};

PromiseResolver.prototype.progress = function (value) {
    if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a");
    }
    async.invoke(this.promise._progress, this.promise, value);
};

PromiseResolver.prototype.cancel = function () {
    async.invoke(this.promise.cancel, this.promise, undefined);
};

PromiseResolver.prototype.timeout = function () {
    this.reject(new TimeoutError("timeout"));
};

PromiseResolver.prototype.isResolved = function () {
    return this.promise.isResolved();
};

PromiseResolver.prototype.toJSON = function () {
    return this.promise.toJSON();
};

PromiseResolver.prototype._setCarriedStackTrace = function (trace) {
    if (this.promise.isRejected()) {
        this.promise._setCarriedStackTrace(trace);
    }
};

module.exports = PromiseResolver;

},{"./async.js":3,"./errors.js":11,"./es5.js":13,"./util.js":36}],24:[function(require,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var THIS = {};
var util = require("./util.js");
var nodebackForPromise = require("./promise_resolver.js")
    ._nodebackForPromise;
var withAppended = util.withAppended;
var maybeWrapAsError = util.maybeWrapAsError;
var canEvaluate = util.canEvaluate;
var TypeError = require("./errors").TypeError;
var defaultSuffix = "Async";
var defaultFilter = function(name, func) {
    return util.isIdentifier(name) &&
        name.charAt(0) !== "_" &&
        !util.isClass(func);
};
var defaultPromisified = {__isPromisified__: true};


function escapeIdentRegex(str) {
    return str.replace(/([$])/, "\\$");
}

function isPromisified(fn) {
    try {
        return fn.__isPromisified__ === true;
    }
    catch (e) {
        return false;
    }
}

function hasPromisified(obj, key, suffix) {
    var val = util.getDataPropertyOrDefault(obj, key + suffix,
                                            defaultPromisified);
    return val ? isPromisified(val) : false;
}
function checkValid(ret, suffix, suffixRegexp) {
    for (var i = 0; i < ret.length; i += 2) {
        var key = ret[i];
        if (suffixRegexp.test(key)) {
            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
            for (var j = 0; j < ret.length; j += 2) {
                if (ret[j] === keyWithoutAsyncSuffix) {
                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/iWrZbw\u000a"
                        .replace("%s", suffix));
                }
            }
        }
    }
}

function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
    var keys = util.inheritedDataKeys(obj);
    var ret = [];
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var value = obj[key];
        var passesDefaultFilter = filter === defaultFilter
            ? true : defaultFilter(key, value, obj);
        if (typeof value === "function" &&
            !isPromisified(value) &&
            !hasPromisified(obj, key, suffix) &&
            filter(key, value, obj, passesDefaultFilter)) {
            ret.push(key, value);
        }
    }
    checkValid(ret, suffix, suffixRegexp);
    return ret;
}

function switchCaseArgumentOrder(likelyArgumentCount) {
    var ret = [likelyArgumentCount];
    var min = Math.max(0, likelyArgumentCount - 1 - 5);
    for(var i = likelyArgumentCount - 1; i >= min; --i) {
        if (i === likelyArgumentCount) continue;
        ret.push(i);
    }
    for(var i = likelyArgumentCount + 1; i <= 5; ++i) {
        ret.push(i);
    }
    return ret;
}

function argumentSequence(argumentCount) {
    return util.filledRange(argumentCount, "arguments[", "]");
}

function parameterDeclaration(parameterCount) {
    return util.filledRange(parameterCount, "_arg", "");
}

function parameterCount(fn) {
    if (typeof fn.length === "number") {
        return Math.max(Math.min(fn.length, 1023 + 1), 0);
    }
    return 0;
}

function generatePropertyAccess(key) {
    if (util.isIdentifier(key)) {
        return "." + key;
    }
    else return "['" + key.replace(/(['\\])/g, "\\$1") + "']";
}

function makeNodePromisifiedEval(callback, receiver, originalName, fn, suffix) {
    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
    var callbackName =
        (typeof originalName === "string" && util.isIdentifier(originalName)
            ? originalName + suffix
            : "promisified");

    function generateCallForArgumentCount(count) {
        var args = argumentSequence(count).join(", ");
        var comma = count > 0 ? ", " : "";
        var ret;
        if (typeof callback === "string") {
            ret = "                                                          \n\
                this.method({{args}}, fn);                                   \n\
                break;                                                       \n\
            ".replace(".method", generatePropertyAccess(callback));
        } else if (receiver === THIS) {
            ret =  "                                                         \n\
                callback.call(this, {{args}}, fn);                           \n\
                break;                                                       \n\
            ";
        } else if (receiver !== undefined) {
            ret =  "                                                         \n\
                callback.call(receiver, {{args}}, fn);                       \n\
                break;                                                       \n\
            ";
        } else {
            ret =  "                                                         \n\
                callback({{args}}, fn);                                      \n\
                break;                                                       \n\
            ";
        }
        return ret.replace("{{args}}", args).replace(", ", comma);
    }

    function generateArgumentSwitchCase() {
        var ret = "";
        for(var i = 0; i < argumentOrder.length; ++i) {
            ret += "case " + argumentOrder[i] +":" +
                generateCallForArgumentCount(argumentOrder[i]);
        }
        var codeForCall;
        if (typeof callback === "string") {
            codeForCall = "                                                  \n\
                this.property.apply(this, args);                             \n\
            "
                .replace(".property", generatePropertyAccess(callback));
        } else if (receiver === THIS) {
            codeForCall = "                                                  \n\
                callback.apply(this, args);                                  \n\
            ";
        } else {
            codeForCall = "                                                  \n\
                callback.apply(receiver, args);                              \n\
            ";
        }

        ret += "                                                             \n\
        default:                                                             \n\
            var args = new Array(len + 1);                                   \n\
            var i = 0;                                                       \n\
            for (var i = 0; i < len; ++i) {                                  \n\
               args[i] = arguments[i];                                       \n\
            }                                                                \n\
            args[i] = fn;                                                    \n\
            [CodeForCall]                                                    \n\
            break;                                                           \n\
        ".replace("[CodeForCall]", codeForCall);
        return ret;
    }

    return new Function("Promise",
                        "callback",
                        "receiver",
                        "withAppended",
                        "maybeWrapAsError",
                        "nodebackForPromise",
                        "INTERNAL","                                         \n\
        var ret = function (Parameters) {                        \n\
            'use strict';                                                    \n\
            var len = arguments.length;                                      \n\
            var promise = new Promise(INTERNAL);                             \n\
            promise._captureStackTrace();                                    \n\
            promise._setIsSpreadable();                                      \n\
            var fn = nodebackForPromise(promise);                            \n\
            try {                                                            \n\
                switch(len) {                                                \n\
                    [CodeForSwitchCase]                                      \n\
                }                                                            \n\
            } catch (e) {                                                    \n\
                var wrapped = maybeWrapAsError(e);                           \n\
                promise._attachExtraTrace(wrapped);                          \n\
                promise._reject(wrapped);                                    \n\
            }                                                                \n\
            return promise;                                                  \n\
        };                                                                   \n\
        ret.__isPromisified__ = true;                                        \n\
        return ret;                                                          \n\
        "
        .replace("FunctionName", callbackName)
        .replace("Parameters", parameterDeclaration(newParameterCount))
        .replace("[CodeForSwitchCase]", generateArgumentSwitchCase()))(
            Promise,
            callback,
            receiver,
            withAppended,
            maybeWrapAsError,
            nodebackForPromise,
            INTERNAL
        );
}

function makeNodePromisifiedClosure(callback, receiver) {
    function promisified() {
        var _receiver = receiver;
        if (receiver === THIS) _receiver = this;
        if (typeof callback === "string") {
            callback = _receiver[callback];
        }
        var promise = new Promise(INTERNAL);
        promise._captureStackTrace();
        promise._setIsSpreadable();
        var fn = nodebackForPromise(promise);
        try {
            callback.apply(_receiver, withAppended(arguments, fn));
        } catch(e) {
            var wrapped = maybeWrapAsError(e);
            promise._attachExtraTrace(wrapped);
            promise._reject(wrapped);
        }
        return promise;
    }
    promisified.__isPromisified__ = true;
    return promisified;
}

var makeNodePromisified = canEvaluate
    ? makeNodePromisifiedEval
    : makeNodePromisifiedClosure;

function promisifyAll(obj, suffix, filter, promisifier) {
    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
    var methods =
        promisifiableMethods(obj, suffix, suffixRegexp, filter);

    for (var i = 0, len = methods.length; i < len; i+= 2) {
        var key = methods[i];
        var fn = methods[i+1];
        var promisifiedKey = key + suffix;
        obj[promisifiedKey] = promisifier === makeNodePromisified
                ? makeNodePromisified(key, THIS, key, fn, suffix)
                : promisifier(fn, function() {
                    return makeNodePromisified(key, THIS, key, fn, suffix);
                });
    }
    util.toFastProperties(obj);
    return obj;
}

function promisify(callback, receiver) {
    return makeNodePromisified(callback, receiver, undefined, callback);
}

Promise.promisify = function (fn, receiver) {
    if (typeof fn !== "function") {
        throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
    }
    if (isPromisified(fn)) {
        return fn;
    }
    return promisify(fn, arguments.length < 2 ? THIS : receiver);
};

Promise.promisifyAll = function (target, options) {
    if (typeof target !== "function" && typeof target !== "object") {
        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/9ITlV0\u000a");
    }
    options = Object(options);
    var suffix = options.suffix;
    if (typeof suffix !== "string") suffix = defaultSuffix;
    var filter = options.filter;
    if (typeof filter !== "function") filter = defaultFilter;
    var promisifier = options.promisifier;
    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

    if (!util.isIdentifier(suffix)) {
        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/8FZo5V\u000a");
    }

    var keys = util.inheritedDataKeys(target, {includeHidden: true});
    for (var i = 0; i < keys.length; ++i) {
        var value = target[keys[i]];
        if (keys[i] !== "constructor" &&
            util.isClass(value)) {
            promisifyAll(value.prototype, suffix, filter, promisifier);
            promisifyAll(value, suffix, filter, promisifier);
        }
    }

    return promisifyAll(target, suffix, filter, promisifier);
};
};


},{"./errors":11,"./promise_resolver.js":23,"./util.js":36}],25:[function(require,module,exports){
"use strict";
module.exports = function(Promise, PromiseArray, tryConvertToPromise) {
var util = require("./util.js");
var apiRejection = require("./errors_api_rejection")(Promise);
var isObject = util.isObject;
var es5 = require("./es5.js");

function PropertiesPromiseArray(obj) {
    var keys = es5.keys(obj);
    var len = keys.length;
    var values = new Array(len * 2);
    for (var i = 0; i < len; ++i) {
        var key = keys[i];
        values[i] = obj[key];
        values[i + len] = key;
    }
    this.constructor$(values);
}
util.inherits(PropertiesPromiseArray, PromiseArray);

PropertiesPromiseArray.prototype._init = function () {
    this._init$(undefined, -3) ;
};

PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        var val = {};
        var keyOffset = this.length();
        for (var i = 0, len = this.length(); i < len; ++i) {
            val[this._values[i + keyOffset]] = this._values[i];
        }
        this._resolve(val);
    }
};

PropertiesPromiseArray.prototype._promiseProgressed = function (value, index) {
    this._promise._progress({
        key: this._values[index + this.length()],
        value: value
    });
};

PropertiesPromiseArray.prototype.shouldCopyValues = function () {
    return false;
};

PropertiesPromiseArray.prototype.getActualLength = function (len) {
    return len >> 1;
};

function props(promises) {
    var ret;
    var castValue = tryConvertToPromise(promises, undefined);

    if (!isObject(castValue)) {
        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/OsFKC8\u000a");
    } else if (castValue instanceof Promise) {
        ret = castValue._then(
            Promise.props, undefined, undefined, undefined, undefined);
    } else {
        ret = new PropertiesPromiseArray(castValue).promise();
    }

    if (castValue instanceof Promise) {
        ret._propagateFrom(castValue, 4);
    }
    return ret;
}

Promise.prototype.props = function () {
    return props(this);
};

Promise.props = function (promises) {
    return props(promises);
};
};

},{"./errors_api_rejection":12,"./es5.js":13,"./util.js":36}],26:[function(require,module,exports){
"use strict";
function arrayMove(src, srcIndex, dst, dstIndex, len) {
    for (var j = 0; j < len; ++j) {
        dst[j + dstIndex] = src[j + srcIndex];
        src[j + srcIndex] = void 0;
    }
}

function Queue(capacity) {
    this._capacity = capacity;
    this._length = 0;
    this._front = 0;
}

Queue.prototype._willBeOverCapacity = function (size) {
    return this._capacity < size;
};

Queue.prototype._pushOne = function (arg) {
    var length = this.length();
    this._checkCapacity(length + 1);
    var i = (this._front + length) & (this._capacity - 1);
    this[i] = arg;
    this._length = length + 1;
};

Queue.prototype._unshiftOne = function(value) {
    var capacity = this._capacity;
    this._checkCapacity(this.length() + 1);
    var front = this._front;
    var i = (((( front - 1 ) &
                    ( capacity - 1) ) ^ capacity ) - capacity );
    this[i] = value;
    this._front = i;
    this._length = this.length() + 1;
};

Queue.prototype.unshift = function(fn, receiver, arg) {
    this._unshiftOne(arg);
    this._unshiftOne(receiver);
    this._unshiftOne(fn);
};

Queue.prototype.push = function (fn, receiver, arg) {
    var length = this.length() + 3;
    if (this._willBeOverCapacity(length)) {
        this._pushOne(fn);
        this._pushOne(receiver);
        this._pushOne(arg);
        return;
    }
    var j = this._front + length - 3;
    this._checkCapacity(length);
    var wrapMask = this._capacity - 1;
    this[(j + 0) & wrapMask] = fn;
    this[(j + 1) & wrapMask] = receiver;
    this[(j + 2) & wrapMask] = arg;
    this._length = length;
};

Queue.prototype.shift = function () {
    var front = this._front,
        ret = this[front];

    this[front] = undefined;
    this._front = (front + 1) & (this._capacity - 1);
    this._length--;
    return ret;
};

Queue.prototype.length = function () {
    return this._length;
};

Queue.prototype._checkCapacity = function (size) {
    if (this._capacity < size) {
        this._resizeTo(this._capacity << 1);
    }
};

Queue.prototype._resizeTo = function (capacity) {
    var oldCapacity = this._capacity;
    this._capacity = capacity;
    var front = this._front;
    var length = this._length;
    if (front + length > oldCapacity) {
        var moveItemsCount = (front + length) & (oldCapacity - 1);
        arrayMove(this, 0, this, oldCapacity, moveItemsCount);
    }
};

module.exports = Queue;

},{}],27:[function(require,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, tryConvertToPromise) {
var apiRejection = require("./errors_api_rejection.js")(Promise);
var isArray = require("./util.js").isArray;

var raceLater = function (promise) {
    return promise.then(function(array) {
        return race(array, promise);
    });
};

function race(promises, parent) {
    var maybePromise = tryConvertToPromise(promises, undefined);

    if (maybePromise instanceof Promise) {
        return raceLater(maybePromise);
    } else if (!isArray(promises)) {
        return apiRejection("expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a");
    }

    var ret = new Promise(INTERNAL);
    if (parent !== undefined) {
        ret._propagateFrom(parent, 4 | 1);
    }
    var fulfill = ret._fulfill;
    var reject = ret._reject;
    for (var i = 0, len = promises.length; i < len; ++i) {
        var val = promises[i];

        if (val === undefined && !(i in promises)) {
            continue;
        }

        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
    }
    return ret;
}

Promise.race = function (promises) {
    return race(promises, undefined);
};

Promise.prototype.race = function () {
    return race(this, undefined);
};

};

},{"./errors_api_rejection.js":12,"./util.js":36}],28:[function(require,module,exports){
"use strict";
module.exports = function(Promise,
                          PromiseArray,
                          apiRejection,
                          tryConvertToPromise,
                          INTERNAL) {
var util = require("./util.js");
var tryCatch4 = util.tryCatch4;
var tryCatch3 = util.tryCatch3;
var errorObj = util.errorObj;
function ReductionPromiseArray(promises, fn, accum, _each) {
    this.constructor$(promises);
    this._promise._captureStackTrace();
    this._preservedValues = _each === INTERNAL ? [] : null;
    this._zerothIsAccum = (accum === undefined);
    this._gotAccum = false;
    this._reducingIndex = (this._zerothIsAccum ? 1 : 0);
    this._valuesPhase = undefined;

    var maybePromise = tryConvertToPromise(accum, undefined);
    var rejected = false;
    var isPromise = maybePromise instanceof Promise;
    if (isPromise) {
        maybePromise = maybePromise._target();
        if (maybePromise._isPending()) {
            maybePromise._proxyPromiseArray(this, -1);
        } else if (maybePromise._isFulfilled()) {
            accum = maybePromise._value();
            this._gotAccum = true;
        } else {
            maybePromise._unsetRejectionIsUnhandled();
            this._reject(maybePromise._reason());
            rejected = true;
        }
    }
    if (!(isPromise || this._zerothIsAccum)) this._gotAccum = true;
    this._callback = fn;
    this._accum = accum;
    if (!rejected) this._init$(undefined, -5);
}
util.inherits(ReductionPromiseArray, PromiseArray);

ReductionPromiseArray.prototype._init = function () {};

ReductionPromiseArray.prototype._resolveEmptyArray = function () {
    if (this._gotAccum || this._zerothIsAccum) {
        this._resolve(this._preservedValues !== null
                        ? [] : this._accum);
    }
};

ReductionPromiseArray.prototype._promiseFulfilled = function (value, index) {
    var values = this._values;
    values[index] = value;
    var length = this.length();
    var preservedValues = this._preservedValues;
    var isEach = preservedValues !== null;
    var gotAccum = this._gotAccum;
    var valuesPhase = this._valuesPhase;
    var valuesPhaseIndex;
    if (!valuesPhase) {
        valuesPhase = this._valuesPhase = Array(length);
        for (valuesPhaseIndex=0; valuesPhaseIndex<length; ++valuesPhaseIndex) {
            valuesPhase[valuesPhaseIndex] = 0;
        }
    }
    valuesPhaseIndex = valuesPhase[index];

    if (index === 0 && this._zerothIsAccum) {
        if (!gotAccum) {
            this._accum = value;
            this._gotAccum = gotAccum = true;
        }
        valuesPhase[index] = ((valuesPhaseIndex === 0)
            ? 1 : 2);
    } else if (index === -1) {
        if (!gotAccum) {
            this._accum = value;
            this._gotAccum = gotAccum = true;
        }
    } else {
        if (valuesPhaseIndex === 0) {
            valuesPhase[index] = 1;
        }
        else {
            valuesPhase[index] = 2;
            if (gotAccum) {
                this._accum = value;
            }
        }
    }
    if (!gotAccum) return;

    var callback = this._callback;
    var receiver = this._promise._boundTo;
    var ret;

    for (var i = this._reducingIndex; i < length; ++i) {
        valuesPhaseIndex = valuesPhase[i];
        if (valuesPhaseIndex === 2) {
            this._reducingIndex = i + 1;
            continue;
        }
        if (valuesPhaseIndex !== 1) return;
        value = values[i];
        if (value instanceof Promise) {
            value = value._target();
            if (value._isFulfilled()) {
                value = value._value();
            } else if (value._isPending()) {
                return;
            } else {
                value._unsetRejectionIsUnhandled();
                return this._reject(value._reason());
            }
        }

        this._promise._pushContext();
        if (isEach) {
            preservedValues.push(value);
            ret = tryCatch3(callback, receiver, value, i, length);
        }
        else {
            ret = tryCatch4(callback, receiver, this._accum, value, i, length);
        }
        this._promise._popContext();

        if (ret === errorObj) return this._reject(ret.e);

        var maybePromise = tryConvertToPromise(ret, this._promise);
        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            if (maybePromise._isPending()) {
                valuesPhase[i] = 4;
                return maybePromise._proxyPromiseArray(this, i);
            } else if (maybePromise._isFulfilled()) {
                ret = maybePromise._value();
            } else {
                maybePromise._unsetRejectionIsUnhandled();
                return this._reject(maybePromise._reason());
            }
        }

        this._reducingIndex = i + 1;
        this._accum = ret;
    }

    if (this._reducingIndex < length) return;
    this._resolve(isEach ? preservedValues : this._accum);
};

function reduce(promises, fn, initialValue, _each) {
    if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
    return array.promise();
}

Promise.prototype.reduce = function (fn, initialValue) {
    return reduce(this, fn, initialValue, null);
};

Promise.reduce = function (promises, fn, initialValue, _each) {
    return reduce(promises, fn, initialValue, _each);
};
};

},{"./util.js":36}],29:[function(require,module,exports){
(function (process){
"use strict";
var schedule;
if (typeof process === "object" && typeof process.version === "string") {
    schedule = parseInt(process.version.split(".")[1], 10) > 10
        ? setImmediate : process.nextTick;
}
else if (typeof MutationObserver !== "undefined") {
    schedule = function(fn) {
        var div = document.createElement("div");
        var observer = new MutationObserver(fn);
        observer.observe(div, {attributes: true});
        return function() { div.classList.toggle("foo"); };
    };
    schedule.isStatic = true;
}
else if (typeof setTimeout !== "undefined") {
    schedule = function (fn) {
        setTimeout(fn, 0);
    };
}
else {
    schedule = function() {
        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/m3OTXk\u000a");
    };
}
module.exports = schedule;

}).call(this,require('_process'))
},{"_process":39}],30:[function(require,module,exports){
"use strict";
module.exports =
    function(Promise, PromiseArray) {
var PromiseInspection = Promise.PromiseInspection;
var util = require("./util.js");

function SettledPromiseArray(values) {
    this.constructor$(values);
    this._promise._setIsSpreadable();
}
util.inherits(SettledPromiseArray, PromiseArray);

SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
    this._values[index] = inspection;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
    }
};

SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
    var ret = new PromiseInspection();
    ret._bitField = 268435456;
    ret._settledValue = value;
    this._promiseResolved(index, ret);
};
SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
    var ret = new PromiseInspection();
    ret._bitField = 134217728;
    ret._settledValue = reason;
    this._promiseResolved(index, ret);
};

Promise.settle = function (promises) {
    return new SettledPromiseArray(promises).promise();
};

Promise.prototype.settle = function () {
    return new SettledPromiseArray(this).promise();
};
};

},{"./util.js":36}],31:[function(require,module,exports){
"use strict";
module.exports =
function(Promise, PromiseArray, apiRejection) {
var util = require("./util.js");
var RangeError = require("./errors.js").RangeError;
var AggregateError = require("./errors.js").AggregateError;
var isArray = util.isArray;


function SomePromiseArray(values) {
    this.constructor$(values);
    this._howMany = 0;
    this._unwrap = false;
    this._initialized = false;
}
util.inherits(SomePromiseArray, PromiseArray);

SomePromiseArray.prototype._init = function () {
    if (!this._initialized) {
        return;
    }
    this._promise._setIsSpreadable();
    if (this._howMany === 0) {
        this._resolve([]);
        return;
    }
    this._init$(undefined, -5);
    var isArrayResolved = isArray(this._values);
    if (!this._isResolved() &&
        isArrayResolved &&
        this._howMany > this._canPossiblyFulfill()) {
        this._reject(this._getRangeError(this.length()));
    }
};

SomePromiseArray.prototype.init = function () {
    this._initialized = true;
    this._init();
};

SomePromiseArray.prototype.setUnwrap = function () {
    this._unwrap = true;
};

SomePromiseArray.prototype.howMany = function () {
    return this._howMany;
};

SomePromiseArray.prototype.setHowMany = function (count) {
    if (this._isResolved()) return;
    this._howMany = count;
};

SomePromiseArray.prototype._promiseFulfilled = function (value) {
    this._addFulfilled(value);
    if (this._fulfilled() === this.howMany()) {
        this._values.length = this.howMany();
        if (this.howMany() === 1 && this._unwrap) {
            this._resolve(this._values[0]);
        } else {
            this._resolve(this._values);
        }
    }

};
SomePromiseArray.prototype._promiseRejected = function (reason) {
    this._addRejected(reason);
    if (this.howMany() > this._canPossiblyFulfill()) {
        var e = new AggregateError();
        for (var i = this.length(); i < this._values.length; ++i) {
            e.push(this._values[i]);
        }
        this._reject(e);
    }
};

SomePromiseArray.prototype._fulfilled = function () {
    return this._totalResolved;
};

SomePromiseArray.prototype._rejected = function () {
    return this._values.length - this.length();
};

SomePromiseArray.prototype._addRejected = function (reason) {
    this._values.push(reason);
};

SomePromiseArray.prototype._addFulfilled = function (value) {
    this._values[this._totalResolved++] = value;
};

SomePromiseArray.prototype._canPossiblyFulfill = function () {
    return this.length() - this._rejected();
};

SomePromiseArray.prototype._getRangeError = function (count) {
    var message = "Input array must contain at least " +
            this._howMany + " items but contains only " + count + " items";
    return new RangeError(message);
};

SomePromiseArray.prototype._resolveEmptyArray = function () {
    this._reject(this._getRangeError(0));
};

function some(promises, howMany) {
    if ((howMany | 0) !== howMany || howMany < 0) {
        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/1wAmHx\u000a");
    }
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    if (promise.isRejected()) {
        return promise;
    }
    ret.setHowMany(howMany);
    ret.init();
    return promise;
}

Promise.some = function (promises, howMany) {
    return some(promises, howMany);
};

Promise.prototype.some = function (howMany) {
    return some(this, howMany);
};

Promise._SomePromiseArray = SomePromiseArray;
};

},{"./errors.js":11,"./util.js":36}],32:[function(require,module,exports){
"use strict";
module.exports = function(Promise) {
function PromiseInspection(promise) {
    if (promise !== undefined) {
        promise = promise._target();
        this._bitField = promise._bitField;
        this._settledValue = promise._isResolved()
            ? promise._settledValue
            : undefined;
    }
    else {
        this._bitField = 0;
        this._settledValue = undefined;
    }
}

PromiseInspection.prototype.value = function () {
    if (!this.isFulfilled()) {
        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/hc1DLj\u000a");
    }
    return this._settledValue;
};

PromiseInspection.prototype.error =
PromiseInspection.prototype.reason = function () {
    if (!this.isRejected()) {
        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/hPuiwB\u000a");
    }
    return this._settledValue;
};

PromiseInspection.prototype.isFulfilled =
Promise.prototype._isFulfilled = function () {
    return (this._bitField & 268435456) > 0;
};

PromiseInspection.prototype.isRejected =
Promise.prototype._isRejected = function () {
    return (this._bitField & 134217728) > 0;
};

PromiseInspection.prototype.isPending =
Promise.prototype._isPending = function () {
    return (this._bitField & 402653184) === 0;
};

PromiseInspection.prototype.isResolved =
Promise.prototype._isResolved = function () {
    return (this._bitField & 402653184) > 0;
};

Promise.prototype.isPending = function() {
    return this._target()._isPending();
};

Promise.prototype.isRejected = function() {
    return this._target()._isRejected();
};

Promise.prototype.isFulfilled = function() {
    return this._target()._isFulfilled();
};

Promise.prototype.isResolved = function() {
    return this._target()._isResolved();
};

Promise.prototype._value = function() {
    return this._settledValue;
};

Promise.prototype._reason = function() {
    return this._settledValue;
};

Promise.prototype.value = function() {
    var target = this._target();
    if (!target.isFulfilled()) {
        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/hc1DLj\u000a");
    }
    return target._settledValue;
};

Promise.prototype.reason = function() {
    var target = this._target();
    if (!target.isRejected()) {
        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/hPuiwB\u000a");
    }
    return target._settledValue;
};


Promise.PromiseInspection = PromiseInspection;
};

},{}],33:[function(require,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var util = require("./util.js");
var canAttachTrace = require("./errors.js").canAttachTrace;
var errorObj = util.errorObj;
var isObject = util.isObject;

function getThen(obj) {
    try {
        return obj.then;
    }
    catch(e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryConvertToPromise(obj, traceParent) {
    if (isObject(obj)) {
        if (obj instanceof Promise) {
            return obj;
        }
        else if (isAnyBluebirdPromise(obj)) {
            var ret = new Promise(INTERNAL);
            obj._then(
                ret._fulfillUnchecked,
                ret._rejectUncheckedCheckError,
                ret._progressUnchecked,
                ret,
                null
            );
            return ret;
        }
        var then = getThen(obj);
        if (then === errorObj) {
            if (traceParent !== undefined && canAttachTrace(then.e)) {
                traceParent._attachExtraTrace(then.e);
            }
            return Promise.reject(then.e);
        } else if (typeof then === "function") {
            return doThenable(obj, then, traceParent);
        }
    }
    return obj;
}

var hasProp = {}.hasOwnProperty;
function isAnyBluebirdPromise(obj) {
    return hasProp.call(obj, "_promise0");
}

function doThenable(x, then, traceParent) {
    var resolver = Promise.defer();
    var called = false;
    try {
        then.call(
            x,
            resolveFromThenable,
            rejectFromThenable,
            progressFromThenable
        );
    } catch(e) {
        if (!called) {
            called = true;
            var trace = canAttachTrace(e) ? e : new Error(util.toString(e));
            if (traceParent !== undefined) {
                traceParent._attachExtraTrace(trace);
            }
            resolver.promise._reject(e, trace);
        }
    }
    return resolver.promise;

    function resolveFromThenable(y) {
        if (called) return;
        called = true;

        if (x === y) {
            var e = Promise._makeSelfResolutionError();
            if (traceParent !== undefined) {
                traceParent._attachExtraTrace(e);
            }
            resolver.promise._reject(e, undefined);
            return;
        }
        resolver.resolve(y);
    }

    function rejectFromThenable(r) {
        if (called) return;
        called = true;
        var trace = canAttachTrace(r) ? r : new Error(util.toString(r));
        if (traceParent !== undefined) {
            traceParent._attachExtraTrace(trace);
        }
        resolver.promise._reject(r, trace);
    }

    function progressFromThenable(v) {
        if (called) return;
        var promise = resolver.promise;
        if (typeof promise._progress === "function") {
            promise._progress(v);
        }
    }
}

return tryConvertToPromise;
};

},{"./errors.js":11,"./util.js":36}],34:[function(require,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, tryConvertToPromise) {
var errors = require("./errors.js");
var TimeoutError = Promise.TimeoutError;

var afterTimeout = function (promise, message) {
    if (!promise.isPending()) return;
    if (typeof message !== "string") {
        message = "operation timed out";
    }
    var err = new TimeoutError(message);
    errors.markAsOriginatingFromRejection(err);
    promise._attachExtraTrace(err);
    promise._cancel(err);
};

var afterDelay = function (value, promise) {
    promise._fulfill(value);
};

var delay = Promise.delay = function (value, ms) {
    if (ms === undefined) {
        ms = value;
        value = undefined;
    }
    ms = +ms;
    var maybePromise = tryConvertToPromise(value, undefined);
    var promise = new Promise(INTERNAL);

    if (maybePromise instanceof Promise) {
        promise._propagateFrom(maybePromise, 4 | 1);
        promise._follow(maybePromise._target());
        return promise.then(function(value) {
            return Promise.delay(value, ms);
        });
    } else {
        setTimeout(function delayTimeout() {
            afterDelay(value, promise);
        }, ms);
    }
    return promise;
};

Promise.prototype.delay = function (ms) {
    return delay(this, ms);
};

function successClear(value) {
    var handle = this;
    if (handle instanceof Number) handle = +handle;
    clearTimeout(handle);
    return value;
}

function failureClear(reason) {
    var handle = this;
    if (handle instanceof Number) handle = +handle;
    clearTimeout(handle);
    throw reason;
}

Promise.prototype.timeout = function (ms, message) {
    var target = this._target();
    ms = +ms;
    var ret = new Promise(INTERNAL).cancellable();
    ret._propagateFrom(this, 4 | 1);
    ret._follow(target);
    var handle = setTimeout(function timeoutTimeout() {
        afterTimeout(ret, message);
    }, ms);
    return ret._then(successClear, failureClear, undefined, handle, undefined);
};

};

},{"./errors.js":11}],35:[function(require,module,exports){
"use strict";
module.exports = function (Promise, apiRejection, tryConvertToPromise,
    createContext) {
    var TypeError = require("./errors.js").TypeError;
    var inherits = require("./util.js").inherits;
    var PromiseInspection = Promise.PromiseInspection;

    function inspectionMapper(inspections) {
        var len = inspections.length;
        for (var i = 0; i < len; ++i) {
            var inspection = inspections[i];
            if (inspection.isRejected()) {
                return Promise.reject(inspection.error());
            }
            inspections[i] = inspection._settledValue;
        }
        return inspections;
    }

    function thrower(e) {
        setTimeout(function(){throw e;}, 0);
    }

    function castPreservingDisposable(thenable) {
        var maybePromise = tryConvertToPromise(thenable, undefined);
        if (maybePromise !== thenable &&
            typeof thenable._isDisposable === "function" &&
            typeof thenable._getDisposer === "function" &&
            thenable._isDisposable()) {
            maybePromise._setDisposable(thenable._getDisposer());
        }
        return maybePromise;
    }
    function dispose(resources, inspection) {
        var i = 0;
        var len = resources.length;
        var ret = Promise.defer();
        function iterator() {
            if (i >= len) return ret.resolve();
            var maybePromise = castPreservingDisposable(resources[i++]);
            if (maybePromise instanceof Promise &&
                maybePromise._isDisposable()) {
                try {
                    maybePromise = tryConvertToPromise(
                        maybePromise._getDisposer().tryDispose(inspection),
                        undefined);
                } catch (e) {
                    return thrower(e);
                }
                if (maybePromise instanceof Promise) {
                    return maybePromise._then(iterator, thrower,
                                              null, null, null);
                }
            }
            iterator();
        }
        iterator();
        return ret.promise;
    }

    function disposerSuccess(value) {
        var inspection = new PromiseInspection();
        inspection._settledValue = value;
        inspection._bitField = 268435456;
        return dispose(this, inspection).thenReturn(value);
    }

    function disposerFail(reason) {
        var inspection = new PromiseInspection();
        inspection._settledValue = reason;
        inspection._bitField = 134217728;
        return dispose(this, inspection).thenThrow(reason);
    }

    function Disposer(data, promise, context) {
        this._data = data;
        this._promise = promise;
        this._context = context;
    }

    Disposer.prototype.data = function () {
        return this._data;
    };

    Disposer.prototype.promise = function () {
        return this._promise;
    };

    Disposer.prototype.resource = function () {
        if (this.promise().isFulfilled()) {
            return this.promise().value();
        }
        return null;
    };

    Disposer.prototype.tryDispose = function(inspection) {
        var resource = this.resource();
        var context = this._context;
        if (context !== undefined) context._pushContext();
        var ret = resource !== null
            ? this.doDispose(resource, inspection) : null;
        if (context !== undefined) context._popContext();
        this._promise._unsetDisposable();
        this._data = null;
        return ret;
    };

    Disposer.isDisposer = function (d) {
        return (d != null &&
                typeof d.resource === "function" &&
                typeof d.tryDispose === "function");
    };

    function FunctionDisposer(fn, promise) {
        this.constructor$(fn, promise);
    }
    inherits(FunctionDisposer, Disposer);

    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
        var fn = this.data();
        return fn.call(resource, resource, inspection);
    };

    function maybeUnwrapDisposer(value) {
        if (Disposer.isDisposer(value)) {
            this.resources[this.index]._setDisposable(value);
            return value.promise();
        }
        return value;
    }

    Promise.using = function () {
        var len = arguments.length;
        if (len < 2) return apiRejection(
                        "you must pass at least 2 arguments to Promise.using");
        var fn = arguments[len - 1];
        if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
        len--;
        var resources = new Array(len);
        for (var i = 0; i < len; ++i) {
            var resource = arguments[i];
            if (Disposer.isDisposer(resource)) {
                var disposer = resource;
                resource = resource.promise();
                resource._setDisposable(disposer);
            } else {
                var maybePromise = tryConvertToPromise(resource, undefined);
                if (maybePromise instanceof Promise) {
                    resource =
                        maybePromise._then(maybeUnwrapDisposer, null, null, {
                            resources: resources,
                            index: i
                    }, undefined);
                }
            }
            resources[i] = resource;
        }

        var promise = Promise.settle(resources)
            .then(inspectionMapper)
            .then(function(vals) {
                promise._pushContext();
                var ret;
                try {
                    ret = fn.apply(undefined, vals);
                } finally {
                    promise._popContext();
                }
                return ret;
            })
            ._then(
                disposerSuccess, disposerFail, undefined, resources, undefined);
        return promise;
    };

    Promise.prototype._setDisposable = function (disposer) {
        this._bitField = this._bitField | 262144;
        this._disposer = disposer;
    };

    Promise.prototype._isDisposable = function () {
        return (this._bitField & 262144) > 0;
    };

    Promise.prototype._getDisposer = function () {
        return this._disposer;
    };

    Promise.prototype._unsetDisposable = function () {
        this._bitField = this._bitField & (~262144);
        this._disposer = undefined;
    };

    Promise.prototype.disposer = function (fn) {
        if (typeof fn === "function") {
            return new FunctionDisposer(fn, this, createContext());
        }
        throw new TypeError();
    };

};

},{"./errors.js":11,"./util.js":36}],36:[function(require,module,exports){
"use strict";
var es5 = require("./es5.js");
var haveGetters = (function(){
    try {
        var o = {};
        es5.defineProperty(o, "f", {
            get: function () {
                return 3;
            }
        });
        return o.f === 3;
    }
    catch (e) {
        return false;
    }

})();
var canEvaluate = typeof navigator == "undefined";
var errorObj = {e: {}};
function tryCatch0(fn, receiver) {
    try { return fn.call(receiver); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch1(fn, receiver, arg) {
    try { return fn.call(receiver, arg); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch2(fn, receiver, arg, arg2) {
    try { return fn.call(receiver, arg, arg2); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch3(fn, receiver, arg, arg2, arg3) {
    try { return fn.call(receiver, arg, arg2, arg3); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch4(fn, receiver, arg, arg2, arg3, arg4) {
    try { return fn.call(receiver, arg, arg2, arg3, arg4); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatchApply(fn, args, receiver) {
    try { return fn.apply(receiver, args); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

var inherits = function(Child, Parent) {
    var hasProp = {}.hasOwnProperty;

    function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
            if (hasProp.call(Parent.prototype, propertyName) &&
                propertyName.charAt(propertyName.length-1) !== "$"
           ) {
                this[propertyName + "$"] = Parent.prototype[propertyName];
            }
        }
    }
    T.prototype = Parent.prototype;
    Child.prototype = new T();
    return Child.prototype;
};

function asString(val) {
    return typeof val === "string" ? val : ("" + val);
}

function isPrimitive(val) {
    return val == null || val === true || val === false ||
        typeof val === "string" || typeof val === "number";

}

function isObject(value) {
    return !isPrimitive(value);
}

function maybeWrapAsError(maybeError) {
    if (!isPrimitive(maybeError)) return maybeError;

    return new Error(asString(maybeError));
}

function withAppended(target, appendee) {
    var len = target.length;
    var ret = new Array(len + 1);
    var i;
    for (i = 0; i < len; ++i) {
        ret[i] = target[i];
    }
    ret[i] = appendee;
    return ret;
}

function getDataPropertyOrDefault(obj, key, defaultValue) {
    if (es5.isES5) {
        var desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc != null) {
            return desc.get == null && desc.set == null
                    ? desc.value
                    : defaultValue;
        }
    } else {
        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
    }
}

function notEnumerableProp(obj, name, value) {
    if (isPrimitive(obj)) return obj;
    var descriptor = {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
    };
    es5.defineProperty(obj, name, descriptor);
    return obj;
}


var wrapsPrimitiveReceiver = (function() {
    return this !== "string";
}).call("string");

function thrower(r) {
    throw r;
}

var inheritedDataKeys = (function() {
    if (es5.isES5) {
        return function(obj, opts) {
            var ret = [];
            var visitedKeys = Object.create(null);
            var getKeys = Object(opts).includeHidden
                ? Object.getOwnPropertyNames
                : Object.keys;
            while (obj != null) {
                var keys;
                try {
                    keys = getKeys(obj);
                } catch (e) {
                    return ret;
                }
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (visitedKeys[key]) continue;
                    visitedKeys[key] = true;
                    var desc = Object.getOwnPropertyDescriptor(obj, key);
                    if (desc != null && desc.get == null && desc.set == null) {
                        ret.push(key);
                    }
                }
                obj = es5.getPrototypeOf(obj);
            }
            return ret;
        };
    } else {
        return function(obj) {
            var ret = [];
            /*jshint forin:false */
            for (var key in obj) {
                ret.push(key);
            }
            return ret;
        };
    }

})();

function isClass(fn) {
    try {
        if (typeof fn === "function") {
            var keys = es5.keys(fn.prototype);
            return keys.length > 0 &&
                   !(keys.length === 1 && keys[0] === "constructor");
        }
        return false;
    } catch (e) {
        return false;
    }
}

function toFastProperties(obj) {
    /*jshint -W027*/
    function f() {}
    f.prototype = obj;
    return f;
    eval(obj);
}

var rident = /^[a-z$_][a-z$_0-9]*$/i;
function isIdentifier(str) {
    return rident.test(str);
}

function filledRange(count, prefix, suffix) {
    var ret = new Array(count);
    for(var i = 0; i < count; ++i) {
        ret[i] = prefix + i + suffix;
    }
    return ret;
}

function safeToString(obj) {
    try {
        return obj + "";
    } catch (e) {
        return "[no string representation]";
    }
}

var ret = {
    isClass: isClass,
    isIdentifier: isIdentifier,
    inheritedDataKeys: inheritedDataKeys,
    getDataPropertyOrDefault: getDataPropertyOrDefault,
    thrower: thrower,
    isArray: es5.isArray,
    haveGetters: haveGetters,
    notEnumerableProp: notEnumerableProp,
    isPrimitive: isPrimitive,
    isObject: isObject,
    canEvaluate: canEvaluate,
    errorObj: errorObj,
    tryCatch0: tryCatch0,
    tryCatch1: tryCatch1,
    tryCatch2: tryCatch2,
    tryCatch3: tryCatch3,
    tryCatch4: tryCatch4,
    tryCatchApply: tryCatchApply,
    inherits: inherits,
    withAppended: withAppended,
    asString: asString,
    maybeWrapAsError: maybeWrapAsError,
    wrapsPrimitiveReceiver: wrapsPrimitiveReceiver,
    toFastProperties: toFastProperties,
    filledRange: filledRange,
    toString: safeToString
};
try {throw new Error(); } catch (e) {ret.lastLineError = e;}
module.exports = ret;

},{"./es5.js":13}],37:[function(require,module,exports){

},{}],38:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":39}],39:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
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

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],40:[function(require,module,exports){
// doT.js
// 2011-2014, Laura Doktorova, https://github.com/olado/doT
// Licensed under the MIT license.

(function() {
	"use strict";

	var doT = {
		version: "1.0.3",
		templateSettings: {
			evaluate:    /\{\{([\s\S]+?(\}?)+)\}\}/g,
			interpolate: /\{\{=([\s\S]+?)\}\}/g,
			encode:      /\{\{!([\s\S]+?)\}\}/g,
			use:         /\{\{#([\s\S]+?)\}\}/g,
			useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
			define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
			defineParams:/^\s*([\w$]+):([\s\S]+)/,
			conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
			iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
			varname:	"it",
			strip:		true,
			append:		true,
			selfcontained: false,
			doNotSkipEncoded: false
		},
		template: undefined, //fn, compile template
		compile:  undefined  //fn, for express
	}, _globals;

	doT.encodeHTMLSource = function(doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	};

	_globals = (function(){ return this || (0,eval)("this"); }());

	if (typeof module !== "undefined" && module.exports) {
		module.exports = doT;
	} else if (typeof define === "function" && define.amd) {
		define(function(){return doT;});
	} else {
		_globals.doT = doT;
	}

	var startend = {
		append: { start: "'+(",      end: ")+'",      startencode: "'+encodeHTML(" },
		split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
	}, skip = /$^/;

	function resolveDefs(c, block, def) {
		return ((typeof block === "string") ? block : block.toString())
		.replace(c.define || skip, function(m, code, assign, value) {
			if (code.indexOf("def.") === 0) {
				code = code.substring(4);
			}
			if (!(code in def)) {
				if (assign === ":") {
					if (c.defineParams) value.replace(c.defineParams, function(m, param, v) {
						def[code] = {arg: param, text: v};
					});
					if (!(code in def)) def[code]= value;
				} else {
					new Function("def", "def['"+code+"']=" + value)(def);
				}
			}
			return "";
		})
		.replace(c.use || skip, function(m, code) {
			if (c.useParams) code = code.replace(c.useParams, function(m, s, d, param) {
				if (def[d] && def[d].arg && param) {
					var rw = (d+":"+param).replace(/'|\\/g, "_");
					def.__exp = def.__exp || {};
					def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
					return s + "def.__exp['"+rw+"']";
				}
			});
			var v = new Function("def", "return " + code)(def);
			return v ? resolveDefs(c, v, def) : v;
		});
	}

	function unescape(code) {
		return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
	}

	doT.template = function(tmpl, c, def) {
		c = c || doT.templateSettings;
		var cse = c.append ? startend.append : startend.split, needhtmlencode, sid = 0, indv,
			str  = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

		str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
					.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""): str)
			.replace(/'|\\/g, "\\$&")
			.replace(c.interpolate || skip, function(m, code) {
				return cse.start + unescape(code) + cse.end;
			})
			.replace(c.encode || skip, function(m, code) {
				needhtmlencode = true;
				return cse.startencode + unescape(code) + cse.end;
			})
			.replace(c.conditional || skip, function(m, elsecase, code) {
				return elsecase ?
					(code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
					(code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
			})
			.replace(c.iterate || skip, function(m, iterate, vname, iname) {
				if (!iterate) return "';} } out+='";
				sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
				return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
					+vname+"=arr"+sid+"["+indv+"+=1];out+='";
			})
			.replace(c.evaluate || skip, function(m, code) {
				return "';" + unescape(code) + "out+='";
			})
			+ "';return out;")
			.replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
			.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
			//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

		if (needhtmlencode) {
			if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
			str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("
				+ doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));"
				+ str;
		}
		try {
			return new Function(c.varname, str);
		} catch (e) {
			if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
			throw e;
		}
	};

	doT.compile = function(tmpl, def) {
		return doT.template(tmpl, null, def);
	};
}());

},{}],41:[function(require,module,exports){
/* doT + auto-compilation of doT templates
 *
 * 2012, Laura Doktorova, https://github.com/olado/doT
 * Licensed under the MIT license
 *
 * Compiles .def, .dot, .jst files found under the specified path.
 * It ignores sub-directories.
 * Template files can have multiple extensions at the same time.
 * Files with .def extension can be included in other files via {{#def.name}}
 * Files with .dot extension are compiled into functions with the same name and
 * can be accessed as renderer.filename
 * Files with .jst extension are compiled into .js files. Produced .js file can be
 * loaded as a commonJS, AMD module, or just installed into a global variable
 * (default is set to window.render).
 * All inline defines defined in the .jst file are
 * compiled into separate functions and are available via _render.filename.definename
 *
 * Basic usage:
 * var dots = require("dot").process({path: "./views"});
 * dots.mytemplate({foo:"hello world"});
 *
 * The above snippet will:
 * 1. Compile all templates in views folder (.dot, .def, .jst)
 * 2. Place .js files compiled from .jst templates into the same folder.
 *    These files can be used with require, i.e. require("./views/mytemplate").
 * 3. Return an object with functions compiled from .dot templates as its properties.
 * 4. Render mytemplate template.
 */

var fs = require("fs"),
	doT = module.exports = require("./doT");

doT.process = function(options) {
	//path, destination, global, rendermodule, templateSettings
	return new InstallDots(options).compileAll();
};

function InstallDots(o) {
	this.__path 		= o.path || "./";
	if (this.__path[this.__path.length-1] !== '/') this.__path += '/';
	this.__destination	= o.destination || this.__path;
	if (this.__destination[this.__destination.length-1] !== '/') this.__destination += '/';
	this.__global		= o.global || "window.render";
	this.__rendermodule	= o.rendermodule || {};
	this.__settings 	= o.templateSettings ? copy(o.templateSettings, copy(doT.templateSettings)) : undefined;
	this.__includes		= {};
}

InstallDots.prototype.compileToFile = function(path, template, def) {
	def = def || {};
	var modulename = path.substring(path.lastIndexOf("/")+1, path.lastIndexOf("."))
		, defs = copy(this.__includes, copy(def))
		, settings = this.__settings || doT.templateSettings
		, compileoptions = copy(settings)
		, defaultcompiled = doT.template(template, settings, defs)
		, exports = []
		, compiled = ""
		, fn;

	for (var property in defs) {
		if (defs[property] !== def[property] && defs[property] !== this.__includes[property]) {
			fn = undefined;
			if (typeof defs[property] === 'string') {
				fn = doT.template(defs[property], settings, defs);
			} else if (typeof defs[property] === 'function') {
				fn = defs[property];
			} else if (defs[property].arg) {
				compileoptions.varname = defs[property].arg;
				fn = doT.template(defs[property].text, compileoptions, defs);
			}
			if (fn) {
				compiled += fn.toString().replace('anonymous', property);
				exports.push(property);
			}
		}
	}
	compiled += defaultcompiled.toString().replace('anonymous', modulename);
	fs.writeFileSync(path, "(function(){" + compiled
		+ "var itself=" + modulename + ", _encodeHTML=(" + doT.encodeHTMLSource.toString() + "(" + (settings.doNotSkipEncoded || '') + "));"
		+ addexports(exports)
		+ "if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {"
		+ this.__global + "=" + this.__global + "||{};" + this.__global + "['" + modulename + "']=itself;}}());");
};

function addexports(exports) {
	for (var ret ='', i=0; i< exports.length; i++) {
		ret += "itself." + exports[i]+ "=" + exports[i]+";";
	}
	return ret;
}

function copy(o, to) {
	to = to || {};
	for (var property in o) {
		to[property] = o[property];
	}
	return to;
}

function readdata(path) {
	var data = fs.readFileSync(path);
	if (data) return data.toString();
	console.log("problems with " + path);
}

InstallDots.prototype.compilePath = function(path) {
	var data = readdata(path);
	if (data) {
		return doT.template(data,
					this.__settings || doT.templateSettings,
					copy(this.__includes));
	}
};

InstallDots.prototype.compileAll = function() {
	console.log("Compiling all doT templates...");

	var defFolder = this.__path,
		sources = fs.readdirSync(defFolder),
		k, l, name;

	for( k = 0, l = sources.length; k < l; k++) {
		name = sources[k];
		if (/\.def(\.dot|\.jst)?$/.test(name)) {
			console.log("Loaded def " + name);
			this.__includes[name.substring(0, name.indexOf('.'))] = readdata(defFolder + name);
		}
	}

	for( k = 0, l = sources.length; k < l; k++) {
		name = sources[k];
		if (/\.dot(\.def|\.jst)?$/.test(name)) {
			console.log("Compiling " + name + " to function");
			this.__rendermodule[name.substring(0, name.indexOf('.'))] = this.compilePath(defFolder + name);
		}
		if (/\.jst(\.dot|\.def)?$/.test(name)) {
			console.log("Compiling " + name + " to file");
			this.compileToFile(this.__destination + name.substring(0, name.indexOf('.')) + '.js',
					readdata(defFolder + name));
		}
	}
	return this.__rendermodule;
};

},{"./doT":40,"fs":37}],42:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * The available render types
 * @enum {string}
 * @alias ImglyKit.RenderType
 */
var RenderType = exports.RenderType = {
  IMAGE: "image",
  DATAURL: "data-url"
};

/**
 * The available output image formats
 * @enum {string}
 * @alias ImglyKit.ImageFormat
 */
var ImageFormat = exports.ImageFormat = {
  PNG: "image/png",
  JPEG: "image/jpeg"
};
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{}],43:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var bluebird = _interopRequire(require("bluebird"));

var RenderImage = _interopRequire(require("./lib/render-image"));

var ImageExporter = _interopRequire(require("./lib/image-exporter"));

var _constants = require("./constants");

var RenderType = _constants.RenderType;
var ImageFormat = _constants.ImageFormat;

var Utils = _interopRequire(require("./lib/utils"));

// Default UIs

var NightUI = _interopRequire(require("./ui/night/ui"));

// Don't catch errors
bluebird.onPossiblyUnhandledRejection(function (error) {
  throw error;
});

/**
 * @class
 * @param {Object} options
 * @param {HTMLElement} [options.container] - Specifies where the UI should be
 *                                          added to. If none is given, the UI
 *                                          will automatically be disabled.
 * @param {Image} options.image - The source image
 */

var ImglyKit = (function () {
  function ImglyKit(options) {
    _classCallCheck(this, ImglyKit);

    // `options` is required
    if (typeof options === "undefined") throw new Error("No options given.");

    // Set default options
    options = _.defaults(options, {
      assetsUrl: "assets",
      container: null,
      ui: true,
      renderOnWindowResize: false
    });

    /**
     * @type {Object}
     * @private
     */
    this._options = options;

    // `options.image` is required
    if (typeof this._options.image === "undefined") throw new Error("`options.image` is undefined.");

    /**
     * The stack of {@link Operation} instances that will be used
     * to render the final Image
     * @type {Array.<ImglyKit.Operation>}
     */
    this.operationsStack = [];

    /**
     * The registered UI types that can be selected via the `ui` option
     * @type {Object.<String, UI>}
     * @private
     */
    this._registeredUIs = {};

    // Register the default UIs
    this._registerUIs();

    /**
     * The registered operations
     * @type {Object.<String, ImglyKit.Operation>}
     */
    this._registeredOperations = {};

    // Register the default operations
    this._registerOperations();

    if (this._options.ui) {
      this._initUI();
      if (this._options.renderOnWindowResize) {
        this._handleWindowResize();
      }
    }
  }

  _prototypeProperties(ImglyKit, null, {
    render: {

      /**
       * Renders the image
       * @param  {ImglyKit.RenderType} [renderType=ImglyKit.RenderType.DATA_URL] - The output type
       * @param  {ImglyKit.ImageFormat} [imageFormat=ImglyKit.ImageFormat.PNG] - The output image format
       * @param  {string} [dimensions] - The final dimensions of the image
       * @return {Promise}
       */

      value: function render(renderType, imageFormat, dimensions) {
        var settings = ImageExporter.validateSettings(renderType, imageFormat);

        renderType = settings.renderType;
        imageFormat = settings.imageFormat;

        // Create a RenderImage
        var renderImage = new RenderImage(this._options.image, this.operationsStack, dimensions, this._options.renderer);

        // Set all operations to dirty, since we have another webgl renderer
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.operationsStack[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var operation = _step.value;

            if (!operation) continue;
            operation.dirty = true;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        // Initiate image rendering
        return renderImage.render().then(function () {
          var canvas = renderImage.getRenderer().getCanvas();
          return ImageExporter["export"](canvas, renderType, imageFormat);
        });
      },
      writable: true,
      configurable: true
    },
    reset: {

      /**
       * Resets all custom and selected operations
       */

      value: function reset() {},
      writable: true,
      configurable: true
    },
    getAssetPath: {

      /**
       * Returns the asset path for the given filename
       * @param  {String} asset
       * @return {String}
       */

      value: function getAssetPath(asset) {
        var isBrowser = typeof window !== "undefined";
        if (isBrowser) {
          /* istanbul ignore next */
          return this._options.assetsUrl + "/" + asset;
        } else {
          var path = require("path");
          return path.resolve(this._options.assetsUrl, asset);
        }
      },
      writable: true,
      configurable: true
    },
    _handleWindowResize: {

      /**
       * If `options.renderOnWindowResize` is set to true, this function
       * will re-render the canvas with a slight delay so that it won't
       * cause lagging of the resize
       * @private
       */

      value: function _handleWindowResize() {
        var _this = this;

        var timer = null;
        window.addEventListener("resize", function () {
          if (timer !== null) {
            clearTimeout(timer);
          }

          timer = setTimeout(function () {
            timer = null;
            _this.ui.render();
          }, 300);
        });
      },
      writable: true,
      configurable: true
    },
    _registerUIs: {

      /**
       * Registers all default UIs
       * @private
       */

      value: function _registerUIs() {
        this.registerUI(NightUI);
      },
      writable: true,
      configurable: true
    },
    _registerOperations: {

      /**
       * Registers all default operations
       * @private
       */

      value: function _registerOperations() {
        for (var operationName in ImglyKit.Operations) {
          this.registerOperation(ImglyKit.Operations[operationName]);
        }
      },
      writable: true,
      configurable: true
    },
    registerOperation: {

      /**
       * Registers the given operation
       * @param {ImglyKit.Operation} operation - The operation class
       */

      value: function registerOperation(operation) {
        this._registeredOperations[operation.prototype.identifier] = operation;
      },
      writable: true,
      configurable: true
    },
    registerUI: {

      /**
       * Registers the given UI
       * @param {UI} ui
       */

      value: function registerUI(ui) {
        this._registeredUIs[ui.prototype.identifier] = ui;
      },
      writable: true,
      configurable: true
    },
    _initUI: {

      /**
       * Initializes the UI
       * @private
       */
      /* istanbul ignore next */

      value: function _initUI() {
        var UI;

        if (this._options.ui === true) {
          // Select the first UI by default
          UI = Utils.values(this._registeredUIs)[0];
        } else {
          // Select the UI with the given identifier
          UI = this._registeredUIs[this._options.ui];
        }

        // Check if UI exists
        if (typeof UI === "undefined") {
          throw new Error("ImglyKit: Unknown UI: " + this._options.ui);
        }

        /**
         * @type {ImglyKit.UI}
         */
        this.ui = new UI(this, this._options);
      },
      writable: true,
      configurable: true
    },
    registeredOperations: {
      get: function () {
        return this._registeredOperations;
      },
      configurable: true
    },
    run: {
      value: function run() {
        if (typeof this.ui !== "undefined") {
          this.ui.run();
        }
      },
      writable: true,
      configurable: true
    }
  });

  return ImglyKit;
})();

/**
 * The current version of the SDK
 * @name ImglyKit.version
 * @internal Keep in sync with package.json
 */
ImglyKit.version = "2.0.0-beta2";

// Exposed classes
ImglyKit.RenderImage = RenderImage;
ImglyKit.Color = require("./lib/color");
ImglyKit.Operation = require("./operations/operation");
ImglyKit.Operations = {};
ImglyKit.Operations.Filters = require("./operations/filters-operation");
ImglyKit.Operations.Crop = require("./operations/crop-operation");
ImglyKit.Operations.Rotation = require("./operations/rotation-operation");
ImglyKit.Operations.Saturation = require("./operations/saturation-operation");
ImglyKit.Operations.Contrast = require("./operations/contrast-operation");
ImglyKit.Operations.Brightness = require("./operations/brightness-operation");
ImglyKit.Operations.Flip = require("./operations/flip-operation");
ImglyKit.Operations.TiltShift = require("./operations/tilt-shift-operation");
ImglyKit.Operations.RadialBlur = require("./operations/radial-blur-operation");
ImglyKit.Operations.Text = require("./operations/text-operation");
ImglyKit.Operations.Stickers = require("./operations/stickers-operation");
ImglyKit.Operations.Frames = require("./operations/frames-operation");

ImglyKit.Filters = {};
ImglyKit.Filters.A15 = require("./operations/filters/a15-filter");
ImglyKit.Filters.Breeze = require("./operations/filters/breeze-filter");
ImglyKit.Filters.BW = require("./operations/filters/bw-filter");
ImglyKit.Filters.BWHard = require("./operations/filters/bwhard-filter");
ImglyKit.Filters.Celsius = require("./operations/filters/celsius-filter");
ImglyKit.Filters.Chest = require("./operations/filters/chest-filter");
ImglyKit.Filters.Fixie = require("./operations/filters/fixie-filter");
ImglyKit.Filters.Food = require("./operations/filters/food-filter");
ImglyKit.Filters.Fridge = require("./operations/filters/fridge-filter");
ImglyKit.Filters.Front = require("./operations/filters/front-filter");
ImglyKit.Filters.Glam = require("./operations/filters/glam-filter");
ImglyKit.Filters.Gobblin = require("./operations/filters/gobblin-filter");
ImglyKit.Filters.K1 = require("./operations/filters/k1-filter");
ImglyKit.Filters.K2 = require("./operations/filters/k2-filter");
ImglyKit.Filters.K6 = require("./operations/filters/k6-filter");
ImglyKit.Filters.KDynamic = require("./operations/filters/kdynamic-filter");
ImglyKit.Filters.Lenin = require("./operations/filters/lenin-filter");
ImglyKit.Filters.Lomo = require("./operations/filters/lomo-filter");
ImglyKit.Filters.Mellow = require("./operations/filters/mellow-filter");
ImglyKit.Filters.Morning = require("./operations/filters/morning-filter");
ImglyKit.Filters.Orchid = require("./operations/filters/orchid-filter");
ImglyKit.Filters.Pola = require("./operations/filters/pola-filter");
ImglyKit.Filters.Pola669 = require("./operations/filters/pola669-filter");
ImglyKit.Filters.Quozi = require("./operations/filters/quozi-filter");
ImglyKit.Filters.Semired = require("./operations/filters/semired-filter");
ImglyKit.Filters.Sunny = require("./operations/filters/sunny-filter");
ImglyKit.Filters.Texas = require("./operations/filters/texas-filter");
ImglyKit.Filters.X400 = require("./operations/filters/x400-filter");

// Exposed constants
ImglyKit.RenderType = RenderType;
ImglyKit.ImageFormat = ImageFormat;
ImglyKit.Vector2 = require("./lib/math/vector2");

module.exports = ImglyKit;

},{"./constants":42,"./lib/color":44,"./lib/image-exporter":48,"./lib/math/vector2":49,"./lib/render-image":50,"./lib/utils":51,"./operations/brightness-operation":52,"./operations/contrast-operation":53,"./operations/crop-operation":54,"./operations/filters-operation":55,"./operations/filters/a15-filter":56,"./operations/filters/breeze-filter":57,"./operations/filters/bw-filter":58,"./operations/filters/bwhard-filter":59,"./operations/filters/celsius-filter":60,"./operations/filters/chest-filter":61,"./operations/filters/fixie-filter":63,"./operations/filters/food-filter":64,"./operations/filters/fridge-filter":65,"./operations/filters/front-filter":66,"./operations/filters/glam-filter":67,"./operations/filters/gobblin-filter":68,"./operations/filters/k1-filter":70,"./operations/filters/k2-filter":71,"./operations/filters/k6-filter":72,"./operations/filters/kdynamic-filter":73,"./operations/filters/lenin-filter":74,"./operations/filters/lomo-filter":75,"./operations/filters/mellow-filter":76,"./operations/filters/morning-filter":77,"./operations/filters/orchid-filter":78,"./operations/filters/pola-filter":79,"./operations/filters/pola669-filter":80,"./operations/filters/quozi-filter":94,"./operations/filters/semired-filter":95,"./operations/filters/sunny-filter":96,"./operations/filters/texas-filter":97,"./operations/filters/x400-filter":98,"./operations/flip-operation":99,"./operations/frames-operation":100,"./operations/operation":101,"./operations/radial-blur-operation":102,"./operations/rotation-operation":103,"./operations/saturation-operation":104,"./operations/stickers-operation":105,"./operations/text-operation":106,"./operations/tilt-shift-operation":107,"./ui/night/ui":131,"bluebird":4,"lodash":"lodash","path":38}],44:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Represents a color
 * @class
 * @alias ImglyKit.Color
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} [a]
 * @private
 */

var Color = (function () {
  function Color(r, g, b, a) {
    _classCallCheck(this, Color);

    if (typeof a === "undefined") a = 1;

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  _prototypeProperties(Color, null, {
    toRGBA: {

      /**
       * Returns an rgba() representation of this color
       * @return {String}
       */

      value: function toRGBA() {
        var colors = [Math.round(this.r * 255), Math.round(this.g * 255), Math.round(this.b * 255), this.a];
        return "rgba(" + colors.join(",") + ")";
      },
      writable: true,
      configurable: true
    },
    toHex: {

      /**
       * Returns a hex representation of this color
       * @return {String}
       */

      value: function toHex() {
        var components = [this._componentToHex(Math.round(this.r * 255)), this._componentToHex(Math.round(this.g * 255)), this._componentToHex(Math.round(this.b * 255))];
        return "#" + components.join("");
      },
      writable: true,
      configurable: true
    },
    toGLColor: {

      /**
       * Returns an array with 4 values (0...1)
       * @return {Array.<Number>}
       */

      value: function toGLColor() {
        return [this.r, this.g, this.b, this.a];
      },
      writable: true,
      configurable: true
    },
    toRGBGLColor: {

      /**
       * Returns an array with 3 values (0...1)
       * @return {Array.<Number>}
       */

      value: function toRGBGLColor() {
        return [this.r, this.g, this.b];
      },
      writable: true,
      configurable: true
    },
    toHSV: {

      /**
       * Converts the RGB value to HSV
       * @return {Array.<Number>}
       */

      value: function toHSV() {
        var max = Math.max(this.r, this.g, this.b);
        var min = Math.min(this.r, this.g, this.b);
        var h = undefined,
            s = undefined,
            v = max;
        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max == min) {
          h = 0; // achromatic
        } else {
          switch (max) {
            case this.r:
              h = (this.g - this.b) / d + (this.g < this.b ? 6 : 0);
              break;
            case this.g:
              h = (this.b - this.r) / d + 2;
              break;
            case this.b:
              h = (this.r - this.g) / d + 4;
              break;
          }
          h /= 6;
        }

        return [h, s, v];
      },
      writable: true,
      configurable: true
    },
    fromHSV: {

      /**
       * Sets the RGB values of this color to match the given HSV values
       * @param {Number} h
       * @param {Number} s
       * @param {Number} v
       */

      value: function fromHSV(h, s, v) {
        var _ref = this;

        var r = _ref.r;
        var g = _ref.g;
        var b = _ref.b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6) {
          case 0:
            r = v, g = t, b = p;break;
          case 1:
            r = q, g = v, b = p;break;
          case 2:
            r = p, g = v, b = t;break;
          case 3:
            r = p, g = q, b = v;break;
          case 4:
            r = t, g = p, b = v;break;
          case 5:
            r = v, g = p, b = q;break;
        }

        this.r = r;
        this.g = g;
        this.b = b;
      },
      writable: true,
      configurable: true
    },
    clone: {

      /**
       * Returns a clone of the current color
       * @return {Color}
       */

      value: function clone() {
        return new Color(this.r, this.g, this.b, this.a);
      },
      writable: true,
      configurable: true
    },
    _componentToHex: {

      /**
       * Returns the given number as hex
       * @param  {Number} component
       * @return {String}
       * @private
       */

      value: function _componentToHex(component) {
        var hex = component.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      },
      writable: true,
      configurable: true
    },
    toString: {

      /**
       * Returns the string representation of this color
       * @returns {String}
       */

      value: function toString() {
        return "Color(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
      },
      writable: true,
      configurable: true
    }
  });

  return Color;
})();

module.exports = Color;

},{}],45:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * EventEmitter (ES6) from:
 * https://gist.github.com/bloodyowl/41b1de3388c626796eca
 */

var DEFAULT_MAX_LISTENERS = 12;

function error(message) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  console.error.apply(console, [message].concat(args));
  console.trace();
}

var EventEmitter = (function () {
  function EventEmitter() {
    _classCallCheck(this, EventEmitter);

    this._maxListeners = DEFAULT_MAX_LISTENERS;
    this._events = {};
  }

  _prototypeProperties(EventEmitter, null, {
    on: {
      value: function on(type, listener) {
        if (typeof listener != "function") {
          throw new TypeError();
        }

        var listeners = this._events[type] || (this._events[type] = []);
        if (listeners.indexOf(listener) != -1) {
          return this;
        }
        listeners.push(listener);

        if (listeners.length > this._maxListeners) {
          error("possible memory leak, added %i %s listeners, " + "use EventEmitter#setMaxListeners(number) if you " + "want to increase the limit (%i now)", listeners.length, type, this._maxListeners);
        }
        return this;
      },
      writable: true,
      configurable: true
    },
    once: {
      value: function once(type, listener) {
        var eventsInstance = this;
        function onceCallback() {
          eventsInstance.off(type, onceCallback);
          listener.apply(null, arguments);
        }
        return this.on(type, onceCallback);
      },
      writable: true,
      configurable: true
    },
    off: {
      value: function off(type) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        if (args.length === 0) {
          this._events[type] = null;
        }

        var listener = arguments[1];
        if (typeof listener != "function") {
          throw new TypeError();
        }

        var listeners = this._events[type];
        if (!listeners || !listeners.length) {
          return this;
        }

        var indexOfListener = listeners.indexOf(listener);
        if (indexOfListener == -1) {
          return this;
        }

        listeners.splice(indexOfListener, 1);
        return this;
      },
      writable: true,
      configurable: true
    },
    emit: {
      value: function emit(type) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var listeners = this._events[type];
        if (!listeners || !listeners.length) {
          return false;
        }

        listeners.forEach(function (fn) {
          return fn.apply(null, args);
        });

        return true;
      },
      writable: true,
      configurable: true
    },
    setMaxListeners: {
      value: function setMaxListeners(newMaxListeners) {
        if (parseInt(newMaxListeners) !== newMaxListeners) {
          throw new TypeError();
        }

        this._maxListeners = newMaxListeners;
      },
      writable: true,
      configurable: true
    }
  });

  return EventEmitter;
})();

module.exports = EventEmitter;

},{}],46:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Helper function to correctly set up the prototype chain
 * Based on the backbone.js extend function:
 * https://github.com/jashkenas/backbone/blob/master/backbone.js
 * @param  {Object} prototypeProperties
 * @param  {Object} classProperties
 * @return {Object}
 */
module.exports = function (prototypeProperties, classProperties) {
  /*jshint validthis:true*/
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (prototypeProperties && prototypeProperties.hasOwnProperty("constructor")) {
    child = prototypeProperties.constructor;
  } else {
    child = function () {
      return parent.apply(this, arguments);
    };
  }

  // Add static properties to the constructor function, if supplied.
  var key;
  for (key in parent) {
    child[key] = parent[key];
  }
  if (typeof classProperties !== "undefined") {
    for (key in classProperties) {
      child[key] = classProperties[key];
    }
  }

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  var Surrogate = function Surrogate() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (prototypeProperties) {
    for (key in prototypeProperties) {
      child.prototype[key] = prototypeProperties[key];
    }
  }

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  return child;
};

},{}],47:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Parses the dimensions string and provides calculation functions
 * @class
 * @alias ImglyKit.ImageDimensions
 * @param {string} dimensions
 * @private
 */

var ImageDimensions = (function () {
  function ImageDimensions(dimensions) {
    _classCallCheck(this, ImageDimensions);

    /**
     * The available dimension modifiers
     * @type {Object}
     * @private
     */
    this._modifiers = {
      FIXED: "!"
    };

    /**
     * @type {string}
     * @private
     */
    this._dimensionsString = dimensions;

    /**
     * An object that represents the parsed dimensions string
     * @type {Object}
     */
    this._rules = this._parse();

    this._validateRules();
  }

  _prototypeProperties(ImageDimensions, null, {
    _parse: {

      /**
       * Parses the dimensions string
       * @private
       */

      value: function _parse() {
        if (typeof this._dimensionsString === "undefined") {
          return null;
        }

        var match = this._dimensionsString.match(/^([0-9]+)?x([0-9]+)?([\!])?$/i);
        if (!match) {
          throw new Error("Invalid size option: " + this._dimensionsString);
        }

        return {
          x: isNaN(match[1]) ? null : parseInt(match[1]),
          y: isNaN(match[2]) ? null : parseInt(match[2]),
          modifier: match[3]
        };
      },
      writable: true,
      configurable: true
    },
    _validateRules: {

      /**
       * Validates the rules
       * @private
       */

      value: function _validateRules() {
        if (this._rules === null) {
          return;
        }var xAvailable = this._rules.x !== null;
        var yAvailable = this._rules.y !== null;

        if (this._rules.modifier === this._modifiers.FIXED && !(xAvailable && yAvailable)) {
          throw new Error("Both `x` and `y` have to be set when using the fixed (!) modifier.");
        }

        if (!xAvailable && !yAvailable) {
          throw new Error("Neither `x` nor `y` are given.");
        }
      },
      writable: true,
      configurable: true
    },
    calculateFinalDimensions: {

      /**
       * Calculates the final dimensions using the dimensions string and the
       * given initial dimensions
       * @param  {Vector2} initialDimensions
       * @return {Vector2}
       */

      value: function calculateFinalDimensions(initialDimensions) {
        var dimensions = initialDimensions.clone(),
            ratio;

        if (this._rules === null) {
          return dimensions;
        } /* istanbul ignore else */
        if (this._rules.modifier === this._modifiers.FIXED) {
          // Fixed dimensions
          dimensions.set(this._rules.x, this._rules.y);
        } else if (this._rules.x !== null && this._rules.y !== null) {
          // Both x and y given, resize to fit
          ratio = Math.min(this._rules.x / dimensions.x, this._rules.y / dimensions.y);
          dimensions.multiply(ratio);
        } else if (this._rules.x !== null) {
          // Fixed x, y by ratio
          ratio = initialDimensions.y / initialDimensions.x;
          dimensions.x = this._rules.x;
          dimensions.y = dimensions.x * ratio;
        } else if (this._rules.y !== null) {
          // Fixed y, x by ratio
          ratio = initialDimensions.x / initialDimensions.y;
          dimensions.y = this._rules.y;
          dimensions.x = dimensions.y * ratio;
        }

        return dimensions;
      },
      writable: true,
      configurable: true
    }
  });

  return ImageDimensions;
})();

module.exports = ImageDimensions;

},{}],48:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _constants = require("../constants");

var RenderType = _constants.RenderType;
var ImageFormat = _constants.ImageFormat;

var Utils = _interopRequire(require("./utils"));

/**
 * @class
 * @alias ImglyKit.ImageExporter
 * @private
 */

var ImageExporter = (function () {
  function ImageExporter() {
    _classCallCheck(this, ImageExporter);
  }

  _prototypeProperties(ImageExporter, {
    validateSettings: {
      value: function validateSettings(renderType, imageFormat) {
        var settings = {
          renderType: renderType,
          imageFormat: imageFormat
        };

        // Validate RenderType
        if (typeof settings.renderType !== "undefined" && settings.renderType !== null && Utils.values(RenderType).indexOf(settings.renderType) === -1) {
          throw new Error("Invalid render type: " + settings.renderType);
        } else if (typeof renderType === "undefined") {
          settings.renderType = RenderType.DATA_URL;
        }

        // Validate ImageFormat
        if (typeof settings.imageFormat !== "undefined" && settings.imageFormat !== null && Utils.values(ImageFormat).indexOf(settings.imageFormat) === -1) {
          throw new Error("Invalid image format: " + settings.imageFormat);
        } else if (typeof imageFormat === "undefined") {
          settings.imageFormat = ImageFormat.PNG;
        }

        return settings;
      },
      writable: true,
      configurable: true
    },
    "export": {

      /**
       * Exports the image from the given canvas with the given options
       * @param  {Canvas} canvas
       * @param  {ImglyKit.RenderType} renderType
       * @param  {ImglyKit.ImageFormat} imageFormat
       * @return {string|image}
       */

      value: function _export(canvas, renderType, imageFormat) {
        var result = canvas.toDataURL(imageFormat);
        if (renderType == RenderType.IMAGE) {
          var image;

          /* istanbul ignore else  */
          if (typeof window === "undefined") {
            // Not a browser environment
            var CanvasImage = require("canvas").Image;
            image = new CanvasImage();
          } else {
            image = new Image();
          }

          image.src = result;
          result = image;
        }
        return result;
      },
      writable: true,
      configurable: true
    }
  });

  return ImageExporter;
})();

module.exports = ImageExporter;

},{"../constants":42,"./utils":51,"canvas":"canvas"}],49:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Represents a 2-dimensional vector while providing math functions to
 * modify / clone the vector. Fully chainable.
 * @class
 * @alias ImglyKit.Vector2
 * @param {number} x
 * @param {number} y
 * @private
 */

var Vector2 = (function () {
  function Vector2(x, y) {
    _classCallCheck(this, Vector2);

    this.x = x;
    this.y = y;
    if (typeof this.x === "undefined") {
      this.x = 0;
    }
    if (typeof this.y === "undefined") {
      this.y = 0;
    }
  }

  _prototypeProperties(Vector2, null, {
    set: {

      /**
       * Sets the given values
       * @param {number} x
       * @param {number} y
       * @return {Vector2}
       */

      value: function set(x, y) {
        this.x = x;
        this.y = y;
        return this;
      },
      writable: true,
      configurable: true
    },
    clone: {

      /**
       * Creates a clone of this vector
       * @return {Vector2}
       */

      value: function clone() {
        return new Vector2(this.x, this.y);
      },
      writable: true,
      configurable: true
    },
    copy: {

      /**
       * Copies the values of the given vector
       * @param  {Vector2} other
       * @return {Vector2}
       */

      value: function copy(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
      },
      writable: true,
      configurable: true
    },
    clamp: {

      /**
       * Clamps this vector with the given Vector2 / number
       * @param  {(number|Vector2)} minimum
       * @param  {(number|Vector2)} maximum
       * @return {Vector2}
       */

      value: function clamp(minimum, maximum) {
        var minimumSet = minimum !== null && typeof minimum !== "undefined";
        var maximumSet = maximum !== null && typeof maximum !== "undefined";

        /* istanbul ignore else  */
        if (!(minimum instanceof Vector2) && minimumSet) {
          minimum = new Vector2(minimum, minimum);
        }
        /* istanbul ignore else  */
        if (!(maximum instanceof Vector2) && maximumSet) {
          maximum = new Vector2(maximum, maximum);
        }

        if (minimumSet) {
          this.x = Math.max(minimum.x, this.x);
          this.y = Math.max(minimum.y, this.y);
        }

        if (maximumSet) {
          this.x = Math.min(maximum.x, this.x);
          this.y = Math.min(maximum.y, this.y);
        }
        return this;
      },
      writable: true,
      configurable: true
    },
    divide: {

      /**
       * Divides this vector by the given Vector2 / number
       * @param  {(number|Vector2)} divisor
       * @param  {number} [y]
       * @return {Vector2}
       */

      value: function divide(divisor, y) {
        if (divisor instanceof Vector2) {
          this.x /= divisor.x;
          this.y /= divisor.y;
        } else {
          this.x /= divisor;
          this.y /= typeof y === "undefined" ? divisor : y;
        }
        return this;
      },
      writable: true,
      configurable: true
    },
    subtract: {

      /**
       * Subtracts the given Vector2 / number from this vector
       * @param  {(number|Vector2)} subtrahend
       * @param  {number} [y]
       * @return {Vector2}
       */

      value: function subtract(subtrahend, y) {
        if (subtrahend instanceof Vector2) {
          this.x -= subtrahend.x;
          this.y -= subtrahend.y;
        } else {
          this.x -= subtrahend;
          this.y -= typeof y === "undefined" ? subtrahend : y;
        }
        return this;
      },
      writable: true,
      configurable: true
    },
    multiply: {

      /**
       * Multiplies the given Vector2 / number with this vector
       * @param  {(number|Vector2)} subtrahend
       * @param  {number} [y]
       * @return {Vector2}
       */

      value: function multiply(factor, y) {
        if (factor instanceof Vector2) {
          this.x *= factor.x;
          this.y *= factor.y;
        } else {
          this.x *= factor;
          this.y *= typeof y === "undefined" ? factor : y;
        }
        return this;
      },
      writable: true,
      configurable: true
    },
    add: {

      /**
       * Adds the given Vector2 / numbers to this vector
       * @param {(number|Vector2)} addend
       * @param {number} [y]
       */

      value: function add(addend, y) {
        if (addend instanceof Vector2) {
          this.x += addend.x;
          this.y += addend.y;
        } else {
          this.x += addend;
          this.y += typeof y === "undefined" ? addend : y;
        }
        return this;
      },
      writable: true,
      configurable: true
    },
    equals: {

      /**
       * Checks whether the x and y value are the same as the given ones
       * @param  {(number|Vector2)} vec
       * @param  {number} y
       * @return {boolean}
       */

      value: function equals(vec, y) {
        if (vec instanceof Vector2) {
          return vec.x === this.x && vec.y === this.y;
        } else {
          return vec === this.x && y === this.y;
        }
      },
      writable: true,
      configurable: true
    },
    flip: {

      /**
       * Flips the x and y values of this vector
       * @return {Vector2}
       */

      value: function flip() {
        var tempX = this.x;
        this.x = this.y;
        this.y = tempX;
        return this;
      },
      writable: true,
      configurable: true
    },
    toString: {

      /**
       * Returns a string representation of this vector
       * @return {String}
       */

      value: function toString() {
        return "Vector2({ x: " + this.x + ", y: " + this.y + " })";
      },
      writable: true,
      configurable: true
    }
  });

  return Vector2;
})();

module.exports = Vector2;

},{}],50:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var bluebird = _interopRequire(require("bluebird"));

var ImageDimensions = _interopRequire(require("./image-dimensions"));

var Vector2 = _interopRequire(require("./math/vector2"));

var CanvasRenderer = _interopRequire(require("../renderers/canvas-renderer"));

var WebGLRenderer = _interopRequire(require("../renderers/webgl-renderer"));

/**
 * Handles the image rendering process
 * @class
 * @alias ImglyKit.RenderImage
 * @param {Image} image
 * @param {Array.<ImglyKit.Operation>} operationsStack
 * @param {string} dimensions
 * @param {string} preferredRenderer
 * @private
 */

var RenderImage = (function () {
  function RenderImage(image, operationsStack, dimensions, preferredRenderer) {
    _classCallCheck(this, RenderImage);

    /**
     * @type {Object}
     * @private
     */
    this._options = {
      preferredRenderer: preferredRenderer
    };

    /**
     * @type {Boolean}
     * @private
     * @default false
     */
    this._webglEnabled = false;

    /**
     * @type {Renderer}
     * @private
     */
    this._renderer = null;

    /**
     * @type {Image}
     * @private
     */
    this._image = image;

    /**
     * @type {Array.<ImglyKit.Operation>}
     * @private
     */
    this._stack = operationsStack;

    /**
     * @type {ImglyKit.ImageDimensions}
     * @private
     */
    this._dimensions = new ImageDimensions(dimensions);

    /**
     * @type {Vector2}
     * @private
     */
    this._initialDimensions = new Vector2(this._image.width, this._image.height);

    this._initRenderer();
  }

  _prototypeProperties(RenderImage, null, {
    _initRenderer: {

      /**
       * Creates a renderer (canvas or webgl, depending on support)
       * @return {Promise}
       * @private
       */

      value: function _initRenderer() {
        /* istanbul ignore if */
        if (WebGLRenderer.isSupported() && this._options.preferredRenderer !== "canvas") {
          this._renderer = new WebGLRenderer(this._initialDimensions);
          this._webglEnabled = true;
        } else if (CanvasRenderer.isSupported()) {
          this._renderer = new CanvasRenderer(this._initialDimensions);
          this._webglEnabled = false;
        }

        /* istanbul ignore if */
        if (this._renderer === null) {
          throw new Error("Neither Canvas nor WebGL renderer are supported.");
        }

        this._renderer.drawImage(this._image);
      },
      writable: true,
      configurable: true
    },
    render: {

      /**
       * Renders the image
       * @return {Promise}
       */

      value: function render() {
        var stack = this.sanitizedStack;

        var self = this;
        return bluebird.map(stack, function (operation) {
          return operation.validateSettings();
        }).then(function () {
          return bluebird.map(stack, function (operation) {
            return operation.render(self._renderer);
          }, { concurrency: 1 }).then(function () {
            return self._renderer.renderFinal();
          });
        }).then(function () {
          var initialSize = self._renderer.getSize();
          var finalDimensions = self._dimensions.calculateFinalDimensions(initialSize);

          if (finalDimensions.equals(initialSize)) {
            // No need to resize
            return;
          }

          return self._renderer.resizeTo(finalDimensions);
        });
      },
      writable: true,
      configurable: true
    },
    getRenderer: {

      /**
       * Returns the renderer
       * @return {Renderer}
       */

      value: function getRenderer() {
        return this._renderer;
      },
      writable: true,
      configurable: true
    },
    sanitizedStack: {

      /**
       * Returns the operations stack without falsy values
       * @type {Array.<Operation>}
       */

      get: function () {
        var sanitizedStack = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._stack[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var operation = _step.value;

            if (!operation) continue;
            sanitizedStack.push(operation);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return sanitizedStack;
      },
      configurable: true
    }
  });

  return RenderImage;
})();

module.exports = RenderImage;

},{"../renderers/canvas-renderer":108,"../renderers/webgl-renderer":110,"./image-dimensions":47,"./math/vector2":49,"bluebird":4}],51:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Vector2 = _interopRequire(require("./math/vector2"));

/**
 * Provides utility functions for internal use
 * @class
 * @alias ImglyKit.Utils
 * @private
 */

var Utils = (function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _prototypeProperties(Utils, {
    isArray: {

      /**
       * Checks if the given object is an Array
       * @param  {Object}  object
       * @return {Boolean}
       */

      value: function isArray(object) {
        return Object.prototype.toString.call(object) === "[object Array]";
      },
      writable: true,
      configurable: true
    },
    select: {

      /**
       * Returns the items selected by the given selector
       * @param  {Array} items
       * @param  {ImglyKit~Selector} selector - The selector
       * @return {Array} The selected items
       */

      value: function select(items, selector) {
        if (selector === null) {
          return items;
        }

        // Turn string parameter into an array
        if (typeof selector === "string") {
          selector = selector.split(",").map(function (identifier) {
            return identifier.trim();
          });
        }

        // Turn array parameter into an object with `only`
        if (Utils.isArray(selector)) {
          selector = { only: selector };
        }

        if (typeof selector.only !== "undefined") {
          // Select only the given identifiers
          return items.filter(function (item) {
            return selector.only.indexOf(item) !== -1;
          });
        } else if (typeof selector.except !== "undefined") {
          // Select all but the given identifiers
          return items.filter(function (item) {
            return selector.except.indexOf(item) === -1;
          });
        }

        throw new Error("Utils#select failed to filter items.");
      },
      writable: true,
      configurable: true
    },
    values: {

      /**
       * Returns the given object's values as an array
       * @param {Object} object
       * @returns {Array<*>}
       */

      value: (function (_values) {
        var _valuesWrapper = function values(_x) {
          return _values.apply(this, arguments);
        };

        _valuesWrapper.toString = function () {
          return _values.toString();
        };

        return _valuesWrapper;
      })(function (object) {
        var values = [];
        for (var key in object) {
          values.push(object[key]);
        }
        return values;
      }),
      writable: true,
      configurable: true
    },
    isDOMElement: {

      /**
       * Checks if the given object is a DOM element
       * @param  {Object}  o
       * @return {Boolean}
       */
      /* istanbul ignore next */

      value: function isDOMElement(o) {
        return typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
      },
      writable: true,
      configurable: true
    },
    getEventPosition: {

      /**
       * Gets the x and y position for the given event.
       * @param {Event} e
       * @return {Vector2}
       */

      value: function getEventPosition(e) {
        var x = e.pageX;
        var y = e.pageY;
        if (e.type.indexOf("touch") !== -1) {
          x = e.touches[0].pageX;
          y = e.touches[0].pageY;
        }
        return new Vector2(x, y);
      },
      writable: true,
      configurable: true
    }
  });

  return Utils;
})();

module.exports = Utils;

},{"./math/vector2":49}],52:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var PrimitivesStack = _interopRequire(require("./filters/primitives-stack"));

var BrightnessPrimitive = _interopRequire(require("./filters/primitives/brightness"));

/**
 * @class
 * @alias ImglyKit.Operations.BrightnessOperation
 * @extends ImglyKit.Operation
 */

var BrightnessOperation = (function (Operation) {
  function BrightnessOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, BrightnessOperation);

    this.availableOptions = {
      brightness: { type: "number", "default": 0 }
    };

    _get(Object.getPrototypeOf(BrightnessOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(BrightnessOperation, Operation);

  _prototypeProperties(BrightnessOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "brightness";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Renders the brightness using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       */

      value: function _renderWebGL(renderer) {
        this._render(renderer);
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Renders the brightness using Canvas2D
       * @param {CanvasRenderer} renderer
       * @override
       */

      value: function _renderCanvas(renderer) {
        this._render(renderer);
      },
      writable: true,
      configurable: true
    },
    _render: {

      /**
       * Renders the brightness (all renderers supported)
       * @param {Renderer} renderer
       * @private
       */

      value: function _render(renderer) {
        var stack = new PrimitivesStack();

        stack.add(new BrightnessPrimitive({
          brightness: this._options.brightness
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return BrightnessOperation;
})(Operation);

module.exports = BrightnessOperation;

},{"./filters/primitives-stack":81,"./filters/primitives/brightness":82,"./operation":101}],53:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var PrimitivesStack = _interopRequire(require("./filters/primitives-stack"));

var ContrastPrimitive = _interopRequire(require("./filters/primitives/contrast"));

/**
 * @class
 * @alias ImglyKit.Operations.ContrastOperation
 * @extends ImglyKit.Operation
 */

var ContrastOperation = (function (Operation) {
  function ContrastOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, ContrastOperation);

    this.availableOptions = {
      contrast: { type: "number", "default": 1 }
    };

    _get(Object.getPrototypeOf(ContrastOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(ContrastOperation, Operation);

  _prototypeProperties(ContrastOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "contrast";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Renders the contrast using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       */

      value: function _renderWebGL(renderer) {
        this._render(renderer);
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Renders the contrast using Canvas2D
       * @param {CanvasRenderer} renderer
       * @override
       */

      value: function _renderCanvas(renderer) {
        this._render(renderer);
      },
      writable: true,
      configurable: true
    },
    _render: {

      /**
       * Renders the contrast (all renderers supported)
       * @param  {Renderer} renderer
       * @private
       */

      value: function _render(renderer) {
        var stack = new PrimitivesStack();

        stack.add(new ContrastPrimitive({
          contrast: this._options.contrast
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return ContrastOperation;
})(Operation);

module.exports = ContrastOperation;

},{"./filters/primitives-stack":81,"./filters/primitives/contrast":83,"./operation":101}],54:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias ImglyKit.Operations.CropOperation
 * @extends ImglyKit.Operation
 */

var CropOperation = (function (Operation) {
  function CropOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, CropOperation);

    this.availableOptions = {
      start: { type: "vector2", required: true, "default": new Vector2(0, 0) },
      end: { type: "vector2", required: true, "default": new Vector2(1, 1) }
    };

    /**
     * The fragment shader used for this operation
     */
    this.fragmentShader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      varying vec2 v_texCoord;\n      uniform vec2 u_cropStart;\n      uniform vec2 u_cropEnd;\n\n      void main() {\n        vec2 size = u_cropEnd - u_cropStart;\n        gl_FragColor = texture2D(u_image, v_texCoord * size + u_cropStart);\n      }\n    ";

    _get(Object.getPrototypeOf(CropOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(CropOperation, Operation);

  _prototypeProperties(CropOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "crop";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Rotates and crops the image using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       * @private
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        var canvas = renderer.getCanvas();
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var start = this._options.start.clone();
        var end = this._options.end.clone();

        if (this._options.numberFormat === "absolute") {
          start.divide(canvasSize);
          end.divide(canvasSize);
        }

        // 0..1 > 1..0 on y-axis
        var originalStartY = start.y;
        start.y = 1 - end.y;
        end.y = 1 - originalStartY;

        // The new size
        var newDimensions = this.getNewDimensions(renderer);

        // Resize the canvas
        canvas.width = newDimensions.x;
        canvas.height = newDimensions.y;

        // Run the cropping shader
        renderer.runShader(null, this.fragmentShader, {
          uniforms: {
            u_cropStart: { type: "2f", value: [start.x, start.y] },
            u_cropEnd: { type: "2f", value: [end.x, end.y] }
          }
        });
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas
       * @param {CanvasRenderer} renderer
       * @override
       * @private
       */

      value: function _renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var dimensions = new Vector2(canvas.width, canvas.height);

        var newDimensions = this.getNewDimensions(renderer);

        // Create a temporary canvas to draw to
        var newCanvas = renderer.createCanvas();
        newCanvas.width = newDimensions.x;
        newCanvas.height = newDimensions.y;
        var newContext = newCanvas.getContext("2d");

        // The upper left corner of the cropped area on the original image
        var startPosition = this._options.start.clone();

        if (this._options.numberFormat === "relative") {
          startPosition.multiply(dimensions);
        }

        // Draw the source canvas onto the new one
        newContext.drawImage(canvas, startPosition.x, startPosition.y, // source x, y
        newDimensions.x, newDimensions.y, // source dimensions
        0, 0, // destination x, y
        newDimensions.x, newDimensions.y // destination dimensions
        );

        // Set the new canvas
        renderer.setCanvas(newCanvas);
      },
      writable: true,
      configurable: true
    },
    getNewDimensions: {

      /**
       * Gets the new dimensions
       * @param {Renderer} renderer
       * @param {Vector2} [dimensions]
       * @return {Vector2}
       */

      value: function getNewDimensions(renderer, dimensions) {
        var canvas = renderer.getCanvas();
        dimensions = dimensions || new Vector2(canvas.width, canvas.height);

        var newDimensions = this._options.end.clone().subtract(this._options.start);

        if (this._options.numberFormat === "relative") {
          newDimensions.multiply(dimensions);
        }

        return newDimensions;
      },
      writable: true,
      configurable: true
    }
  });

  return CropOperation;
})(Operation);

module.exports = CropOperation;

},{"../lib/math/vector2":49,"./operation":101}],55:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var IdentityFilter = _interopRequire(require("./filters/identity-filter"));

/**
 * An operation that can apply a selected filter
 *
 * @class
 * @alias ImglyKit.Operations.FiltersOperation
 * @extends ImglyKit.Operation
 */

var FiltersOperation = (function (Operation) {
  function FiltersOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, FiltersOperation);

    this.availableOptions = {
      filter: { type: "object", "default": IdentityFilter,
        setter: function setter(Filter) {
          this._selectedFilter = new Filter();
          return Filter;
        }
      }
    };

    _get(Object.getPrototypeOf(FiltersOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(FiltersOperation, Operation);

  _prototypeProperties(FiltersOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "filters";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Renders the filter using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       */

      value: function _renderWebGL(renderer) {
        this._render(renderer);
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Renders the filter using Canvas2D
       * @param {CanvasRenderer} renderer
       * @override
       */

      value: function _renderCanvas(renderer) {
        this._render(renderer);
      },
      writable: true,
      configurable: true
    },
    _render: {

      /**
       * Renders the filter (all renderers supported)
       * @param {Renderer} renderer
       * @private
       */

      value: function _render(renderer) {
        this._selectedFilter.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return FiltersOperation;
})(Operation);

module.exports = FiltersOperation;

},{"./filters/identity-filter":69,"./operation":101}],56:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * A15 Filter
 * @class
 * @alias ImglyKit.Filters.A15Filter
 * @extends {ImglyKit.Filter}
 */

var A15Filter = (function (Filter) {
  function A15Filter() {
    _classCallCheck(this, A15Filter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(A15Filter, Filter);

  _prototypeProperties(A15Filter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "a15";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Contrast({
          contrast: 0.63
        }));

        stack.add(new Filter.Primitives.Brightness({
          brightness: 0.12
        }));

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 38], [94, 94], [148, 142], [175, 187], [255, 255]],
            green: [[0, 0], [77, 53], [171, 190], [255, 255]],
            blue: [[0, 10], [48, 85], [174, 228], [255, 255]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return A15Filter;
})(Filter);

module.exports = A15Filter;

},{"./filter":62}],57:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Breeze Filter
 * @class
 * @alias ImglyKit.Filters.BreezeFilter
 * @extends {ImglyKit.Filter}
 */

var BreezeFilter = (function (Filter) {
  function BreezeFilter() {
    _classCallCheck(this, BreezeFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(BreezeFilter, Filter);

  _prototypeProperties(BreezeFilter, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "breeze";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Desaturation
        stack.add(new Filter.Primitives.Desaturation({
          desaturation: 0.5
        }));

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [170, 170], [212, 219], [234, 242], [255, 255]],
            green: [[0, 0], [170, 168], [234, 231], [255, 255]],
            blue: [[0, 0], [170, 170], [212, 208], [255, 255]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return BreezeFilter;
})(Filter);

module.exports = BreezeFilter;

},{"./filter":62}],58:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * BW Filter
 * @class
 * @alias ImglyKit.Filters.BWFilter
 * @extends {ImglyKit.Filter}
 */

var BWFilter = (function (Filter) {
  function BWFilter() {
    _classCallCheck(this, BWFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(BWFilter, Filter);

  _prototypeProperties(BWFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "bw";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Grayscale());

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return BWFilter;
})(Filter);

module.exports = BWFilter;

},{"./filter":62}],59:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * BWHard Filter
 * @class
 * @alias ImglyKit.Filters.BWHardFilter
 * @extends {ImglyKit.Filter}
 */

var BWHardFilter = (function (Filter) {
  function BWHardFilter() {
    _classCallCheck(this, BWHardFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(BWHardFilter, Filter);

  _prototypeProperties(BWHardFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "bwhard";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Grayscale());
        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.5
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return BWHardFilter;
})(Filter);

module.exports = BWHardFilter;

},{"./filter":62}],60:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Celsius Filter
 * @class
 * @alias ImglyKit.Filters.CelsiusFilter
 * @extends {ImglyKit.Filter}
 */

var CelsiusFilter = (function (Filter) {
  function CelsiusFilter() {
    _classCallCheck(this, CelsiusFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(CelsiusFilter, Filter);

  _prototypeProperties(CelsiusFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "celsius";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 69], [55, 110], [202, 230], [255, 255]],
            green: [[0, 44], [89, 93], [185, 141], [255, 189]],
            blue: [[0, 76], [39, 82], [218, 138], [255, 171]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return CelsiusFilter;
})(Filter);

module.exports = CelsiusFilter;

},{"./filter":62}],61:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Chest Filter
 * @class
 * @alias ImglyKit.Filters.ChestFilter
 * @extends {ImglyKit.Filter}
 */

var ChestFilter = (function (Filter) {
  function ChestFilter() {
    _classCallCheck(this, ChestFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(ChestFilter, Filter);

  _prototypeProperties(ChestFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "chest";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [44, 44], [124, 143], [221, 204], [255, 255]],
            green: [[0, 0], [130, 127], [213, 199], [255, 255]],
            blue: [[0, 0], [51, 52], [219, 204], [255, 255]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return ChestFilter;
})(Filter);

module.exports = ChestFilter;

},{"./filter":62}],62:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Base class for filters. Extendable via {@link ImglyKit.Filter#extend}
 * @class
 * @alias ImglyKit.Filter
 */

var Filter = (function () {
  function Filter() {
    _classCallCheck(this, Filter);
  }

  _prototypeProperties(Filter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return null;
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        /* istanbul ignore next */
        throw new Error("Filter#render is abstract and not implemented in inherited class.");
      },
      writable: true,
      configurable: true
    }
  });

  return Filter;
})();

/**
 * To create an {@link ImglyKit.Filter} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Filter.extend = require("../../lib/extend");

// Exposed classes
Filter.PrimitivesStack = require("./primitives-stack");
Filter.Primitives = {};
Filter.Primitives.Saturation = require("./primitives/saturation");
Filter.Primitives.LookupTable = require("./primitives/lookup-table");
Filter.Primitives.ToneCurve = require("./primitives/tone-curve");
Filter.Primitives.SoftColorOverlay = require("./primitives/soft-color-overlay");
Filter.Primitives.Desaturation = require("./primitives/desaturation");
Filter.Primitives.X400 = require("./primitives/x400");
Filter.Primitives.Grayscale = require("./primitives/grayscale");
Filter.Primitives.Contrast = require("./primitives/contrast");
Filter.Primitives.Glow = require("./primitives/glow");
Filter.Primitives.Gobblin = require("./primitives/gobblin");
Filter.Primitives.Brightness = require("./primitives/brightness");

module.exports = Filter;
/* jshint unused: false */

},{"../../lib/extend":46,"./primitives-stack":81,"./primitives/brightness":82,"./primitives/contrast":83,"./primitives/desaturation":84,"./primitives/glow":85,"./primitives/gobblin":86,"./primitives/grayscale":87,"./primitives/lookup-table":88,"./primitives/saturation":90,"./primitives/soft-color-overlay":91,"./primitives/tone-curve":92,"./primitives/x400":93}],63:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Fixie Filter
 * @class
 * @alias ImglyKit.Filters.FixieFilter
 * @extends {ImglyKit.Filter}
 */

var FixieFilter = (function (Filter) {
  function FixieFilter() {
    _classCallCheck(this, FixieFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(FixieFilter, Filter);

  _prototypeProperties(FixieFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "fixie";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [44, 28], [63, 48], [128, 132], [235, 248], [255, 255]],
            green: [[0, 0], [20, 10], [60, 45], [190, 209], [211, 231], [255, 255]],
            blue: [[0, 31], [41, 62], [150, 142], [234, 212], [255, 224]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return FixieFilter;
})(Filter);

module.exports = FixieFilter;

},{"./filter":62}],64:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Food Filter
 * @class
 * @alias ImglyKit.Filters.FoodFilter
 * @extends {ImglyKit.Filter}
 */

var FoodFilter = (function (Filter) {
  function FoodFilter() {
    _classCallCheck(this, FoodFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(FoodFilter, Filter);

  _prototypeProperties(FoodFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "food";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Saturation({
          saturation: 1.35
        }));

        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.1
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return FoodFilter;
})(Filter);

module.exports = FoodFilter;

},{"./filter":62}],65:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Fridge Filter
 * @class
 * @alias ImglyKit.Filters.FridgeFilter
 * @extends {ImglyKit.Filter}
 */

var FridgeFilter = (function (Filter) {
  function FridgeFilter() {
    _classCallCheck(this, FridgeFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(FridgeFilter, Filter);

  _prototypeProperties(FridgeFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "fridge";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 9], [21, 11], [45, 24], [255, 220]],
            green: [[0, 12], [21, 21], [42, 42], [150, 150], [170, 173], [255, 210]],
            blue: [[0, 28], [43, 72], [128, 185], [255, 220]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return FridgeFilter;
})(Filter);

module.exports = FridgeFilter;

},{"./filter":62}],66:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Front Filter
 * @class
 * @alias ImglyKit.Filters.FrontFilter
 * @extends {ImglyKit.Filter}
 */

var FrontFilter = (function (Filter) {
  function FrontFilter() {
    _classCallCheck(this, FrontFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(FrontFilter, Filter);

  _prototypeProperties(FrontFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "front";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 65], [28, 67], [67, 113], [125, 183], [187, 217], [255, 229]],
            green: [[0, 52], [42, 59], [104, 134], [169, 209], [255, 240]],
            blue: [[0, 52], [65, 68], [93, 104], [150, 153], [255, 198]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return FrontFilter;
})(Filter);

module.exports = FrontFilter;

},{"./filter":62}],67:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Glam Filter
 * @class
 * @alias ImglyKit.Filters.GlamFilter
 * @extends {ImglyKit.Filter}
 */

var GlamFilter = (function (Filter) {
  function GlamFilter() {
    _classCallCheck(this, GlamFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(GlamFilter, Filter);

  _prototypeProperties(GlamFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "glam";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.1
        }));

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [94, 74], [181, 205], [255, 255]],
            green: [[0, 0], [127, 127], [255, 255]],
            blue: [[0, 0], [102, 73], [227, 213], [255, 255]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return GlamFilter;
})(Filter);

module.exports = GlamFilter;

},{"./filter":62}],68:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Gobblin Filter
 * @class
 * @alias ImglyKit.Filters.GobblinFilter
 * @extends {ImglyKit.Filter}
 */

var GobblinFilter = (function (Filter) {
  function GobblinFilter() {
    _classCallCheck(this, GobblinFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(GobblinFilter, Filter);

  _prototypeProperties(GobblinFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "gobblin";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Gobblin());

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return GobblinFilter;
})(Filter);

module.exports = GobblinFilter;

},{"./filter":62}],69:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Identity Filter
 * @class
 * @alias ImglyKit.Filters.IdentityFilter
 * @extends {ImglyKit.Filter}
 */

var IdentityFilter = (function (Filter) {
  function IdentityFilter() {
    _classCallCheck(this, IdentityFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(IdentityFilter, Filter);

  _prototypeProperties(IdentityFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "identity";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {},
      writable: true,
      configurable: true
    }
  });

  return IdentityFilter;
})(Filter);

module.exports = IdentityFilter;

// This is the identity filter, it doesn't have any effect.

},{"./filter":62}],70:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * K1 Filter
 * @class
 * @alias ImglyKit.Filters.K1Filter
 * @extends {ImglyKit.Filter}
 */

var K1Filter = (function (Filter) {
  function K1Filter() {
    _classCallCheck(this, K1Filter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(K1Filter, Filter);

  _prototypeProperties(K1Filter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "k1";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [53, 32], [91, 80], [176, 205], [255, 255]]
        }));

        // Saturation
        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.9
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return K1Filter;
})(Filter);

module.exports = K1Filter;

},{"./filter":62}],71:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

var Color = _interopRequire(require("../../lib/color"));

/**
 * K2 Filter
 * @class
 * @alias ImglyKit.Filters.K2Filter
 * @extends {ImglyKit.Filter}
 */

var K2Filter = (function (Filter) {
  function K2Filter() {
    _classCallCheck(this, K2Filter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(K2Filter, Filter);

  _prototypeProperties(K2Filter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "k2";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [54, 33], [77, 82], [94, 103], [122, 126], [177, 193], [229, 232], [255, 255]]
        }));

        // Soft color overlay
        stack.add(new Filter.Primitives.SoftColorOverlay({
          color: new Color(40 / 255, 40 / 255, 40 / 255)
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return K2Filter;
})(Filter);

module.exports = K2Filter;

},{"../../lib/color":44,"./filter":62}],72:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * K6 Filter
 * @class
 * @alias ImglyKit.Filters.K6Filter
 * @extends {ImglyKit.Filter}
 */

var K6Filter = (function (Filter) {
  function K6Filter() {
    _classCallCheck(this, K6Filter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(K6Filter, Filter);

  _prototypeProperties(K6Filter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "k6";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Saturation
        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.5
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return K6Filter;
})(Filter);

module.exports = K6Filter;

},{"./filter":62}],73:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * KDynamic Filter
 * @class
 * @alias ImglyKit.Filters.KDynamicFilter
 * @extends {ImglyKit.Filter}
 */

var KDynamicFilter = (function (Filter) {
  function KDynamicFilter() {
    _classCallCheck(this, KDynamicFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(KDynamicFilter, Filter);

  _prototypeProperties(KDynamicFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "kdynamic";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [17, 27], [46, 69], [90, 112], [156, 200], [203, 243], [255, 255]]
        }));

        // Saturation
        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.7
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return KDynamicFilter;
})(Filter);

module.exports = KDynamicFilter;

},{"./filter":62}],74:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Lenin Filter
 * @class
 * @alias ImglyKit.Filters.LeninFilter
 * @extends {ImglyKit.Filter}
 */

var LeninFilter = (function (Filter) {
  function LeninFilter() {
    _classCallCheck(this, LeninFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(LeninFilter, Filter);

  _prototypeProperties(LeninFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "lenin";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Desaturation
        stack.add(new Filter.Primitives.Desaturation({
          desaturation: 0.4
        }));

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 20], [40, 20], [106, 111], [129, 153], [190, 223], [255, 255]],
            green: [[0, 20], [40, 20], [62, 41], [106, 108], [132, 159], [203, 237], [255, 255]],
            blue: [[0, 40], [40, 40], [73, 60], [133, 160], [191, 297], [203, 237], [237, 239], [255, 255]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return LeninFilter;
})(Filter);

module.exports = LeninFilter;

},{"./filter":62}],75:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Lomo Filter
 * @class
 * @alias ImglyKit.Filters.LomoFilter
 * @extends {ImglyKit.Filter}
 */

var LomoFilter = (function (Filter) {
  function LomoFilter() {
    _classCallCheck(this, LomoFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(LomoFilter, Filter);

  _prototypeProperties(LomoFilter, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "lomo";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [87, 20], [131, 156], [183, 205], [255, 200]]
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return LomoFilter;
})(Filter);

module.exports = LomoFilter;

},{"./filter":62}],76:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Mellow Filter
 * @class
 * @alias ImglyKit.Filters.MellowFilter
 * @extends {ImglyKit.Filter}
 */

var MellowFilter = (function (Filter) {
  function MellowFilter() {
    _classCallCheck(this, MellowFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(MellowFilter, Filter);

  _prototypeProperties(MellowFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "mellow";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [41, 84], [87, 134], [255, 255]],
            green: [[0, 0], [255, 216]],
            blue: [[0, 0], [255, 131]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return MellowFilter;
})(Filter);

module.exports = MellowFilter;

},{"./filter":62}],77:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Morning Filter
 * @class
 * @alias ImglyKit.Filters.MorningFilter
 * @extends {ImglyKit.Filter}
 */

var MorningFilter = (function (Filter) {
  function MorningFilter() {
    _classCallCheck(this, MorningFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(MorningFilter, Filter);

  _prototypeProperties(MorningFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "morning";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 40], [255, 230]],
            green: [[0, 10], [255, 225]],
            blue: [[0, 20], [255, 181]]
          }
        }));

        stack.add(new Filter.Primitives.Glow());

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return MorningFilter;
})(Filter);

module.exports = MorningFilter;

},{"./filter":62}],78:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Orchid Filter
 * @class
 * @alias ImglyKit.Filters.OrchidFilter
 * @extends {ImglyKit.Filter}
 */

var OrchidFilter = (function (Filter) {
  function OrchidFilter() {
    _classCallCheck(this, OrchidFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(OrchidFilter, Filter);

  _prototypeProperties(OrchidFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "orchid";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [115, 130], [195, 215], [255, 255]],
            green: [[0, 0], [148, 153], [172, 215], [255, 255]],
            blue: [[0, 46], [58, 75], [178, 205], [255, 255]]
          }
        }));

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [117, 151], [189, 217], [255, 255]]
        }));

        // Desaturation
        stack.add(new Filter.Primitives.Desaturation({
          desaturation: 0.65
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return OrchidFilter;
})(Filter);

module.exports = OrchidFilter;

},{"./filter":62}],79:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Pola Filter
 * @class
 * @alias ImglyKit.Filters.PolaFilter
 * @extends {ImglyKit.Filter}
 */

var PolaFilter = (function (Filter) {
  function PolaFilter() {
    _classCallCheck(this, PolaFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(PolaFilter, Filter);

  _prototypeProperties(PolaFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "pola";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [94, 74], [181, 205], [255, 255]],
            green: [[0, 0], [34, 34], [99, 76], [176, 190], [255, 255]],
            blue: [[0, 0], [102, 73], [227, 213], [255, 255]]
          }
        }));

        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.8
        }));

        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.5
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return PolaFilter;
})(Filter);

module.exports = PolaFilter;

},{"./filter":62}],80:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Pola669 Filter
 * @class
 * @alias ImglyKit.Filters.Pola669Filter
 * @extends {ImglyKit.Filter}
 */

var Pola669Filter = (function (Filter) {
  function Pola669Filter() {
    _classCallCheck(this, Pola669Filter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(Pola669Filter, Filter);

  _prototypeProperties(Pola669Filter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "pola669";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [56, 18], [196, 209], [255, 255]],
            green: [[0, 38], [71, 84], [255, 255]],
            blue: [[0, 0], [131, 133], [204, 211], [255, 255]]
          }
        }));

        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.8
        }));

        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.5
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return Pola669Filter;
})(Filter);

module.exports = Pola669Filter;

},{"./filter":62}],81:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * A helper class that can collect {@link Primitive} instances and render
 * the stack
 * @class
 * @alias ImglyKit.Filter.PrimitivesStack
 */

var PrimitivesStack = (function () {
  function PrimitivesStack() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, PrimitivesStack);

    _get(Object.getPrototypeOf(PrimitivesStack.prototype), "constructor", this).apply(this, args);

    /**
     * The stack of {@link ImglyKit.Filter.Primitive} instances
     * @type {Array}
     * @private
     */
    this._stack = [];
  }

  _prototypeProperties(PrimitivesStack, null, {
    add: {

      /**
       * Adds the given primitive to the stack
       * @param {ImglyKit.Filter.Primitive} primitive
       */

      value: function add(primitive) {
        this._stack.push(primitive);
      },
      writable: true,
      configurable: true
    },
    render: {

      /**
       * Renders the stack of primitives on the renderer
       * @param  {Renderer} renderer
       */

      value: function render(renderer) {
        for (var i = 0; i < this._stack.length; i++) {
          var primitive = this._stack[i];
          primitive.render(renderer);
        }
      },
      writable: true,
      configurable: true
    }
  });

  return PrimitivesStack;
})();

module.exports = PrimitivesStack;

},{}],82:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

/**
 * Brightness primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Brightness
 * @extends {ImglyKit.Filter.Primitive}
 */

var Brightness = (function (Primitive) {
  function Brightness() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Brightness);

    _get(Object.getPrototypeOf(Brightness.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      brightness: 1
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_brightness;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        gl_FragColor = vec4((texColor.rgb + vec3(u_brightness)), texColor.a);\n      }\n\n    ";
  }

  _inherits(Brightness, Primitive);

  _prototypeProperties(Brightness, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_brightness: { type: "f", value: this._options.brightness }
          }
        });
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
        var brightness = this._options.brightness;

        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            imageData.data[index] = imageData.data[index] + brightness * 255;
            imageData.data[index + 1] = imageData.data[index + 1] + brightness * 255;
            imageData.data[index + 2] = imageData.data[index + 2] + brightness * 255;
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    }
  });

  return Brightness;
})(Primitive);

module.exports = Brightness;

},{"./primitive":89,"lodash":"lodash"}],83:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

/**
 * Contrast primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Contrast
 * @extends {ImglyKit.Filter.Primitive}
 */

var Contrast = (function (Primitive) {
  function Contrast() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Contrast);

    _get(Object.getPrototypeOf(Contrast.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      contrast: 1
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_contrast;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        gl_FragColor = vec4(((texColor.rgb - vec3(0.5)) * u_contrast + vec3(0.5)), texColor.a);\n      }\n\n    ";
  }

  _inherits(Contrast, Primitive);

  _prototypeProperties(Contrast, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_contrast: { type: "f", value: this._options.contrast }
          }
        });
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
        var contrast = this._options.contrast;

        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            imageData.data[index] = (imageData.data[index] - 127) * contrast + 127;
            imageData.data[index + 1] = (imageData.data[index + 1] - 127) * contrast + 127;
            imageData.data[index + 2] = (imageData.data[index + 2] - 127) * contrast + 127;
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    }
  });

  return Contrast;
})(Primitive);

module.exports = Contrast;

},{"./primitive":89,"lodash":"lodash"}],84:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

/**
 * Desaturation primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Desaturation
 * @extends {ImglyKit.Filter.Primitive}
 */

var Desaturation = (function (Primitive) {
  function Desaturation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Desaturation);

    _get(Object.getPrototypeOf(Desaturation.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      desaturation: 1
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_desaturation;\n\n      const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);\n\n      void main() {\n        vec3 texColor = texture2D(u_image, v_texCoord).xyz;\n        vec3 grayXfer = vec3(0.3, 0.59, 0.11);\n        vec3 gray = vec3(dot(grayXfer, texColor));\n        gl_FragColor = vec4(mix(texColor, gray, u_desaturation), 1.0);\n      }\n    ";
  }

  _inherits(Desaturation, Primitive);

  _prototypeProperties(Desaturation, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       * @return {Promise}
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_desaturation: { type: "f", value: this._options.desaturation }
          }
        });
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
        var desaturation = this._options.desaturation;

        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            var luminance = imageData.data[index] * 0.3 + imageData.data[index + 1] * 0.59 + imageData.data[index + 2] * 0.11;
            imageData.data[index] = luminance * (1 - desaturation) + imageData.data[index] * desaturation;
            imageData.data[index + 1] = luminance * (1 - desaturation) + imageData.data[index + 1] * desaturation;
            imageData.data[index + 2] = luminance * (1 - desaturation) + imageData.data[index + 2] * desaturation;
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    }
  });

  return Desaturation;
})(Primitive);

module.exports = Desaturation;

},{"./primitive":89,"lodash":"lodash"}],85:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

var Color = _interopRequire(require("../../../lib/color"));

/**
 * Glow primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Glow
 * @extends {ImglyKit.Filter.Primitive}
 */

var Glow = (function (Primitive) {
  function Glow() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Glow);

    _get(Object.getPrototypeOf(Glow.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      color: new Color(1, 1, 1)
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n\n      uniform vec3 u_color;\n\n      void main() {\n        vec3 texColor = texture2D(u_image, v_texCoord).rgb;\n\n        vec2 textureCoord = v_texCoord - vec2(0.5, 0.5);\n        textureCoord /= 0.75;\n\n        float d = 1.0 - dot(textureCoord, textureCoord);\n        d = clamp(d, 0.2, 1.0);\n        vec3 newColor = texColor * d * u_color.rgb;\n        gl_FragColor = vec4(vec3(newColor),1.0);\n      }\n    ";
  }

  _inherits(Glow, Primitive);

  _prototypeProperties(Glow, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       * @return {Promise}
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_color: { type: "3f", value: this._options.color.toRGBGLColor() }
          }
        });
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       * @return {Promise}
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
        var color = this._options.color;

        var d;
        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            var x01 = x / canvas.width;
            var y01 = y / canvas.height;

            var nx = (x01 - 0.5) / 0.75;
            var ny = (y01 - 0.5) / 0.75;

            var scalarX = nx * nx;
            var scalarY = ny * ny;
            d = 1 - (scalarX + scalarY);
            d = Math.min(Math.max(d, 0.1), 1);

            imageData.data[index] = imageData.data[index] * (d * color.r);
            imageData.data[index + 1] = imageData.data[index + 1] * (d * color.g);
            imageData.data[index + 2] = imageData.data[index + 2] * (d * color.b);
            imageData.data[index + 3] = 255;
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    }
  });

  return Glow;
})(Primitive);

module.exports = Glow;

},{"../../../lib/color":44,"./primitive":89,"lodash":"lodash"}],86:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = _interopRequire(require("./primitive"));

/**
 * Gobblin primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Gobblin
 * @extends {ImglyKit.Filter.Primitive}
 */

var Gobblin = (function (Primitive) {
  function Gobblin() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Gobblin);

    _get(Object.getPrototypeOf(Gobblin.prototype), "constructor", this).apply(this, args);

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        texColor.b = texColor.g * 0.33;\n        texColor.r = texColor.r * 0.6;\n        texColor.b += texColor.r * 0.33;\n        texColor.g = texColor.g * 0.7;\n        gl_FragColor = texColor;\n      }\n    ";
  }

  _inherits(Gobblin, Primitive);

  _prototypeProperties(Gobblin, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       * @return {Promise}
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader);
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            imageData.data[index + 2] = imageData.data[index + 1] * 0.33;
            imageData.data[index] = imageData.data[index] * 0.6;
            imageData.data[index + 2] += imageData.data[index] * 0.33;
            imageData.data[index + 1] = imageData.data[index + 1] * 0.7;
            imageData.data[index + 3] = 255;
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    }
  });

  return Gobblin;
})(Primitive);

module.exports = Gobblin;

},{"./primitive":89}],87:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = _interopRequire(require("./primitive"));

/**
 * Grayscale primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Grayscale
 * @extends {ImglyKit.Filter.Primitive}
 */

var Grayscale = (function (Primitive) {
  function Grayscale() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Grayscale);

    _get(Object.getPrototypeOf(Grayscale.prototype), "constructor", this).apply(this, args);

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      vec3 W = vec3(0.2125, 0.7154, 0.0721);\n\n      void main() {\n        vec3 texColor = texture2D(u_image, v_texCoord).rgb;\n        float luminance = dot(texColor, W);\n        gl_FragColor = vec4(vec3(luminance), 1.0);\n      }\n    ";
  }

  _inherits(Grayscale, Primitive);

  _prototypeProperties(Grayscale, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       * @return {Promise}
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader);
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            var luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;

            imageData.data[index] = luminance;
            imageData.data[index + 1] = luminance;
            imageData.data[index + 2] = luminance;
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    }
  });

  return Grayscale;
})(Primitive);

module.exports = Grayscale;

},{"./primitive":89}],88:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = _interopRequire(require("./primitive"));

/**
 * Stores a 256 byte long lookup table in a 2d texture which will be
 * used to look up the corresponding value for each channel.
 * @class
 * @alias ImglyKit.Filter.Primitives.LookupTable
 * @extends {ImglyKit.Filter.Primitive}
 */

var LookupTable = (function (Primitive) {
  function LookupTable() {
    _classCallCheck(this, LookupTable);

    Primitive.apply(this, arguments);

    this._textureIndex = 3;

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_lookupTable;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float r = texture2D(u_lookupTable, vec2(texColor.r, 0.0)).r;\n        float g = texture2D(u_lookupTable, vec2(texColor.g, 0.0)).g;\n        float b = texture2D(u_lookupTable, vec2(texColor.b, 0.0)).b;\n\n        gl_FragColor = vec4(r, g, b, texColor.a);\n      }\n    ";
  }

  _inherits(LookupTable, Primitive);

  _prototypeProperties(LookupTable, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        this._updateTexture(renderer);

        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_lookupTable: { type: "i", value: 3 }
          }
        });
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
        var table = this._options.data;

        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            var r = imageData.data[index];
            imageData.data[index] = table[r * 4];
            var g = imageData.data[index + 1];
            imageData.data[index + 1] = table[1 + g * 4];
            var b = imageData.data[index + 2];
            imageData.data[index + 2] = table[2 + b * 4];
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    },
    _updateTexture: {

      /**
       * Updates the lookup table texture (WebGL only)
       * @private
       */
      /* istanbul ignore next */

      value: function _updateTexture(renderer) {
        var gl = renderer.getContext();

        if (typeof this._options.data === "undefined") {
          throw new Error("LookupTable: No data specified.");
        }

        var dataTypedArray = new Uint8Array(this._options.data);

        gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
        if (!this._texture) {
          this._texture = gl.createTexture();
        }
        gl.bindTexture(gl.TEXTURE_2D, this._texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataTypedArray);
        gl.activeTexture(gl.TEXTURE0);
      },
      writable: true,
      configurable: true
    }
  });

  return LookupTable;
})(Primitive);

module.exports = LookupTable;

},{"./primitive":89}],89:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Base class for primitives. Extendable via {@link ImglyKit.Filter.Primitive#extend}
 * @class
 * @alias ImglyKit.Filter.Primitive
 */

var Primitive = (function () {
  function Primitive(options) {
    _classCallCheck(this, Primitive);

    options = options || {};

    this._options = options;
  }

  _prototypeProperties(Primitive, null, {
    render: {

      /**
       * Renders the primitive
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        if (renderer.identifier === "webgl") {
          this.renderWebGL(renderer);
        } else {
          this.renderCanvas(renderer);
        }
      },
      writable: true,
      configurable: true
    },
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {CanvasRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        /* istanbul ignore next */
        throw new Error("Primitive#renderWebGL is abstract and not implemented in inherited class.");
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas2D)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        /* istanbul ignore next */
        throw new Error("Primitive#renderCanvas is abstract and not implemented in inherited class.");
      },
      writable: true,
      configurable: true
    }
  });

  return Primitive;
})();

module.exports = Primitive;
/* jshint unused: false */

},{}],90:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

/**
 * Saturation primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Saturation
 * @extends {ImglyKit.Filter.Primitive}
 */

var Saturation = (function (Primitive) {
  function Saturation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Saturation);

    _get(Object.getPrototypeOf(Saturation.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      saturation: 0
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_saturation;\n\n      const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float luminance = dot(texColor.rgb, luminanceWeighting);\n\n        vec3 greyScaleColor = vec3(luminance);\n\n        gl_FragColor = vec4(mix(greyScaleColor, texColor.rgb, u_saturation), texColor.a);\n      }\n    ";
  }

  _inherits(Saturation, Primitive);

  _prototypeProperties(Saturation, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_saturation: { type: "f", value: this._options.saturation }
          }
        });
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       * @return {Promise}
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
        var saturation = this._options.saturation;

        var d;
        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            var luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;
            imageData.data[index] = luminance * (1 - saturation) + imageData.data[index] * saturation;
            imageData.data[index + 1] = luminance * (1 - saturation) + imageData.data[index + 1] * saturation;
            imageData.data[index + 2] = luminance * (1 - saturation) + imageData.data[index + 2] * saturation;
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    }
  });

  return Saturation;
})(Primitive);

module.exports = Saturation;

},{"./primitive":89,"lodash":"lodash"}],91:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

var Color = _interopRequire(require("../../../lib/color"));

/**
 * SoftColorOverlay primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.SoftColorOverlay
 * @extends {ImglyKit.Filter.Primitive}
 */

var SoftColorOverlay = (function (Primitive) {
  function SoftColorOverlay() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, SoftColorOverlay);

    _get(Object.getPrototypeOf(SoftColorOverlay.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      color: new Color(1, 1, 1)
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform vec3 u_overlay;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        vec4 overlayVec4 = vec4(u_overlay, texColor.a);\n        gl_FragColor = max(overlayVec4, texColor);\n      }\n    ";
  }

  _inherits(SoftColorOverlay, Primitive);

  _prototypeProperties(SoftColorOverlay, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_overlay: { type: "3f", value: this._options.color.toRGBGLColor() }
          }
        });
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            imageData.data[index] = Math.max(this._options.color.r, imageData.data[index]);
            imageData.data[index + 1] = Math.max(this._options.color.g, imageData.data[index + 1]);
            imageData.data[index + 2] = Math.max(this._options.color.b, imageData.data[index + 2]);
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    }
  });

  return SoftColorOverlay;
})(Primitive);

module.exports = SoftColorOverlay;

},{"../../../lib/color":44,"./primitive":89,"lodash":"lodash"}],92:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var LookupTable = _interopRequire(require("./lookup-table"));

/**
 * Tone curve primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.ToneCurve
 * @extends {ImglyKit.Filter.Primitives.LookupTable}
 */

var ToneCurve = (function (LookupTable) {
  function ToneCurve() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, ToneCurve);

    _get(Object.getPrototypeOf(ToneCurve.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      rgbControlPoints: {
        red: this._options.controlPoints,
        green: this._options.controlPoints,
        blue: this._options.controlPoints
      }
    });

    if (typeof this._options.rgbControlPoints !== "undefined") {
      this._updateLookupTable();
    }
  }

  _inherits(ToneCurve, LookupTable);

  _prototypeProperties(ToneCurve, null, {
    _updateLookupTable: {

      /**
       * Calculates the lookup table
       * @private
       */

      value: function _updateLookupTable() {
        var r = this._calculateSplineCurve(this._options.rgbControlPoints.red);
        var g = this._calculateSplineCurve(this._options.rgbControlPoints.green);
        var b = this._calculateSplineCurve(this._options.rgbControlPoints.blue);

        this._options.data = this._buildLookupTable(r, g, b);
      },
      writable: true,
      configurable: true
    },
    _buildLookupTable: {

      /**
       * Builds the lookup table
       * @param  {Array} r
       * @param  {Array} g
       * @param  {Array} b
       * @return {Array}
       * @private
       */

      value: function _buildLookupTable(r, g, b) {
        var data = [];

        for (var i = 0; i < 256; i++) {
          data.push(Math.min(Math.max(i + r[i], 0), 255));
          data.push(Math.min(Math.max(i + g[i], 0), 255));
          data.push(Math.min(Math.max(i + b[i], 0), 255));
          data.push(255);
        }

        return data;
      },
      writable: true,
      configurable: true
    },
    _calculateSplineCurve: {

      /**
       * Calculates the spline curve data for the given points
       * @param  {Array.<Array.<Number>>} points
       * @return {Array.<Number>}
       */

      value: function _calculateSplineCurve(points) {
        points = points.sort(function (a, b) {
          return a[0] > b[0];
        });

        var splinePoints = this._getSplineCurve(points);
        var firstSplinePoint = splinePoints[0];
        var i;

        if (firstSplinePoint[0] > 0) {
          for (i = 0; i < firstSplinePoint[0]; i++) {
            splinePoints.unshift([0, 0]);
          }
        }

        var preparedPoints = [];
        for (i = 0; i < splinePoints.length; i++) {
          var newPoint = splinePoints[i];
          var origPoint = [newPoint[0], newPoint[0]];

          var distance = Math.sqrt(Math.pow(origPoint[0] - newPoint[0], 2) + Math.pow(origPoint[1] - newPoint[1], 2));

          if (origPoint[1] > newPoint[1]) {
            distance = -distance;
          }

          preparedPoints.push(distance);
        }

        return preparedPoints;
      },
      writable: true,
      configurable: true
    },
    _getSplineCurve: {
      value: function _getSplineCurve(points) {
        var sdA = this._secondDerivative(points);

        var n = sdA.length;
        var sd = [];
        var i;

        for (i = 0; i < n; i++) {
          sd[i] = sdA[i];
        }

        var output = [];

        for (i = 0; i < n - 1; i++) {
          var cur = points[i];
          var next = points[i + 1];

          for (var x = cur[0]; x < next[0]; x++) {
            var t = (x - cur[0]) / (next[0] - cur[0]);

            var a = 1 - t;
            var b = t;
            var h = next[0] - cur[0];

            var y = a * cur[1] + b * next[1] + h * h / 6 * ((a * a * a - a) * sd[i] + (b * b * b - b) * sd[i + 1]);

            if (y > 255) {
              y = 255;
            } else if (y < 0) {
              y = 0;
            }

            output.push([x, y]);
          }
        }

        if (output.length === 255) {
          output.push(points[points.length - 1]);
        }

        return output;
      },
      writable: true,
      configurable: true
    },
    _secondDerivative: {
      value: function _secondDerivative(points) {
        var n = points.length;
        if (n <= 0 || n === 1) {
          return null;
        }

        var matrix = [];
        var result = [];
        var i, k;

        matrix[0] = [0, 1, 0];

        for (i = 1; i < n - 1; i++) {
          var P1 = points[i - 1];
          var P2 = points[i];
          var P3 = points[i + 1];

          matrix[i] = matrix[i] || [];
          matrix[i][0] = (P2[0] - P1[0]) / 6;
          matrix[i][1] = (P3[0] - P1[0]) / 3;
          matrix[i][2] = (P3[0] - P2[0]) / 6;
          result[i] = (P3[1] - P2[1]) / (P3[0] - P2[0]) - (P2[1] - P1[1]) / (P2[0] - P1[0]);
        }

        result[0] = 0;
        result[n - 1] = 0;

        matrix[n - 1] = [0, 1, 0];

        // Pass 1
        for (i = 1; i < n; i++) {
          k = matrix[1][0] / matrix[i - 1][1];
          matrix[i][1] -= k * matrix[i - 1][2];
          matrix[i][0] = 0;
          result[i] -= k * result[i - 1];
        }

        // Pass 2
        for (i = n - 2; i > 0; i--) {
          k = matrix[i][2] / matrix[i + 1][1];
          matrix[i][1] -= k * matrix[i + 1][0];
          matrix[i][2] = 0;
          result[i] -= k * result[i + 1];
        }

        var y2 = [];
        for (i = 0; i < n; i++) {
          y2[i] = result[i] / matrix[i][1];
        }

        return y2;
      },
      writable: true,
      configurable: true
    }
  });

  return ToneCurve;
})(LookupTable);

module.exports = ToneCurve;

},{"./lookup-table":88,"lodash":"lodash"}],93:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = _interopRequire(require("./primitive"));

/**
 * X400 primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.X400
 * @extends {ImglyKit.Filter.Primitive}
 */

var X400 = (function (Primitive) {
  function X400() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, X400);

    _get(Object.getPrototypeOf(X400.prototype), "constructor", this).apply(this, args);

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float gray = texColor.r * 0.3 + texColor.g * 0.3 + texColor.b * 0.3;\n        gray -= 0.2;\n        gray = clamp(gray, 0.0, 1.0);\n        gray += 0.15;\n        gray *= 1.4;\n        gl_FragColor = vec4(vec3(gray), 1.0);\n      }\n    ";
  }

  _inherits(X400, Primitive);

  _prototypeProperties(X400, null, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader);
      },
      writable: true,
      configurable: true
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            var index = (canvas.width * y + x) * 4;

            var gray = imageData.data[index] / 255 * 0.3 + imageData.data[index + 1] / 255 * 0.3 + imageData.data[index + 2] / 255 * 0.3;
            gray -= 0.2;
            gray = Math.max(0, Math.min(1, gray));
            gray += 0.15;
            gray *= 1.4;

            gray *= 255;
            imageData.data[index] = gray;
            imageData.data[index + 1] = gray;
            imageData.data[index + 2] = gray;
          }
        }

        renderer.getContext().putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    }
  });

  return X400;
})(Primitive);

module.exports = X400;

},{"./primitive":89}],94:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Quozi Filter
 * @class
 * @alias ImglyKit.Filters.QuoziFilter
 * @extends {ImglyKit.Filter}
 */

var QuoziFilter = (function (Filter) {
  function QuoziFilter() {
    _classCallCheck(this, QuoziFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(QuoziFilter, Filter);

  _prototypeProperties(QuoziFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "quozi";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Desaturation
        stack.add(new Filter.Primitives.Desaturation({
          desaturation: 0.65
        }));

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 50], [40, 78], [118, 170], [181, 211], [255, 255]],
            green: [[0, 27], [28, 45], [109, 157], [157, 195], [179, 208], [206, 212], [255, 240]],
            blue: [[0, 50], [12, 55], [46, 103], [103, 162], [194, 182], [241, 201], [255, 219]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return QuoziFilter;
})(Filter);

module.exports = QuoziFilter;

},{"./filter":62}],95:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Semired Filter
 * @class
 * @alias ImglyKit.Filters.SemiredFilter
 * @extends {ImglyKit.Filter}
 */

var SemiredFilter = (function (Filter) {
  function SemiredFilter() {
    _classCallCheck(this, SemiredFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(SemiredFilter, Filter);

  _prototypeProperties(SemiredFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "semired";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 129], [75, 153], [181, 227], [255, 255]],
            green: [[0, 8], [111, 85], [212, 158], [255, 226]],
            blue: [[0, 5], [75, 22], [193, 90], [255, 229]]
          }
        }));

        stack.add(new Filter.Primitives.Glow());

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return SemiredFilter;
})(Filter);

module.exports = SemiredFilter;

},{"./filter":62}],96:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Sunny Filter
 * @class
 * @alias ImglyKit.Filters.SunnyFilter
 * @extends {ImglyKit.Filter}
 */

var SunnyFilter = (function (Filter) {
  function SunnyFilter() {
    _classCallCheck(this, SunnyFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(SunnyFilter, Filter);

  _prototypeProperties(SunnyFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "sunny";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [62, 82], [141, 154], [255, 255]],
            green: [[0, 39], [56, 96], [192, 176], [255, 255]],
            blue: [[0, 0], [174, 99], [255, 235]]
          }
        }));

        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [55, 20], [158, 191], [255, 255]]
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return SunnyFilter;
})(Filter);

module.exports = SunnyFilter;

},{"./filter":62}],97:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * Texas Filter
 * @class
 * @alias ImglyKit.Filters.TexasFilter
 * @extends {ImglyKit.Filter}
 */

var TexasFilter = (function (Filter) {
  function TexasFilter() {
    _classCallCheck(this, TexasFilter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(TexasFilter, Filter);

  _prototypeProperties(TexasFilter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "texas";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 72], [89, 99], [176, 212], [255, 237]],
            green: [[0, 49], [255, 192]],
            blue: [[0, 72], [255, 151]]
          }
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return TexasFilter;
})(Filter);

module.exports = TexasFilter;

},{"./filter":62}],98:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

/**
 * X400 Filter
 * @class
 * @alias ImglyKit.Filters.X400Filter
 * @extends {ImglyKit.Filter}
 */

var X400Filter = (function (Filter) {
  function X400Filter() {
    _classCallCheck(this, X400Filter);

    if (Filter != null) {
      Filter.apply(this, arguments);
    }
  }

  _inherits(X400Filter, Filter);

  _prototypeProperties(X400Filter, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "x400";
      },
      configurable: true
    }
  }, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.X400());

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return X400Filter;
})(Filter);

module.exports = X400Filter;

},{"./filter":62}],99:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

/**
 * An operation that can flip the canvas
 *
 * @class
 * @alias ImglyKit.Operations.FlipOperation
 * @extends ImglyKit.Operation
 */

var FlipOperation = (function (Operation) {
  function FlipOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, FlipOperation);

    this.availableOptions = {
      horizontal: { type: "boolean", "default": false },
      vertical: { type: "boolean", "default": false }
    };

    /**
     * The fragment shader used for this operation
     */
    this.fragmentShader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      varying vec2 v_texCoord;\n      uniform bool u_flipVertical;\n      uniform bool u_flipHorizontal;\n\n      void main() {\n        vec2 texCoord = vec2(v_texCoord);\n        if (u_flipVertical) {\n          texCoord.y = 1.0 - texCoord.y;\n        }\n        if (u_flipHorizontal) {\n          texCoord.x = 1.0 - texCoord.x;\n        }\n        gl_FragColor = texture2D(u_image, texCoord);\n      }\n    ";

    _get(Object.getPrototypeOf(FlipOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(FlipOperation, Operation);

  _prototypeProperties(FlipOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "flip";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Crops this image using WebGL
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        renderer.runShader(null, this.fragmentShader, {
          uniforms: {
            u_flipVertical: { type: "f", value: this._options.vertical },
            u_flipHorizontal: { type: "f", value: this._options.horizontal }
          }
        });
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas2D
       * @param  {CanvasRenderer} renderer
       */

      value: function _renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var context = renderer.getContext();

        var scaleX = 1,
            scaleY = 1;
        var translateX = 0,
            translateY = 0;

        if (this._options.horizontal) {
          scaleX = -1;
          translateX = canvas.width;
        }

        if (this._options.vertical) {
          scaleY = -1;
          translateY = canvas.height;
        }

        // Save the current state
        context.save();

        // Apply the transformation
        context.translate(translateX, translateY);
        context.scale(scaleX, scaleY);

        // Create a temporary canvas so that we can draw the image
        // with the applied transformation
        var tempCanvas = renderer.cloneCanvas();
        context.drawImage(tempCanvas, 0, 0);

        // Restore old transformation
        context.restore();
      },
      writable: true,
      configurable: true
    }
  });

  return FlipOperation;
})(Operation);

module.exports = FlipOperation;

},{"./operation":101}],100:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Color = _interopRequire(require("../lib/color"));

/**
 * An operation that can frames on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.FramesOperation
 * @extends ImglyKit.Operation
 */

var FramesOperation = (function (Operation) {
  function FramesOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, FramesOperation);

    this.availableOptions = {
      color: { type: "color", "default": new Color(0, 0, 0, 1) },
      thickness: { type: "number", "default": 0.02 }
    };

    /**
     * The texture index used for the frame
     * @type {Number}
     * @private
     */
    this._textureIndex = 1;

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_frameImage;\n      uniform vec4 u_color;\n      uniform vec2 u_thickness;\n\n      void main() {\n        vec4 fragColor = texture2D(u_image, v_texCoord);\n        if (v_texCoord.x < u_thickness.x || v_texCoord.x > 1.0 - u_thickness.x ||\n          v_texCoord.y < u_thickness.y || v_texCoord.y > 1.0 - u_thickness.y) {\n            fragColor = mix(fragColor, u_color, u_color.a);\n          }\n\n        gl_FragColor = fragColor;\n      }\n    ";

    _get(Object.getPrototypeOf(FramesOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(FramesOperation, Operation);

  _prototypeProperties(FramesOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "frames";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Crops this image using WebGL
       * @param  {WebGLRenderer} renderer
       * @private
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        var canvas = renderer.getCanvas();

        var color = this._options.color;
        var thickness = this._options.thickness * canvas.height;
        var thicknessVec2 = [thickness / canvas.width, thickness / canvas.height];

        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_color: { type: "4f", value: color.toGLColor() },
            u_thickness: { type: "2f", value: thicknessVec2 }
          }
        });
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas2D
       * @param  {CanvasRenderer} renderer
       * @private
       */

      value: function _renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var context = renderer.getContext();

        var color = this._options.color;
        var thickness = this._options.thickness * canvas.height;

        context.save();
        context.beginPath();
        context.lineWidth = thickness * 2;
        context.strokeStyle = color.toRGBA();
        context.rect(0, 0, canvas.width, canvas.height);
        context.stroke();
        context.restore();
      },
      writable: true,
      configurable: true
    }
  });

  return FramesOperation;
})(Operation);

module.exports = FramesOperation;

},{"../lib/color":44,"./operation":101}],101:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var Color = _interopRequire(require("../lib/color"));

var EventEmitter = _interopRequire(require("../lib/event-emitter"));

/**
 * Base class for Operations. Extendable via {@link ImglyKit.Operation#extend}.
 * @class
 * @alias ImglyKit.Operation
 */

var Operation = (function (EventEmitter) {
  function Operation(kit, options) {
    _classCallCheck(this, Operation);

    _get(Object.getPrototypeOf(Operation.prototype), "constructor", this).call(this);

    if (kit.constructor.name !== "ImglyKit") {
      throw new Error("Operation: First parameter for constructor has to be an ImglyKit instance.");
    }

    this._kit = kit;
    this.availableOptions = _.extend(this.availableOptions || {}, {
      numberFormat: { type: "string", "default": "relative", available: ["absolute", "relative"] }
    });
    this._dirty = true;

    this._uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });

    this._initOptions(options || {});
  }

  _inherits(Operation, EventEmitter);

  _prototypeProperties(Operation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return null;
      },
      configurable: true
    },
    validateSettings: {

      /**
       * Checks whether this Operation can be applied the way it is configured
       */

      value: function validateSettings() {
        var identifier = this.identifier;

        // Check for required options
        for (var optionName in this.availableOptions) {
          var optionConfig = this.availableOptions[optionName];
          if (optionConfig.required && typeof this._options[optionName] === "undefined") {
            throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` is required.");
          }
        }
      },
      writable: true,
      configurable: true
    },
    render: {

      /**
       * Applies this operation
       * @param  {Renderer} renderer
       * @return {Promise}
       * @abstract
       */

      value: function render(renderer) {
        var renderFn = undefined;
        if (renderer.identifier === "webgl") {
          /* istanbul ignore next */
          renderFn = this._renderWebGL.bind(this);
        } else {
          renderFn = this._renderCanvas.bind(this);
        }

        // Handle caching
        if (this._dirty) {
          renderFn(renderer);
          renderer.cache(this._uuid);
          this._dirty = false;
        } else {
          renderer.drawCached(this._uuid);
        }
      },
      writable: true,
      configurable: true
    },
    _renderWebGL: {

      /**
       * Applies this operation using WebGL
       * @return {WebGLRenderer} renderer
       * @private
       */

      value: function _renderWebGL() {
        throw new Error("Operation#_renderWebGL is abstract and not implemented in inherited class.");
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Applies this operation using Canvas2D
       * @return {CanvasRenderer} renderer
       * @private
       */

      value: function _renderCanvas() {
        throw new Error("Operation#_renderCanvas is abstract and not implemented in inherited class.");
      },
      writable: true,
      configurable: true
    },
    _initOptions: {

      /**
       * Goes through the available options, sets _options defaults
       * @param {Object} userOptions
       * @private
       */

      value: function _initOptions(userOptions) {
        this._options = {};

        // Set defaults, create getters and setters
        var optionName, option, capitalized;
        var self = this;
        for (optionName in this.availableOptions) {
          capitalized = optionName.charAt(0).toUpperCase() + optionName.slice(1);
          option = this.availableOptions[optionName];

          // Create setter and getter
          (function (optionName, option) {
            self["set" + capitalized] = function (value) {
              if (typeof option.setter !== "undefined") {
                value = option.setter.call(this, value);
              }
              self._setOption(optionName, value);
            };

            // Default getter
            self["get" + capitalized] = function () {
              return self._getOption(optionName);
            };
          })(optionName, option);

          // Set default if available
          if (typeof option["default"] !== "undefined") {
            this["set" + capitalized](option["default"]);
          }
        }

        // Overwrite options with the ones given by user
        for (optionName in userOptions) {
          // Check if option is available
          if (typeof this.availableOptions[optionName] === "undefined") {
            throw new Error("Invalid option: " + optionName);
          }

          // Call setter
          capitalized = optionName.charAt(0).toUpperCase() + optionName.slice(1);
          this["set" + capitalized](userOptions[optionName]);
        }
      },
      writable: true,
      configurable: true
    },
    set: {

      /**
       * Sets the given options
       * @param {Object} options
       */

      value: function set(options) {
        for (var optionName in options) {
          this._setOption(optionName, options[optionName], false);
        }

        this.emit("update");
      },
      writable: true,
      configurable: true
    },
    _getOption: {

      /**
       * Returns the value for the given option
       * @param {String} optionName
       * @return {*}
       * @private
       */

      value: function _getOption(optionName) {
        return this._options[optionName];
      },
      writable: true,
      configurable: true
    },
    _setOption: {

      /**
       * Sets the value for the given option, validates it
       * @param {String} optionName
       * @param {*} value
       * @param {Boolean} update
       * @private
       */

      value: function _setOption(optionName, value) {
        var update = arguments[2] === undefined ? true : arguments[2];

        var optionConfig = this.availableOptions[optionName];
        var identifier = this.identifier;

        if (typeof optionConfig.validation !== "undefined") {
          optionConfig.validation(value);
        }

        switch (optionConfig.type) {
          // String options
          case "string":
            if (typeof value !== "string") {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be a string.");
            }

            // String value restrictions
            var available = optionConfig.available;
            if (typeof available !== "undefined" && available.indexOf(value) === -1) {
              throw new Error("Operation `" + identifier + "`: Invalid value for `" + optionName + "` (valid values are: " + optionConfig.available.join(", ") + ")");
            }

            this._options[optionName] = value;
            break;

          // Number options
          case "number":
            if (typeof value !== "number") {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be a number.");
            }

            this._options[optionName] = value;
            break;

          // Boolean options
          case "boolean":
            if (typeof value !== "boolean") {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be a boolean.");
            }

            this._options[optionName] = value;
            break;

          // Vector2 options
          case "vector2":
            if (!(value instanceof Vector2)) {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be an instance of ImglyKit.Vector2.");
            }

            this._options[optionName] = value.clone();

            break;

          // Color options
          case "color":
            if (!(value instanceof Color)) {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be an instance of ImglyKit.Color.");
            }

            this._options[optionName] = value;
            break;

          // Object options
          case "object":
            this._options[optionName] = value;
            break;
        }

        this._dirty = true;
        if (update) {
          this.emit("update");
        }
      },
      writable: true,
      configurable: true
    },
    getNewDimensions: {

      /**
       * Gets the new dimensions
       * @param {Renderer} renderer
       * @param {Vector2} [dimensions]
       * @return {Vector2}
       * @private
       */

      value: function getNewDimensions(renderer, dimensions) {
        var canvas = renderer.getCanvas();
        dimensions = dimensions || new Vector2(canvas.width, canvas.height);

        return dimensions;
      },
      writable: true,
      configurable: true
    },
    dirty: {

      /**
       * Sets this operation to dirty, so that it will re-render next time
       * @param {Boolean} dirty = true
       */

      set: function (dirty) {
        this._dirty = dirty;
      },

      /**
       * Returns the dirty state
       * @type {Boolean}
       */
      get: function () {
        return this._dirty;
      },
      configurable: true
    }
  });

  return Operation;
})(EventEmitter);

/**
 * To create an {@link ImglyKit.Operation} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */

var extend = _interopRequire(require("../lib/extend"));

Operation.extend = extend;

module.exports = Operation;
/* jshint unused:false */
/* jshint -W083 */

},{"../lib/color":44,"../lib/event-emitter":45,"../lib/extend":46,"../lib/math/vector2":49,"lodash":"lodash"}],102:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { return set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { return desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { return setter.call(receiver, value); } } };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var StackBlur = _interopRequire(require("../vendor/stack-blur"));

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias ImglyKit.Operations.RadialBlurOperation
 * @extends ImglyKit.Operation
 */

var RadialBlurOperation = (function (Operation) {
  function RadialBlurOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, RadialBlurOperation);

    this.availableOptions = {
      position: { type: "vector2", "default": new Vector2(0.5, 0.5) },
      gradientRadius: { type: "number", "default": 50 },
      blurRadius: { type: "number", "default": 20 }
    };

    /**
     * The fragment shader used for this operation
     * @internal Based on evanw's glfx.js tilt shift shader:
     *           https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
     */
    this.fragmentShader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      uniform float blurRadius;\n      uniform float gradientRadius;\n      uniform vec2 position;\n      uniform vec2 delta;\n      uniform vec2 texSize;\n      varying vec2 v_texCoord;\n\n      float random(vec3 scale, float seed) {\n        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n      }\n\n      void main() {\n          vec4 color = vec4(0.0);\n          float total = 0.0;\n\n          float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n          float radius = smoothstep(0.0, 1.0, abs(distance(v_texCoord * texSize, position)) / (gradientRadius * 2.0)) * blurRadius;\n          for (float t = -30.0; t <= 30.0; t++) {\n              float percent = (t + offset - 0.5) / 30.0;\n              float weight = 1.0 - abs(percent);\n              vec4 sample = texture2D(u_image, v_texCoord + delta * percent * radius / texSize);\n\n              sample.rgb *= sample.a;\n\n              color += sample * weight;\n              total += weight;\n          }\n\n          gl_FragColor = color / total;\n          gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n      }\n    ";

    _get(Object.getPrototypeOf(RadialBlurOperation.prototype), "constructor", this).apply(this, args);

    this._cachedBlurredCanvas = null;
    this._lastBlurRadius = this._options.blurRadius;
    this._lastGradientRadius = this._options.gradientRadius;
  }

  _inherits(RadialBlurOperation, Operation);

  _prototypeProperties(RadialBlurOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "radial-blur";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Crops this image using WebGL
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        var canvas = renderer.getCanvas();
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var position = this._options.position.clone();
        position.y = 1 - position.y;

        if (this._options.numberFormat === "relative") {
          position.multiply(canvasSize);
        }

        var uniforms = {
          blurRadius: { type: "f", value: this._options.blurRadius },
          gradientRadius: { type: "f", value: this._options.gradientRadius },
          position: { type: "2f", value: [position.x, position.y] },
          texSize: { type: "2f", value: [canvas.width, canvas.height] },
          delta: { type: "2f", value: [1, 1] }
        };

        // First pass
        renderer.runShader(null, this.fragmentShader, {
          uniforms: uniforms
        });

        // Update delta for second pass
        uniforms.delta.value = [-1, 1];

        renderer.runShader(null, this.fragmentShader, {
          uniforms: uniforms
        });
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas2D
       * @param  {CanvasRenderer} renderer
       */

      value: function _renderCanvas(renderer) {
        var canvas = renderer.getCanvas();

        var blurRadiusChanged = this._options.blurRadius !== this._lastBlurRadius;
        var blurryCanvas = undefined;
        if (blurRadiusChanged || this._cachedBlurredCanvas === null) {
          // Blur and cache canvas
          blurryCanvas = this._blurCanvas(renderer);
          this._cachedBlurredCanvas = blurryCanvas;
          this._lastBlurRadius = this._options.blurRadius;
          this._lastGradientRadius = this._options.gradientRadius;
        } else {
          // Use cached canvas
          blurryCanvas = this._cachedBlurredCanvas;
        }

        var maskCanvas = this._createMask(renderer);

        this._applyMask(canvas, blurryCanvas, maskCanvas);
      },
      writable: true,
      configurable: true
    },
    _blurCanvas: {

      /**
       * Creates a blurred copy of the canvas
       * @param  {CanvasRenderer} renderer
       * @return {Canvas}
       * @private
       */

      value: function _blurCanvas(renderer) {
        var newCanvas = renderer.cloneCanvas();
        var blurryContext = newCanvas.getContext("2d");
        var blurryImageData = blurryContext.getImageData(0, 0, newCanvas.width, newCanvas.height);
        StackBlur.stackBlurCanvasRGBA(blurryImageData, 0, 0, newCanvas.width, newCanvas.height, this._options.blurRadius);
        blurryContext.putImageData(blurryImageData, 0, 0);

        return newCanvas;
      },
      writable: true,
      configurable: true
    },
    _createMask: {

      /**
       * Creates the mask canvas
       * @param  {CanvasRenderer} renderer
       * @return {Canvas}
       * @private
       */

      value: function _createMask(renderer) {
        var canvas = renderer.getCanvas();

        var canvasSize = new Vector2(canvas.width, canvas.height);
        var gradientRadius = this._options.gradientRadius;

        var maskCanvas = renderer.createCanvas(canvas.width, canvas.height);
        var maskContext = maskCanvas.getContext("2d");

        var position = this._options.position.clone();

        if (this._options.numberFormat === "relative") {
          position.multiply(canvasSize);
        }

        // Build gradient
        var gradient = maskContext.createRadialGradient(position.x, position.y, 0, position.x, position.y, gradientRadius);
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(1, "#000000");

        // Draw gradient
        maskContext.fillStyle = gradient;
        maskContext.fillRect(0, 0, canvas.width, canvas.height);

        return maskCanvas;
      },
      writable: true,
      configurable: true
    },
    _applyMask: {

      /**
       * Applies the blur and mask to the input canvas
       * @param  {Canvas} inputCanvas
       * @param  {Canvas} blurryCanvas
       * @param  {Canvas} maskCanvas
       * @private
       */

      value: function _applyMask(inputCanvas, blurryCanvas, maskCanvas) {
        var inputContext = inputCanvas.getContext("2d");
        var blurryContext = blurryCanvas.getContext("2d");
        var maskContext = maskCanvas.getContext("2d");

        var inputImageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
        var pixels = inputImageData.data;
        var blurryPixels = blurryContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;
        var maskPixels = maskContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;

        var index, alpha;
        for (var y = 0; y < inputCanvas.height; y++) {
          for (var x = 0; x < inputCanvas.width; x++) {
            index = (y * inputCanvas.width + x) * 4;
            alpha = maskPixels[index] / 255;

            pixels[index] = alpha * pixels[index] + (1 - alpha) * blurryPixels[index];
            pixels[index + 1] = alpha * pixels[index + 1] + (1 - alpha) * blurryPixels[index + 1];
            pixels[index + 2] = alpha * pixels[index + 2] + (1 - alpha) * blurryPixels[index + 2];
          }
        }

        inputContext.putImageData(inputImageData, 0, 0);
      },
      writable: true,
      configurable: true
    },
    dirty: {

      /**
       * Sets the dirty state of this operation
       * @param {Boolean} dirty
       * @comment Since blur operations do seperate caching of the
       *          blurred canvas, we need to invalidate the cache when the
       *          dirty state changes.
       */

      set: function (dirty) {
        _set(Object.getPrototypeOf(RadialBlurOperation.prototype), "dirty", dirty, this);
        this._cachedBlurredCanvas = null;
      },

      /**
       * Returns the dirty state
       * @type {Boolean}
       */
      get: function () {
        return _get(Object.getPrototypeOf(RadialBlurOperation.prototype), "dirty", this);
      },
      configurable: true
    }
  });

  return RadialBlurOperation;
})(Operation);

module.exports = RadialBlurOperation;

},{"../lib/math/vector2":49,"../vendor/stack-blur":132,"./operation":101}],103:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

/**
 * An operation that can crop out a part of the image and rotates it
 *
 * @class
 * @alias ImglyKit.Operations.RotationOperation
 * @extends ImglyKit.Operation
 */

var RotationOperation = (function (Operation) {
  function RotationOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, RotationOperation);

    this.availableOptions = {
      degrees: { type: "number", "default": 0, validation: function validation(value) {
          if (value % 90 !== 0) {
            throw new Error("RotationOperation: `rotation` has to be a multiple of 90.");
          }
        } }
    };

    /**
     * The fragment shader used for this operation
     */
    this.vertexShader = "\n      attribute vec2 a_position;\n      attribute vec2 a_texCoord;\n      varying vec2 v_texCoord;\n      uniform mat3 u_matrix;\n\n      void main() {\n        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);\n        v_texCoord = a_texCoord;\n      }\n    ";

    _get(Object.getPrototypeOf(RotationOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(RotationOperation, Operation);

  _prototypeProperties(RotationOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "rotation";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Rotates the image using WebGL
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        var canvas = renderer.getCanvas();

        var actualDegrees = this._options.degrees % 360;

        // If we're not rotating by 180 degrees, we need to resize the canvas
        // and the texture
        if (actualDegrees % 180 !== 0) {
          var newDimensions = this.getNewDimensions(renderer);

          // Resize the canvas
          canvas.width = newDimensions.x;
          canvas.height = newDimensions.y;
        }

        // Build the rotation matrix
        var radians = actualDegrees * (Math.PI / 180);
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        var rotationMatrix = [c, -s, 0, s, c, 0, 0, 0, 1];

        // Run the shader
        renderer.runShader(this.vertexShader, null, {
          uniforms: {
            u_matrix: { type: "mat3fv", value: rotationMatrix }
          }
        });
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas2D
       * @param  {CanvasRenderer} renderer
       */

      value: function _renderCanvas(renderer) {
        var canvas = renderer.getCanvas();

        var actualDegrees = this._options.degrees % 360;
        var newDimensions = this.getNewDimensions(renderer);

        // Create a rotated canvas
        var newCanvas = renderer.createCanvas();
        newCanvas.width = newDimensions.x;
        newCanvas.height = newDimensions.y;
        var newContext = newCanvas.getContext("2d");

        newContext.save();

        // Translate the canvas
        newContext.translate(newCanvas.width / 2, newCanvas.height / 2);

        // Rotate the canvas
        newContext.rotate(actualDegrees * (Math.PI / 180));

        // Create a temporary canvas so that we can draw the image
        // with the applied transformation
        var tempCanvas = renderer.cloneCanvas();
        newContext.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2);

        // Restore old transformation
        newContext.restore();

        renderer.setCanvas(newCanvas);
      },
      writable: true,
      configurable: true
    },
    getNewDimensions: {

      /**
       * Gets the new dimensions
       * @param {Renderer} renderer
       * @param {Vector2} [dimensions]
       * @return {Vector2}
       */

      value: function getNewDimensions(renderer, dimensions) {
        var canvas = renderer.getCanvas();
        dimensions = dimensions || new Vector2(canvas.width, canvas.height);

        var actualDegrees = this._options.degrees % 360;
        if (actualDegrees % 180 !== 0) {
          var tempX = dimensions.x;
          dimensions.x = dimensions.y;
          dimensions.y = tempX;
        }

        return dimensions;
      },
      writable: true,
      configurable: true
    }
  });

  return RotationOperation;
})(Operation);

module.exports = RotationOperation;

},{"../lib/math/vector2":49,"./operation":101}],104:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var PrimitivesStack = _interopRequire(require("./filters/primitives-stack"));

var SaturationPrimitive = _interopRequire(require("./filters/primitives/saturation"));

/**
 * @class
 * @alias ImglyKit.Operations.SaturationOperation
 * @extends ImglyKit.Operation
 */

var SaturationOperation = (function (Operation) {
  function SaturationOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, SaturationOperation);

    this.availableOptions = {
      saturation: { type: "number", "default": 1 }
    };

    _get(Object.getPrototypeOf(SaturationOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(SaturationOperation, Operation);

  _prototypeProperties(SaturationOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "saturation";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Renders the saturation using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       */

      value: function _renderWebGL(renderer) {
        this._render(renderer);
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Renders the saturation using Canvas2D
       * @param {CanvasRenderer} renderer
       * @override
       */

      value: function _renderCanvas(renderer) {
        this._render(renderer);
      },
      writable: true,
      configurable: true
    },
    _render: {

      /**
       * Renders the saturation (all renderers supported)
       * @param  {Renderer} renderer
       * @private
       */

      value: function _render(renderer) {
        var stack = new PrimitivesStack();

        stack.add(new SaturationPrimitive({
          saturation: this._options.saturation
        }));

        stack.render(renderer);
      },
      writable: true,
      configurable: true
    }
  });

  return SaturationOperation;
})(Operation);

module.exports = SaturationOperation;

},{"./filters/primitives-stack":81,"./filters/primitives/saturation":90,"./operation":101}],105:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var Utils = _interopRequire(require("../lib/utils"));

var bluebird = _interopRequire(require("bluebird"));

/**
 * An operation that can draw text on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.StickersOperation
 * @extends ImglyKit.Operation
 */

var StickersOperation = (function (Operation) {
  function StickersOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, StickersOperation);

    this.availableOptions = {
      sticker: { type: "string" },
      position: { type: "vector2", "default": new Vector2(0, 0) },
      size: { type: "vector2", "default": new Vector2(0, 0) }
    };

    /**
     * The texture index used for the sticker
     * @type {Number}
     * @private
     */
    this._textureIndex = 1;

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_stickerImage;\n      uniform vec2 u_position;\n      uniform vec2 u_size;\n\n      void main() {\n        vec4 color0 = texture2D(u_image, v_texCoord);\n        vec2 relative = (v_texCoord - u_position) / u_size;\n\n        if (relative.x >= 0.0 && relative.x <= 1.0 &&\n          relative.y >= 0.0 && relative.y <= 1.0) {\n\n            vec4 color1 = texture2D(u_stickerImage, relative);\n            gl_FragColor = vec4(mix(color0.rgb, color1.rgb, color1.a), 1.0);\n\n        } else {\n\n          gl_FragColor = color0;\n\n        }\n      }\n    ";

    this._loadedStickers = {};

    _get(Object.getPrototypeOf(StickersOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(StickersOperation, Operation);

  _prototypeProperties(StickersOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "stickers";
      },
      configurable: true
    },
    render: {

      /**
       * Applies this operation
       * @param  {Renderer} renderer
       * @return {Promise}
       * @abstract
       */

      value: function render(renderer) {
        var self = this;
        return this._loadSticker().then(function (image) {
          if (renderer.identifier === "webgl") {
            /* istanbul ignore next */
            return self._renderWebGL(renderer, image);
          } else {
            return self._renderCanvas(renderer, image);
          }
        });
      },
      writable: true,
      configurable: true
    },
    _renderWebGL: {

      /**
       * Crops this image using WebGL
       * @param  {WebGLRenderer} renderer
       * @param  {Image} image
       * @private
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer, image) {
        var canvas = renderer.getCanvas();
        var gl = renderer.getContext();

        var position = this._options.position.clone();
        var canvasSize = new Vector2(canvas.width, canvas.height);

        if (this._options.numberFormat === "absolute") {
          position.divide(canvasSize);
        }

        var size = new Vector2(image.width, image.height);
        if (typeof this._options.size !== "undefined") {
          size.copy(this._options.size);

          if (this._options.numberFormat === "relative") {
            size.multiply(canvasSize);
          }

          // Calculate image ratio, scale by width
          var ratio = image.height / image.width;
          size.y = size.x * ratio;
        }
        size.divide(canvasSize);

        position.y = 1 - position.y; // Invert y
        position.y -= size.y; // Fix y

        // Upload the texture
        gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
        this._texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.activeTexture(gl.TEXTURE0);

        // Execute the shader
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_stickerImage: { type: "i", value: this._textureIndex },
            u_position: { type: "2f", value: [position.x, position.y] },
            u_size: { type: "2f", value: [size.x, size.y] }
          }
        });
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas2D
       * @param  {CanvasRenderer} renderer
       * @param  {Image} image
       * @private
       */

      value: function _renderCanvas(renderer, image) {
        var canvas = renderer.getCanvas();
        var context = renderer.getContext();

        var canvasSize = new Vector2(canvas.width, canvas.height);
        var scaledPosition = this._options.position.clone();

        if (this._options.numberFormat === "relative") {
          scaledPosition.multiply(canvasSize);
        }

        var size = new Vector2(image.width, image.height);
        if (typeof this._options.size !== "undefined") {
          size.copy(this._options.size);

          if (this._options.numberFormat === "relative") {
            size.multiply(canvasSize);
          }
        }

        context.drawImage(image, 0, 0, image.width, image.height, scaledPosition.x, scaledPosition.y, size.x, size.y);
      },
      writable: true,
      configurable: true
    },
    _loadSticker: {

      /**
       * Loads the sticker
       * @return {Promise}
       * @private
       */

      value: function _loadSticker() {
        var isBrowser = typeof window !== "undefined";
        if (isBrowser) {
          return this._loadImageBrowser(this._options.sticker);
        } else {
          return this._loadImageNode(this._options.sticker);
        }
      },
      writable: true,
      configurable: true
    },
    _loadImageBrowser: {

      /**
       * Loads the given image using the browser's `Image` class
       * @param  {String} fileName
       * @return {Promise}
       * @private
       */

      value: function _loadImageBrowser(fileName) {
        var self = this;
        return new Promise(function (resolve, reject) {
          // Return preloaded sticker if available
          if (self._loadedStickers[fileName]) {
            return resolve(self._loadedStickers[fileName]);
          }

          var image = new Image();

          image.addEventListener("load", function () {
            self._loadedStickers[fileName] = image;
            resolve(image);
          });
          image.addEventListener("error", function () {
            reject(new Error("Could not load sticker: " + fileName));
          });

          image.src = self._kit.getAssetPath(fileName);
        });
      },
      writable: true,
      configurable: true
    },
    _loadImageNode: {

      /**
       * Loads the given image using node.js' `fs` and node-canvas `Image`
       * @param  {String} fileName
       * @return {Promise}
       * @private
       */

      value: function _loadImageNode(fileName) {
        var Canvas = require("canvas");
        

        var self = this;
        var image = new Canvas.Image();
        var path = self._kit.getAssetPath(fileName);

        return bluebird.promisify(fs.readFile)(path).then(function (buffer) {
          image.src = buffer;
          return image;
        });
      },
      writable: true,
      configurable: true
    },
    stickers: {

      /**
       * The registered stickers
       * @type {Object.<String,String>}
       */

      get: function () {
        return this._stickers;
      },
      configurable: true
    }
  });

  return StickersOperation;
})(Operation);

module.exports = StickersOperation;

},{"../lib/math/vector2":49,"../lib/utils":51,"./operation":101,"bluebird":4,"canvas":"canvas"}],106:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var Color = _interopRequire(require("../lib/color"));

/**
 * An operation that can draw text on the canvas
 *
 * @class
 * @alias ImglyKit.Operations.TextOperation
 * @extends ImglyKit.Operation
 */

var TextOperation = (function (Operation) {
  function TextOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, TextOperation);

    this.availableOptions = {
      fontSize: { type: "number", "default": 0.1 },
      lineHeight: { type: "number", "default": 1.1 },
      fontFamily: { type: "string", "default": "Times New Roman" },
      fontWeight: { type: "string", "default": "normal" },
      alignment: { type: "string", "default": "left", available: ["left", "center", "right"] },
      verticalAlignment: { type: "string", "default": "top", available: ["top", "center", "bottom"] },
      color: { type: "color", "default": new Color(1, 1, 1, 1) },
      backgroundColor: { type: "color", "default": new Color(0, 0, 0, 0) },
      position: { type: "vector2", "default": new Vector2(0, 0) },
      text: { type: "string", required: true },
      maxWidth: { type: "number", "default": 1 }
    };

    /**
     * The texture index used for the text
     * @type {Number}
     * @private
     */
    this._textureIndex = 1;

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_textImage;\n      uniform vec2 u_position;\n      uniform vec2 u_size;\n\n      void main() {\n        vec4 color0 = texture2D(u_image, v_texCoord);\n        vec2 relative = (v_texCoord - u_position) / u_size;\n\n        if (relative.x >= 0.0 && relative.x <= 1.0 &&\n          relative.y >= 0.0 && relative.y <= 1.0) {\n\n            vec4 color1 = texture2D(u_textImage, relative);\n            gl_FragColor = vec4(mix(color0.rgb, color1.rgb, color1.a), 1.0);\n\n        } else {\n\n          gl_FragColor = color0;\n\n        }\n      }\n    ";

    _get(Object.getPrototypeOf(TextOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(TextOperation, Operation);

  _prototypeProperties(TextOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "text";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Crops this image using WebGL
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        var textCanvas = this._renderTextCanvas(renderer);

        var canvas = renderer.getCanvas();
        var gl = renderer.getContext();

        var position = this._options.position.clone();
        var canvasSize = new Vector2(canvas.width, canvas.height);
        var size = new Vector2(textCanvas.width, textCanvas.height).divide(canvasSize);

        if (this._options.numberFormat === "absolute") {
          position.divide(canvasSize);
        }

        position.y = 1 - position.y; // Invert y
        position.y -= size.y; // Fix y

        // Adjust vertical alignment
        if (this._options.verticalAlignment === "center") {
          position.y += size.y / 2;
        } else if (this._options.verticalAlignment === "bottom") {
          position.y += size.y;
        }

        // Adjust horizontal alignment
        if (this._options.alignment === "center") {
          position.x -= size.x / 2;
        } else if (this._options.alignment === "right") {
          position.x -= size.x;
        }

        // Upload the texture
        gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
        this._texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
        gl.activeTexture(gl.TEXTURE0);

        // Execute the shader
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_textImage: { type: "i", value: this._textureIndex },
            u_position: { type: "2f", value: [position.x, position.y] },
            u_size: { type: "2f", value: [size.x, size.y] }
          }
        });
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas2D
       * @param  {CanvasRenderer} renderer
       */

      value: function _renderCanvas(renderer) {
        var textCanvas = this._renderTextCanvas(renderer);

        var canvas = renderer.getCanvas();
        var context = renderer.getContext();

        var canvasSize = new Vector2(canvas.width, canvas.height);
        var scaledPosition = this._options.position.clone();

        if (this._options.numberFormat === "relative") {
          scaledPosition.multiply(canvasSize);
        }

        // Adjust vertical alignment
        if (this._options.verticalAlignment === "center") {
          scaledPosition.y -= textCanvas.height / 2;
        } else if (this._options.verticalAlignment === "bottom") {
          scaledPosition.y -= textCanvas.height;
        }

        // Adjust horizontal alignment
        if (this._options.alignment === "center") {
          scaledPosition.x -= textCanvas.width / 2;
        } else if (this._options.alignment === "right") {
          scaledPosition.x -= textCanvas.width;
        }

        context.drawImage(textCanvas, scaledPosition.x, scaledPosition.y);
      },
      writable: true,
      configurable: true
    },
    _renderTextCanvas: {

      /**
       * Renders the text canvas that will be used as a texture in WebGL
       * and as an image in canvas
       * @return {Canvas}
       * @private
       */

      value: function _renderTextCanvas(renderer) {
        var line = undefined,
            lineNum = undefined;
        var canvas = renderer.createCanvas();
        var context = canvas.getContext("2d");

        var outputCanvas = renderer.getCanvas();
        var canvasSize = new Vector2(outputCanvas.width, outputCanvas.height);

        var maxWidth = this._options.maxWidth;
        var actualFontSize = this._options.fontSize * canvasSize.y;
        var actualLineHeight = this._options.lineHeight * actualFontSize;

        if (this._options.numberFormat === "relative") {
          maxWidth *= renderer.getCanvas().width;
        }

        // Apply text options
        this._applyTextOptions(renderer, context);

        var boundingBox = new Vector2();

        var lines = this._options.text.split("\n");
        if (typeof maxWidth !== "undefined") {
          // Calculate the bounding box
          boundingBox.x = maxWidth;
          lines = this._buildOutputLines(context, maxWidth);
        } else {
          for (lineNum = 0; lineNum < lines.length; lineNum++) {
            line = lines[lineNum];
            boundingBox.x = Math.max(boundingBox.x, context.measureText(line).width);
          }
        }

        // Calculate boundingbox height
        boundingBox.y = actualLineHeight * lines.length;

        // Resize the canvas
        canvas.width = boundingBox.x;
        canvas.height = boundingBox.y;

        // Get the context again
        context = canvas.getContext("2d");

        // Render background color
        context.fillStyle = this._options.backgroundColor.toRGBA();
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Apply text options
        this._applyTextOptions(renderer, context);

        // Draw lines
        for (lineNum = 0; lineNum < lines.length; lineNum++) {
          line = lines[lineNum];
          this._drawText(context, line, actualLineHeight * lineNum);
        }

        return canvas;
      },
      writable: true,
      configurable: true
    },
    _applyTextOptions: {

      /**
       * Applies the text options on the given context
       * @param  {Renderer} renderer
       * @param  {RenderingContext2D} context
       * @private
       */

      value: function _applyTextOptions(renderer, context) {
        var canvas = renderer.getCanvas();
        var canvasSize = new Vector2(canvas.width, canvas.height);
        var actualFontSize = this._options.fontSize * canvasSize.y;

        context.font = this._options.fontWeight + " " + actualFontSize + "px " + this._options.fontFamily;
        context.textBaseline = "top";
        context.textAlign = this._options.alignment;
        context.fillStyle = this._options.color.toRGBA();
      },
      writable: true,
      configurable: true
    },
    _buildOutputLines: {

      /**
       * Iterate over all lines and split them into multiple lines, depending
       * on the width they need
       * @param {RenderingContext2d} context
       * @param {Number} maxWidth
       * @return {Array.<string>}
       * @private
       */

      value: function _buildOutputLines(context, maxWidth) {
        var inputLines = this._options.text.split("\n");
        var outputLines = [];
        var currentChars = [];

        for (var lineNum = 0; lineNum < inputLines.length; lineNum++) {
          var inputLine = inputLines[lineNum];
          var lineChars = inputLine.split("");

          if (lineChars.length === 0) {
            outputLines.push("");
          }

          for (var charNum = 0; charNum < lineChars.length; charNum++) {
            var currentChar = lineChars[charNum];
            currentChars.push(currentChar);
            var currentLine = currentChars.join("");
            var lineWidth = context.measureText(currentLine).width;

            if (lineWidth > maxWidth && currentChars.length === 1) {
              outputLines.push(currentChars[0]);
              currentChars = [];
            } else if (lineWidth > maxWidth) {
              // Remove the last word
              var lastWord = currentChars.pop();

              // Add the line, clear the words
              outputLines.push(currentChars.join(""));
              currentChars = [];

              // Make sure to use the last word for the next line
              currentChars = [lastWord];
            } else if (charNum === lineChars.length - 1) {
              // Add the line, clear the words
              outputLines.push(currentChars.join(""));
              currentChars = [];
            }
          }

          // Line ended, but there's words left
          if (currentChars.length) {
            outputLines.push(currentChars.join(""));
            currentChars = [];
          }
        }
        return outputLines;
      },
      writable: true,
      configurable: true
    },
    _drawText: {

      /**
       * Draws the given line onto the given context at the given Y position
       * @param  {RenderingContext2D} context
       * @param  {String} text
       * @param  {Number} y
       * @private
       */

      value: function _drawText(context, text, y) {
        var canvas = context.canvas;
        if (this._options.alignment === "center") {
          context.fillText(text, canvas.width / 2, y);
        } else if (this._options.alignment === "left") {
          context.fillText(text, 0, y);
        } else if (this._options.alignment === "right") {
          context.fillText(text, canvas.width, y);
        }
      },
      writable: true,
      configurable: true
    }
  });

  return TextOperation;
})(Operation);

module.exports = TextOperation;

},{"../lib/color":44,"../lib/math/vector2":49,"./operation":101}],107:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { return set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { return desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { return setter.call(receiver, value); } } };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var StackBlur = _interopRequire(require("../vendor/stack-blur"));

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias ImglyKit.Operations.TiltShiftOperation
 * @extends ImglyKit.Operation
 */

var TiltShiftOperation = (function (Operation) {
  function TiltShiftOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, TiltShiftOperation);

    this.availableOptions = {
      start: { type: "vector2", "default": new Vector2(0, 0.5) },
      end: { type: "vector2", "default": new Vector2(1, 0.5) },
      blurRadius: { type: "number", "default": 30 },
      gradientRadius: { type: "number", "default": 50 }
    };

    /**
     * The fragment shader used for this operation
     * @internal Based on evanw's glfx.js tilt shift shader:
     *           https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
     */
    this.fragmentShader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      uniform float blurRadius;\n      uniform float gradientRadius;\n      uniform vec2 start;\n      uniform vec2 end;\n      uniform vec2 delta;\n      uniform vec2 texSize;\n      varying vec2 v_texCoord;\n\n      float random(vec3 scale, float seed) {\n        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n      }\n\n      void main() {\n          vec4 color = vec4(0.0);\n          float total = 0.0;\n\n          float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n          vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n          float radius = smoothstep(0.0, 1.0, abs(dot(v_texCoord * texSize - start, normal)) / gradientRadius) * blurRadius;\n          for (float t = -30.0; t <= 30.0; t++) {\n              float percent = (t + offset - 0.5) / 30.0;\n              float weight = 1.0 - abs(percent);\n              vec4 sample = texture2D(u_image, v_texCoord + delta * percent * radius / texSize);\n\n              sample.rgb *= sample.a;\n\n              color += sample * weight;\n              total += weight;\n          }\n\n          gl_FragColor = color / total;\n          gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n      }\n    ";

    _get(Object.getPrototypeOf(TiltShiftOperation.prototype), "constructor", this).apply(this, args);

    this._cachedBlurredCanvas = null;
    this._lastBlurRadius = this._options.blurRadius;
    this._lastGradientRadius = this._options.gradientRadius;
  }

  _inherits(TiltShiftOperation, Operation);

  _prototypeProperties(TiltShiftOperation, null, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * operations.
       * @type {String}
       */

      get: function () {
        return "tilt-shift";
      },
      configurable: true
    },
    _renderWebGL: {

      /**
       * Crops this image using WebGL
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        var canvas = renderer.getCanvas();
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var start = this._options.start.clone();
        var end = this._options.end.clone();

        if (this._options.numberFormat === "relative") {
          start.multiply(canvasSize);
          end.multiply(canvasSize);
        }

        start.y = canvasSize.y - start.y;
        end.y = canvasSize.y - end.y;

        var delta = end.clone().subtract(start);
        var d = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

        var uniforms = {
          blurRadius: { type: "f", value: this._options.blurRadius },
          gradientRadius: { type: "f", value: this._options.gradientRadius },
          start: { type: "2f", value: [start.x, start.y] },
          end: { type: "2f", value: [end.x, end.y] },
          delta: { type: "2f", value: [delta.x / d, delta.y / d] },
          texSize: { type: "2f", value: [canvas.width, canvas.height] }
        };

        renderer.runShader(null, this.fragmentShader, {
          uniforms: uniforms
        });

        uniforms.delta.value = [-delta.y / d, delta.x / d];

        renderer.runShader(null, this.fragmentShader, {
          uniforms: uniforms
        });
      },
      writable: true,
      configurable: true
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas2D
       * @param  {CanvasRenderer} renderer
       */

      value: function _renderCanvas(renderer) {
        var canvas = renderer.getCanvas();

        var optionsChanged = this._options.blurRadius !== this._lastBlurRadius || this._options.gradientRadius !== this._lastGradientRadius;
        var blurryCanvas = undefined;
        if (optionsChanged || this._cachedBlurredCanvas === null) {
          // Blur and cache canvas
          blurryCanvas = this._blurCanvas(renderer);
          this._cachedBlurredCanvas = blurryCanvas;
          this._lastBlurRadius = this._options.blurRadius;
          this._lastGradientRadius = this._options.gradientRadius;
        } else {
          // Use cached canvas
          blurryCanvas = this._cachedBlurredCanvas;
        }

        var maskCanvas = this._createMask(renderer);

        this._applyMask(canvas, blurryCanvas, maskCanvas);
      },
      writable: true,
      configurable: true
    },
    _blurCanvas: {

      /**
       * Creates a blurred copy of the canvas
       * @param  {CanvasRenderer} renderer
       * @return {Canvas}
       * @private
       */

      value: function _blurCanvas(renderer) {
        var newCanvas = renderer.cloneCanvas();
        var blurryContext = newCanvas.getContext("2d");
        var blurryImageData = blurryContext.getImageData(0, 0, newCanvas.width, newCanvas.height);
        StackBlur.stackBlurCanvasRGBA(blurryImageData, 0, 0, newCanvas.width, newCanvas.height, this._options.blurRadius);
        blurryContext.putImageData(blurryImageData, 0, 0);

        return newCanvas;
      },
      writable: true,
      configurable: true
    },
    _createMask: {

      /**
       * Creates the mask canvas
       * @param  {CanvasRenderer} renderer
       * @return {Canvas}
       * @private
       */

      value: function _createMask(renderer) {
        var canvas = renderer.getCanvas();

        var canvasSize = new Vector2(canvas.width, canvas.height);
        var gradientRadius = this._options.gradientRadius;

        var maskCanvas = renderer.createCanvas(canvas.width, canvas.height);
        var maskContext = maskCanvas.getContext("2d");

        var start = this._options.start.clone();
        var end = this._options.end.clone();

        if (this._options.numberFormat === "relative") {
          start.multiply(canvasSize);
          end.multiply(canvasSize);
        }

        var dist = end.clone().subtract(start);
        var middle = start.clone().add(dist.clone().divide(2));

        var totalDist = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2));
        var factor = dist.clone().divide(totalDist);

        var gradientStart = middle.clone().add(gradientRadius * factor.y, -gradientRadius * factor.x);
        var gradientEnd = middle.clone().add(-gradientRadius * factor.y, gradientRadius * factor.x);

        // Build gradient
        var gradient = maskContext.createLinearGradient(gradientStart.x, gradientStart.y, gradientEnd.x, gradientEnd.y);
        gradient.addColorStop(0, "#000000");
        gradient.addColorStop(0.5, "#FFFFFF");
        gradient.addColorStop(1, "#000000");

        // Draw gradient
        maskContext.fillStyle = gradient;
        maskContext.fillRect(0, 0, canvas.width, canvas.height);

        return maskCanvas;
      },
      writable: true,
      configurable: true
    },
    _applyMask: {

      /**
       * Applies the blur and mask to the input canvas
       * @param  {Canvas} inputCanvas
       * @param  {Canvas} blurryCanvas
       * @param  {Canvas} maskCanvas
       * @private
       */

      value: function _applyMask(inputCanvas, blurryCanvas, maskCanvas) {
        var inputContext = inputCanvas.getContext("2d");
        var blurryContext = blurryCanvas.getContext("2d");
        var maskContext = maskCanvas.getContext("2d");

        var inputImageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
        var pixels = inputImageData.data;
        var blurryPixels = blurryContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;
        var maskPixels = maskContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;

        for (var i = 0; i < maskPixels.length; i++) {
          var alpha = maskPixels[i] / 255;
          pixels[i] = alpha * pixels[i] + (1 - alpha) * blurryPixels[i];
        }

        inputContext.putImageData(inputImageData, 0, 0);
      },
      writable: true,
      configurable: true
    },
    dirty: {

      /**
       * Sets the dirty state of this operation
       * @param {Boolean} dirty
       * @comment Since blur operations do seperate caching of the
       *          blurred canvas, we need to invalidate the cache when the
       *          dirty state changes.
       */

      set: function (dirty) {
        _set(Object.getPrototypeOf(TiltShiftOperation.prototype), "dirty", dirty, this);
        this._cachedBlurredCanvas = null;
      },

      /**
       * Returns the dirty state
       * @type {Boolean}
       */
      get: function () {
        return _get(Object.getPrototypeOf(TiltShiftOperation.prototype), "dirty", this);
      },
      configurable: true
    }
  });

  return TiltShiftOperation;
})(Operation);

module.exports = TiltShiftOperation;

},{"../lib/math/vector2":49,"../vendor/stack-blur":132,"./operation":101}],108:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Renderer = _interopRequire(require("./renderer"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

/**
 * @class
 * @alias ImglyKit.CanvasRenderer
 * @extends {ImglyKit.Renderer}
 * @private
 */

var CanvasRenderer = (function (Renderer) {
  function CanvasRenderer() {
    _classCallCheck(this, CanvasRenderer);

    if (Renderer != null) {
      Renderer.apply(this, arguments);
    }
  }

  _inherits(CanvasRenderer, Renderer);

  _prototypeProperties(CanvasRenderer, {
    identifier: {
      /**
       * A unique string that identifies this renderer
       * @type {String}
       */

      get: function () {
        return "canvas";
      },
      configurable: true
    },
    isSupported: {

      /**
       * Checks whether this type of renderer is supported in the current environment
       * @abstract
       * @returns {boolean}
       */

      value: function isSupported() {
        var elem = this.prototype.createCanvas();
        return !!(elem.getContext && elem.getContext("2d"));
      },
      writable: true,
      configurable: true
    }
  }, {
    cache: {

      /**
       * Caches the current canvas content for the given identifier
       * @param {String} identifier
       */

      value: function cache(identifier) {
        this._cache[identifier] = {
          data: this._context.getImageData(0, 0, this._canvas.width, this._canvas.height),
          size: new Vector2(this._canvas.width, this._canvas.height)
        };
      },
      writable: true,
      configurable: true
    },
    drawCached: {

      /**
       * Draws the stored texture / image data for the given identifier
       * @param {String} identifier
       */

      value: function drawCached(identifier) {
        var _cache$identifier = this._cache[identifier];
        var data = _cache$identifier.data;
        var size = _cache$identifier.size;

        this._canvas.width = size.x;
        this._canvas.height = size.y;
        this._context.putImageData(data, 0, 0);
      },
      writable: true,
      configurable: true
    },
    _getContext: {

      /**
       * Gets the rendering context from the Canva
       * @return {RenderingContext}
       * @abstract
       */

      value: function _getContext() {
        /* istanbul ignore next */
        return this._canvas.getContext("2d");
      },
      writable: true,
      configurable: true
    },
    drawImage: {

      /**
       * Draws the given image on the canvas
       * @param  {Image} image
       */

      value: function drawImage(image) {
        this._context.drawImage(image, 0, 0, image.width, image.height, 0, 0, this._canvas.width, this._canvas.height);
      },
      writable: true,
      configurable: true
    },
    resizeTo: {

      /**
       * Resizes the current canvas picture to the given dimensions
       * @param  {Vector2} dimensions
       * @return {Promise}
       */

      value: function resizeTo(dimensions) {
        // Create a temporary canvas to draw to
        var newCanvas = this.createCanvas();
        newCanvas.width = dimensions.x;
        newCanvas.height = dimensions.y;
        var newContext = newCanvas.getContext("2d");

        // Draw the source canvas onto the new one
        newContext.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height, 0, 0, newCanvas.width, newCanvas.height);

        // Set the new canvas and context
        this.setCanvas(newCanvas);
      },
      writable: true,
      configurable: true
    },
    cloneCanvas: {

      /**
       * Returns a cloned version of the current canvas
       * @return {Canvas}
       */

      value: function cloneCanvas() {
        var canvas = this.createCanvas();
        var context = canvas.getContext("2d");

        // Resize the canvas
        canvas.width = this._canvas.width;
        canvas.height = this._canvas.height;

        // Draw the current canvas on the new one
        context.drawImage(this._canvas, 0, 0);

        return canvas;
      },
      writable: true,
      configurable: true
    }
  });

  return CanvasRenderer;
})(Renderer);

module.exports = CanvasRenderer;

},{"../lib/math/vector2":49,"./renderer":109}],109:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var EventEmitter = _interopRequire(require("../lib/event-emitter"));

/**
 * @class
 * @alias ImglyKit.Renderer
 * @param {Vector2} dimensions
 * @private
 */

var Renderer = (function (EventEmitter) {
  function Renderer(dimensions, canvas) {
    _classCallCheck(this, Renderer);

    _get(Object.getPrototypeOf(Renderer.prototype), "constructor", this).call(this);

    /**
     * @type {Canvas}
     * @private
     */
    this._canvas = canvas || this.createCanvas();

    if (!canvas) {
      this.setSize(dimensions);
    }

    /**
     * @type {RenderingContext}
     * @private
     */
    this._context = this._getContext();

    /**
     * The texture / image data cache
     * @type {Object.<String, *>}
     */
    this._cache = {};
  }

  _inherits(Renderer, EventEmitter);

  _prototypeProperties(Renderer, {
    isSupported: {

      /**
       * Checks whether this type of renderer is supported in the current environment
       * @abstract
       * @returns {boolean}
       */

      value: function isSupported() {
        /* istanbul ignore next */
        throw new Error("Renderer#isSupported is abstract and not implemented in inherited class.");
      },
      writable: true,
      configurable: true
    }
  }, {
    identifier: {

      /**
       * A unique string that identifies this renderer
       * @type {String}
       */

      get: function () {
        return null;
      },
      configurable: true
    },
    cache: {

      /**
       * Caches the current canvas content for the given identifier
       * @param {String} identifier
       */

      value: function cache(identifier) {},
      writable: true,
      configurable: true
    },
    drawCached: {

      /**
       * Draws the stored texture / image data for the given identifier
       * @param {String} identifier
       */

      value: function drawCached(identifier) {},
      writable: true,
      configurable: true
    },
    createCanvas: {

      /**
       * Creates a new canvas
       * @param {Number} [width]
       * @param {Number} [height]
       * @return {Canvas}
       * @private
       */

      value: function createCanvas(width, height) {
        var isBrowser = typeof window !== "undefined";
        var canvas;
        if (isBrowser) {
          /* istanbul ignore next */
          canvas = document.createElement("canvas");
        } else {
          var Canvas = require("canvas");
          canvas = new Canvas();
        }

        // Apply width
        if (typeof width !== "undefined") {
          canvas.width = width;
        }

        // Apply height
        if (typeof height !== "undefined") {
          canvas.height = height;
        }

        return canvas;
      },
      writable: true,
      configurable: true
    },
    getSize: {

      /**
       * Returns the current size of the canvas
       * @return {Vector2}
       */

      value: function getSize() {
        return new Vector2(this._canvas.width, this._canvas.height);
      },
      writable: true,
      configurable: true
    },
    setSize: {

      /**
       * Sets the canvas dimensions
       * @param {Vector2} dimensions
       */

      value: function setSize(dimensions) {
        this._canvas.width = dimensions.x;
        this._canvas.height = dimensions.y;
      },
      writable: true,
      configurable: true
    },
    _getContext: {

      /**
       * Gets the rendering context from the Canva
       * @return {RenderingContext}
       * @abstract
       */

      value: function _getContext() {
        /* istanbul ignore next */
        throw new Error("Renderer#_getContext is abstract and not implemented in inherited class.");
      },
      writable: true,
      configurable: true
    },
    resizeTo: {

      /**
       * Resizes the current canvas picture to the given dimensions
       * @param  {Vector2} dimensions
       * @return {Promise}
       * @abstract
       */

      value: function resizeTo(dimensions) {
        /* istanbul ignore next */
        throw new Error("Renderer#resizeTo is abstract and not implemented in inherited class.");
      },
      writable: true,
      configurable: true
    },
    drawImage: {

      /**
       * Draws the given image on the canvas
       * @param  {Image} image
       * @abstract
       */

      value: function drawImage(image) {
        /* istanbul ignore next */
        throw new Error("Renderer#drawImage is abstract and not implemented in inherited class.");
      },
      writable: true,
      configurable: true
    },
    renderFinal: {

      /**
       * Gets called after the stack has been rendered
       * @param  {Image} image
       */

      value: function renderFinal() {},
      writable: true,
      configurable: true
    },
    getCanvas: {

      /**
       * Returns the canvas
       * @return {Canvas}
       */

      value: function getCanvas() {
        return this._canvas;
      },
      writable: true,
      configurable: true
    },
    getContext: {

      /**
       * Returns the context
       * @return {RenderingContext}
       */

      value: function getContext() {
        return this._context;
      },
      writable: true,
      configurable: true
    },
    setCanvas: {

      /**
       * Sets the current canvas to the given one
       * @param {Canvas} canvas
       */

      value: function setCanvas(canvas) {
        this._canvas = canvas;
        this._context = this._getContext();

        this.emit("new-canvas", this._canvas);
      },
      writable: true,
      configurable: true
    },
    setContext: {

      /**
       * Sets the current context to the given one
       * @param {RenderingContext2D} context
       */

      value: function setContext(context) {
        this._context = context;
      },
      writable: true,
      configurable: true
    },
    reset: {

      /**
       * Resets the renderer
       */

      value: function reset() {},
      writable: true,
      configurable: true
    }
  });

  return Renderer;
})(EventEmitter);

module.exports = Renderer;
/*jshint unused:false */

},{"../lib/event-emitter":45,"../lib/math/vector2":49,"canvas":"canvas"}],110:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Renderer = _interopRequire(require("./renderer"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

/**
 * @class
 * @alias ImglyKit.WebGLRenderer
 * @extends {ImglyKit.Renderer}
 * @private
 */

var WebGLRenderer = (function (Renderer) {
  function WebGLRenderer() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, WebGLRenderer);

    _get(Object.getPrototypeOf(WebGLRenderer.prototype), "constructor", this).apply(this, args);

    this._defaultProgram = this.setupGLSLProgram();
    this.reset();
  }

  _inherits(WebGLRenderer, Renderer);

  _prototypeProperties(WebGLRenderer, {
    isSupported: {

      /**
       * Checks whether this type of renderer is supported in the current environment
       * @abstract
       * @returns {boolean}
       */

      value: function isSupported() {
        return !!(typeof window !== "undefined" && window.WebGLRenderingContext);
      },
      writable: true,
      configurable: true
    }
  }, {
    identifier: {

      /**
       * A unique string that identifies this renderer
       * @type {String}
       */

      get: function () {
        return "webgl";
      },
      configurable: true
    },
    cache: {

      /**
       * Caches the current canvas content for the given identifier
       * @param {String} identifier
       */

      value: function cache(identifier) {
        var size = new Vector2(this._canvas.width, this._canvas.height);

        // Re-use FBO and textures
        var fbo = undefined,
            texture = undefined,
            cacheObject = undefined;
        if (!this._cache[identifier]) {
          cacheObject = this._createFramebuffer();
        } else {
          cacheObject = this._cache[identifier];
        }

        // Extract FBO and texture
        fbo = cacheObject.fbo;
        texture = cacheObject.texture;

        // Resize output texture
        var gl = this._context;
        gl.useProgram(this._defaultProgram);

        // Resize cached texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Render to FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, size.x, size.y);

        // Use last fbo texture as input
        gl.bindTexture(gl.TEXTURE_2D, this._lastTexture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        this._cache[identifier] = { fbo: fbo, texture: texture, size: size };
      },
      writable: true,
      configurable: true
    },
    _drawCachedFinal: {

      /**
       * Debugging method to draw a cached texture to the canvas instead
       * to an FBO
       * @private
       */

      value: function _drawCachedFinal(identifier) {
        var _cache$identifier = this._cache[identifier];
        var texture = _cache$identifier.texture;
        var size = _cache$identifier.size;

        var gl = this._context;
        gl.useProgram(this._defaultProgram);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Use the cached texture as input
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Resize the canvas
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        gl.viewport(0, 0, size.x, size.y);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      writable: true,
      configurable: true
    },
    drawCached: {

      /**
       * Draws the stored texture / image data for the given identifier
       * @param {String} identifier
       */

      value: function drawCached(identifier) {
        var _cache$identifier = this._cache[identifier];
        var texture = _cache$identifier.texture;
        var size = _cache$identifier.size;

        var fbo = this.getCurrentFramebuffer();
        var currentTexture = this.getCurrentTexture();

        var gl = this._context;
        gl.useProgram(this._defaultProgram);

        // Resize the canvas
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        // Resize all textures
        for (var i = 0; i < this._textures.length; i++) {
          var otherTexture = this._textures[i];
          gl.bindTexture(gl.TEXTURE_2D, otherTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        // Select the current framebuffer to draw to
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Resize the texture we're drawing to
        gl.bindTexture(gl.TEXTURE_2D, currentTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Use the cached texture as input
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.viewport(0, 0, size.x, size.y);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        this.setLastTexture(currentTexture);
        this.selectNextBuffer();
      },
      writable: true,
      configurable: true
    },
    defaultVertexShader: {

      /**
       * The default vertex shader which just passes the texCoord to the
       * fragment shader.
       * @type {String}
       * @private
       */

      get: function () {
        var shader = "\n      attribute vec2 a_position;\n      attribute vec2 a_texCoord;\n      varying vec2 v_texCoord;\n\n      void main() {\n        gl_Position = vec4(a_position, 0, 1);\n        v_texCoord = a_texCoord;\n      }\n    ";
        return shader;
      },
      configurable: true
    },
    defaultFragmentShader: {

      /**
       * The default fragment shader which will just look up the colors from the
       * texture.
       * @type {String}
       * @private
       */

      get: function () {
        var shader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      varying vec2 v_texCoord;\n\n      void main() {\n        gl_FragColor = texture2D(u_image, v_texCoord);\n      }\n    ";
        return shader;
      },
      configurable: true
    },
    _getContext: {

      /**
       * Gets the rendering context from the Canvas
       * @return {RenderingContext}
       * @abstract
       */

      value: function _getContext() {
        /* istanbul ignore next */
        return this._canvas.getContext("webgl") || this._canvas.getContext("webgl-experimental");
      },
      writable: true,
      configurable: true
    },
    drawImage: {

      /**
       * Draws the given image on the canvas
       * @param  {Image} image
       */
      /* istanbul ignore next */

      value: function drawImage(image) {
        var gl = this._context;
        gl.useProgram(this._defaultProgram);

        // Create the texture
        var texture = this.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        this._inputTexture = texture;
        this.setLastTexture(texture);

        // Upload the image into the texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      writable: true,
      configurable: true
    },
    runShader: {

      /**
       * Runs the given shader
       * @param  {String} [vertexShader]
       * @param  {String} [fragmentShader]
       */
      /* istanbul ignore next */

      value: function runShader(vertexShader, fragmentShader, options) {
        if (typeof options === "undefined") options = {};
        if (typeof options.uniforms === "undefined") options.uniforms = {};

        var gl = this._context;
        var program = this.setupGLSLProgram(vertexShader, fragmentShader);
        gl.useProgram(program);

        var fbo = this.getCurrentFramebuffer();
        var currentTexture = this.getCurrentTexture();

        // Select the current framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, this._canvas.width, this._canvas.height);

        // Resize the texture to canvas size
        gl.bindTexture(gl.TEXTURE_2D, currentTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._canvas.width, this._canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Make sure we select the current texture
        gl.bindTexture(gl.TEXTURE_2D, this._lastTexture);

        // Set the uniforms
        for (var name in options.uniforms) {
          var location = gl.getUniformLocation(program, name);
          var uniform = options.uniforms[name];

          switch (uniform.type) {
            case "i":
            case "1i":
              gl.uniform1i(location, uniform.value);
              break;
            case "f":
            case "1f":
              gl.uniform1f(location, uniform.value);
              break;
            case "2f":
              gl.uniform2f(location, uniform.value[0], uniform.value[1]);
              break;
            case "3f":
              gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2]);
              break;
            case "4f":
              gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
              break;
            case "2fv":
              gl.uniform2fv(location, uniform.value);
              break;
            case "mat3fv":
              gl.uniformMatrix3fv(location, false, uniform.value);
              break;
            default:
              throw new Error("Unknown uniform type: " + uniform.type);
          }
        }

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        this.setLastTexture(currentTexture);
        this.selectNextBuffer();
      },
      writable: true,
      configurable: true
    },
    renderFinal: {

      /**
       * Draws the last used buffer onto the canvas
       */
      /* istanbul ignore next */

      value: function renderFinal() {
        var gl = this._context;
        var program = this._defaultProgram;
        gl.useProgram(program);

        // Don't draw to framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Make sure the viewport size is correct
        gl.viewport(0, 0, this._canvas.width, this._canvas.height);

        // Select the last texture that has been rendered to
        gl.bindTexture(gl.TEXTURE_2D, this._lastTexture);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      writable: true,
      configurable: true
    },
    setupGLSLProgram: {

      /**
       * Sets up a GLSL program. Uses the default vertex and fragment shader
       * if none are given.
       * @param {String} [vertexShader]
       * @param {String} [fragmentShader]
       * @return {WebGLProgram}
       */
      /* istanbul ignore next */

      value: function setupGLSLProgram(vertexShader, fragmentShader) {
        var gl = this._context;
        var shaders = [];

        // Use default vertex shader
        vertexShader = this._createShader(gl.VERTEX_SHADER, vertexShader || WebGLRenderer.prototype.defaultVertexShader);
        shaders.push(vertexShader);

        // Use default fragment shader
        fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fragmentShader || WebGLRenderer.prototype.defaultFragmentShader);
        shaders.push(fragmentShader);

        // Create the program
        var program = gl.createProgram();

        // Attach the shaders
        for (var i = 0; i < shaders.length; i++) {
          gl.attachShader(program, shaders[i]);
        }

        // Link the program
        gl.linkProgram(program);

        // Check linking status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
          var lastError = gl.getProgramInfoLog(program);
          gl.deleteProgram(program);
          throw new Error("WebGL program linking error: " + lastError);
        }

        // Lookup texture coordinates location
        var positionLocation = gl.getAttribLocation(program, "a_position");
        var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

        // Provide texture coordinates
        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        // First triangle
        0, 0, 1, 0, 0, 1,

        // Second triangle
        0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Create a buffer for the rectangle positions
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        // First triangle
        -1, -1, 1, -1, -1, 1,

        // Second triangle
        -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

        return program;
      },
      writable: true,
      configurable: true
    },
    _createShader: {

      /**
       * Creates a WebGL shader with the given type and source code
       * @param  {WebGLShaderType} shaderType
       * @param  {String} shaderSource
       * @return {WebGLShader}
       * @private
       */
      /* istanbul ignore next */

      value: function _createShader(shaderType, shaderSource) {
        var gl = this._context;

        // Create the shader and compile it
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        // Check compilation status
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
          var lastError = gl.getShaderInfoLog(shader);
          gl.deleteShader(shader);
          throw new Error("WebGL shader compilation error: " + lastError);
        }

        return shader;
      },
      writable: true,
      configurable: true
    },
    createTexture: {

      /**
       * Creates an empty texture
       * @return {WebGLTexture}
       */
      /* istanbul ignore next */

      value: function createTexture() {
        var gl = this._context;
        var texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture;
      },
      writable: true,
      configurable: true
    },
    _createFramebuffers: {

      /**
       * Creates two textures and framebuffers that are used for the stack
       * rendering
       * @private
       */
      /* istanbul ignore next */

      value: function _createFramebuffers() {
        for (var i = 0; i < 2; i++) {
          var _createFramebuffer = this._createFramebuffer();

          var fbo = _createFramebuffer.fbo;
          var texture = _createFramebuffer.texture;

          this._textures.push(texture);
          this._framebuffers.push(fbo);
        }
      },
      writable: true,
      configurable: true
    },
    _createFramebuffer: {

      /**
       * Creates and returns a frame buffer and texture
       * @return {Object}
       * @private
       */

      value: function _createFramebuffer() {
        var gl = this._context;

        // Create texture
        var texture = this.createTexture();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._canvas.width, this._canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Create framebuffer
        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Attach the texture
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        return { fbo: fbo, texture: texture };
      },
      writable: true,
      configurable: true
    },
    resizeTo: {

      /**
       * Resizes the current canvas picture to the given dimensions
       * @param  {Vector2} dimensions
       * @todo Use a downsampling shader for smoother image resizing
       */
      /* istanbul ignore next */

      value: function resizeTo(dimensions) {
        var gl = this._context;

        // Resize the canvas
        this._canvas.width = dimensions.x;
        this._canvas.height = dimensions.y;

        // Update the viewport dimensions
        gl.viewport(0, 0, this._canvas.width, this._canvas.height);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      writable: true,
      configurable: true
    },
    getCurrentFramebuffer: {

      /**
       * Returns the current framebuffer
       * @return {WebGLFramebuffer}
       */

      value: function getCurrentFramebuffer() {
        return this._framebuffers[this._bufferIndex % 2];
      },
      writable: true,
      configurable: true
    },
    getCurrentTexture: {

      /**
       * Returns the current texture
       * @return {WebGLTexture}
       */

      value: function getCurrentTexture() {
        return this._textures[this._bufferIndex % 2];
      },
      writable: true,
      configurable: true
    },
    selectNextBuffer: {

      /**
       * Increases the buffer index
       */

      value: function selectNextBuffer() {
        this._bufferIndex++;
      },
      writable: true,
      configurable: true
    },
    getDefaultProgram: {

      /**
       * Returns the default program
       * @return {WebGLProgram}
       */

      value: function getDefaultProgram() {
        return this._defaultProgram;
      },
      writable: true,
      configurable: true
    },
    getLastTexture: {

      /**
       * Returns the last texture that has been drawn to
       * @return {WebGLTexture}
       */

      value: function getLastTexture() {
        return this._lastTexture;
      },
      writable: true,
      configurable: true
    },
    getTextures: {

      /**
       * Returns all textures
       * @return {Array.<WebGLTexture>}
       */

      value: function getTextures() {
        return this._textures;
      },
      writable: true,
      configurable: true
    },
    setLastTexture: {

      /**
       * Sets the last texture
       * @param {WebGLTexture} texture
       */

      value: function setLastTexture(texture) {
        this._lastTexture = texture;
      },
      writable: true,
      configurable: true
    },
    reset: {

      /**
       * Resets the renderer
       * @override
       */

      value: function reset() {
        this._lastTexture = null;
        this._textures = [];
        this._framebuffers = [];
        this._bufferIndex = 0;

        this._createFramebuffers();
        this.setLastTexture(this._inputTexture);
      },
      writable: true,
      configurable: true
    }
  });

  return WebGLRenderer;
})(Renderer);

module.exports = WebGLRenderer;

},{"../lib/math/vector2":49,"./renderer":109}],111:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Helpers = (function () {
  function Helpers(kit, ui, options) {
    _classCallCheck(this, Helpers);

    this._kit = kit;
    this._ui = ui;
    this._options = options;
  }

  _prototypeProperties(Helpers, null, {
    assetPath: {
      value: function assetPath(asset) {
        return this._options.assetsUrl + "/" + asset;
      },
      writable: true,
      configurable: true
    }
  });

  return Helpers;
})();

module.exports = Helpers;

},{}],112:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var dot = _interopRequire(require("dot"));

var Utils = _interopRequire(require("../../lib/utils"));

var Helpers = _interopRequire(require("./helpers"));

var BaseUI = (function () {
  function BaseUI(kit, options) {
    _classCallCheck(this, BaseUI);

    this._kit = kit;
    this._options = options;
    this._operations = [];
    this._helpers = new Helpers(this.kit, this, options);
    this.selectOperations(null);
  }

  _prototypeProperties(BaseUI, null, {
    run: {

      /**
       * Prepares the UI for use
       */

      value: function run() {
        this._attach();
      },
      writable: true,
      configurable: true
    },
    identifier: {

      /**
       * A unique string that represents this UI
       * @type {String}
       */

      get: function () {
        return null;
      },
      configurable: true
    },
    _attach: {

      /**
       * Renders and attaches the UI HTML
       * @private
       */

      value: function _attach() {
        if (this._options.container === null) {
          throw new Error("BaseUI#attach: No container set.");
        }

        var html = this._render();
        this._options.container.innerHTML = html;

        // Container has to be position: relative
        this._options.container.style.position = "relative";
      },
      writable: true,
      configurable: true
    },
    _render: {

      /**
       * Renders the template
       * @private
       */

      value: function _render() {
        if (typeof this._template === "undefined") {
          throw new Error("BaseUI#_render: No template set.");
        }

        var renderFn = dot.template(this._template);
        return renderFn(this.context);
      },
      writable: true,
      configurable: true
    },
    selectOperations: {

      /**
       * Selects the enabled operations
       * @param {ImglyKit.Selector}
       */

      value: function selectOperations(selector) {
        var registeredOperations = this._kit.registeredOperations;

        var operationIdentifiers = Object.keys(registeredOperations);

        var selectedOperations = Utils.select(operationIdentifiers, selector);
        this._operations = selectedOperations.map(function (identifier) {
          return registeredOperations[identifier];
        });
      },
      writable: true,
      configurable: true
    },
    isOperationSelected: {

      /**
       * Checks whether the operation with the given identifier is selected
       * @param {String} identifier
       * @returns {Boolean}
       */

      value: function isOperationSelected(identifier) {
        var operationIdentifiers = this._operations.map(function (operation) {
          return operation.prototype.identifier;
        });
        return operationIdentifiers.indexOf(identifier) !== -1;
      },
      writable: true,
      configurable: true
    },
    context: {

      /**
       * The data that is passed to the template renderer
       * @type {Object}
       */

      get: function () {
        return {
          operations: this._operations,
          helpers: this._helpers
        };
      },
      configurable: true
    },
    container: {

      /**
       * The DOM container
       * @type {DOMElement}
       */

      get: function () {
        return this._options.container;
      },
      configurable: true
    },
    operations: {

      /**
       * The selected / active operations
       * @type {Array.<ImglyKit.Operation>}
       */

      get: function () {
        return this._operations;
      },
      configurable: true
    },
    options: {

      /**
       * The options
       * @type {Object}
       */

      get: function () {
        return this._options;
      },
      configurable: true
    },
    canvas: {

      /**
       * The canvas object
       * @type {Canvas}
       */

      get: function () {
        return this._canvas;
      },
      configurable: true
    },
    helpers: {

      /**
       * The helpers
       * @type {Helpers}
       */

      get: function () {
        return this._helpers;
      },
      configurable: true
    },
    image: {

      /**
       * The image
       * @type {Image}
       */

      get: function () {
        return this._options.image;
      },
      configurable: true
    }
  });

  return BaseUI;
})();

module.exports = BaseUI;

},{"../../lib/utils":51,"./helpers":111,"dot":41}],113:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Slider = _interopRequire(require("../lib/slider"));



var BrightnessControls = (function (Control) {
  function BrightnessControls() {
    _classCallCheck(this, BrightnessControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(BrightnessControls, Control);

  _prototypeProperties(BrightnessControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "brightness";
      },
      configurable: true
    },
    init: {

      /**
       * The entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    {{#def.slider}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
        this._partialTemplates.push(Slider.template);
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        this._operationExistedBefore = !!this._ui.operations.brightness;
        this._operation = this._ui.getOrCreateOperation("brightness");

        var sliderElement = this._controls.querySelector(".imglykit-slider");
        this._slider = new Slider(sliderElement, {
          minValue: -1,
          maxValue: 1
        });
        this._slider.on("update", this._onUpdate.bind(this));

        // Initially set value
        var brightness = this._operation.getBrightness();
        this._initialBrightness = brightness;
        this._slider.setValue(brightness);

        this._initialIdentity = this._operation.isIdentity;
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        _get(Object.getPrototypeOf(BrightnessControls.prototype), "_onBack", this).call(this);

        if (this._operationExistedBefore) {
          this._operation.setBrightness(this._initialBrightness);
        } else {
          this._ui.removeOperation("brightness");
        }

        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onUpdate: {

      /**
       * Gets called when the value has been updated
       * @override
       */

      value: function _onUpdate(value) {
        this._operation.setBrightness(value);
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        this._ui.addHistory(this._operation, {
          brightness: this._initialBrightness
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    }
  });

  return BrightnessControls;
})(Control);

module.exports = BrightnessControls;

},{"../lib/slider":129,"./control":115}],114:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Slider = _interopRequire(require("../lib/slider"));



var ContrastControls = (function (Control) {
  function ContrastControls() {
    _classCallCheck(this, ContrastControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(ContrastControls, Control);

  _prototypeProperties(ContrastControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "contrast";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    {{#def.slider}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
        this._partialTemplates.push(Slider.template);
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        this._operationExistedBefore = !!this._ui.operations.contrast;
        this._operation = this._ui.getOrCreateOperation("contrast");

        var sliderElement = this._controls.querySelector(".imglykit-slider");
        this._slider = new Slider(sliderElement, {
          minValue: 0,
          maxValue: 2
        });
        this._slider.on("update", this._onUpdate.bind(this));

        // Initially set value
        var contrast = this._operation.getContrast();
        this._initialContrast = contrast;
        this._slider.setValue(contrast);

        this._initialIdentity = this._operation.isIdentity;
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        _get(Object.getPrototypeOf(ContrastControls.prototype), "_onBack", this).call(this);

        if (this._operationExistedBefore) {
          this._operation.setContrast(this._initialContrast);
        } else {
          this._ui.removeOperation("contrast");
        }

        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onUpdate: {

      /**
       * Gets called when the value has been updated
       * @override
       */

      value: function _onUpdate(value) {
        this._operation.setContrast(value);
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        this._ui.addHistory(this._operation, {
          contrast: this._initialContrast
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    }
  });

  return ContrastControls;
})(Control);

module.exports = ContrastControls;

},{"../lib/slider":129,"./control":115}],115:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var dot = _interopRequire(require("dot"));

var Helpers = _interopRequire(require("../../base/helpers"));

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var Control = (function (EventEmitter) {
  function Control(kit, ui, operation) {
    _classCallCheck(this, Control);

    _get(Object.getPrototypeOf(Control.prototype), "constructor", this).call(this);

    this._kit = kit;
    this._ui = ui;
    this._operation = operation;
    this._helpers = new Helpers(this._kit, this._ui, this._ui.options);
    this._partialTemplates = [];
    this._active = false;

    this.init();
  }

  _inherits(Control, EventEmitter);

  _prototypeProperties(Control, null, {
    identifier: {

      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return null;
      },
      configurable: true
    },
    setContainers: {

      /**
       * Sets the containers that the control will be rendered to
       * @param {DOMElement} controlsContainer
       * @param {DOMElement} canvasControlsContainer
       */

      value: function setContainers(controlsContainer, canvasControlsContainer) {
        this._controlsContainer = controlsContainer;
        this._canvasControlsContainer = canvasControlsContainer;
      },
      writable: true,
      configurable: true
    },
    init: {

      /**
       * The entry point for this control
       */

      value: function init() {},
      writable: true,
      configurable: true
    },
    _renderAllControls: {

      /**
       * Renders the controls
       * @private
       */

      value: function _renderAllControls() {
        this._renderControls();
        this._renderCanvasControls();
      },
      writable: true,
      configurable: true
    },
    _renderControls: {

      /**
       * Renders the controls
       * @private
       */

      value: function _renderControls() {
        if (typeof this._controlsTemplate === "undefined") {
          throw new Error("Control#_renderOverviewControls: Control needs to define this._controlsTemplate.");
        }

        var template = this._partialTemplates.concat([this._controlsTemplate]).join("\r\n");

        // Render the template
        var renderFn = dot.template(template);
        var html = renderFn(this.context);

        if (typeof this._controls !== "undefined" && this._controls.parentNode !== null) {
          this._controls.parentNode.removeChild(this._controls);
        }

        // Create a wrapper
        this._controls = document.createElement("div");
        this._controls.innerHTML = html;

        // Append to DOM
        this._controlsContainer.appendChild(this._controls);
      },
      writable: true,
      configurable: true
    },
    _renderCanvasControls: {

      /**
       * Renders the canvas controls
       * @private
       */

      value: function _renderCanvasControls() {
        if (typeof this._canvasControlsTemplate === "undefined") {
          return; // Canvas controls are optional
        }

        var template = this._partialTemplates.concat([this._canvasControlsTemplate]).join("\r\n");

        // Render the template
        var renderFn = dot.template(template);
        var html = renderFn(this.context);

        // Create a wrapper
        this._canvasControls = document.createElement("div");
        this._canvasControls.innerHTML = html;

        // Append to DOM
        this._canvasControlsContainer.appendChild(this._canvasControls);
      },
      writable: true,
      configurable: true
    },
    _removeControls: {

      /**
       * Removes the controls from the DOM
       * @private
       */

      value: function _removeControls() {
        this._controls.parentNode.removeChild(this._controls);
        if (this._canvasControls) {
          this._canvasControls.parentNode.removeChild(this._canvasControls);
        }
      },
      writable: true,
      configurable: true
    },
    _handleBackAndDoneButtons: {
      value: function _handleBackAndDoneButtons() {
        // Back button
        var backButton = this._controls.querySelector(".imglykit-controls-back");
        backButton.addEventListener("click", this._onBackButtonClick.bind(this));

        // Done button
        var doneButton = this._controls.querySelector(".imglykit-controls-done");
        doneButton.addEventListener("click", this._onDoneButtonClick.bind(this));
      },
      writable: true,
      configurable: true
    },
    _onBackButtonClick: {

      /**
       * Gets called when the back button has been clicked
       * @private
       */

      value: function _onBackButtonClick() {
        this._onBack();
        this.emit("back");
      },
      writable: true,
      configurable: true
    },
    _onDoneButtonClick: {

      /**
       * Gets called when the done button has been clicked
       * @private
       */

      value: function _onDoneButtonClick() {
        this._onDone();
        this.emit("back");
      },
      writable: true,
      configurable: true
    },
    enter: {

      /**
       * Gets called when this control is activated
       * @internal Used by the SDK, don't override.
       */

      value: function enter() {
        this._active = true;

        this._ui.hideZoom();

        this._renderAllControls();
        this._handleBackAndDoneButtons();
        this._enableCanvasControls();
        this._onEnter();
      },
      writable: true,
      configurable: true
    },
    leave: {

      /**
       * Gets called when this control is deactivated
       * @internal Used by the SDK, don't override.
       */

      value: function leave() {
        this._active = false;

        this._ui.showZoom();

        this._removeControls();
        this._disableCanvasControls();
        this._onLeave();
      },
      writable: true,
      configurable: true
    },
    _enableCanvasControls: {
      value: function _enableCanvasControls() {
        this._canvasControlsContainer.classList.remove("imglykit-canvas-controls-disabled");
      },
      writable: true,
      configurable: true
    },
    _disableCanvasControls: {
      value: function _disableCanvasControls() {
        this._canvasControlsContainer.classList.add("imglykit-canvas-controls-disabled");
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      // Protected methods

      /**
       * Gets called when this control is activated.
       * @protected
       */

      value: function _onEnter() {},
      writable: true,
      configurable: true
    },
    _onLeave: {

      /**
       * Gets called when this control is deactivated
       * @protected
       */

      value: function _onLeave() {},
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @protected
       */

      value: function _onBack() {},
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @protected
       */

      value: function _onDone() {},
      writable: true,
      configurable: true
    },
    onZoom: {

      /**
       * Gets called when the zoom level has been changed while
       * this control is active
       */

      value: function onZoom() {},
      writable: true,
      configurable: true
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       */

      get: function () {
        return {
          helpers: this._helpers
        };
      },
      configurable: true
    }
  });

  return Control;
})(EventEmitter);

module.exports = Control;

},{"../../../lib/event-emitter":45,"../../base/helpers":111,"dot":41}],116:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));



var CropControls = (function (Control) {
  function CropControls() {
    _classCallCheck(this, CropControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(CropControls, Control);

  _prototypeProperties(CropControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "crop";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        this._availableRatios = {};
        this._ratios = {};

        var controlsTemplate = "<div class=\"imglykit-controls-rotation\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{ for(var identifier in it.ratios) { }}\n        {{ var ratio = it.ratios[identifier]; }}\n        {{ var enabled = ratio.selected; }}\n        <li data-identifier=\"{{= identifier}}\" data-ratio=\"{{= ratio.ratio}}\"{{? enabled}} data-selected{{?}}>\n          <img src=\"{{=it.helpers.assetPath('ui/night/crop/' + identifier + '.png')}}\" />\n        </li>\n      {{ } }}\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-crop-container\">\n  <div class=\"imglykit-canvas-crop-top\">\n    <div class=\"imglykit-canvas-crop-top-left\"></div>\n    <div class=\"imglykit-canvas-crop-top-center\"></div>\n    <div class=\"imglykit-canvas-crop-top-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-center\">\n    <div class=\"imglykit-canvas-crop-center-left\"></div>\n    <div class=\"imglykit-canvas-crop-center-center\">\n      <div class=\"imglykit-canvas-crop-knobs\">\n        <div data-corner=\"top-left\"></div>\n        <div data-corner=\"top-right\"></div>\n        <div data-corner=\"bottom-left\"></div>\n        <div data-corner=\"bottom-right\"></div>\n      </div>\n    </div>\n    <div class=\"imglykit-canvas-crop-center-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-bottom\">\n    <div class=\"imglykit-canvas-crop-bottom-left\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-center\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-right\"></div>\n  </div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;

        // Mouse event callbacks bound to the class context
        this._onKnobDown = this._onKnobDown.bind(this);
        this._onKnobDrag = this._onKnobDrag.bind(this);
        this._onKnobUp = this._onKnobUp.bind(this);
        this._onCenterDown = this._onCenterDown.bind(this);
        this._onCenterDrag = this._onCenterDrag.bind(this);
        this._onCenterUp = this._onCenterUp.bind(this);

        this._addDefaultRatios();

        // Select all ratios per default
        this.selectRatios(null);
      },
      writable: true,
      configurable: true
    },
    selectRatios: {

      /**
       * Selects the ratios
       * @param {Selector} selector
       */

      value: function selectRatios(selector) {
        this._ratios = {};

        var ratioIdentifiers = Object.keys(this._availableRatios);

        var selectedRatios = Utils.select(ratioIdentifiers, selector);
        for (var i = 0; i < selectedRatios.length; i++) {
          var identifier = selectedRatios[i];
          this._ratios[identifier] = this._availableRatios[identifier];
        }

        if (this._active) {
          this._renderControls();
        }
      },
      writable: true,
      configurable: true
    },
    _addDefaultRatios: {

      /**
       * Adds the default ratios
       * @private
       */

      value: function _addDefaultRatios() {
        this.addRatio("custom", "*", true);
        this.addRatio("square", "1");
        this.addRatio("4-3", "1.33");
        this.addRatio("16-9", "1.77");
      },
      writable: true,
      configurable: true
    },
    addRatio: {

      /**
       * Adds a ratio with the given identifier
       * @param {String} identifier
       * @param {Number} ratio
       * @param {Boolean} selected
       */

      value: function addRatio(identifier, ratio, selected) {
        this._availableRatios[identifier] = { ratio: ratio, selected: selected };
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        _get(Object.getPrototypeOf(CropControls.prototype), "_onEnter", this).call(this);

        this._operationExistedBefore = !!this._ui.operations.crop;
        this._operation = this._ui.getOrCreateOperation("crop");

        this._defaultStart = new Vector2(0.1, 0.1);
        this._defaultEnd = new Vector2(0.9, 0.9);

        this._initialOptions = {
          start: this._operation.getStart(),
          end: this._operation.getEnd()
        };

        this._start = this._initialOptions.start || this._defaultStart;
        this._end = this._initialOptions.end || this._defaultEnd;

        // Minimum size in pixels
        this._minimumSize = new Vector2(50, 50);

        this._initialZoomLevel = this._ui.canvas.zoomLevel;
        this._ui.canvas.zoomToFit(false);

        var prefix = ".imglykit-canvas-crop";
        var container = this._canvasControls;
        var knobsContainer = container.querySelector("" + prefix + "-knobs");

        // Store initial settings for "back" button
        this._initialStart = this._operation.getStart().clone();
        this._initialEnd = this._operation.getEnd().clone();

        // Make sure we see the whole input image
        this._operation.set({
          start: new Vector2(0, 0),
          end: new Vector2(1, 1)
        });

        // Find all 4 knobs
        this._knobs = {
          topLeft: knobsContainer.querySelector("[data-corner=top-left]"),
          topRight: knobsContainer.querySelector("[data-corner=top-right]"),
          bottomLeft: knobsContainer.querySelector("[data-corner=bottom-left]"),
          bottomRight: knobsContainer.querySelector("[data-corner=bottom-right]")
        };

        // Find the div areas that affect the displayed crop size
        this._areas = {
          topLeft: this._canvasControls.querySelector("" + prefix + "-top-left"),
          topCenter: this._canvasControls.querySelector("" + prefix + "-top-center"),
          centerLeft: this._canvasControls.querySelector("" + prefix + "-center-left"),
          centerCenter: this._canvasControls.querySelector("" + prefix + "-center-center")
        };

        this._handleControls();
        this._handleKnobs();
        this._handleCenter();

        // Resume the rendering
        this._ui.canvas.render().then(function () {
          _this._updateDOM();
        });
      },
      writable: true,
      configurable: true
    },
    _handleControls: {

      /**
       * Handles the ratio controls
       * @private
       */

      value: function _handleControls() {
        var _this = this;

        var listItems = this._controls.querySelectorAll("ul > li");
        this._ratioItems = Array.prototype.slice.call(listItems);

        for (var i = 0; i < this._ratioItems.length; i++) {
          var _item$dataset;

          (function (i) {
            var item = _this._ratioItems[i];
            _item$dataset = item.dataset;
            var selected = _item$dataset.selected;
            var ratio = _item$dataset.ratio;
            var identifier = _item$dataset.identifier;

            if (typeof selected !== "undefined" && !_this._operationExistedBefore) {
              _this._setRatio(identifier, ratio, false);
              _this._selectRatio(item);
            }

            item.addEventListener("click", function (e) {
              e.preventDefault();
              _this._onRatioClick(item);
            });
          })(i);
        }
      },
      writable: true,
      configurable: true
    },
    _onRatioClick: {

      /**
       * Gets called when the given ratio has been selected
       * @param {DOMElement} item
       * @private
       */

      value: function _onRatioClick(item) {
        this._unselectAllRatios();
        this._selectRatio(item);
      },
      writable: true,
      configurable: true
    },
    _unselectAllRatios: {

      /**
       * Unselects all ratio control items
       * @private
       */

      value: function _unselectAllRatios() {
        for (var i = 0; i < this._ratioItems.length; i++) {
          var item = this._ratioItems[i];
          item.classList.remove("imglykit-controls-item-active");
        }
      },
      writable: true,
      configurable: true
    },
    _selectRatio: {

      /**
       * Activates the given ratio control item
       * @param {DOMElement} item
       * @private
       */

      value: function _selectRatio(item) {
        item.classList.add("imglykit-controls-item-active");
        var _item$dataset = item.dataset;
        var ratio = _item$dataset.ratio;
        var identifier = _item$dataset.identifier;

        this._setRatio(identifier, ratio);
      },
      writable: true,
      configurable: true
    },
    _setRatio: {

      /**
       * Sets the given ratio
       * @param {String} identifier
       * @param {String} ratio
       * @param {Boolean} resize
       * @private
       */

      value: function _setRatio(identifier, ratio) {
        var resize = arguments[2] === undefined ? true : arguments[2];

        var canvasSize = this._ui.canvas.size;
        this._selectedRatio = identifier;

        if (ratio === "*") {
          this._ratio = null;
          this._start = new Vector2(0.1, 0.1);
          this._end = new Vector2(0.9, 0.9);
        } else {
          if (ratio === "original") {
            this._ratio = canvasSize.x / canvasSize.y;
          } else {
            ratio = parseFloat(ratio);
            this._ratio = ratio;
          }

          if (resize) {
            if (canvasSize.x / canvasSize.y <= this._ratio) {
              this._start.x = 0.1;
              this._end.x = 0.9;
              var height = 1 / canvasSize.y * (canvasSize.x / this._ratio * 0.8);
              this._start.y = (1 - height) / 2;
              this._end.y = 1 - this._start.y;
            } else {
              this._start.y = 0.1;
              this._end.y = 0.9;
              var width = 1 / canvasSize.x * (this._ratio * canvasSize.y * 0.8);
              this._start.x = (1 - width) / 2;
              this._end.x = 1 - this._start.x;
            }
          }
        }

        this._updateDOM();
      },
      writable: true,
      configurable: true
    },
    _updateDOM: {

      /**
       * Updates the cropping divs for the current operation settings
       * @private
       */

      value: function _updateDOM() {
        var canvasSize = this._ui.canvas.size;
        var startAbsolute = this._start.clone().multiply(canvasSize);
        var endAbsolute = this._end.clone().multiply(canvasSize);
        var size = endAbsolute.clone().subtract(startAbsolute);

        var top = Math.max(1, startAbsolute.y);
        var left = Math.max(1, startAbsolute.x);
        var width = Math.max(1, size.x);
        var height = Math.max(1, size.y);

        // widths are defined by top left and top center areas
        this._areas.topLeft.style.width = "" + left + "px";
        this._areas.topCenter.style.width = "" + width + "px";

        // heights are defined by top left and center left areas
        this._areas.topLeft.style.height = "" + top + "px";
        this._areas.centerLeft.style.height = "" + height + "px";
      },
      writable: true,
      configurable: true
    },
    _handleKnobs: {

      /**
       * Handles the knob dragging
       * @private
       */

      value: function _handleKnobs() {
        var _this = this;

        for (var identifier in this._knobs) {
          (function (identifier) {
            var knob = _this._knobs[identifier];
            knob.addEventListener("mousedown", function (e) {
              _this._onKnobDown(e, knob);
            });
            knob.addEventListener("touchstart", function (e) {
              _this._onKnobDown(e, knob);
            });
          })(identifier);
        }
      },
      writable: true,
      configurable: true
    },
    _onKnobDown: {

      /**
       * Gets called when the user presses a knob
       * @param {Event} e
       * @param {DOMElement} knob
       * @private
       */

      value: function _onKnobDown(e, knob) {
        e.preventDefault();
        e.stopPropagation();

        this._currentKnob = knob;
        this._initialMousePosition = Utils.getEventPosition(e);

        // Remember the current values
        this._startBeforeDrag = this._start.clone();
        this._endBeforeDrag = this._end.clone();

        document.addEventListener("mousemove", this._onKnobDrag);
        document.addEventListener("touchmove", this._onKnobDrag);
        document.addEventListener("mouseup", this._onKnobUp);
        document.addEventListener("touchend", this._onKnobUp);
      },
      writable: true,
      configurable: true
    },
    _onKnobDrag: {

      /**
       * Gets called whe the user drags a knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDrag(e) {
        e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);
        var mouseDiff = mousePosition.subtract(this._initialMousePosition);
        var corner = this._currentKnob.dataset.corner;
        var canvasSize = this._ui.canvas.size;

        var absoluteStart = this._startBeforeDrag.clone().multiply(canvasSize);
        var absoluteEnd = this._endBeforeDrag.clone().multiply(canvasSize);
        var maxHeight = canvasSize.y;

        var width = undefined,
            height = undefined,
            maximum = undefined,
            minimum = undefined;

        switch (corner) {
          case "top-left":
            absoluteStart.add(mouseDiff);
            maximum = absoluteEnd.clone().subtract(this._minimumSize);
            absoluteStart.clamp(null, maximum);
            break;
          case "top-right":
            absoluteEnd.x += mouseDiff.x;
            absoluteStart.y += mouseDiff.y;
            absoluteEnd.x = Math.max(absoluteStart.x + this._minimumSize.x, absoluteEnd.x);
            absoluteStart.y = Math.min(absoluteEnd.y - this._minimumSize.y, absoluteStart.y);
            break;
          case "bottom-right":
            absoluteEnd.add(mouseDiff);
            minimum = absoluteStart.clone().add(this._minimumSize);
            absoluteEnd.clamp(minimum);
            maxHeight = canvasSize.y - absoluteStart.y;
            break;
          case "bottom-left":
            absoluteStart.x += mouseDiff.x;
            absoluteEnd.y += mouseDiff.y;
            absoluteStart.x = Math.min(absoluteEnd.x - this._minimumSize.x, absoluteStart.x);
            absoluteEnd.y = Math.max(absoluteStart.y + this._minimumSize.y, absoluteEnd.y);
            break;
        }

        this._start.copy(absoluteStart).divide(canvasSize);
        this._end.copy(absoluteEnd).divide(canvasSize);

        this._start.clamp(0, 1);
        this._end.clamp(0, 1);

        /**
         * Calculate boundaries
         */
        if (this._ratio !== null) {
          switch (corner) {
            case "top-left":
              width = (this._end.x - this._start.x) * canvasSize.x;
              height = width / this._ratio;
              this._start.y = this._end.y - height / canvasSize.y;

              if (this._start.y <= 0) {
                this._start.y = 0;
                height = (this._end.y - this._start.y) * canvasSize.y;
                width = height * this._ratio;
                this._start.x = this._end.x - width / canvasSize.x;
              }
              break;
            case "top-right":
              width = (this._end.x - this._start.x) * canvasSize.x;
              height = width / this._ratio;
              this._start.y = this._end.y - height / canvasSize.y;

              if (this._start.y <= 0) {
                this._start.y = 0;
                height = (this._end.y - this._start.y) * canvasSize.y;
                width = height * this._ratio;
                this._end.x = this._start.x + width / canvasSize.x;
              }
              break;
            case "bottom-right":
              width = (this._end.x - this._start.x) * canvasSize.x;
              height = width / this._ratio;
              this._end.y = this._start.y + height / canvasSize.y;

              // If boundaries are exceeded, calculate width by maximum height
              if (this._end.y >= 1) {
                this._end.y = 1;
                height = (this._end.y - this._start.y) * canvasSize.y;
                width = height * this._ratio;
                this._end.x = this._start.x + width / canvasSize.x;
              }
              break;
            case "bottom-left":
              width = (this._end.x - this._start.x) * canvasSize.x;
              height = width / this._ratio;
              this._end.y = this._start.y + height / canvasSize.y;

              if (this._end.y >= 1) {
                this._end.y = 1;
                height = (this._end.y - this._start.y) * canvasSize.y;
                width = height * this._ratio;
                this._start.x = this._end.x - width / canvasSize.x;
              }
              break;
          }
        }

        this._updateDOM();
      },
      writable: true,
      configurable: true
    },
    _onKnobUp: {

      /**
       * Gets called whe the user releases a knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobUp(e) {
        this._currentKnob = null;
        document.removeEventListener("mousemove", this._onKnobDrag);
        document.removeEventListener("touchmove", this._onKnobDrag);
        document.removeEventListener("mouseup", this._onKnobUp);
        document.removeEventListener("touchend", this._onKnobUp);
      },
      writable: true,
      configurable: true
    },
    _handleCenter: {

      /**
       * Handles the center dragging
       * @private
       */

      value: function _handleCenter() {
        this._areas.centerCenter.addEventListener("mousedown", this._onCenterDown);
        this._areas.centerCenter.addEventListener("touchstart", this._onCenterDown);
      },
      writable: true,
      configurable: true
    },
    _onCenterDown: {

      /**
       * Gets called when the user presses the center area
       * @param {Event} e
       * @private
       */

      value: function _onCenterDown(e) {
        this._initialMousePosition = Utils.getEventPosition(e);

        // Remember the current values
        this._startBeforeDrag = this._start.clone();
        this._endBeforeDrag = this._end.clone();

        document.addEventListener("mousemove", this._onCenterDrag);
        document.addEventListener("touchmove", this._onCenterDrag);
        document.addEventListener("mouseup", this._onCenterUp);
        document.addEventListener("touchend", this._onCenterUp);
      },
      writable: true,
      configurable: true
    },
    _onCenterDrag: {

      /**
       * Gets called when the user presses the center area and moves his mouse
       * @param {Event} e
       * @private
       */

      value: function _onCenterDrag(e) {
        var mousePosition = Utils.getEventPosition(e);
        var mouseDiff = mousePosition.subtract(this._initialMousePosition);
        var canvasSize = this._ui.canvas.size;

        // Get the crop size
        var cropSize = this._endBeforeDrag.clone().subtract(this._startBeforeDrag);
        var absoluteCropSize = cropSize.clone().multiply(canvasSize);

        // Get the absolute initial values
        var absoluteStart = this._startBeforeDrag.clone().multiply(canvasSize);
        var absoluteEnd = this._endBeforeDrag.clone().multiply(canvasSize);

        // Add the mouse position difference
        absoluteStart.add(mouseDiff);

        // Clamp the value
        var maxStart = canvasSize.clone().subtract(absoluteCropSize);
        absoluteStart.clamp(new Vector2(0, 0), maxStart);

        // End position does not change (relative to start)
        absoluteEnd.copy(absoluteStart).add(absoluteCropSize);

        // Set the final values
        this._start.copy(absoluteStart).divide(canvasSize);
        this._end.copy(absoluteEnd).divide(canvasSize);

        this._updateDOM();
      },
      writable: true,
      configurable: true
    },
    _onCenterUp: {

      /**
       * Gets called when the user releases the center area
       * @param {Event} e
       * @private
       */

      value: function _onCenterUp(e) {
        document.removeEventListener("mousemove", this._onCenterDrag);
        document.removeEventListener("touchmove", this._onCenterDrag);
        document.removeEventListener("mouseup", this._onCenterUp);
        document.removeEventListener("touchend", this._onCenterUp);
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);

        if (this._operationExistedBefore) {
          this._operation.set({
            start: this._initialStart,
            end: this._initialEnd
          });
        } else {
          this._ui.removeOperation("crop");
        }
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @protected
       */

      value: function _onDone() {
        this._operation.set({
          start: this._start,
          end: this._end
        });
        this._ui.canvas.zoomToFit(true);

        this._ui.addHistory(this._operation, {
          start: this._initialStart.clone(),
          end: this._initialEnd.clone()
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       * @override
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(CropControls.prototype), "context", this);
        context.ratios = this._ratios;
        return context;
      },
      configurable: true
    },
    selectedRatio: {

      /**
       * The selected ratio identifier
       * @type {String}
       */

      get: function () {
        return this._selectedRatio;
      },
      configurable: true
    }
  });

  return CropControls;
})(Control);

module.exports = CropControls;

},{"../../../lib/math/vector2":49,"../../../lib/utils":51,"./control":115}],117:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Utils = _interopRequire(require("../../../lib/utils"));



var FiltersControls = (function (Control) {
  function FiltersControls() {
    _classCallCheck(this, FiltersControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(FiltersControls, Control);

  _prototypeProperties(FiltersControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "filters";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{ for(var identifier in it.filters) { }}\n        {{ var filter = it.filters[identifier]; }}\n        {{ var enabled = it.activeFilter.identifier === identifier; }}\n        {{? identifier !== \"identity\"}}\n        <li data-identifier=\"{{= identifier}}\"{{? enabled}} class=\"imglykit-controls-item-active\"{{?}}>\n          <img src=\"{{=it.helpers.assetPath('ui/night/filters/' + identifier + '.png')}}\" />\n        </li>\n        {{?}}\n      {{ } }}\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        this._availableFilters = {};
        this._filters = {};

        this._addDefaultFilters();

        // Select all filters per default
        this.selectFilters(null);
      },
      writable: true,
      configurable: true
    },
    _renderAllControls: {

      /**
       * Renders the controls
       * @private
       * @internal We need to access information from the operation when
       *           rendering, which is why we have to override this function
       */

      value: function _renderAllControls() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        this._operationExistedBefore = !!this._ui.operations.filters;
        this._operation = this._ui.getOrCreateOperation("filters");

        _get(Object.getPrototypeOf(FiltersControls.prototype), "_renderAllControls", this).apply(this, args);
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._initialFilter = this._operation.getFilter();
        this._initialIdentity = this._operation.isIdentity;

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });
          })(i);
        }
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the user hits the back button
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation.setFilter(this._initialFilter);
        } else {
          this._ui.removeOperation("filters");
        }
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        this._ui.addHistory(this._operation, {
          filter: this._initialFilter
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    },
    _onListItemClick: {

      /**
       * Gets called when the user clicked a list item
       * @private
       */

      value: function _onListItemClick(item) {
        this._deactivateAllItems();

        var identifier = item.dataset.identifier;

        this._operation.setFilter(this._filters[identifier]);
        this._ui.canvas.render();

        item.classList.add("imglykit-controls-item-active");
      },
      writable: true,
      configurable: true
    },
    _deactivateAllItems: {

      /**
       * Deactivates all list items
       * @private
       */

      value: function _deactivateAllItems() {
        for (var i = 0; i < this._listItems.length; i++) {
          var listItem = this._listItems[i];
          listItem.classList.remove("imglykit-controls-item-active");
        }
      },
      writable: true,
      configurable: true
    },
    _addDefaultFilters: {

      /**
       * Registers all the known filters
       * @private
       */

      value: function _addDefaultFilters() {
        this.addFilter(require("../../../operations/filters/identity-filter"));
        this.addFilter(require("../../../operations/filters/k1-filter"));
        this.addFilter(require("../../../operations/filters/k2-filter"));
        this.addFilter(require("../../../operations/filters/k6-filter"));
        this.addFilter(require("../../../operations/filters/kdynamic-filter"));
        this.addFilter(require("../../../operations/filters/fridge-filter"));
        this.addFilter(require("../../../operations/filters/breeze-filter"));
        this.addFilter(require("../../../operations/filters/orchid-filter"));
        this.addFilter(require("../../../operations/filters/chest-filter"));
        this.addFilter(require("../../../operations/filters/front-filter"));
        this.addFilter(require("../../../operations/filters/fixie-filter"));
        this.addFilter(require("../../../operations/filters/x400-filter"));
        this.addFilter(require("../../../operations/filters/bw-filter"));
        this.addFilter(require("../../../operations/filters/bwhard-filter"));
        this.addFilter(require("../../../operations/filters/lenin-filter"));
        this.addFilter(require("../../../operations/filters/quozi-filter"));
        this.addFilter(require("../../../operations/filters/pola669-filter"));
        this.addFilter(require("../../../operations/filters/pola-filter"));
        this.addFilter(require("../../../operations/filters/food-filter"));
        this.addFilter(require("../../../operations/filters/glam-filter"));
        this.addFilter(require("../../../operations/filters/celsius-filter"));
        this.addFilter(require("../../../operations/filters/texas-filter"));
        this.addFilter(require("../../../operations/filters/morning-filter"));
        this.addFilter(require("../../../operations/filters/lomo-filter"));
        this.addFilter(require("../../../operations/filters/gobblin-filter"));
        this.addFilter(require("../../../operations/filters/mellow-filter"));
        this.addFilter(require("../../../operations/filters/sunny-filter"));
        this.addFilter(require("../../../operations/filters/a15-filter"));
        this.addFilter(require("../../../operations/filters/semired-filter"));
      },
      writable: true,
      configurable: true
    },
    addFilter: {

      /**
       * Registers the given filter
       * @param  {class} filter
       * @private
       */

      value: function addFilter(filter) {
        this._availableFilters[filter.identifier] = filter;
      },
      writable: true,
      configurable: true
    },
    selectFilters: {

      /**
       * Selects the filters
       * @param {Selector} selector
       */

      value: function selectFilters(selector) {
        this._filters = {};

        var filterIdentifiers = Object.keys(this._availableFilters);

        var selectedFilters = Utils.select(filterIdentifiers, selector);
        for (var i = 0; i < selectedFilters.length; i++) {
          var identifier = selectedFilters[i];
          this._filters[identifier] = this._availableFilters[identifier];
        }

        if (this._active) {
          this._renderControls();
        }
      },
      writable: true,
      configurable: true
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       * @override
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(FiltersControls.prototype), "context", this);
        context.filters = this._filters;
        context.activeFilter = this._operation.getFilter();
        return context;
      },
      configurable: true
    }
  });

  return FiltersControls;
})(Control);

module.exports = FiltersControls;

},{"../../../lib/utils":51,"../../../operations/filters/a15-filter":56,"../../../operations/filters/breeze-filter":57,"../../../operations/filters/bw-filter":58,"../../../operations/filters/bwhard-filter":59,"../../../operations/filters/celsius-filter":60,"../../../operations/filters/chest-filter":61,"../../../operations/filters/fixie-filter":63,"../../../operations/filters/food-filter":64,"../../../operations/filters/fridge-filter":65,"../../../operations/filters/front-filter":66,"../../../operations/filters/glam-filter":67,"../../../operations/filters/gobblin-filter":68,"../../../operations/filters/identity-filter":69,"../../../operations/filters/k1-filter":70,"../../../operations/filters/k2-filter":71,"../../../operations/filters/k6-filter":72,"../../../operations/filters/kdynamic-filter":73,"../../../operations/filters/lenin-filter":74,"../../../operations/filters/lomo-filter":75,"../../../operations/filters/mellow-filter":76,"../../../operations/filters/morning-filter":77,"../../../operations/filters/orchid-filter":78,"../../../operations/filters/pola-filter":79,"../../../operations/filters/pola669-filter":80,"../../../operations/filters/quozi-filter":94,"../../../operations/filters/semired-filter":95,"../../../operations/filters/sunny-filter":96,"../../../operations/filters/texas-filter":97,"../../../operations/filters/x400-filter":98,"./control":115}],118:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));



var FlipControls = (function (Control) {
  function FlipControls() {
    _classCallCheck(this, FlipControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(FlipControls, Control);

  _prototypeProperties(FlipControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "flip";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-rotation\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      <li data-direction=\"horizontal\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/flip/horizontal.png')}}\" />\n      </li>\n      <li data-direction=\"vertical\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/flip/vertical.png')}}\" />\n      </li>\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations.flip;
        this._operation = this._ui.getOrCreateOperation("flip");

        this._initialHorizontal = this._operation.getHorizontal();
        this._initialVertical = this._operation.getVertical();
        this._initialIdentity = this._operation.isIdentity;

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });

            var direction = listItem.dataset.direction;

            if (direction === "horizontal" && _this._operation.getHorizontal()) {
              _this._toggleItem(listItem, true);
            } else if (direction === "vertical" && _this._operation.getVertical()) {
              _this._toggleItem(listItem, true);
            }
          })(i);
        }
      },
      writable: true,
      configurable: true
    },
    _onListItemClick: {

      /**
       * Gets called when the user clicked a list item
       * @private
       */

      value: function _onListItemClick(item) {
        var direction = item.dataset.direction;

        var active = false;

        if (direction === "horizontal") {
          var currentHorizontal = this._operation.getHorizontal();
          this._operation.setHorizontal(!currentHorizontal);
          this._ui.canvas.render();
          active = !currentHorizontal;
        } else if (direction === "vertical") {
          var currentVertical = this._operation.getVertical();
          this._operation.setVertical(!currentVertical);
          this._ui.canvas.render();
          active = !currentVertical;
        }

        this._toggleItem(item, active);
      },
      writable: true,
      configurable: true
    },
    _toggleItem: {

      /**
       * Toggles the active state of the given item
       * @param {DOMElement} item
       * @param {Boolean} active
       * @private
       */

      value: function _toggleItem(item, active) {
        var activeClass = "imglykit-controls-item-active";
        if (active) {
          item.classList.add(activeClass);
        } else {
          item.classList.remove(activeClass);
        }
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation.setHorizontal(this._initialHorizontal);
          this._operation.setVertical(this._initialVertical);
        } else {
          this._ui.removeOperation("flip");
        }
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        this._ui.addHistory(this._operation, {
          vertical: this._initialVertical,
          horizontal: this._initialHorizontal
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    }
  });

  return FlipControls;
})(Control);

module.exports = FlipControls;

},{"./control":115}],119:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var SimpleSlider = _interopRequire(require("../lib/simple-slider"));

var ColorPicker = _interopRequire(require("../lib/color-picker"));



var FramesControls = (function (Control) {
  function FramesControls() {
    _classCallCheck(this, FramesControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(FramesControls, Control);

  _prototypeProperties(FramesControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "frames";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    {{#def.simpleSlider}}\n  </div>\n\n  <div class=\"imglykit-controls-button\">\n    {{#def.colorpicker}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
        this._partialTemplates.push(SimpleSlider.template);
        this._partialTemplates.push(ColorPicker.template);
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        this._operationExistedBefore = !!this._ui.operations.frames;
        this._operation = this._ui.getOrCreateOperation("frames");

        // Remember initial identity state
        this._initialIdentity = this._operation.isIdentity;

        this._initialOptions = {
          thickness: this._operation.getThickness(),
          color: this._operation.getColor()
        };

        this._operation.isIdentity = false;
        this._ui.canvas.render();

        // Init slider
        var sliderElement = this._controls.querySelector(".imglykit-slider");
        this._slider = new SimpleSlider(sliderElement, {
          minValue: 0,
          maxValue: 0.5
        });
        this._slider.on("update", this._onThicknessUpdate.bind(this));
        this._slider.setValue(this._initialOptions.thickness);

        // Init colorpicker
        var colorPickerElement = this._controls.querySelector(".imglykit-color-picker");
        this._colorPicker = new ColorPicker(this._ui, colorPickerElement);
        this._colorPicker.on("update", this._onColorUpdate.bind(this));
        this._colorPicker.setValue(this._initialOptions.color);
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation.set(this._initialOptions);
        } else {
          this._ui.removeOperation("frames");
        }
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onThicknessUpdate: {

      /**
       * Gets called when the thickness has been changed
       * @override
       */

      value: function _onThicknessUpdate(value) {
        this._operation.setThickness(value);
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onColorUpdate: {

      /**
       * Gets called when the color has been changed
       * @override
       */

      value: function _onColorUpdate(value) {
        this._operation.setColor(value);
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        this._ui.addHistory(this._operation, {
          color: this._initialOptions.color,
          thickness: this._initialOptions.thickness
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    }
  });

  return FramesControls;
})(Control);

module.exports = FramesControls;

},{"../lib/color-picker":127,"../lib/simple-slider":128,"./control":115}],120:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));

var SimpleSlider = _interopRequire(require("../lib/simple-slider"));



var RadialBlurControls = (function (Control) {
  function RadialBlurControls() {
    _classCallCheck(this, RadialBlurControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(RadialBlurControls, Control);

  _prototypeProperties(RadialBlurControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "radial-blur";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-radial-blur\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div class=\"imglykit-controls-icon\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/blur/blur.png')}}\" />\n  </div>\n\n  <div>\n    {{var sliderId = \"imglykit-blur-radius-slider\";}}\n    {{#def.simpleSlider}}\n  </div>\n\n  <div class=\"imglykit-controls-icon\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/blur/radius.png')}}\" />\n  </div>\n\n  <div>\n    {{var sliderId = \"imglykit-gradient-radius-slider\";}}\n    {{#def.simpleSlider}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-radial-blur-container\">\n  <div class=\"imglykit-canvas-radial-blur-dot\"></div>\n  <div class=\"imglykit-canvas-radial-blur-circle-container\">\n    <div class=\"imglykit-canvas-radial-blur-circle\"></div>\n  </div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;

        this._partialTemplates.push(SimpleSlider.template);
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations["radial-blur"];
        this._operation = this._ui.getOrCreateOperation("radial-blur");

        // Remember initial identity state
        this._initialIdentity = this._operation.isIdentity;
        this._initialSettings = {
          position: this._operation.getPosition().clone(),
          gradientRadius: this._operation.getGradientRadius(),
          blurRadius: this._operation.getBlurRadius()
        };

        this._operation.isIdentity = false;

        // Mouse event callbacks bound to the class context
        this._onKnobDown = this._onKnobDown.bind(this);
        this._onKnobDrag = this._onKnobDrag.bind(this);
        this._onKnobUp = this._onKnobUp.bind(this);

        this._knob = this._canvasControls.querySelector(".imglykit-canvas-radial-blur-dot");
        this._circle = this._canvasControls.querySelector(".imglykit-canvas-radial-blur-circle");
        this._handleKnob();
        this._initSliders();

        this._ui.canvas.render().then(function () {
          _this._updateDOM();
        });
      },
      writable: true,
      configurable: true
    },
    _initSliders: {

      /**
       * Initializes the slider controls
       * @private
       */

      value: function _initSliders() {
        var canvasSize = this._ui.canvas.size;

        var blurRadiusSlider = this._controls.querySelector("#imglykit-blur-radius-slider");
        this._blurRadiusSlider = new SimpleSlider(blurRadiusSlider, {
          minValue: 0,
          maxValue: 40
        });
        this._blurRadiusSlider.on("update", this._onBlurRadiusUpdate.bind(this));
        this._blurRadiusSlider.setValue(this._initialSettings.blurRadius);

        var gradientRadiusSlider = this._controls.querySelector("#imglykit-gradient-radius-slider");
        this._gradientRadiusSlider = new SimpleSlider(gradientRadiusSlider, {
          minValue: 1,
          maxValue: Math.max(canvasSize.y, canvasSize.x)
        });
        this._gradientRadiusSlider.on("update", this._onGradientRadiusUpdate.bind(this));
        this._gradientRadiusSlider.setValue(this._initialSettings.gradientRadius);
      },
      writable: true,
      configurable: true
    },
    _onBlurRadiusUpdate: {

      /**
       * Gets called when the value of the blur radius slider has been updated
       * @param {Number} value
       * @private
       */

      value: function _onBlurRadiusUpdate(value) {
        this._operation.setBlurRadius(value);
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onGradientRadiusUpdate: {

      /**
       * Gets called when the value of the gradient radius slider has been updated
       * @param {Number} value
       * @private
       */

      value: function _onGradientRadiusUpdate(value) {
        this._operation.setGradientRadius(value);
        this._updateDOM();
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _handleKnob: {

      /**
       * Handles the knob dragging
       * @private
       */

      value: function _handleKnob() {
        this._knob.addEventListener("mousedown", this._onKnobDown);
        this._knob.addEventListener("touchstart", this._onKnobDown);
      },
      writable: true,
      configurable: true
    },
    _onKnobDown: {

      /**
       * Gets called when the user starts dragging the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialPosition = this._operation.getPosition().clone();

        document.addEventListener("mousemove", this._onKnobDrag);
        document.addEventListener("touchmove", this._onKnobDrag);

        document.addEventListener("mouseup", this._onKnobUp);
        document.addEventListener("touchend", this._onKnobUp);
      },
      writable: true,
      configurable: true
    },
    _onKnobDrag: {

      /**
       * Gets called while the user starts drags the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;
        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.subtract(this._initialMousePosition);

        var newPosition = this._initialPosition.clone().multiply(canvasSize).add(diff).divide(canvasSize);

        this._operation.setPosition(newPosition);
        this._updateDOM();
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onKnobUp: {

      /**
       * Gets called when the user stops dragging the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobUp(e) {
        e.preventDefault();

        document.removeEventListener("mousemove", this._onKnobDrag);
        document.removeEventListener("touchmove", this._onKnobDrag);

        document.removeEventListener("mouseup", this._onKnobUp);
        document.removeEventListener("touchend", this._onKnobUp);
      },
      writable: true,
      configurable: true
    },
    _updateDOM: {

      /**
       * Updates the knob
       * @private
       */

      value: function _updateDOM() {
        var canvasSize = this._ui.canvas.size;
        var position = this._operation.getPosition().clone().multiply(canvasSize);
        position.clamp(new Vector2(0, 0), canvasSize);

        this._knob.style.left = "" + position.x + "px";
        this._knob.style.top = "" + position.y + "px";

        var circleSize = this._operation.getGradientRadius() * 2;
        this._circle.style.left = "" + position.x + "px";
        this._circle.style.top = "" + position.y + "px";
        this._circle.style.width = "" + circleSize + "px";
        this._circle.style.height = "" + circleSize + "px";
        this._circle.style.marginLeft = "-" + circleSize / 2 + "px";
        this._circle.style.marginTop = "-" + circleSize / 2 + "px";
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation.set(this._initialSettings);
        } else {
          this._ui.removeOperation("radial-blur");
        }
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        this._ui.addHistory(this._operation, {
          position: this._initialSettings.position.clone(),
          gradientRadius: this._initialSettings.gradientRadius,
          blurRadius: this._initialSettings.blurRadius
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    }
  });

  return RadialBlurControls;
})(Control);

module.exports = RadialBlurControls;

},{"../../../lib/math/vector2":49,"../../../lib/utils":51,"../lib/simple-slider":128,"./control":115}],121:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));



var RotationControls = (function (Control) {
  function RotationControls() {
    _classCallCheck(this, RotationControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(RotationControls, Control);

  _prototypeProperties(RotationControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "rotation";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-rotation\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      <li data-degrees=\"-90\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/rotation/left.png')}}\" />\n      </li>\n      <li data-degrees=\"90\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/rotation/right.png')}}\" />\n      </li>\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-crop-container imglykit-canvas-crop-container-hidden\">\n  <div class=\"imglykit-canvas-crop-top\">\n    <div class=\"imglykit-canvas-crop-top-left\"></div>\n    <div class=\"imglykit-canvas-crop-top-center\"></div>\n    <div class=\"imglykit-canvas-crop-top-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-center\">\n    <div class=\"imglykit-canvas-crop-center-left\"></div>\n    <div class=\"imglykit-canvas-crop-center-center imglykit-canvas-crop-center-center-nomove\">\n\n    </div>\n    <div class=\"imglykit-canvas-crop-center-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-bottom\">\n    <div class=\"imglykit-canvas-crop-bottom-left\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-center\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-right\"></div>\n  </div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations.rotation;
        this._operation = this._ui.getOrCreateOperation("rotation");

        this._cropOperation = this._ui.operations.crop;

        this._initialZoomLevel = this._ui.canvas.zoomLevel;
        this._ui.canvas.zoomToFit(false);

        if (this._cropOperation) {
          // Store initial settings for "back" and "done" buttons
          this._initialStart = this._cropOperation.getStart().clone();
          this._initialEnd = this._cropOperation.getEnd().clone();
          this._initialIdentity = this._operation.isIdentity;

          // Make sure we see the whole input image
          this._cropOperation.set({
            start: new Vector2(0, 0),
            end: new Vector2(1, 1)
          });
        }

        this._initialDegrees = this._operation.getDegrees();

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });
          })(i);
        }

        // Find the div areas that affect the displayed crop size
        var prefix = ".imglykit-canvas-crop";
        this._cropAreas = {
          topLeft: this._canvasControls.querySelector("" + prefix + "-top-left"),
          topCenter: this._canvasControls.querySelector("" + prefix + "-top-center"),
          centerLeft: this._canvasControls.querySelector("" + prefix + "-center-left"),
          centerCenter: this._canvasControls.querySelector("" + prefix + "-center-center")
        };

        // Resume the rendering
        this._ui.canvas.render().then(function () {
          _this._showCropContainer();
          _this._updateCropDOM();
        });
      },
      writable: true,
      configurable: true
    },
    _showCropContainer: {

      /**
       * Shows the crop container which is hidden initially to avoid flickering
       * when resizing after the rendering
       * @private
       */

      value: function _showCropContainer() {
        var container = this._canvasControls.querySelector(".imglykit-canvas-crop-container");
        container.classList.remove("imglykit-canvas-crop-container-hidden");
      },
      writable: true,
      configurable: true
    },
    _onListItemClick: {

      /**
       * Gets called when the given item has been clicked
       * @param {DOMObject} item
       * @private
       */

      value: function _onListItemClick(item) {
        var _this = this;

        var degrees = item.dataset.degrees;

        degrees = parseInt(degrees);

        var currentDegrees = this._operation.getDegrees();
        this._operation.setDegrees(currentDegrees + degrees);
        this._ui.canvas.zoomToFit().then(function () {
          _this._updateCropDOM();
        });
      },
      writable: true,
      configurable: true
    },
    onZoom: {

      /**
       * Gets called when the zoom level has been changed while
       * this control is active
       */

      value: function onZoom() {
        this._updateCropDOM();
      },
      writable: true,
      configurable: true
    },
    _updateCropDOM: {

      /**
       * Updates the cropping divs for the current operation settings
       * @private
       */

      value: function _updateCropDOM() {
        var start = undefined,
            end = undefined;
        if (this._cropOperation) {
          start = this._initialStart.clone();
          end = this._initialEnd.clone();
        } else {
          start = new Vector2(0, 0);
          end = new Vector2(1, 1);
        }

        var canvasSize = this._ui.canvas.size;

        var startAbsolute = start.multiply(canvasSize);
        var endAbsolute = end.multiply(canvasSize);
        var size = endAbsolute.clone().subtract(startAbsolute);

        var top = Math.max(1, startAbsolute.y);
        var left = Math.max(1, startAbsolute.x);
        var width = Math.max(1, size.x);
        var height = Math.max(1, size.y);

        // widths are defined by top left and top center areas
        this._cropAreas.topLeft.style.width = "" + left + "px";
        this._cropAreas.topCenter.style.width = "" + width + "px";

        // heights are defined by top left and center left areas
        this._cropAreas.topLeft.style.height = "" + top + "px";
        this._cropAreas.centerLeft.style.height = "" + height + "px";
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation.setDegrees(this._initialDegrees);
        } else {
          this._ui.removeOperation("rotation");
        }

        if (this._cropOperation) {
          this._cropOperation.set({
            start: this._initialStart,
            end: this._initialEnd
          });
        }
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {

        if (this._cropOperation) {
          this._cropOperation.set({
            start: this._initialStart,
            end: this._initialEnd
          });
        }
        this._ui.canvas.render();

        this._ui.addHistory(this._operation, {
          degrees: this._initialDegrees
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    }
  });

  return RotationControls;
})(Control);

module.exports = RotationControls;

},{"../../../lib/math/vector2":49,"./control":115}],122:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Slider = _interopRequire(require("../lib/slider"));

var Control = _interopRequire(require("./control"));



var SaturationControls = (function (Control) {
  function SaturationControls() {
    _classCallCheck(this, SaturationControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(SaturationControls, Control);

  _prototypeProperties(SaturationControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "saturation";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    {{#def.slider}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
        this._partialTemplates.push(Slider.template);
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        _get(Object.getPrototypeOf(SaturationControls.prototype), "_onEnter", this).call(this);

        this._operationExistedBefore = !!this._ui.operations.saturation;
        this._operation = this._ui.getOrCreateOperation("saturation");

        var sliderElement = this._controls.querySelector(".imglykit-slider");
        this._slider = new Slider(sliderElement, {
          minValue: 0,
          maxValue: 2
        });
        this._slider.on("update", this._onUpdate.bind(this));

        // Initially set value
        var saturation = this._operation.getSaturation();
        this._initialSaturation = saturation;
        this._slider.setValue(saturation);

        this._initialIdentity = this._operation.isIdentity;
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        _get(Object.getPrototypeOf(SaturationControls.prototype), "_onBack", this).call(this);
        if (this._operationExistedBefore) {
          this._operation.setSaturation(this._initialSaturation);
        } else {
          this._ui.removeOperation("saturation");
        }
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onUpdate: {

      /**
       * Gets called when the value has been updated
       * @override
       */

      value: function _onUpdate(value) {
        this._operation.setSaturation(value);
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        this._ui.addHistory(this._operation, {
          saturation: this._initialSaturation
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    }
  });

  return SaturationControls;
})(Control);

module.exports = SaturationControls;

},{"../lib/slider":129,"./control":115}],123:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));



var StickersControl = (function (Control) {
  function StickersControl() {
    _classCallCheck(this, StickersControl);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(StickersControl, Control);

  _prototypeProperties(StickersControl, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "stickers";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-stickers\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{ for(var identifier in it.stickers) { }}\n        {{ var stickerPath = it.stickers[identifier]; }}\n        {{ var enabled = it.activeSticker === identifier; }}\n        <li data-identifier=\"{{= identifier}}\"{{? enabled}} class=\"imglykit-controls-item-active\"{{?}} style=\"background-image: url('{{=it.helpers.assetPath(stickerPath)}}');\">\n        </li>\n      {{ } }}\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-stickers-container\">\n  <div class=\"imglykit-canvas-stickers\">\n    <img class=\"imglykit-canvas-sticker-image\" />\n    <div class=\"imglykit-knob\"></div>\n  </div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;

        /**
         * The registered stickers
         * @type {Object.<string, class>}
         */
        this._availableStickers = {};
        this._stickers = {};
        this._addDefaultStickers();
        this.selectStickers(null);
      },
      writable: true,
      configurable: true
    },
    _addDefaultStickers: {

      /**
       * Registers the default stickers
       * @private
       */

      value: function _addDefaultStickers() {
        this.addSticker("glasses-nerd", "stickers/sticker-glasses-nerd.png");
        this.addSticker("glasses-normal", "stickers/sticker-glasses-normal.png");
        this.addSticker("glasses-shutter-green", "stickers/sticker-glasses-shutter-green.png");
        this.addSticker("glasses-shutter-yellow", "stickers/sticker-glasses-shutter-yellow.png");
        this.addSticker("glasses-sun", "stickers/sticker-glasses-sun.png");
        this.addSticker("hat-cap", "stickers/sticker-hat-cap.png");
        this.addSticker("hat-cylinder", "stickers/sticker-hat-cylinder.png");
        this.addSticker("hat-party", "stickers/sticker-hat-party.png");
        this.addSticker("hat-sheriff", "stickers/sticker-hat-sheriff.png");
        this.addSticker("heart", "stickers/sticker-heart.png");
        this.addSticker("mustache-long", "stickers/sticker-mustache-long.png");
        this.addSticker("mustache1", "stickers/sticker-mustache1.png");
        this.addSticker("mustache2", "stickers/sticker-mustache2.png");
        this.addSticker("mustache3", "stickers/sticker-mustache3.png");
        this.addSticker("pipe", "stickers/sticker-pipe.png");
        this.addSticker("snowflake", "stickers/sticker-snowflake.png");
        this.addSticker("star", "stickers/sticker-star.png");
      },
      writable: true,
      configurable: true
    },
    addSticker: {

      /**
       * Registers the sticker with the given identifier and path
       * @private
       */

      value: function addSticker(identifier, path) {
        this._availableStickers[identifier] = path;
      },
      writable: true,
      configurable: true
    },
    selectStickers: {

      /**
       * Selects the stickers
       * @param {Selector} selector
       */

      value: function selectStickers(selector) {
        this._stickers = {};

        var stickerIdentifiers = Object.keys(this._availableStickers);

        var selectedStickers = Utils.select(stickerIdentifiers, selector);
        for (var i = 0; i < selectedStickers.length; i++) {
          var identifier = selectedStickers[i];
          this._stickers[identifier] = this._availableStickers[identifier];
        }

        if (this._active) {
          this._renderControls();
        }
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations.stickers;
        this._operation = this._ui.getOrCreateOperation("stickers");

        // Don't render initially
        this._ui.removeOperation("stickers");

        this._initialSettings = {
          sticker: this._operation.getSticker(),
          position: this._operation.getPosition().clone(),
          size: this._operation.getSize().clone()
        };

        var canvasSize = this._ui.canvas.size;

        this._size = this._initialSettings.size.clone();
        this._position = this._initialSettings.position.clone().multiply(canvasSize);

        // Don't render an already existing sticker as long as
        // we're editing
        this._operation.isIdentity = true;

        // Remember zoom level and zoom to fit the canvas
        this._initialZoomLevel = this._ui.canvas.zoomLevel;
        this._ui.canvas.zoomToFit();

        // Find DOM elements
        this._container = this._canvasControls.querySelector(".imglykit-canvas-stickers");
        this._stickerImage = this._canvasControls.querySelector("img");
        this._stickerImage.addEventListener("load", function () {
          _this._stickerSize = new Vector2(_this._stickerImage.width, _this._stickerImage.height);
          _this._onStickerLoad();
        });
        this._knob = this._canvasControls.querySelector("div.imglykit-knob");

        // Mouse event callbacks bound to the class context
        this._onImageDown = this._onImageDown.bind(this);
        this._onImageDrag = this._onImageDrag.bind(this);
        this._onImageUp = this._onImageUp.bind(this);
        this._onKnobDown = this._onKnobDown.bind(this);
        this._onKnobDrag = this._onKnobDrag.bind(this);
        this._onKnobUp = this._onKnobUp.bind(this);

        this._handleListItems();
        this._handleImage();
        this._handleKnob();
      },
      writable: true,
      configurable: true
    },
    _handleListItems: {

      /**
       * Handles the list item click events
       * @private
       */

      value: function _handleListItems() {
        var _this = this;

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            var identifier = listItem.dataset.identifier;

            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });

            if (!_this._operationExistedBefore && i === 0 || _this._operationExistedBefore && _this._stickers[identifier] === _this._initialSettings.sticker) {
              _this._onListItemClick(listItem);
            }
          })(i);
        }
      },
      writable: true,
      configurable: true
    },
    _applySettings: {

      /**
       * Resizes and positions the sticker according to the current settings
       * @private
       */

      value: function _applySettings() {
        var ratio = this._stickerSize.y / this._stickerSize.x;
        this._size.y = this._size.x * ratio;

        this._stickerImage.style.width = "" + this._size.x + "px";
        this._stickerImage.style.height = "" + this._size.y + "px";
        this._container.style.left = "" + this._position.x + "px";
        this._container.style.top = "" + this._position.y + "px";
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the user hits the back button
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation = this._ui.getOrCreateOperation("stickers");
          this._operation.set(this._initialSettings);
        } else {
          this._ui.removeOperation("stickers");
        }
        this._ui.canvas.setZoomLevel(this._initialZoomLevel);
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @protected
       */

      value: function _onDone() {
        // Map the position and size options to 0...1 values
        var canvasSize = this._ui.canvas.size;
        var position = this._position.clone().divide(canvasSize);
        var size = this._size.clone().divide(canvasSize);

        this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);

        // Create a new operation and render it
        this._operation = this._ui.getOrCreateOperation("stickers");
        this._operation.set({
          sticker: this._availableStickers[this._sticker],
          position: position,
          size: size
        });
        this._ui.canvas.render();

        this._ui.addHistory(this, {
          sticker: this._initialSettings.sticker,
          position: this._initialSettings.position.clone(),
          size: this._initialSettings.size.clone()
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    },
    _handleKnob: {

      /**
       * Handles the knob dragging
       * @private
       */

      value: function _handleKnob() {
        this._knob.addEventListener("mousedown", this._onKnobDown);
        this._knob.addEventListener("touchstart", this._onKnobDown);
      },
      writable: true,
      configurable: true
    },
    _onKnobDown: {

      /**
       * Gets called when the user clicks the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialSize = this._size.clone();

        document.addEventListener("mousemove", this._onKnobDrag);
        document.addEventListener("touchmove", this._onKnobDrag);

        document.addEventListener("mouseup", this._onKnobUp);
        document.addEventListener("touchend", this._onKnobUp);
      },
      writable: true,
      configurable: true
    },
    _onKnobDrag: {

      /**
       * Gets called when the user drags the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDrag(e) {
        e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.clone().subtract(this._initialMousePosition);

        var size = this._initialSize.clone();
        var ratio = this._stickerImage.height / this._stickerImage.width;
        size.x += diff.x;
        size.y = size.x * ratio;

        this._size.copy(size);

        this._applySettings();
      },
      writable: true,
      configurable: true
    },
    _onKnobUp: {

      /**
       * Gets called when the user releases the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobUp(e) {
        document.removeEventListener("mousemove", this._onKnobDrag);
        document.removeEventListener("touchmove", this._onKnobDrag);

        document.removeEventListener("mouseup", this._onKnobUp);
        document.removeEventListener("touchend", this._onKnobUp);
      },
      writable: true,
      configurable: true
    },
    _handleImage: {

      /**
       * Handles the image dragging
       * @private
       */

      value: function _handleImage() {
        this._stickerImage.addEventListener("mousedown", this._onImageDown);
        this._stickerImage.addEventListener("touchstart", this._onImageDown);
      },
      writable: true,
      configurable: true
    },
    _onImageDown: {

      /**
       * Gets called when the user clicks the image
       * @param {Event} e
       * @private
       */

      value: function _onImageDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialPosition = this._position.clone();

        document.addEventListener("mousemove", this._onImageDrag);
        document.addEventListener("touchmove", this._onImageDrag);

        document.addEventListener("mouseup", this._onImageUp);
        document.addEventListener("touchend", this._onImageUp);
      },
      writable: true,
      configurable: true
    },
    _onImageDrag: {

      /**
       * Gets called when the user drags the image
       * @param {Event} e
       * @private
       */

      value: function _onImageDrag(e) {
        e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.clone().subtract(this._initialMousePosition);

        var position = this._initialPosition.clone();
        position.add(diff);

        this._position.copy(position);

        this._applySettings();
      },
      writable: true,
      configurable: true
    },
    _onImageUp: {

      /**
       * Gets called when the user releases the image
       * @param {Event} e
       * @private
       */

      value: function _onImageUp(e) {
        document.removeEventListener("mousemove", this._onImageDrag);
        document.removeEventListener("touchmove", this._onImageDrag);

        document.removeEventListener("mouseup", this._onImageUp);
        document.removeEventListener("touchend", this._onImageUp);
      },
      writable: true,
      configurable: true
    },
    _onStickerLoad: {

      /**
       * Gets called as soon as the sticker image has been loaded
       * @private
       */

      value: function _onStickerLoad() {
        this._size = new Vector2(this._stickerImage.width, this._stickerImage.height);

        if (typeof this._position === "undefined") {
          this._position = new Vector2(0, 0);
        }

        this._applySettings();
      },
      writable: true,
      configurable: true
    },
    _onListItemClick: {

      /**
       * Gets called when the user clicked a list item
       * @private
       */

      value: function _onListItemClick(item) {
        this._deactivateAllItems();

        var identifier = item.dataset.identifier;

        var stickerPath = this._availableStickers[identifier];
        stickerPath = this._kit.getAssetPath(stickerPath);

        try {
          this._stickerImage.attributes.removeNamedItem("style");
        } catch (e) {}

        this._sticker = identifier;
        this._stickerImage.src = stickerPath;

        item.classList.add("imglykit-controls-item-active");
      },
      writable: true,
      configurable: true
    },
    _deactivateAllItems: {

      /**
       * Deactivates all list items
       * @private
       */

      value: function _deactivateAllItems() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._listItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var listItem = _step.value;

            listItem.classList.remove("imglykit-controls-item-active");
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      },
      writable: true,
      configurable: true
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       * @override
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(StickersControl.prototype), "context", this);
        context.stickers = this._stickers;
        return context;
      },
      configurable: true
    }
  });

  return StickersControl;
})(Control);

module.exports = StickersControl;

},{"../../../lib/math/vector2":49,"../../../lib/utils":51,"./control":115}],124:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var ColorPicker = _interopRequire(require("../lib/color-picker"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));



var TextControl = (function (Control) {
  function TextControl() {
    _classCallCheck(this, TextControl);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(TextControl, Control);

  _prototypeProperties(TextControl, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "text";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-text\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{~it.fonts :value:index}}\n        <li data-name=\"{{= value.name}}\" data-weight=\"{{= value.weight}}\" style=\"font-family: {{= value.name}}; font-weight: {{= value.weight}}\">{{= value.name.substr(0, 2)}}</li>\n      {{~}}\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button\">\n    {{var colorpickerId = \"imglykit-text-foreground-color-picker\";}}\n    {{#def.colorpicker}}\n  </div>\n\n  <div class=\"imglykit-controls-button\">\n    {{var colorpickerId = \"imglykit-text-background-color-picker\";}}\n    {{#def.colorpicker}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-text-container\">\n  <div class=\"imglykit-canvas-text\">\n    <div class=\"imglykit-crosshair\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/crosshair.png')}}\" />\n    </div>\n    <div class=\"imglykit-canvas-text-textarea\">\n      <textarea></textarea>\n      <div class=\"imglykit-knob\"></div>\n    </div>\n  </div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;

        this._partialTemplates.push(ColorPicker.template);

        this._fonts = [];
        this._addFonts();
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations.text;
        this._operation = this._ui.getOrCreateOperation("text");

        // Don't render initially
        this._ui.removeOperation("text");

        var canvasSize = this._ui.canvas.size;

        this._initialSettings = {
          lineHeight: this._operation.getLineHeight(),
          fontSize: this._operation.getFontSize(),
          fontFamily: this._operation.getFontFamily(),
          fontWeight: this._operation.getFontWeight(),
          color: this._operation.getColor(),
          position: this._operation.getPosition(),
          text: this._operation.getText() || "",
          maxWidth: this._operation.getMaxWidth(),
          backgroundColor: this._operation.getBackgroundColor()
        };

        this._settings = {
          lineHeight: this._initialSettings.lineHeight,
          fontSize: this._initialSettings.fontSize,
          fontFamily: this._initialSettings.fontFamily,
          fontWeight: this._initialSettings.fontWeight,
          color: this._initialSettings.color.clone(),
          position: this._initialSettings.position.clone().multiply(canvasSize),
          text: this._initialSettings.text,
          maxWidth: this._initialSettings.maxWidth * canvasSize.x,
          backgroundColor: this._initialSettings.backgroundColor.clone()
        };

        // Remember zoom level and zoom to fit the canvas
        this._initialZoomLevel = this._ui.canvas.zoomLevel;

        this._container = this._canvasControls.querySelector(".imglykit-canvas-text");
        this._textarea = this._canvasControls.querySelector("textarea");
        this._textarea.focus();

        this._moveKnob = this._canvasControls.querySelector(".imglykit-crosshair");
        this._resizeKnob = this._canvasControls.querySelector(".imglykit-knob");

        // If the text has been edited before, subtract the knob width and padding
        if (this._operationExistedBefore) {
          this._settings.position.x -= 2;
          this._settings.position.y -= 2;
        }

        this._onTextareaKeyUp = this._onTextareaKeyUp.bind(this);
        this._onResizeKnobDown = this._onResizeKnobDown.bind(this);
        this._onResizeKnobDrag = this._onResizeKnobDrag.bind(this);
        this._onResizeKnobUp = this._onResizeKnobUp.bind(this);
        this._onMoveKnobDown = this._onMoveKnobDown.bind(this);
        this._onMoveKnobDrag = this._onMoveKnobDrag.bind(this);
        this._onMoveKnobUp = this._onMoveKnobUp.bind(this);
        this._onForegroundColorUpdate = this._onForegroundColorUpdate.bind(this);
        this._onBackgroundColorUpdate = this._onBackgroundColorUpdate.bind(this);

        this._initColorPickers();
        this._handleListItems();
        this._handleTextarea();
        this._handleResizeKnob();
        this._handleMoveKnob();
        this._resizeTextarea();

        this._ui.canvas.zoomToFit().then(function () {
          _this._applySettings();
        });
      },
      writable: true,
      configurable: true
    },
    _initColorPickers: {

      /**
       * Initializes the color pickers
       * @private
       */

      value: function _initColorPickers() {
        var foregroundColorPicker = this._controls.querySelector("#imglykit-text-foreground-color-picker");
        this._foregroundColorPicker = new ColorPicker(this._ui, foregroundColorPicker);
        this._foregroundColorPicker.setValue(this._operation.getColor());
        this._foregroundColorPicker.on("update", this._onForegroundColorUpdate);

        var backgroundColorPicker = this._controls.querySelector("#imglykit-text-background-color-picker");
        this._backgroundColorPicker = new ColorPicker(this._ui, backgroundColorPicker);
        this._backgroundColorPicker.setValue(this._operation.getBackgroundColor());
        this._backgroundColorPicker.on("update", this._onBackgroundColorUpdate);
      },
      writable: true,
      configurable: true
    },
    _handleListItems: {

      /**
       * Handles the list item click events
       * @private
       */

      value: function _handleListItems() {
        var _this = this;

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });

            if (!_this._operationExistedBefore && i === 0 || _this._operationExistedBefore && name === _this._initialSettings.fontFamily) {
              _this._onListItemClick(listItem);
            }
          })(i);
        }
      },
      writable: true,
      configurable: true
    },
    _handleTextarea: {

      /**
       * Handles the text area key events
       * @private
       */

      value: function _handleTextarea() {
        this._textarea.addEventListener("keyup", this._onTextareaKeyUp);
      },
      writable: true,
      configurable: true
    },
    _onTextareaKeyUp: {

      /**
       * Gets called when the user releases a key inside the text area
       * @private
       */

      value: function _onTextareaKeyUp() {
        this._resizeTextarea();
        this._settings.text = this._textarea.value;
      },
      writable: true,
      configurable: true
    },
    _resizeTextarea: {

      /**
       * Resizes the text area to fit the text inside of it
       * @private
       */

      value: function _resizeTextarea() {
        var scrollTop = this._textarea.scrollTop;

        if (!scrollTop) {
          var _scrollHeight = undefined,
              height = undefined;
          do {
            _scrollHeight = this._textarea.scrollHeight;
            height = this._textarea.offsetHeight;
            this._textarea.style.height = "" + (height - 5) + "px";
          } while (_scrollHeight && _scrollHeight != this._textarea.scrollHeight);
        }

        var scrollHeight = this._textarea.scrollHeight;
        this._textarea.style.height = "" + (scrollHeight + 20) + "px";
      },
      writable: true,
      configurable: true
    },
    _handleMoveKnob: {

      /**
       * Handles the move knob dragging
       * @private
       */

      value: function _handleMoveKnob() {
        this._moveKnob.addEventListener("mousedown", this._onMoveKnobDown);
        this._moveKnob.addEventListener("touchstart", this._onMoveKnobDown);
      },
      writable: true,
      configurable: true
    },
    _onMoveKnobDown: {

      /**
       * Gets called when the user clicks the move knob
       * @private
       */

      value: function _onMoveKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialPosition = this._settings.position.clone();

        document.addEventListener("mousemove", this._onMoveKnobDrag);
        document.addEventListener("touchmove", this._onMoveKnobDrag);

        document.addEventListener("mouseup", this._onMoveKnobUp);
        document.addEventListener("tochend", this._onMoveKnobUp);
      },
      writable: true,
      configurable: true
    },
    _onMoveKnobDrag: {

      /**
       * Gets called when the user drags the move knob
       * @private
       */

      value: function _onMoveKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;

        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.clone().subtract(this._initialMousePosition);

        var minPosition = new Vector2(0, 0);
        var containerSize = new Vector2(this._container.offsetWidth, this._container.offsetHeight);
        var maxPosition = canvasSize.clone().subtract(containerSize);
        var position = this._initialPosition.clone().add(diff).clamp(minPosition, maxPosition);

        this._settings.position = position;

        this._container.style.left = "" + position.x + "px";
        this._container.style.top = "" + position.y + "px";
      },
      writable: true,
      configurable: true
    },
    _onMoveKnobUp: {

      /**
       * Gets called when the user releases the move knob
       * @private
       */

      value: function _onMoveKnobUp() {
        document.removeEventListener("mousemove", this._onMoveKnobDrag);
        document.removeEventListener("touchmove", this._onMoveKnobDrag);

        document.removeEventListener("mouseup", this._onMoveKnobUp);
        document.removeEventListener("touchend", this._onMoveKnobUp);
      },
      writable: true,
      configurable: true
    },
    _handleResizeKnob: {

      /**
       * Handles the resize knob dragging
       * @private
       */

      value: function _handleResizeKnob() {
        this._resizeKnob.addEventListener("mousedown", this._onResizeKnobDown);
        this._resizeKnob.addEventListener("touchstart", this._onResizeKnobDown);
      },
      writable: true,
      configurable: true
    },
    _onResizeKnobDown: {

      /**
       * Gets called when the user clicks the resize knob
       * @param {Event} e
       * @private
       */

      value: function _onResizeKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialMaxWidth = this._settings.maxWidth;

        document.addEventListener("mousemove", this._onResizeKnobDrag);
        document.addEventListener("touchmove", this._onResizeKnobDrag);

        document.addEventListener("mouseup", this._onResizeKnobUp);
        document.addEventListener("touchend", this._onResizeKnobUp);
      },
      writable: true,
      configurable: true
    },
    _onResizeKnobDrag: {

      /**
       * Gets called when the user drags the resize knob
       * @param {Event} e
       * @private
       */

      value: function _onResizeKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;
        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.subtract(this._initialMousePosition);

        var position = this._settings.position.clone();
        var maxWidthAllowed = canvasSize.x - position.x;

        var maxWidth = this._initialMaxWidth + diff.x;
        maxWidth = Math.max(100, Math.min(maxWidthAllowed, maxWidth));
        this._settings.maxWidth = maxWidth;
        this._textarea.style.width = "" + maxWidth + "px";

        this._resizeTextarea();
      },
      writable: true,
      configurable: true
    },
    _onResizeKnobUp: {

      /**
       * Gets called when the user releases the resize knob
       * @param {Event} e
       * @private
       */

      value: function _onResizeKnobUp(e) {
        document.removeEventListener("mousemove", this._onResizeKnobDrag);
        document.removeEventListener("touchmove", this._onResizeKnobDrag);

        document.removeEventListener("mouseup", this._onResizeKnobUp);
        document.removeEventListener("touchend", this._onResizeKnobUp);
      },
      writable: true,
      configurable: true
    },
    _onForegroundColorUpdate: {

      /**
       * Gets called when the user selects another color using
       * the color picker.
       * @param {Color} value
       * @private
       */

      value: function _onForegroundColorUpdate(value) {
        this._settings.color = value;
        this._applySettings();
      },
      writable: true,
      configurable: true
    },
    _onBackgroundColorUpdate: {

      /**
       * Gets called when the user selects another color using
       * the color picker.
       * @param {Color} value
       * @private
       */

      value: function _onBackgroundColorUpdate(value) {
        this._settings.backgroundColor = value;
        this._applySettings();
      },
      writable: true,
      configurable: true
    },
    _applySettings: {

      /**
       * Styles the textarea to represent the current settings
       * @private
       */

      value: function _applySettings() {
        var textarea = this._textarea;
        var settings = this._settings;

        var canvasSize = this._ui.canvas.size;
        var actualFontSize = settings.fontSize * canvasSize.y;

        this._container.style.left = "" + settings.position.x + "px";
        this._container.style.top = "" + settings.position.y + "px";

        textarea.value = settings.text;
        textarea.style.fontFamily = settings.fontFamily;
        textarea.style.fontSize = "" + actualFontSize + "px";
        textarea.style.fontWeight = settings.fontWeight;
        textarea.style.lineHeight = settings.lineHeight;
        textarea.style.color = settings.color.toRGBA();
        textarea.style.backgroundColor = settings.backgroundColor.toRGBA();
        textarea.style.width = "" + settings.maxWidth + "px";
      },
      writable: true,
      configurable: true
    },
    _onListItemClick: {

      /**
       * Gets called when the user clicked a list item
       * @private
       */

      value: function _onListItemClick(item) {
        this._deactivateAllItems();

        var _item$dataset = item.dataset;
        var name = _item$dataset.name;
        var weight = _item$dataset.weight;

        this._settings.fontFamily = name;
        this._settings.fontWeight = weight;

        this._applySettings();

        item.classList.add("imglykit-controls-item-active");
      },
      writable: true,
      configurable: true
    },
    _deactivateAllItems: {

      /**
       * Deactivates all list items
       * @private
       */

      value: function _deactivateAllItems() {
        for (var i = 0; i < this._listItems.length; i++) {
          var listItem = this._listItems[i];
          listItem.classList.remove("imglykit-controls-item-active");
        }
      },
      writable: true,
      configurable: true
    },
    _addFonts: {

      /**
       * Adds the default fonts
       * @private
       */

      value: function _addFonts() {
        this.addFont("Helvetica", "normal");
        this.addFont("Lucida Grande", "normal");
        this.addFont("Times New Roman", "normal");
      },
      writable: true,
      configurable: true
    },
    addFont: {

      /**
       * Adds a font with the given name and weight
       * @param {String} name
       * @param {String} weight
       */

      value: function addFont(name, weight) {
        this._fonts.push({ name: name, weight: weight });
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        var canvasSize = this._ui.canvas.size;
        var padding = new Vector2(2, 2);
        var position = this._settings.position.clone().add(padding).divide(canvasSize);

        this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);

        this._operation = this._ui.getOrCreateOperation("text");
        this._operation.set({
          fontSize: this._settings.fontSize,
          fontFamily: this._settings.fontFamily,
          fontWeight: this._settings.fontWeight,
          color: this._settings.color,
          backgroundColor: this._settings.backgroundColor,
          position: position,
          text: this._settings.text,
          maxWidth: this._settings.maxWidth / canvasSize.x
        });
        this._ui.canvas.render();

        this._ui.addHistory(this, {
          fontFamily: this._initialSettings.fontFamily,
          fontWeight: this._initialSettings.fontWeight,
          color: this._initialSettings.color.clone(),
          backgroundColor: this._initialSettings.backgroundColor.clone(),
          position: this._initialSettings.position.clone(),
          text: this._initialSettings.text,
          maxWidth: this._initialSettings.maxWidth
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation = this._ui.getOrCreateOperation("text");
          this._operation.set(this._initialSettings);
        } else {
          this._ui.removeOperation("text");
        }
        this._ui.canvas.setZoomLevel(this._initialZoomLevel);
      },
      writable: true,
      configurable: true
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       * @override
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(TextControl.prototype), "context", this);
        context.fonts = this._fonts;
        return context;
      },
      configurable: true
    }
  });

  return TextControl;
})(Control);

module.exports = TextControl;

},{"../../../lib/math/vector2":49,"../../../lib/utils":51,"../lib/color-picker":127,"./control":115}],125:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));

var SimpleSlider = _interopRequire(require("../lib/simple-slider"));



var TiltShiftControls = (function (Control) {
  function TiltShiftControls() {
    _classCallCheck(this, TiltShiftControls);

    if (Control != null) {
      Control.apply(this, arguments);
    }
  }

  _inherits(TiltShiftControls, Control);

  _prototypeProperties(TiltShiftControls, null, {
    identifier: {
      /**
       * A unique string that identifies this control.
       * @type {String}
       */

      get: function () {
        return "tilt-shift";
      },
      configurable: true
    },
    init: {

      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-tilt-shift\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div class=\"imglykit-controls-icon\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/blur/blur.png')}}\" />\n  </div>\n\n  <div>\n    {{var sliderId = \"imglykit-blur-radius-slider\";}}\n    {{#def.simpleSlider}}\n  </div>\n\n  <div class=\"imglykit-controls-icon\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/blur/radius.png')}}\" />\n  </div>\n\n  <div>\n    {{var sliderId = \"imglykit-gradient-radius-slider\";}}\n    {{#def.simpleSlider}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-tilt-shift-container\">\n  <div class=\"imglykit-canvas-tilt-shift-dot\" data-option=\"start\"></div>\n  <div class=\"imglykit-canvas-tilt-shift-dot\" data-option=\"end\"></div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;

        this._partialTemplates.push(SimpleSlider.template);
        this._currentKnob = null;
      },
      writable: true,
      configurable: true
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations["tilt-shift"];
        this._operation = this._ui.getOrCreateOperation("tilt-shift");

        // Remember initial identity state
        this._initialIdentity = this._operation.isIdentity;
        this._initialSettings = {
          start: this._operation.getStart().clone(),
          end: this._operation.getEnd().clone(),
          gradientRadius: this._operation.getGradientRadius(),
          blurRadius: this._operation.getBlurRadius()
        };

        this._operation.isIdentity = false;

        // Mouse event callbacks bound to the class context
        this._onKnobDown = this._onKnobDown.bind(this);
        this._onKnobDrag = this._onKnobDrag.bind(this);
        this._onKnobUp = this._onKnobUp.bind(this);

        var selector = ".imglykit-canvas-tilt-shift-dot";
        this._startKnob = this._canvasControls.querySelector("" + selector + "[data-option=\"start\"]");
        this._endKnob = this._canvasControls.querySelector("" + selector + "[data-option=\"end\"]");
        this._knobs = [this._startKnob, this._endKnob];

        this._handleKnobs();
        this._initSliders();

        this._ui.canvas.render().then(function () {
          _this._updateDOM();
        });
      },
      writable: true,
      configurable: true
    },
    _initSliders: {

      /**
       * Initializes the slider controls
       * @private
       */

      value: function _initSliders() {
        var canvasSize = this._ui.canvas.size;

        var blurRadiusSlider = this._controls.querySelector("#imglykit-blur-radius-slider");
        this._blurRadiusSlider = new SimpleSlider(blurRadiusSlider, {
          minValue: 0,
          maxValue: 40
        });
        this._blurRadiusSlider.on("update", this._onBlurRadiusUpdate.bind(this));
        this._blurRadiusSlider.setValue(this._initialSettings.blurRadius);

        var gradientRadiusSlider = this._controls.querySelector("#imglykit-gradient-radius-slider");
        this._gradientRadiusSlider = new SimpleSlider(gradientRadiusSlider, {
          minValue: 1,
          maxValue: Math.max(canvasSize.y, canvasSize.x)
        });
        this._gradientRadiusSlider.on("update", this._onGradientRadiusUpdate.bind(this));
        this._gradientRadiusSlider.setValue(this._initialSettings.gradientRadius);
      },
      writable: true,
      configurable: true
    },
    _onBlurRadiusUpdate: {

      /**
       * Gets called when the value of the blur radius slider has been updated
       * @param {Number} value
       * @private
       */

      value: function _onBlurRadiusUpdate(value) {
        this._operation.setBlurRadius(value);
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onGradientRadiusUpdate: {

      /**
       * Gets called when the value of the gradient radius slider has been updated
       * @param {Number} value
       * @private
       */

      value: function _onGradientRadiusUpdate(value) {
        this._operation.setGradientRadius(value);
        this._updateDOM();
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _handleKnobs: {

      /**
       * Handles the knob dragging
       * @private
       */

      value: function _handleKnobs() {
        var _this = this;

        for (var i = 0; i < this._knobs.length; i++) {
          (function (i) {
            var knob = _this._knobs[i];
            knob.addEventListener("mousedown", function (e) {
              _this._onKnobDown(knob, e);
            });
            knob.addEventListener("touchstart", function (e) {
              _this._onKnobDown(knob, e);
            });
          })(i);
        }
      },
      writable: true,
      configurable: true
    },
    _onKnobDown: {

      /**
       * Gets called when the user starts dragging the knob
       * @param {DOMElement} knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDown(knob, e) {
        e.preventDefault();

        this._currentKnob = knob;
        this._initialMousePosition = Utils.getEventPosition(e);

        var option = knob.dataset.option;

        var capitalized = option.charAt(0).toUpperCase() + option.slice(1);
        this._valueBeforeDrag = this._operation["get" + capitalized]();

        document.addEventListener("mousemove", this._onKnobDrag);
        document.addEventListener("touchmove", this._onKnobDrag);

        document.addEventListener("mouseup", this._onKnobUp);
        document.addEventListener("touchend", this._onKnobUp);
      },
      writable: true,
      configurable: true
    },
    _onKnobDrag: {

      /**
       * Gets called while the user starts drags the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;
        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.subtract(this._initialMousePosition);

        var option = this._currentKnob.dataset.option;

        var capitalized = option.charAt(0).toUpperCase() + option.slice(1);

        var newPosition = this._valueBeforeDrag.clone().multiply(canvasSize).add(diff).divide(canvasSize);
        this._operation["set" + capitalized](newPosition);
        this._updateDOM();
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onKnobUp: {

      /**
       * Gets called when the user stops dragging the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobUp(e) {
        e.preventDefault();

        document.removeEventListener("mousemove", this._onKnobDrag);
        document.removeEventListener("touchmove", this._onKnobDrag);

        document.removeEventListener("mouseup", this._onKnobUp);
        document.removeEventListener("touchend", this._onKnobUp);
      },
      writable: true,
      configurable: true
    },
    _updateDOM: {

      /**
       * Updates the knob
       * @private
       */

      value: function _updateDOM() {
        var canvasSize = this._ui.canvas.size;
        var start = this._operation.getStart().clone().multiply(canvasSize);
        start.clamp(new Vector2(0, 0), canvasSize);

        this._startKnob.style.left = "" + start.x + "px";
        this._startKnob.style.top = "" + start.y + "px";

        var end = this._operation.getEnd().clone().multiply(canvasSize);
        end.clamp(new Vector2(0, 0), canvasSize);

        this._endKnob.style.left = "" + end.x + "px";
        this._endKnob.style.top = "" + end.y + "px";
      },
      writable: true,
      configurable: true
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation.set(this._initialSettings);
        } else {
          this._ui.removeOperation("radial-blur");
        }
        this._ui.canvas.render();
      },
      writable: true,
      configurable: true
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        this._ui.addHistory(this._operation, {
          start: this._initialSettings.start.clone(),
          end: this._initialSettings.end.clone(),
          blurRadius: this._initialSettings.blurRadius,
          gradientRadius: this._initialSettings.gradientRadius
        }, this._operationExistedBefore);
      },
      writable: true,
      configurable: true
    }
  });

  return TiltShiftControls;
})(Control);

module.exports = TiltShiftControls;

},{"../../../lib/math/vector2":49,"../../../lib/utils":51,"../lib/simple-slider":128,"./control":115}],126:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var bluebird = _interopRequire(require("bluebird"));

var WebGLRenderer = _interopRequire(require("../../../renderers/webgl-renderer"));

var CanvasRenderer = _interopRequire(require("../../../renderers/canvas-renderer"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var Canvas = (function (EventEmitter) {
  function Canvas(kit, ui, options) {
    _classCallCheck(this, Canvas);

    _get(Object.getPrototypeOf(Canvas.prototype), "constructor", this).call(this);

    this._kit = kit;
    this._ui = ui;
    this._options = options;

    var container = this._ui.container;

    this._canvasContainer = container.querySelector(".imglykit-canvas-container");
    this._canvasInnerContainer = container.querySelector(".imglykit-canvas-inner-container");
    this._canvas = this._canvasContainer.querySelector("canvas");
    this._image = this._options.image;
    this._roundZoomBy = 0.1;
    this._isFirstRender = true;

    // Mouse event callbacks bound to the class context
    this._dragOnMousedown = this._dragOnMousedown.bind(this);
    this._dragOnMousemove = this._dragOnMousemove.bind(this);
    this._dragOnMouseup = this._dragOnMouseup.bind(this);
  }

  _inherits(Canvas, EventEmitter);

  _prototypeProperties(Canvas, null, {
    run: {

      /**
       * Initializes the renderer, sets the zoom level and initially
       * renders the operations stack
       */

      value: function run() {
        this._initRenderer();

        // Calculate the initial zoom level
        this._zoomLevel = this._getInitialZoomLevel();
        this._initialZoomLevel = this._zoomLevel;
        this._isInitialZoom = true;
        this._size = null;

        this.render();
        this._centerCanvas();
        this._handleDrag();
      },
      writable: true,
      configurable: true
    },
    render: {

      /**
       * Renders the current operations stack
       */

      value: function render() {
        var _this = this;

        this._initialZoomLevel = this._getInitialZoomLevel();

        // Reset the zoom level to initial
        // Some operations change the texture resolution (e.g. rotation)
        // If we're on initial zoom level, we still want to make the canvas
        // fit into the container. Find the new initial zoom level and set it.
        if (this._isInitialZoom) {
          this.setZoomLevel(this._initialZoomLevel, false);
        }

        // Calculate the initial size
        var imageSize = new Vector2(this._image.width, this._image.height);
        var initialSize = imageSize.multiply(this._zoomLevel);
        this._setCanvasSize(initialSize);

        // Reset framebuffers
        this._renderer.reset();

        // On first render, draw the image to the input texture
        if (this._isFirstRender || this._renderer.constructor.identifier === "canvas") {
          this._renderer.drawImage(this._image);
          this._isFirstRender = false;
        }

        // Run the operations stack
        var stack = this.sanitizedStack;
        this._updateStackDirtyStates(stack);

        return bluebird
        // Validate all settings
        .map(stack, function (operation) {
          return operation.validateSettings();
        })
        // Render the operations stack
        .then(function () {
          return bluebird.map(stack, function (operation) {
            return operation.render(_this._renderer);
          }, { concurrency: 1 });
        })
        // Render the final image
        .then(function () {
          return _this._renderer.renderFinal();
        })
        // Update the margins and boundaries
        .then(function () {
          _this._storeCanvasSize();
          _this._updateContainerSize();
          _this._updateCanvasMargins();
          _this._applyBoundaries();
        });
      },
      writable: true,
      configurable: true
    },
    zoomIn: {

      /**
       * Increase zoom level
       */

      value: function zoomIn() {
        this._isInitialZoom = false;

        var zoomLevel = Math.round(this._zoomLevel * 100);
        var roundZoomBy = Math.round(this._roundZoomBy * 100);
        var initialZoomLevel = Math.round(this._initialZoomLevel * 100);

        // Round up if needed
        if (zoomLevel % roundZoomBy !== 0) {
          zoomLevel = Math.ceil(zoomLevel / roundZoomBy) * roundZoomBy;
        } else {
          zoomLevel += roundZoomBy;
        }

        zoomLevel = Math.min(initialZoomLevel * 2, zoomLevel);
        return this.setZoomLevel(zoomLevel / 100);
      },
      writable: true,
      configurable: true
    },
    zoomOut: {

      /**
       * Decrease zoom level
       */

      value: function zoomOut() {
        this._isInitialZoom = false;

        var zoomLevel = Math.round(this._zoomLevel * 100);
        var roundZoomBy = Math.round(this._roundZoomBy * 100);
        var initialZoomLevel = Math.round(this._initialZoomLevel * 100);

        // Round up if needed
        if (zoomLevel % roundZoomBy !== 0) {
          zoomLevel = Math.floor(zoomLevel / roundZoomBy) * roundZoomBy;
        } else {
          zoomLevel -= roundZoomBy;
        }

        zoomLevel = Math.max(initialZoomLevel, zoomLevel);
        return this.setZoomLevel(zoomLevel / 100);
      },
      writable: true,
      configurable: true
    },
    _setCanvasSize: {

      /**
       * Resizes and positions the canvas
       * @param {Vector2} [size]
       * @private
       */

      value: function _setCanvasSize(size) {
        size = size || new Vector2(this._canvas.width, this._canvas.height);

        this._canvas.width = size.x;
        this._canvas.height = size.y;

        this._storeCanvasSize();
        this._updateContainerSize();
      },
      writable: true,
      configurable: true
    },
    _updateContainerSize: {

      /**
       * Updates the canvas container size
       * @private
       */

      value: function _updateContainerSize() {
        var size = this._size;
        this._canvasInnerContainer.style.width = "" + size.x + "px";
        this._canvasInnerContainer.style.height = "" + size.y + "px";
      },
      writable: true,
      configurable: true
    },
    _storeCanvasSize: {

      /**
       * Remembers the canvas size
       * @comment This was introduced because the canvas size was not always
       *          correct due to some race conditions. Now that promises work
       *          properly, do we still need this?
       * @private
       */

      value: function _storeCanvasSize() {
        this._size = new Vector2(this._canvas.width, this._canvas.height);
      },
      writable: true,
      configurable: true
    },
    _centerCanvas: {

      /**
       * Centers the canvas inside the container
       * @private
       */

      value: function _centerCanvas() {
        var position = this._maxSize.divide(2);

        this._canvasInnerContainer.style.left = "" + position.x + "px";
        this._canvasInnerContainer.style.top = "" + position.y + "px";

        this._updateCanvasMargins();
      },
      writable: true,
      configurable: true
    },
    _updateCanvasMargins: {

      /**
       * Updates the canvas margins so that they are the negative half width
       * and height of the canvas
       * @private
       */

      value: function _updateCanvasMargins() {
        var canvasSize = new Vector2(this._canvas.width, this._canvas.height);
        var margin = canvasSize.divide(2).multiply(-1);
        this._canvasInnerContainer.style.marginLeft = "" + margin.x + "px";
        this._canvasInnerContainer.style.marginTop = "" + margin.y + "px";
      },
      writable: true,
      configurable: true
    },
    setZoomLevel: {

      /**
       * Sets the zoom level, re-renders the canvas and
       * repositions it
       * @param {Number} zoomLevel
       * @param {Boolean} render
       * @private
       */

      value: function setZoomLevel(zoomLevel) {
        var _this = this;

        var render = arguments[1] === undefined ? true : arguments[1];

        this._zoomLevel = zoomLevel;
        if (render) {
          this.setAllOperationsToDirty();
          return this.render().then(function () {
            _this._updateCanvasMargins();
            _this._applyBoundaries();
            _this.emit("zoom"); // will be redirected to top controls
          });
        } else {
          this._updateCanvasMargins();
          this._applyBoundaries();
          this.emit("zoom"); // will be redirected to top controls
        }
      },
      writable: true,
      configurable: true
    },
    setAllOperationsToDirty: {

      /**
       * Sets all operations to dirty
       */

      value: function setAllOperationsToDirty() {
        var operationsStack = this._kit.operationsStack;

        for (var i = 0; i < operationsStack.length; i++) {
          var operation = operationsStack[i];
          if (!operation) continue;
          operation.dirty = true;
        }
      },
      writable: true,
      configurable: true
    },
    _getInitialZoomLevel: {

      /**
       * Gets the initial zoom level so that the image fits the maximum
       * canvas size
       * @private
       */

      value: function _getInitialZoomLevel() {
        var inputSize = new Vector2(this._image.width, this._image.height);

        var cropOperation = this._ui.operations.crop;
        var rotationOperation = this._ui.operations.rotation;

        var cropSize = undefined,
            croppedSize = undefined,
            finalSize = undefined,
            initialSize = undefined;

        if (cropOperation) {
          cropSize = cropOperation.getEnd().clone().subtract(cropOperation.getStart());
        } else {
          cropSize = new Vector2(1, 1);
        }

        croppedSize = inputSize.clone().multiply(cropSize);

        // Has the image been rotated?
        if (rotationOperation && !rotationOperation.isIdentity && rotationOperation.getDegrees() % 180 !== 0) {
          var tempX = croppedSize.x;
          croppedSize.x = croppedSize.y;
          croppedSize.y = tempX;
        }

        finalSize = this._resizeVectorToFit(croppedSize);

        // Rotate back to be able to find the final size
        if (rotationOperation && !rotationOperation.isIdentity && rotationOperation.getDegrees() % 180 !== 0) {
          var tempX = finalSize.x;
          finalSize.x = finalSize.y;
          finalSize.y = tempX;
        }

        initialSize = finalSize.clone().divide(cropSize);
        return initialSize.x / inputSize.x;
      },
      writable: true,
      configurable: true
    },
    _resizeVectorToFit: {

      /**
       * Resizes the given two-dimensional vector so that it fits
       * the maximum size.
       * @private
       */

      value: function _resizeVectorToFit(size) {
        var maxSize = this._maxSize;
        var scale = Math.min(maxSize.x / size.x, maxSize.y / size.y);

        var newSize = size.clone().multiply(scale);

        return newSize;
      },
      writable: true,
      configurable: true
    },
    _initRenderer: {

      /**
       * Initializes the renderer
       * @private
       */

      value: function _initRenderer() {
        var _this = this;

        if (WebGLRenderer.isSupported() && this._options.renderer !== "canvas") {
          this._renderer = new WebGLRenderer(null, this._canvas);
          this._webglEnabled = true;
        } else if (CanvasRenderer.isSupported()) {
          this._renderer = new CanvasRenderer(null, this._canvas);
          this._webglEnabled = false;
        }

        if (this._renderer === null) {
          throw new Error("Neither Canvas nor WebGL renderer are supported.");
        }

        this._renderer.on("new-canvas", function (canvas) {
          _this._setCanvas(canvas);
        });
      },
      writable: true,
      configurable: true
    },
    _setCanvas: {

      /**
       * Replaces the canvas with the given canvas, updates margins etc
       * @param {DOMElement} canvas
       * @private
       */

      value: function _setCanvas(canvas) {
        var canvasParent = this._canvas.parentNode;
        canvasParent.removeChild(this._canvas);
        this._canvas = canvas;
        canvasParent.appendChild(this._canvas);

        this._updateCanvasMargins();
        this._applyBoundaries();
        this._updateContainerSize();
      },
      writable: true,
      configurable: true
    },
    _handleDrag: {

      /**
       * Handles the dragging
       * @private
       */

      value: function _handleDrag() {
        this._canvas.addEventListener("mousedown", this._dragOnMousedown);
        this._canvas.addEventListener("touchstart", this._dragOnMousedown);
      },
      writable: true,
      configurable: true
    },
    _dragOnMousedown: {

      /**
       * Gets called when the user started touching / clicking the canvas
       * @param {Event} e
       * @private
       */

      value: function _dragOnMousedown(e) {
        if (e.type === "mousedown" && e.button !== 0) {
          return;
        }e.preventDefault();

        var x = e.pageX,
            y = e.pageY;
        if (e.type === "touchstart") {
          x = e.touches[0].pageX;
          y = e.touches[0].pageY;
        }

        var canvasX = parseInt(this._canvasInnerContainer.style.left);
        var canvasY = parseInt(this._canvasInnerContainer.style.top);

        document.addEventListener("mousemove", this._dragOnMousemove);
        document.addEventListener("touchmove", this._dragOnMousemove);

        document.addEventListener("mouseup", this._dragOnMouseup);
        document.addEventListener("touchend", this._dragOnMouseup);

        // Remember initial position
        this._initialMousePosition = new Vector2(x, y);
        this._initialCanvasPosition = new Vector2(canvasX, canvasY);
      },
      writable: true,
      configurable: true
    },
    _dragOnMousemove: {

      /**
       * Gets called when the user drags the canvas
       * @param {Event} e
       * @private
       */

      value: function _dragOnMousemove(e) {
        e.preventDefault();

        var x = e.pageX,
            y = e.pageY;
        if (e.type === "touchmove") {
          x = e.touches[0].pageX;
          y = e.touches[0].pageY;
        }

        var newMousePosition = new Vector2(x, y);
        var mouseDiff = newMousePosition.clone().subtract(this._initialMousePosition);
        var newPosition = this._initialCanvasPosition.clone().add(mouseDiff);

        this._canvasInnerContainer.style.left = "" + newPosition.x + "px";
        this._canvasInnerContainer.style.top = "" + newPosition.y + "px";

        this._applyBoundaries();
      },
      writable: true,
      configurable: true
    },
    _applyBoundaries: {

      /**
       * Makes sure the canvas positions are within the boundaries
       * @private
       */

      value: function _applyBoundaries() {
        var x = parseInt(this._canvasInnerContainer.style.left);
        var y = parseInt(this._canvasInnerContainer.style.top);
        var canvasPosition = new Vector2(x, y);

        // Boundaries
        var boundaries = this._boundaries;
        canvasPosition.x = Math.min(boundaries.max.x, Math.max(boundaries.min.x, canvasPosition.x));
        canvasPosition.y = Math.min(boundaries.max.y, Math.max(boundaries.min.y, canvasPosition.y));

        this._canvasInnerContainer.style.left = "" + canvasPosition.x + "px";
        this._canvasInnerContainer.style.top = "" + canvasPosition.y + "px";
      },
      writable: true,
      configurable: true
    },
    _dragOnMouseup: {

      /**
       * Gets called when the user stopped dragging the canvsa
       * @param {Event} e
       * @private
       */

      value: function _dragOnMouseup(e) {
        e.preventDefault();

        document.removeEventListener("mousemove", this._dragOnMousemove);
        document.removeEventListener("touchmove", this._dragOnMousemove);

        document.removeEventListener("mouseup", this._dragOnMouseup);
        document.removeEventListener("touchend", this._dragOnMouseup);
      },
      writable: true,
      configurable: true
    },
    _boundaries: {

      /**
       * The position boundaries for the canvas inside the container
       * @type {Object.<Vector2>}
       * @private
       */

      get: function () {
        var canvasSize = new Vector2(this._canvas.width, this._canvas.height);
        var maxSize = this._maxSize;

        var diff = canvasSize.clone().subtract(maxSize).multiply(-1);

        var boundaries = {
          min: new Vector2(diff.x, diff.y),
          max: new Vector2(0, 0)
        };

        if (canvasSize.x < maxSize.x) {
          boundaries.min.x = diff.x / 2;
          boundaries.max.x = diff.x / 2;
        }

        if (canvasSize.y < maxSize.y) {
          boundaries.min.y = diff.y / 2;
          boundaries.max.y = diff.y / 2;
        }

        var halfCanvasSize = canvasSize.clone().divide(2);
        boundaries.min.add(halfCanvasSize);
        boundaries.max.add(halfCanvasSize);
        return boundaries;
      },
      configurable: true
    },
    _maxSize: {

      /**
       * The maximum canvas size
       * @private
       */

      get: function () {
        var computedStyle = getComputedStyle(this._canvasContainer);
        var size = new Vector2(this._canvasContainer.offsetWidth, this._canvasContainer.offsetHeight);

        var paddingX = parseInt(computedStyle.getPropertyValue("padding-left"));
        paddingX += parseInt(computedStyle.getPropertyValue("padding-right"));

        var paddingY = parseInt(computedStyle.getPropertyValue("padding-top"));
        paddingY += parseInt(computedStyle.getPropertyValue("padding-bottom"));

        size.x -= paddingX;
        size.y -= paddingY;

        var controlsHeight = this._ui._controlsContainer.offsetHeight;
        size.y -= controlsHeight;

        return size;
      },
      configurable: true
    },
    _updateStackDirtyStates: {

      /**
       * Find the first dirty operation of the stack and sets all following
       * operations to dirty
       * @param {Array.<Operation>} stack
       * @private
       */

      value: function _updateStackDirtyStates(stack) {
        var dirtyFound = false;
        for (var i = 0; i < stack.length; i++) {
          var operation = stack[i];
          if (!operation) continue;
          if (operation.dirty) {
            dirtyFound = true;
          }

          if (dirtyFound) {
            operation.dirty = true;
          }
        }
      },
      writable: true,
      configurable: true
    },
    zoomToFit: {

      /**
       * Zooms the canvas so that it fits the container
       * @param {Boolean} render
       */

      value: function zoomToFit() {
        var render = arguments[0] === undefined ? true : arguments[0];

        var initialZoomLevel = this._getInitialZoomLevel();
        return this.setZoomLevel(initialZoomLevel, render);
      },
      writable: true,
      configurable: true
    },
    sanitizedStack: {

      /**
       * Returns the operations stack without falsy values
       * @type {Array.<Operation>}
       */

      get: function () {
        var sanitizedStack = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._kit.operationsStack[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var operation = _step.value;

            if (!operation) continue;
            sanitizedStack.push(operation);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return sanitizedStack;
      },
      configurable: true
    },
    zoomLevel: {

      /**
       * The current zoom level
       * @type {Number}
       */

      get: function () {
        return this._zoomLevel;
      },
      configurable: true
    },
    size: {

      /**
       * The canvas size in pixels
       * @type {Vector2}
       */

      get: function () {
        return this._size;
      },
      configurable: true
    }
  });

  return Canvas;
})(EventEmitter);

module.exports = Canvas;

},{"../../../lib/event-emitter":45,"../../../lib/math/vector2":49,"../../../renderers/canvas-renderer":108,"../../../renderers/webgl-renderer":110,"bluebird":4}],127:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var Utils = _interopRequire(require("../../../lib/utils"));

var Color = _interopRequire(require("../../../lib/color"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var _ = _interopRequire(require("lodash"));



var ColorPicker = (function (EventEmitter) {
  function ColorPicker(ui, element) {
    _classCallCheck(this, ColorPicker);

    _get(Object.getPrototypeOf(ColorPicker.prototype), "constructor", this).call(this);

    this._ui = ui;
    this._element = element;
    this._visible = false;
    this._loaded = false;

    this._overlay = this._element.querySelector(".imglykit-color-picker-overlay");
    this._currentColorCanvas = this._element.querySelector(".imglykit-color-picker-color");

    this._alphaCanvas = this._element.querySelector("canvas.imglykit-color-picker-alpha");
    this._alphaKnob = this._element.querySelector(".imglykit-color-picker-alpha-container .imglykit-transparent-knob");

    this._hueCanvas = this._element.querySelector("canvas.imglykit-color-picker-hue");
    this._hueKnob = this._element.querySelector(".imglykit-color-picker-hue-container .imglykit-transparent-knob");

    this._saturationCanvas = this._element.querySelector("canvas.imglykit-color-picker-saturation");
    this._saturationKnob = this._element.querySelector(".imglykit-color-picker-saturation-container .imglykit-transparent-knob");

    this._transparencyImage = new Image();
    this._transparencyImage.src = ui.helpers.assetPath("ui/night/transparency.png");
    this._transparencyImage.addEventListener("load", this._onTransparencyImageLoad.bind(this));

    this._onAlphaCanvasDown = this._onAlphaCanvasDown.bind(this);
    this._onAlphaCanvasDrag = this._onAlphaCanvasDrag.bind(this);
    this._onAlphaCanvasUp = this._onAlphaCanvasUp.bind(this);
    this._onHueCanvasDown = this._onHueCanvasDown.bind(this);
    this._onHueCanvasDrag = this._onHueCanvasDrag.bind(this);
    this._onHueCanvasUp = this._onHueCanvasUp.bind(this);

    this._onSaturationCanvasDown = this._onSaturationCanvasDown.bind(this);
    this._onSaturationCanvasDrag = this._onSaturationCanvasDrag.bind(this);
    this._onSaturationCanvasUp = this._onSaturationCanvasUp.bind(this);

    this._onElementClick = this._onElementClick.bind(this);

    this._handleToggle();
    this._handleAlphaKnob();
    this._handleHueKnob();
    this._handleSaturationKnob();
  }

  _inherits(ColorPicker, EventEmitter);

  _prototypeProperties(ColorPicker, {
    template: {

      /**
       * The partial template string
       * @type {String}
       */

      get: function () {
        return "{{##def.colorpicker:\n  <div class=\"imglykit-color-picker\" id=\"{{=(typeof colorpickerId === \"undefined\"?'':colorpickerId)}}\">\n    <canvas class=\"imglykit-color-picker-color\" width=\"34\" height=\"34\"></canvas>\n\n    <div class=\"imglykit-color-picker-overlay\">\n      <div class=\"imglykit-color-picker-alpha-container\">\n        <canvas class=\"imglykit-color-picker-alpha\" width=\"200\" height=\"30\"></canvas>\n        <div class=\"imglykit-transparent-knob\"></div>\n      </div>\n\n      <div class=\"imglykit-color-picker-saturation-container\">\n        <canvas class=\"imglykit-color-picker-saturation\" width=\"160\" height=\"160\"></canvas>\n        <div class=\"imglykit-transparent-knob\"></div>\n      </div>\n\n      <div class=\"imglykit-color-picker-hue-container\">\n        <canvas class=\"imglykit-color-picker-hue\" width=\"30\" height=\"160\"></canvas>\n        <div class=\"imglykit-transparent-knob\"></div>\n      </div>\n    </div>\n  </div>\n#}}\n";
      },
      configurable: true
    }
  }, {
    _onTransparencyImageLoad: {
      value: function _onTransparencyImageLoad() {
        this._loaded = true;
        this._render();
      },
      writable: true,
      configurable: true
    },
    _handleToggle: {

      /**
       * Handles the toggling of the overlay
       * @private
       */

      value: function _handleToggle() {
        this._element.addEventListener("click", this._onElementClick);
      },
      writable: true,
      configurable: true
    },
    _onElementClick: {

      /**
       * Gets called when the element has been clicked
       * @param {Event} e
       * @private
       */

      value: function _onElementClick(e) {
        if (e.target === this._element || e.target === this._currentColorCanvas) {
          if (this._visible) {
            this._overlay.classList.remove("imglykit-visible");
          } else {
            this._overlay.classList.add("imglykit-visible");
          }
          this._visible = !this._visible;
        }
      },
      writable: true,
      configurable: true
    },
    setValue: {

      /**
       * Sets the given value
       * @param {Number} value
       */

      value: function setValue(value) {
        this._value = value.clone();

        var _value$toHSV = this._value.toHSV();

        var _value$toHSV2 = _slicedToArray(_value$toHSV, 3);

        var h = _value$toHSV2[0];
        var s = _value$toHSV2[1];
        var v = _value$toHSV2[2];

        this._hsvColor = { h: h, s: s, v: v };
        this._positionKnobs();
        this._render();
      },
      writable: true,
      configurable: true
    },
    _positionKnobs: {

      /**
       * Updates the knob positions to represent the current HSV color
       * @private
       */

      value: function _positionKnobs() {
        this._positionAlphaKnob();
        this._positionHueKnob();
        this._positionSaturationKnob();
      },
      writable: true,
      configurable: true
    },
    _positionAlphaKnob: {

      /**
       * Positions the alpha knob according to the current alpha value
       * @private
       */

      value: function _positionAlphaKnob() {
        var canvas = this._alphaCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var left = this._value.a * canvasSize.x;
        this._alphaKnob.style.left = "" + left + "px";
      },
      writable: true,
      configurable: true
    },
    _positionHueKnob: {

      /**
       * Positions the hue knob according to the current hue value
       * @private
       */

      value: function _positionHueKnob() {
        var canvas = this._hueCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var top = this._hsvColor.h * canvasSize.y;
        this._hueKnob.style.top = "" + top + "px";
      },
      writable: true,
      configurable: true
    },
    _positionSaturationKnob: {

      /**
       * Positions the saturation knob according to the current saturation value
       * @private
       */

      value: function _positionSaturationKnob() {
        var canvas = this._saturationCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var left = this._hsvColor.s * canvasSize.x;
        this._saturationKnob.style.left = "" + left + "px";
        var top = (1 - this._hsvColor.v) * canvasSize.y;
        this._saturationKnob.style.top = "" + top + "px";
      },
      writable: true,
      configurable: true
    },
    _render: {

      /**
       * Updates and renders all controls to represent the current value
       * @private
       */

      value: function _render() {
        if (!this._loaded) {
          return;
        }this._renderCurrentColor();
        this._renderAlpha();
        this._renderHue();
        this._renderSaturation();
      },
      writable: true,
      configurable: true
    },
    _renderCurrentColor: {

      /**
       * Renders the currently selected color on the controls canvas
       * @private
       */

      value: function _renderCurrentColor() {
        var canvas = this._currentColorCanvas;
        var context = canvas.getContext("2d");

        var pattern = context.createPattern(this._transparencyImage, "repeat");
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = pattern;
        context.fill();

        context.fillStyle = this._value.toRGBA();
        context.fill();
      },
      writable: true,
      configurable: true
    },
    _renderAlpha: {

      /**
       * Renders the transparency canvas with the current color
       * @private
       */

      value: function _renderAlpha() {
        var canvas = this._alphaCanvas;
        var context = canvas.getContext("2d");

        var pattern = context.createPattern(this._transparencyImage, "repeat");
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = pattern;
        context.fill();

        var gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);

        var color = this._value.clone();
        color.a = 0;
        gradient.addColorStop(0, color.toRGBA());
        gradient.addColorStop(1, this._value.toHex());
        context.fillStyle = gradient;
        context.fill();
      },
      writable: true,
      configurable: true
    },
    _renderHue: {

      /**
       * Renders the hue canvas
       * @private
       */

      value: function _renderHue() {
        var canvas = this._hueCanvas;
        var context = canvas.getContext("2d");

        var color = new Color();
        for (var y = 0; y < canvas.height; y++) {
          var ratio = y / canvas.height;
          color.fromHSV(ratio, 1, 1);

          context.strokeStyle = color.toRGBA();
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(canvas.width, y);
          context.stroke();
        }
      },
      writable: true,
      configurable: true
    },
    _renderSaturation: {

      /**
       * Renders the saturation canvas
       * @private
       */

      value: function _renderSaturation() {
        var canvas = this._saturationCanvas;
        var context = canvas.getContext("2d");

        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        var color = new Color(1, 0, 0, 1);
        for (var y = 0; y < canvas.height; y++) {
          var value = (canvas.height - y) / canvas.height;
          for (var x = 0; x < canvas.width; x++) {
            var saturation = x / canvas.width;
            color.fromHSV(this._hsvColor.h, saturation, value);
            var r = color.r;
            var g = color.g;
            var b = color.b;
            var a = color.a;

            var index = (y * canvas.width + x) * 4;

            imageData.data[index] = r * 255;
            imageData.data[index + 1] = g * 255;
            imageData.data[index + 2] = b * 255;
            imageData.data[index + 3] = a * 255;
          }
        }

        context.putImageData(imageData, 0, 0);
      },
      writable: true,
      configurable: true
    },
    _handleAlphaKnob: {

      /**
       * Handles the dragging of the alpha knob
       * @private
       */

      value: function _handleAlphaKnob() {
        this._alphaCanvas.addEventListener("mousedown", this._onAlphaCanvasDown);
        this._alphaCanvas.addEventListener("touchstart", this._onAlphaCanvasDown);
      },
      writable: true,
      configurable: true
    },
    _onAlphaCanvasDown: {

      /**
       * Gets called when the user clicks the alpha knob
       * @param {Event} e
       * @private
       */

      value: function _onAlphaCanvasDown(e) {
        e.preventDefault();

        this._onAlphaCanvasDrag(e);

        document.addEventListener("mousemove", this._onAlphaCanvasDrag);
        document.addEventListener("touchmove", this._onAlphaCanvasDrag);

        document.addEventListener("mouseup", this._onAlphaCanvasUp);
        document.addEventListener("touchend", this._onAlphaCanvasUp);
      },
      writable: true,
      configurable: true
    },
    _onAlphaCanvasDrag: {

      /**
       * Gets called when the user drags the alpha knob
       * @param {Event} e
       * @private
       */

      value: function _onAlphaCanvasDrag(e) {
        e.preventDefault();

        // Calculate relative mouse position on canvas
        var canvas = this._alphaCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);
        var mousePosition = Utils.getEventPosition(e);

        var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

        var left = _canvas$getBoundingClientRect.left;
        var top = _canvas$getBoundingClientRect.top;

        var offset = new Vector2(left, top);
        var relativePosition = mousePosition.subtract(offset);
        relativePosition.clamp(new Vector2(0, 0), canvasSize);

        // Update knob css positioning
        this._alphaKnob.style.left = "" + relativePosition.x + "px";

        // Update alpha value
        this._value.a = relativePosition.x / canvasSize.x;
        this._updateColor();
      },
      writable: true,
      configurable: true
    },
    _onAlphaCanvasUp: {

      /**
       * Gets called when the user stops dragging the alpha knob
       * @param {Event} e
       * @private
       */

      value: function _onAlphaCanvasUp(e) {
        document.removeEventListener("mousemove", this._onAlphaCanvasDrag);
        document.removeEventListener("touchmove", this._onAlphaCanvasDrag);

        document.removeEventListener("mouseup", this._onAlphaCanvasUp);
        document.removeEventListener("touchend", this._onAlphaCanvasUp);
      },
      writable: true,
      configurable: true
    },
    _handleHueKnob: {

      /**
       * Handles the dragging of the hue knob
       * @private
       */

      value: function _handleHueKnob() {
        this._hueCanvas.addEventListener("mousedown", this._onHueCanvasDown);
        this._hueCanvas.addEventListener("touchstart", this._onHueCanvasDown);
      },
      writable: true,
      configurable: true
    },
    _onHueCanvasDown: {

      /**
       * Gets called when the user clicks the canvas knob
       * @param {Event} e
       * @private
       */

      value: function _onHueCanvasDown(e) {
        e.preventDefault();

        this._onHueCanvasDrag(e);

        document.addEventListener("mousemove", this._onHueCanvasDrag);
        document.addEventListener("touchmove", this._onHueCanvasDrag);

        document.addEventListener("mouseup", this._onHueCanvasUp);
        document.addEventListener("touchend", this._onHueCanvasUp);
      },
      writable: true,
      configurable: true
    },
    _onHueCanvasDrag: {

      /**
       * Gets called when the user drags the hue knob
       * @param {Event} e
       * @private
       */

      value: function _onHueCanvasDrag(e) {
        e.preventDefault();

        var canvas = this._hueCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        // Calculate relative mouse position on canvas
        var mousePosition = Utils.getEventPosition(e);

        var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

        var left = _canvas$getBoundingClientRect.left;
        var top = _canvas$getBoundingClientRect.top;

        var offset = new Vector2(left, top);
        var relativePosition = mousePosition.subtract(offset);
        relativePosition.clamp(new Vector2(0, 0), canvasSize);

        // Update saturaiton knob css positioning
        this._hueKnob.style.top = "" + relativePosition.y + "px";

        // Update saturation and value
        relativePosition.divide(canvasSize);
        this._hsvColor.h = relativePosition.y;
        this._updateColor();
      },
      writable: true,
      configurable: true
    },
    _onHueCanvasUp: {

      /**
       * Gets called when the user stops dragging the alpha knob
       * @param {Event} e
       * @private
       */

      value: function _onHueCanvasUp(e) {
        document.removeEventListener("mousemove", this._onHueCanvasDrag);
        document.removeEventListener("touchmove", this._onHueCanvasDrag);

        document.removeEventListener("mouseup", this._onHueCanvasUp);
        document.removeEventListener("touchend", this._onHueCanvasUp);
      },
      writable: true,
      configurable: true
    },
    _handleSaturationKnob: {

      /**
       * Handles the dragging of the saturation knob
       * @private
       */

      value: function _handleSaturationKnob() {
        this._saturationCanvas.addEventListener("mousedown", this._onSaturationCanvasDown);
        this._saturationCanvas.addEventListener("touchstart", this._onSaturationCanvasDown);
      },
      writable: true,
      configurable: true
    },
    _onSaturationCanvasDown: {

      /**
       * Gets called when the user clicks the saturation canvas
       * @param {Event} e
       * @private
       */

      value: function _onSaturationCanvasDown(e) {
        e.preventDefault();

        this._onSaturationCanvasDrag(e);

        document.addEventListener("mousemove", this._onSaturationCanvasDrag);
        document.addEventListener("touchmove", this._onSaturationCanvasDrag);

        document.addEventListener("mouseup", this._onSaturationCanvasUp);
        document.addEventListener("touchend", this._onSaturationCanvasUp);
      },
      writable: true,
      configurable: true
    },
    _onSaturationCanvasDrag: {

      /**
       * Gets called when the user drags the saturation knob
       * @param {Event} e
       * @private
       */

      value: function _onSaturationCanvasDrag(e) {
        e.preventDefault();

        var canvas = this._saturationCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        // Calculate relative mouse position on canvas
        var mousePosition = Utils.getEventPosition(e);

        var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

        var left = _canvas$getBoundingClientRect.left;
        var top = _canvas$getBoundingClientRect.top;

        var offset = new Vector2(left, top);
        var relativePosition = mousePosition.subtract(offset);
        relativePosition.clamp(0, canvas.width);

        // Update saturaiton knob css positioning
        this._saturationKnob.style.left = "" + relativePosition.x + "px";
        this._saturationKnob.style.top = "" + relativePosition.y + "px";

        // Update saturation and value
        relativePosition.divide(canvasSize);
        this._hsvColor.s = relativePosition.x;
        this._hsvColor.v = 1 - relativePosition.y;
        this._updateColor();
      },
      writable: true,
      configurable: true
    },
    _onSaturationCanvasUp: {

      /**
       * Gets called when the user stops dragging the saturation knob
       * @param {Event} e
       * @private
       */

      value: function _onSaturationCanvasUp(e) {
        document.removeEventListener("mousemove", this._onSaturationCanvasDrag);
        document.removeEventListener("touchmove", this._onSaturationCanvasDrag);

        document.removeEventListener("mouseup", this._onSaturationCanvasUp);
        document.removeEventListener("touchend", this._onSaturationCanvasUp);
      },
      writable: true,
      configurable: true
    },
    _updateColor: {

      /**
       * Updates the attached color, emits the `update` event and triggers
       * a render
       * @private
       */

      value: function _updateColor() {
        this._value.fromHSV(this._hsvColor.h, this._hsvColor.s, this._hsvColor.v);
        this.emit("update", this._value);
        this._render();
      },
      writable: true,
      configurable: true
    }
  });

  return ColorPicker;
})(EventEmitter);

module.exports = ColorPicker;

},{"../../../lib/color":44,"../../../lib/event-emitter":45,"../../../lib/math/vector2":49,"../../../lib/utils":51,"lodash":"lodash"}],128:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Slider = _interopRequire(require("./slider"));



var SimpleSlider = (function (Slider) {
  function SimpleSlider() {
    _classCallCheck(this, SimpleSlider);

    if (Slider != null) {
      Slider.apply(this, arguments);
    }
  }

  _inherits(SimpleSlider, Slider);

  _prototypeProperties(SimpleSlider, {
    template: {
      /**
       * The partial template string
       * @type {String}
       */

      get: function () {
        return "{{##def.simpleSlider:\n  <div class=\"imglykit-slider\" id=\"{{=(typeof sliderId === \"undefined\"?'':sliderId)}}\">\n    <div class=\"imglykit-slider-minus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/minus.png') }}\" />\n    </div>\n    <div class=\"imglykit-slider-slider\">\n      <div class=\"imglykit-slider-background\"></div>\n      <div class=\"imglykit-slider-fill\"></div>\n      <div class=\"imglykit-slider-dot\"></div>\n    </div>\n    <div class=\"imglykit-slider-plus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/plus.png') }}\" />\n    </div>\n  </div>\n#}}\n";
      },
      configurable: true
    }
  }, {
    _setX: {

      /**
       * Sets the slider position to the given X value and resizes
       * the fill div
       * @private
       */

      value: function _setX(x) {
        this._dotElement.style.left = "" + x + "px";
        this._fillElement.style.width = "" + x + "px";
      },
      writable: true,
      configurable: true
    }
  });

  return SimpleSlider;
})(Slider);

module.exports = SimpleSlider;

},{"./slider":129}],129:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var Utils = _interopRequire(require("../../../lib/utils"));

var _ = _interopRequire(require("lodash"));



var Slider = (function (EventEmitter) {
  function Slider(element, options) {
    _classCallCheck(this, Slider);

    _get(Object.getPrototypeOf(Slider.prototype), "constructor", this).call(this);

    this._element = element;
    this._options = _.defaults(options, {
      minValue: 0,
      maxValue: 1
    });

    this._value = 0;

    this._sliderElement = this._element.querySelector(".imglykit-slider-slider");
    this._dotElement = this._element.querySelector(".imglykit-slider-dot");
    this._fillElement = this._element.querySelector(".imglykit-slider-fill");

    // Mouse event callbacks bound to class context
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this._handleDot();
  }

  _inherits(Slider, EventEmitter);

  _prototypeProperties(Slider, {
    template: {

      /**
       * The partial template string
       * @type {String}
       */

      get: function () {
        return "{{##def.slider:\n  <div class=\"imglykit-slider\" id=\"{{=(typeof sliderId === \"undefined\"?'':sliderId)}}\">\n    <div class=\"imglykit-slider-minus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/minus.png') }}\" />\n    </div>\n    <div class=\"imglykit-slider-slider\">\n      <div class=\"imglykit-slider-background\"></div>\n      <div class=\"imglykit-slider-fill\"></div>\n      <div class=\"imglykit-slider-center-dot\"></div>\n      <div class=\"imglykit-slider-dot\"></div>\n    </div>\n    <div class=\"imglykit-slider-plus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/plus.png') }}\" />\n    </div>\n  </div>\n#}}\n";
      },
      configurable: true
    }
  }, {
    setValue: {

      /**
       * Sets the given value
       * @param {Number} value
       */

      value: function setValue(value) {
        this._value = value;

        var _options = this._options;
        var maxValue = _options.maxValue;
        var minValue = _options.minValue;

        // Calculate the X position
        var valueRange = maxValue - minValue;
        var percentage = (value - minValue) / valueRange;
        var sliderWidth = this._sliderElement.offsetWidth;
        this._setX(sliderWidth * percentage);
      },
      writable: true,
      configurable: true
    },
    _setX: {

      /**
       * Sets the slider position to the given X value and resizes
       * the fill div
       * @private
       */

      value: function _setX(x) {
        this._dotElement.style.left = "" + x + "px";

        // X position relative to center to simplify calculations
        var halfSliderWidth = this._sliderElement.offsetWidth / 2;
        var relativeX = x - halfSliderWidth;

        // Update style
        this._fillElement.style.width = "" + Math.abs(relativeX) + "px";
        if (relativeX < 0) {
          this._fillElement.style.left = halfSliderWidth - Math.abs(relativeX) + "px";
        } else {
          this._fillElement.style.left = halfSliderWidth + "px";
        }
      },
      writable: true,
      configurable: true
    },
    _handleDot: {

      /**
       * Handles the dot dragging
       * @private
       */

      value: function _handleDot() {
        this._dotElement.addEventListener("mousedown", this._onMouseDown);
        this._dotElement.addEventListener("touchstart", this._onMouseDown);
      },
      writable: true,
      configurable: true
    },
    _onMouseDown: {

      /**
       * Gets called when the user presses a mouse button on the slider dot
       * @private
       */

      value: function _onMouseDown(e) {
        if (e.type === "mousedown" && e.button !== 0) {
          return;
        }e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);

        document.addEventListener("mousemove", this._onMouseMove);
        document.addEventListener("touchmove", this._onMouseMove);

        document.addEventListener("mouseup", this._onMouseUp);
        document.addEventListener("touchend", this._onMouseUp);

        // Remember initial position
        var dotPosition = this._dotElement.getBoundingClientRect();
        var sliderPosition = this._sliderElement.getBoundingClientRect();

        this._initialSliderX = dotPosition.left - sliderPosition.left;
        this._initialMousePosition = mousePosition;
      },
      writable: true,
      configurable: true
    },
    _onMouseMove: {

      /**
       * Gets called when the user drags the mouse
       * @private
       */

      value: function _onMouseMove(e) {
        e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);
        var mouseDiff = mousePosition.subtract(this._initialMousePosition);

        // Add half width of the dot for negative margin compensation
        var halfDotWidth = this._dotElement.offsetWidth * 0.5;
        var newSliderX = this._initialSliderX + mouseDiff.x + halfDotWidth;

        // X boundaries
        var sliderWidth = this._sliderElement.offsetWidth;
        newSliderX = Math.max(0, Math.min(newSliderX, sliderWidth));

        this._setX(newSliderX);

        // Calculate the new value
        var _options = this._options;
        var minValue = _options.minValue;
        var maxValue = _options.maxValue;

        var percentage = newSliderX / sliderWidth;
        var value = minValue + (maxValue - minValue) * percentage;
        this.emit("update", value);
      },
      writable: true,
      configurable: true
    },
    _onMouseUp: {

      /**
       * Gets called when the user does not press the mouse button anymore
       * @private
       */

      value: function _onMouseUp() {
        document.removeEventListener("mousemove", this._onMouseMove);
        document.removeEventListener("touchmove", this._onMouseMove);

        document.removeEventListener("mouseup", this._onMouseUp);
        document.removeEventListener("touchend", this._onMouseUp);
      },
      writable: true,
      configurable: true
    }
  });

  return Slider;
})(EventEmitter);

module.exports = Slider;

},{"../../../lib/event-emitter":45,"../../../lib/utils":51,"lodash":"lodash"}],130:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var TopControls = (function (EventEmitter) {
  function TopControls(kit, ui) {
    _classCallCheck(this, TopControls);

    _get(Object.getPrototypeOf(TopControls.prototype), "constructor", this).call(this);

    this._kit = kit;
    this._ui = ui;
    this._canvas = this._ui.canvas;
  }

  _inherits(TopControls, EventEmitter);

  _prototypeProperties(TopControls, null, {
    run: {

      /**
       * Initializes the controls
       */

      value: function run() {
        var container = this._ui.container;

        this._rightControls = container.querySelector(".imglykit-top-controls-right");
        this._leftControls = container.querySelector(".imglykit-top-controls-left");

        this._undoButton = container.querySelector(".imglykit-undo");
        this._zoomIn = container.querySelector(".imglykit-zoom-in");
        this._zoomOut = container.querySelector(".imglykit-zoom-out");
        this._zoomLevel = container.querySelector(".imglykit-zoom-level-num");
        this._handleZoom();
        this._handleUndo();
      },
      writable: true,
      configurable: true
    },
    _handleZoom: {

      /**
       * Handles the zoom controls
       * @private
       */

      value: function _handleZoom() {
        this._zoomIn.addEventListener("click", this._onZoomInClick.bind(this));
        this._zoomOut.addEventListener("click", this._onZoomOutClick.bind(this));
        this.updateZoomLevel();
      },
      writable: true,
      configurable: true
    },
    _handleUndo: {

      /**
       * Handles the undo control
       * @private
       */

      value: function _handleUndo() {
        this._undoButton.addEventListener("click", this._undo.bind(this));
        this._undo();
      },
      writable: true,
      configurable: true
    },
    _undo: {

      /**
       * Gets called when the user clicks the undo button
       * @private
       */

      value: function _undo() {
        this.emit("undo");
      },
      writable: true,
      configurable: true
    },
    updateUndoButton: {

      /**
       * Updates the undo button active state
       */

      value: function updateUndoButton() {
        var history = this._ui.history;

        if (history.length === 0) {
          this._leftControls.style.display = "none";
        } else {
          this._leftControls.style.display = "block";
        }
      },
      writable: true,
      configurable: true
    },
    _onZoomInClick: {

      /**
       * Gets called when the user clicked the zoom in button
       * @param {Event}
       * @private
       */

      value: function _onZoomInClick(e) {
        e.preventDefault();

        this.emit("zoom-in");
        this.updateZoomLevel();
      },
      writable: true,
      configurable: true
    },
    _onZoomOutClick: {

      /**
       * Gets called when the user clicked the zoom out button
       * @param {Event}
       * @private
       */

      value: function _onZoomOutClick(e) {
        e.preventDefault();

        this.emit("zoom-out");
        this.updateZoomLevel();
      },
      writable: true,
      configurable: true
    },
    showZoom: {

      /**
       * Shows the zoom control
       */

      value: function showZoom() {
        this._rightControls.style.display = "block";
      },
      writable: true,
      configurable: true
    },
    hideZoom: {

      /**
       * Hides the zoom control
       */

      value: function hideZoom() {
        this._rightControls.style.display = "none";
      },
      writable: true,
      configurable: true
    },
    updateZoomLevel: {

      /**
       * Updates the zoom level display
       */

      value: function updateZoomLevel() {
        var zoomLevel = this._canvas.zoomLevel;

        this._zoomLevel.innerHTML = Math.round(zoomLevel * 100);
      },
      writable: true,
      configurable: true
    }
  });

  return TopControls;
})(EventEmitter);

module.exports = TopControls;

},{"../../../lib/event-emitter":45}],131:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */



var UI = _interopRequire(require("../base/ui"));

var Canvas = _interopRequire(require("./lib/canvas"));

var TopControls = _interopRequire(require("./lib/top-controls"));

var NightUI = (function (UI) {
  function NightUI() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, NightUI);

    this._operationsMap = {};
    this._template = "<div class=\"imglykit-container\">\n  <div class=\"imglykit-top-controls\">\n    <div class=\"imglykit-top-controls-left\">\n      <div class=\"imglykit-undo\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/undo.png')}}\" />\n        Undo\n      </div>\n    </div>\n    <div class=\"imglykit-top-controls-right\">\n      <div class=\"imglykit-zoom-fit\"></div>\n      <div class=\"imglykit-zoom-level\">Zoom: <span class=\"imglykit-zoom-level-num\">100</span>%</div>\n      <div class=\"imglykit-zoom-in\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/zoom-in.png')}}\" />\n      </div>\n      <div class=\"imglykit-zoom-out\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/zoom-out.png')}}\" />\n      </div>\n    </div>\n  </div>\n\n  <div class=\"imglykit-canvas-container\">\n    <div class=\"imglykit-canvas-inner-container\">\n      <canvas class=\"imglykit-canvas-draggable\"></canvas>\n      <div class=\"imglykit-canvas-controls imglykit-canvas-controls-disabled\"></div>\n    </div>\n  </div>\n\n  <div class=\"imglykit-controls-container\">\n    <div class=\"imglykit-controls\">\n\n      <div>\n        <div class=\"imglykit-controls-overview\">\n          <ul class=\"imglykit-controls-list\">\n          {{ for (var identifier in it.controls) { }}\n            {{ var control = it.controls[identifier]; }}\n            <li data-identifier=\"{{= control.identifier}}\">\n              <img src=\"{{=it.helpers.assetPath('ui/night/operations/' + control.identifier + '.png') }}\" />\n            </li>\n          {{ } }}\n          </ul>\n        </div>\n      </div>\n\n    </div>\n  </div>\n</div>\n";
    this._registeredControls = {};
    this._history = [];

    // The `Night` UI has a fixed operation order
    this._preferredOperationOrder = [
    // First, all operations that affect the image dimensions
    "rotation", "crop", "flip",

    // Then color operations (first filters, then fine-tuning)
    "filters", "contrast", "brightness", "saturation",

    // Then post-processing
    "radial-blur", "tilt-shift", "frames", "stickers", "text"];

    this._paused = false;

    _get(Object.getPrototypeOf(NightUI.prototype), "constructor", this).apply(this, args);
  }

  _inherits(NightUI, UI);

  _prototypeProperties(NightUI, null, {
    identifier: {

      /**
       * A unique string that represents this UI
       * @type {String}
       */

      get: function () {
        return "night";
      },
      configurable: true
    },
    run: {

      /**
       * Prepares the UI for use
       */

      value: function run() {
        this._registerControls();

        _get(Object.getPrototypeOf(NightUI.prototype), "run", this).call(this);

        var container = this._options.container;

        this._controlsContainer = container.querySelector(".imglykit-controls");
        this._canvasControlsContainer = container.querySelector(".imglykit-canvas-controls");
        this._overviewControlsContainer = container.querySelector(".imglykit-controls-overview");

        this._handleOverview();

        this._initCanvas();
        this._initTopControls();
        this._initControls();
      },
      writable: true,
      configurable: true
    },
    _initTopControls: {

      /**
       * Initializes the top controls
       * @private
       */

      value: function _initTopControls() {
        var _this = this;

        this._topControls = new TopControls(this._kit, this);
        this._topControls.run();

        this._topControls.on("undo", function () {
          _this.undo();
        });

        // Pass zoom in event
        this._topControls.on("zoom-in", function () {
          _this._canvas.zoomIn().then(function () {
            if (_this._currentControl) {
              _this._currentControl.onZoom();
            }
          });
        });

        // Pass zoom out event
        this._topControls.on("zoom-out", function () {
          _this._canvas.zoomOut().then(function () {
            if (_this._currentControl) {
              _this._currentControl.onZoom();
            }
          });
        });
      },
      writable: true,
      configurable: true
    },
    _initCanvas: {

      /**
       * Inititializes the canvas
       * @private
       */

      value: function _initCanvas() {
        var _this = this;

        this._canvas = new Canvas(this._kit, this, this._options);
        this._canvas.run();
        this._canvas.on("zoom", function () {
          _this._topControls.updateZoomLevel();
        });
      },
      writable: true,
      configurable: true
    },
    selectOperations: {

      /**
       * Selects the enabled operations
       * @param {ImglyKit.Selector}
       */

      value: function selectOperations(selector) {
        _get(Object.getPrototypeOf(NightUI.prototype), "selectOperations", this).call(this, selector);
      },
      writable: true,
      configurable: true
    },
    getOrCreateOperation: {

      /**
       * Returns or creates an instance of the operation with the given identifier
       * @param {String} identifier
       */

      value: function getOrCreateOperation(identifier) {
        var _kit = this._kit;
        var operationsStack = _kit.operationsStack;
        var registeredOperations = _kit.registeredOperations;

        var Operation = registeredOperations[identifier];

        if (typeof this._operationsMap[identifier] === "undefined") {
          // Create operation
          var operationInstance = new Operation(this._kit);
          this._operationsMap[identifier] = operationInstance;

          // Find index in preferred operatino order
          var index = this._preferredOperationOrder.indexOf(identifier);
          operationsStack[index] = operationInstance;

          return operationInstance;
        } else {
          return this._operationsMap[identifier];
        }
      },
      writable: true,
      configurable: true
    },
    removeOperation: {

      /**
       * Removes the operation with the given identifier from the stack
       * @param {String} identifier
       */

      value: function removeOperation(identifier) {
        if (!this._operationsMap[identifier]) {
          return;
        }var operation = this._operationsMap[identifier];
        delete this._operationsMap[identifier];

        var index = this._kit.operationsStack.indexOf(operation);
        this._kit.operationsStack.splice(index, 1);
      },
      writable: true,
      configurable: true
    },
    _registerControls: {

      /**
       * Registers all default operation controls
       * @private
       */

      value: function _registerControls() {
        this.registerControl("filters", "filters", require("./controls/filters"));
        this.registerControl("rotation", "rotation", require("./controls/rotation"));
        this.registerControl("flip", "flip", require("./controls/flip"));
        this.registerControl("brightness", "brightness", require("./controls/brightness"));
        this.registerControl("contrast", "contrast", require("./controls/contrast"));
        this.registerControl("saturation", "saturation", require("./controls/saturation"));
        this.registerControl("crop", "crop", require("./controls/crop"));
        this.registerControl("radial-blur", "radial-blur", require("./controls/radial-blur"));
        this.registerControl("tilt-shift", "tilt-shift", require("./controls/tilt-shift"));
        this.registerControl("frames", "frames", require("./controls/frames"));
        this.registerControl("stickers", "stickers", require("./controls/stickers"));
        this.registerControl("text", "text", require("./controls/text"));
      },
      writable: true,
      configurable: true
    },
    _handleOverview: {

      /**
       * Handles the overview button click events
       * @private
       */

      value: function _handleOverview() {
        var _this = this;

        var listItems = this._overviewControlsContainer.querySelectorAll(":scope > ul > li");

        // Turn NodeList into an Array
        listItems = Array.prototype.slice.call(listItems);

        // Add click events to all items
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = listItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            (function () {
              var listItem = _step.value;
              var identifier = listItem.dataset.identifier;

              listItem.addEventListener("click", function () {
                _this._onOverviewButtonClick(identifier);
              });
            })();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      },
      writable: true,
      configurable: true
    },
    _onOverviewButtonClick: {

      /**
       * Gets called when an overview button has been clicked
       * @private
       */

      value: function _onOverviewButtonClick(identifier) {
        this._overviewControlsContainer.style.display = "none";

        if (this._currentControl) {
          this._currentControl.leave();
        }

        this._currentControl = this._registeredControls[identifier];
        this._currentControl.enter();
        this._currentControl.once("back", this._switchToOverview.bind(this));
      },
      writable: true,
      configurable: true
    },
    _switchToOverview: {

      /**
       * Switches back to the overview controls
       * @private
       */

      value: function _switchToOverview() {
        if (this._currentControl) {
          this._currentControl.leave();
        }

        this._currentControl = null;
        this._overviewControlsContainer.style.display = "";
      },
      writable: true,
      configurable: true
    },
    registerControl: {

      /**
       * Registers the controls for an operation
       * @param {String} identifier
       * @param {String} operationIdentifier
       * @param {Control} ControlClass
       */

      value: function registerControl(identifier, operationIdentifier, ControlClass) {
        if (!this.isOperationSelected(operationIdentifier)) {
          return;
        }var instance = new ControlClass(this._kit, this);
        this._registeredControls[identifier] = instance;
      },
      writable: true,
      configurable: true
    },
    _initControls: {

      /**
       * Initializes the registered controls
       * @private
       */

      value: function _initControls() {
        for (var identifier in this._registeredControls) {
          var control = this._registeredControls[identifier];
          control.setContainers(this._controlsContainer, this._canvasControlsContainer);
          control.init();
        }
      },
      writable: true,
      configurable: true
    },
    render: {

      /**
       * Re-renders the canvas
       */

      value: function render() {
        this._canvas.render();
      },
      writable: true,
      configurable: true
    },
    operations: {

      /**
       * An object containing all active operations
       * @type {Object.<String,Operation>}
       */

      get: function () {
        return this._operationsMap;
      },
      configurable: true
    },
    controls: {

      /**
       * An object containing all registered controls
       * @type {Object.<String,Control>}
       */

      get: function () {
        return this._registeredControls;
      },
      configurable: true
    },
    context: {

      /**
       * The data that is passed to the template renderer
       * @type {Object}
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(NightUI.prototype), "context", this);
        context.controls = this._registeredControls;
        return context;
      },
      configurable: true
    },
    pause: {

      /**
       * Pauses the UI. Operation updates will not cause a re-rendering
       * of the canvas.
       */

      value: function pause() {
        this._paused = true;
      },
      writable: true,
      configurable: true
    },
    resume: {

      /**
       * Resumes the UI and re-renders the canvas
       * @param {Boolean} rerender = true
       */

      value: function resume() {
        var rerender = arguments[0] === undefined ? true : arguments[0];

        this._paused = false;
        if (rerender) {
          this.render();
        }
      },
      writable: true,
      configurable: true
    },
    addHistory: {

      /**
       * Adds the given operation and options to the history stack
       * @param {Operation} operation
       * @param {Object.<String, *>} options
       * @param {Boolean} existent
       */

      value: function addHistory(operation, options, existent) {
        this._history.push({ operation: operation, options: options, existent: existent });
        this._topControls.updateUndoButton();
      },
      writable: true,
      configurable: true
    },
    hideZoom: {

      /**
       * Hides the zoom control
       */

      value: function hideZoom() {
        this._topControls.hideZoom();
      },
      writable: true,
      configurable: true
    },
    showZoom: {

      /**
       * Hides the zoom control
       */

      value: function showZoom() {
        this._topControls.showZoom();
      },
      writable: true,
      configurable: true
    },
    undo: {

      /**
       * Takes the last history item and applies its options
       */

      value: function undo() {
        var lastItem = this._history.pop();
        if (lastItem) {
          var operation = lastItem.operation;
          var existent = lastItem.existent;
          var options = lastItem.options;

          if (!existent) {
            this.removeOperation(operation.identifier);
          }
          this.canvas.zoomToFit(true);
        }
        this._topControls.updateUndoButton();
      },
      writable: true,
      configurable: true
    },
    history: {

      /**
       * The undo history
       * @type {Array.<Object>}
       */

      get: function () {
        return this._history;
      },
      configurable: true
    }
  });

  return NightUI;
})(UI);

module.exports = NightUI;

},{"../base/ui":112,"./controls/brightness":113,"./controls/contrast":114,"./controls/crop":116,"./controls/filters":117,"./controls/flip":118,"./controls/frames":119,"./controls/radial-blur":120,"./controls/rotation":121,"./controls/saturation":122,"./controls/stickers":123,"./controls/text":124,"./controls/tilt-shift":125,"./lib/canvas":126,"./lib/top-controls":130}],132:[function(require,module,exports){
"use strict";

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author:   Mario Klingemann
Contact:  mario@quasimondo.com
Website:  http://www.quasimondo.com/StackBlurForCanvas
Twitter:  @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr:
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

var shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

function stackBlurCanvasRGBA(imageData, top_x, top_y, width, height, radius) {
  if (isNaN(radius) || radius < 1) {
    return;
  }radius |= 0;

  var pixels = imageData.data;

  var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;

  var div = radius + radius + 1;
  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

  var stackStart = new BlurStack();
  var stackEnd;
  var stack = stackStart;
  for (i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();
    if (i == radiusPlus1) stackEnd = stack;
  }
  stack.next = stackStart;
  var stackIn = null;
  var stackOut = null;

  yw = yi = 0;

  var mul_sum = mul_table[radius];
  var shg_sum = shg_table[radius];

  for (y = 0; y < height; y++) {
    r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    a_sum += sumFactor * pa;

    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    for (i = 1; i < radiusPlus1; i++) {
      p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
      r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
      a_sum += (stack.a = pa = pixels[p + 3]) * rbs;

      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      a_in_sum += pa;

      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;
    for (x = 0; x < width; x++) {
      pixels[yi + 3] = pa = a_sum * mul_sum >> shg_sum;
      if (pa !== 0) {
        pa = 255 / pa;
        pixels[yi] = (r_sum * mul_sum >> shg_sum) * pa;
        pixels[yi + 1] = (g_sum * mul_sum >> shg_sum) * pa;
        pixels[yi + 2] = (b_sum * mul_sum >> shg_sum) * pa;
      } else {
        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
      }

      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      a_sum -= a_out_sum;

      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      a_out_sum -= stackIn.a;

      p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;

      r_in_sum += stackIn.r = pixels[p];
      g_in_sum += stackIn.g = pixels[p + 1];
      b_in_sum += stackIn.b = pixels[p + 2];
      a_in_sum += stackIn.a = pixels[p + 3];

      r_sum += r_in_sum;
      g_sum += g_in_sum;
      b_sum += b_in_sum;
      a_sum += a_in_sum;

      stackIn = stackIn.next;

      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      a_out_sum += pa = stackOut.a;

      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      a_in_sum -= pa;

      stackOut = stackOut.next;

      yi += 4;
    }
    yw += width;
  }

  for (x = 0; x < width; x++) {
    g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

    yi = x << 2;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    a_sum += sumFactor * pa;

    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    yp = width;

    for (i = 1; i <= radius; i++) {
      yi = yp + x << 2;

      r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
      a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;

      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      a_in_sum += pa;

      stack = stack.next;

      if (i < heightMinus1) {
        yp += width;
      }
    }

    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;
    for (y = 0; y < height; y++) {
      p = yi << 2;
      pixels[p + 3] = pa = a_sum * mul_sum >> shg_sum;
      if (pa > 0) {
        pa = 255 / pa;
        pixels[p] = (r_sum * mul_sum >> shg_sum) * pa;
        pixels[p + 1] = (g_sum * mul_sum >> shg_sum) * pa;
        pixels[p + 2] = (b_sum * mul_sum >> shg_sum) * pa;
      } else {
        pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
      }

      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      a_sum -= a_out_sum;

      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      a_out_sum -= stackIn.a;

      p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;

      r_sum += r_in_sum += stackIn.r = pixels[p];
      g_sum += g_in_sum += stackIn.g = pixels[p + 1];
      b_sum += b_in_sum += stackIn.b = pixels[p + 2];
      a_sum += a_in_sum += stackIn.a = pixels[p + 3];

      stackIn = stackIn.next;

      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      a_out_sum += pa = stackOut.a;

      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      a_in_sum -= pa;

      stackOut = stackOut.next;

      yi += width;
    }
  }
}

function BlurStack() {
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
}

module.exports = {
  stackBlurCanvasRGBA: stackBlurCanvasRGBA
};

},{}],"lodash":[function(require,module,exports){
(function (global){
"use strict";

/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash include="defaults,extend"`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function () {

  /** Used internally to indicate various things */
  var indicatorObject = {};

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowedProps = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];

  /** `Object#toString` result shortcuts */
  var argsClass = "[object Arguments]",
      arrayClass = "[object Array]",
      boolClass = "[object Boolean]",
      dateClass = "[object Date]",
      errorClass = "[object Error]",
      funcClass = "[object Function]",
      numberClass = "[object Number]",
      objectClass = "[object Object]",
      regexpClass = "[object RegExp]",
      stringClass = "[object String]";

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    configurable: false,
    enumerable: false,
    value: null,
    writable: false
  };

  /** Used as the data object for `iteratorTemplate` */
  var iteratorData = {
    args: "",
    array: null,
    bottom: "",
    firstArg: "",
    init: "",
    keys: null,
    loop: "",
    shadowedProps: null,
    support: null,
    top: "",
    useHas: false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    boolean: false,
    "function": true,
    object: true,
    number: false,
    string: false,
    undefined: false
  };

  /** Used as a reference to the global object */
  var root = objectTypes[typeof window] && window || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == "undefined") {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Used for native method references */
  var errorProto = Error.prototype,
      objectProto = Object.prototype,
      stringProto = String.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Used to detect if a method is native */
  var reNative = RegExp("^" + String(toString).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/toString| for [^\]]+/g, ".*?") + "$");

  /** Native method shortcuts */
  var fnToString = Function.prototype.toString,
      hasOwnProperty = objectProto.hasOwnProperty,
      push = arrayRef.push,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      unshift = arrayRef.unshift;

  /** Used to set meta data on functions */
  var defineProperty = (function () {
    // IE 8 only accepts DOM elements
    try {
      var o = {},
          func = isNative(func = Object.defineProperty) && func,
          result = func(o, o, o) && func;
    } catch (e) {}
    return result;
  })();

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
      nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
      nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

  /** Used to avoid iterating non-enumerable properties in IE < 9 */
  var nonEnumProps = {};
  nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { constructor: true, toLocaleString: true, toString: true, valueOf: true };
  nonEnumProps[boolClass] = nonEnumProps[stringClass] = { constructor: true, toString: true, valueOf: true };
  nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { constructor: true, toString: true };
  nonEnumProps[objectClass] = { constructor: true };

  (function () {
    var length = shadowedProps.length;
    while (length--) {
      var key = shadowedProps[length];
      for (var className in nonEnumProps) {
        if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {
          nonEnumProps[className][key] = false;
        }
      }
    }
  })();

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object which wraps the given value to enable intuitive
   * method chaining.
   *
   * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
   * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
   * and `unshift`
   *
   * Chaining is supported in custom builds as long as the `value` method is
   * implicitly or explicitly included in the build.
   *
   * The chainable wrapper functions are:
   * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
   * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
   * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
   * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
   * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
   * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
   * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
   * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
   * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
   * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
   * and `zip`
   *
   * The non-chainable wrapper functions are:
   * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
   * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
   * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
   * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
   * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
   * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
   * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
   * `template`, `unescape`, `uniqueId`, and `value`
   *
   * The wrapper functions `first` and `last` return wrapped values when `n` is
   * provided, otherwise they return unwrapped values.
   *
   * Explicit chaining can be enabled by using the `_.chain` method.
   *
   * @name _
   * @constructor
   * @category Chaining
   * @param {*} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns a `lodash` instance.
   * @example
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // returns an unwrapped value
   * wrapped.reduce(function(sum, num) {
   *   return sum + num;
   * });
   * // => 6
   *
   * // returns a wrapped value
   * var squares = wrapped.map(function(num) {
   *   return num * num;
   * });
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
  function lodash() {}

  /**
   * An object used to flag environments features.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = lodash.support = {};

  (function () {
    var ctor = function ctor() {
      this.x = 1;
    },
        object = { "0": 1, length: 1 },
        props = [];

    ctor.prototype = { valueOf: 1, y: 1 };
    for (var key in new ctor()) {
      props.push(key);
    }
    for (key in arguments) {}

    /**
     * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.argsClass = toString.call(arguments) == argsClass;

    /**
     * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);

    /**
     * Detect if `name` or `message` properties of `Error.prototype` are
     * enumerable by default. (IE < 9, Safari < 5.1)
     *
     * @memberOf _.support
     * @type boolean
     */
    support.enumErrorProps = propertyIsEnumerable.call(errorProto, "message") || propertyIsEnumerable.call(errorProto, "name");

    /**
     * Detect if `prototype` properties are enumerable by default.
     *
     * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
     * (if the prototype or a property on the prototype has been set)
     * incorrectly sets a function's `prototype` property [[Enumerable]]
     * value to `true`.
     *
     * @memberOf _.support
     * @type boolean
     */
    support.enumPrototypes = propertyIsEnumerable.call(ctor, "prototype");

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(root.WinRTError) && reThis.test(function () {
      return this;
    });

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == "string";

    /**
     * Detect if `arguments` object indexes are non-enumerable
     * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.nonEnumArgs = key != 0;

    /**
     * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
     *
     * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
     * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.nonEnumShadows = !/valueOf/.test(props);

    /**
     * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.
     *
     * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
     * and `splice()` functions that fail to remove the last element, `value[0]`,
     * of array-like objects even though the `length` property is set to `0`.
     * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
     * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
     *
     * @memberOf _.support
     * @type boolean
     */
    support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);

    /**
     * Detect lack of support for accessing string characters by index.
     *
     * IE < 8 can't access characters by index and IE 8 can only access
     * characters by index on string literals.
     *
     * @memberOf _.support
     * @type boolean
     */
    support.unindexedChars = "x"[0] + Object("x")[0] != "xx";
  })(1);

  /*--------------------------------------------------------------------------*/

  /**
   * The template used to create iterator functions.
   *
   * @private
   * @param {Object} data The data object used to populate the text.
   * @returns {string} Returns the interpolated text.
   */
  var iteratorTemplate = function iteratorTemplate(obj) {

    var __p = "var index, iterable = " + obj.firstArg + ", result = " + obj.init + ";\nif (!iterable) return result;\n" + obj.top + ";";
    if (obj.array) {
      __p += "\nvar length = iterable.length; index = -1;\nif (" + obj.array + ") {  ";
      if (support.unindexedChars) {
        __p += "\n  if (isString(iterable)) {\n    iterable = iterable.split('')\n  }  ";
      }
      __p += "\n  while (++index < length) {\n    " + obj.loop + ";\n  }\n}\nelse {  ";
    } else if (support.nonEnumArgs) {
      __p += "\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += '';\n      " + obj.loop + ";\n    }\n  } else {  ";
    }

    if (support.enumPrototypes) {
      __p += "\n  var skipProto = typeof iterable == 'function';\n  ";
    }

    if (support.enumErrorProps) {
      __p += "\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ";
    }

    var conditions = [];if (support.enumPrototypes) {
      conditions.push("!(skipProto && index == \"prototype\")");
    }if (support.enumErrorProps) {
      conditions.push("!(skipErrorProps && (index == \"message\" || index == \"name\"))");
    }

    if (obj.useHas && obj.keys) {
      __p += "\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n";
      if (conditions.length) {
        __p += "    if (" + conditions.join(" && ") + ") {\n  ";
      }
      __p += obj.loop + ";    ";
      if (conditions.length) {
        __p += "\n    }";
      }
      __p += "\n  }  ";
    } else {
      __p += "\n  for (index in iterable) {\n";
      if (obj.useHas) {
        conditions.push("hasOwnProperty.call(iterable, index)");
      }if (conditions.length) {
        __p += "    if (" + conditions.join(" && ") + ") {\n  ";
      }
      __p += obj.loop + ";    ";
      if (conditions.length) {
        __p += "\n    }";
      }
      __p += "\n  }    ";
      if (support.nonEnumShadows) {
        __p += "\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ";
        for (k = 0; k < 7; k++) {
          __p += "\n    index = '" + obj.shadowedProps[k] + "';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))";
          if (!obj.useHas) {
            __p += " || (!nonEnum[index] && iterable[index] !== objectProto[index])";
          }
          __p += ") {\n      " + obj.loop + ";\n    }      ";
        }
        __p += "\n  }    ";
      }
    }

    if (obj.array || support.nonEnumArgs) {
      __p += "\n}";
    }
    __p += obj.bottom + ";\nreturn result";

    return __p;
  };

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.bind` that creates the bound function and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new bound function.
   */
  function baseBind(bindData) {
    var func = bindData[0],
        partialArgs = bindData[2],
        thisArg = bindData[4];

    function bound() {
      // `Function#bind` spec
      // http://es5.github.io/#x15.3.4.5
      if (partialArgs) {
        // avoid `arguments` object deoptimizations by using `slice` instead
        // of `Array.prototype.slice.call` and not assigning `arguments` to a
        // variable as a ternary expression
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      // mimic the constructor's `return` behavior
      // http://es5.github.io/#x13.2.2
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `func`
        var thisBinding = baseCreate(func.prototype),
            result = func.apply(thisBinding, args || arguments);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisArg, args || arguments);
    }
    setBindData(bound, bindData);
    return bound;
  }

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  function baseCreate(prototype, properties) {
    return isObject(prototype) ? nativeCreate(prototype) : {};
  }
  // fallback for browsers without `Object.create`
  if (!nativeCreate) {
    baseCreate = (function () {
      function Object() {}
      return function (prototype) {
        if (isObject(prototype)) {
          Object.prototype = prototype;
          var result = new Object();
          Object.prototype = null;
        }
        return result || root.Object();
      };
    })();
  }

  /**
   * The base implementation of `_.createCallback` without support for creating
   * "_.pluck" or "_.where" style callbacks.
   *
   * @private
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   */
  function baseCreateCallback(func, thisArg, argCount) {
    if (typeof func != "function") {
      return identity;
    }
    // exit early for no `thisArg` or already bound by `Function#bind`
    if (typeof thisArg == "undefined" || !("prototype" in func)) {
      return func;
    }
    var bindData = func.__bindData__;
    if (typeof bindData == "undefined") {
      if (support.funcNames) {
        bindData = !func.name;
      }
      bindData = bindData || !support.funcDecomp;
      if (!bindData) {
        var source = fnToString.call(func);
        if (!support.funcNames) {
          bindData = !reFuncName.test(source);
        }
        if (!bindData) {
          // checks if `func` references the `this` keyword and stores the result
          bindData = reThis.test(source);
          setBindData(func, bindData);
        }
      }
    }
    // exit early if there are no `this` references or `func` is bound
    if (bindData === false || bindData !== true && bindData[1] & 1) {
      return func;
    }
    switch (argCount) {
      case 1:
        return function (value) {
          return func.call(thisArg, value);
        };
      case 2:
        return function (a, b) {
          return func.call(thisArg, a, b);
        };
      case 3:
        return function (value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
    }
    return bind(func, thisArg);
  }

  /**
   * The base implementation of `createWrapper` that creates the wrapper and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new function.
   */
  function baseCreateWrapper(bindData) {
    var func = bindData[0],
        bitmask = bindData[1],
        partialArgs = bindData[2],
        partialRightArgs = bindData[3],
        thisArg = bindData[4],
        arity = bindData[5];

    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        key = func;

    function bound() {
      var thisBinding = isBind ? thisArg : this;
      if (partialArgs) {
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      if (partialRightArgs || isCurry) {
        args || (args = slice(arguments));
        if (partialRightArgs) {
          push.apply(args, partialRightArgs);
        }
        if (isCurry && args.length < arity) {
          bitmask |= 16 & ~32;
          return baseCreateWrapper([func, isCurryBound ? bitmask : bitmask & ~3, args, null, thisArg, arity]);
        }
      }
      args || (args = arguments);
      if (isBindKey) {
        func = thisBinding[key];
      }
      if (this instanceof bound) {
        thisBinding = baseCreate(func.prototype);
        var result = func.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisBinding, args);
    }
    setBindData(bound, bindData);
    return bound;
  }

  /**
   * Creates a function that, when called, either curries or invokes `func`
   * with an optional `this` binding and partially applied arguments.
   *
   * @private
   * @param {Function|string} func The function or method name to reference.
   * @param {number} bitmask The bitmask of method flags to compose.
   *  The bitmask may be composed of the following flags:
   *  1 - `_.bind`
   *  2 - `_.bindKey`
   *  4 - `_.curry`
   *  8 - `_.curry` (bound)
   *  16 - `_.partial`
   *  32 - `_.partialRight`
   * @param {Array} [partialArgs] An array of arguments to prepend to those
   *  provided to the new function.
   * @param {Array} [partialRightArgs] An array of arguments to append to those
   *  provided to the new function.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new function.
   */
  function createWrapper(_x, _x2, _x3, _x4, _x5, _x6) {
    var _arguments;

    var _again = true;

    _function: while (_again) {
      _again = false;
      var func = _x,
          bitmask = _x2,
          partialArgs = _x3,
          partialRightArgs = _x4,
          thisArg = _x5,
          arity = _x6;
      isBind = isBindKey = isCurry = isCurryBound = isPartial = isPartialRight = bindData = creater = undefined;

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError();
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        _arguments = bindData;
        _x = _arguments[0];
        _x2 = _arguments[1];
        _x3 = _arguments[2];
        _x4 = _arguments[3];
        _x5 = _arguments[4];
        _x6 = _arguments[5];
        _again = true;
        continue _function;
      }
      // fast path for `_.bind`
      var creater = bitmask == 1 || bitmask === 17 ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }
  }

  /**
   * Creates compiled iteration functions.
   *
   * @private
   * @param {...Object} [options] The compile options object(s).
   * @param {string} [options.array] Code to determine if the iterable is an array or array-like.
   * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.
   * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.
   * @param {string} [options.args] A comma separated string of iteration function arguments.
   * @param {string} [options.top] Code to execute before the iteration branches.
   * @param {string} [options.loop] Code to execute in the object loop.
   * @param {string} [options.bottom] Code to execute after the iteration branches.
   * @returns {Function} Returns the compiled function.
   */
  function createIterator() {
    // data properties
    iteratorData.shadowedProps = shadowedProps;

    // iterator options
    iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = "";
    iteratorData.init = "iterable";
    iteratorData.useHas = true;

    // merge options into a template data object
    for (var object, index = 0; object = arguments[index]; index++) {
      for (var key in object) {
        iteratorData[key] = object[key];
      }
    }
    var args = iteratorData.args;
    iteratorData.firstArg = /^[^,]+/.exec(args)[0];

    // create the function factory
    var factory = Function("baseCreateCallback, errorClass, errorProto, hasOwnProperty, " + "indicatorObject, isArguments, isArray, isString, keys, objectProto, " + "objectTypes, nonEnumProps, stringClass, stringProto, toString", "return function(" + args + ") {\n" + iteratorTemplate(iteratorData) + "\n}");

    // return the compiled function
    return factory(baseCreateCallback, errorClass, errorProto, hasOwnProperty, indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto, objectTypes, nonEnumProps, stringClass, stringProto, toString);
  }

  /**
   * Checks if `value` is a native function.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
   */
  function isNative(value) {
    return typeof value == "function" && reNative.test(value);
  }

  /**
   * Sets `this` binding data on a given function.
   *
   * @private
   * @param {Function} func The function to set data on.
   * @param {Array} value The data array to set.
   */
  var setBindData = !defineProperty ? noop : function (func, value) {
    descriptor.value = value;
    defineProperty(func, "__bindData__", descriptor);
  };

  /*--------------------------------------------------------------------------*/

  /**
   * Checks if `value` is an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
   * @example
   *
   * (function() { return _.isArguments(arguments); })(1, 2, 3);
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    return value && typeof value == "object" && typeof value.length == "number" && toString.call(value) == argsClass || false;
  }
  // fallback for browsers that can't detect `arguments` objects by [[Class]]
  if (!support.argsClass) {
    isArguments = function (value) {
      return value && typeof value == "object" && typeof value.length == "number" && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee") || false;
    };
  }

  /**
   * Checks if `value` is an array.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
   * @example
   *
   * (function() { return _.isArray(arguments); })();
   * // => false
   *
   * _.isArray([1, 2, 3]);
   * // => true
   */
  var isArray = nativeIsArray || function (value) {
    return value && typeof value == "object" && typeof value.length == "number" && toString.call(value) == arrayClass || false;
  };

  /**
   * A fallback implementation of `Object.keys` which produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @type Function
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   */
  var shimKeys = createIterator({
    args: "object",
    init: "[]",
    top: "if (!(objectTypes[typeof object])) return result",
    loop: "result.push(index)"
  });

  /**
   * Creates an array composed of the own enumerable property names of an object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
   */
  var keys = !nativeKeys ? shimKeys : function (object) {
    if (!isObject(object)) {
      return [];
    }
    if (support.enumPrototypes && typeof object == "function" || support.nonEnumArgs && object.length && isArguments(object)) {
      return shimKeys(object);
    }
    return nativeKeys(object);
  };

  /** Reusable iterator options for `assign` and `defaults` */
  var defaultsIteratorOptions = {
    args: "object, source, guard",
    top: "var args = arguments,\n" + "    argsIndex = 0,\n" + "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" + "while (++argsIndex < argsLength) {\n" + "  iterable = args[argsIndex];\n" + "  if (iterable && objectTypes[typeof iterable]) {",
    keys: keys,
    loop: "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
    bottom: "  }\n}"
  };

  /*--------------------------------------------------------------------------*/

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources will overwrite property assignments of previous
   * sources. If a callback is provided it will be executed to produce the
   * assigned values. The callback is bound to `thisArg` and invoked with two
   * arguments; (objectValue, sourceValue).
   *
   * @static
   * @memberOf _
   * @type Function
   * @alias extend
   * @category Objects
   * @param {Object} object The destination object.
   * @param {...Object} [source] The source objects.
   * @param {Function} [callback] The function to customize assigning values.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
   * // => { 'name': 'fred', 'employer': 'slate' }
   *
   * var defaults = _.partialRight(_.assign, function(a, b) {
   *   return typeof a == 'undefined' ? b : a;
   * });
   *
   * var object = { 'name': 'barney' };
   * defaults(object, { 'name': 'fred', 'employer': 'slate' });
   * // => { 'name': 'barney', 'employer': 'slate' }
   */
  var assign = createIterator(defaultsIteratorOptions, {
    top: defaultsIteratorOptions.top.replace(";", ";\n" + "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" + "  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n" + "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" + "  callback = args[--argsLength];\n" + "}"),
    loop: "result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]"
  });

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object for all destination properties that resolve to `undefined`. Once a
   * property is set, additional defaults of the same property will be ignored.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The destination object.
   * @param {...Object} [source] The source objects.
   * @param- {Object} [guard] Allows working with `_.reduce` without using its
   *  `key` and `object` arguments as sources.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * var object = { 'name': 'barney' };
   * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
   * // => { 'name': 'barney', 'employer': 'slate' }
   */
  var defaults = createIterator(defaultsIteratorOptions);

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == "function";
  }
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function (value) {
      return typeof value == "function" && toString.call(value) == funcClass;
    };
  }

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.io/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return !!(value && objectTypes[typeof value]);
  }

  /**
   * Checks if `value` is a string.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
   * @example
   *
   * _.isString('fred');
   * // => true
   */
  function isString(value) {
    return typeof value == "string" || value && typeof value == "object" && toString.call(value) == stringClass || false;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * provided to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {...*} [arg] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'fred' }, 'hi');
   * func();
   * // => 'hi fred'
   */
  function bind(func, thisArg) {
    return arguments.length > 2 ? createWrapper(func, 17, slice(arguments, 2), null, thisArg) : createWrapper(func, 1, null, null, thisArg);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * This method returns the first argument provided to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * A no-operation function.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {}

  /*--------------------------------------------------------------------------*/

  lodash.assign = assign;
  lodash.bind = bind;
  lodash.defaults = defaults;
  lodash.keys = keys;

  lodash.extend = assign;

  /*--------------------------------------------------------------------------*/

  lodash.identity = identity;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isFunction = isFunction;
  lodash.isObject = isObject;
  lodash.isString = isString;
  lodash.noop = noop;

  /*--------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type string
   */
  lodash.VERSION = "2.4.1";

  /*--------------------------------------------------------------------------*/

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = lodash;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function () {
      return lodash;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = lodash)._ = lodash;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = lodash;
    }
  } else {
    // in a browser or Rhino
    root._ = lodash;
  }
}).call(undefined);

// no operation performed

// no operation performed

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
