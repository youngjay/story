!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Story=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var slice = [].slice;
var push = [].push;

var collect = function(input, fn, context, callback) {
    var ret = fn.call(context, input, callback);
    if (ret !== undefined) {
        callback(ret);
    }
};

var group = function(fns) {

    return function(input, callback) {
        var n = fns.length;
        var results = [];
        var context = this;

        var check = function(i) {
            return function(o) {
                results[i] = o;
                if (--n === 0) {
                    callback(results);
                }
            }
        }

        fns.forEach(function(fn, i) {
            collect(input, fn, context, check(i));
        });
    }

};

var isArray = [].isArray || function(o) {
    return o && typeof o === 'object' && typeof o.length === 'number';
};

var Story = function(context) {
    this.context = context;
};

(function(consumer) {

    consumer.when = function(statement) {
        return new Statement(this.context, statement, this);
    };

    consumer['@then'] = function() {
        if (!arguments.length) {
            return;
        }

        var context = this.context;
        var fns = slice.call(arguments).map(function(name) {
            if (name === 'me') {
                return function() {
                    return this;
                }
            }

            return typeof context[name] === 'function' ? context[name]: function() {
                return this[name];
            };
        });

        return fns.length > 1 ? group(fns) : fns[0];
    };

})(Story.prototype);


var Statement = function(context, statement, consumer) {
    this.context = context;
    this.consumer = consumer;
    this.callbacks = [];
    this._parseStatement(statement);
};

(function(sp) {
    var EMPTY = {};

    sp._consume = function() {
        if (this.statements.length) {
            return this.statements.shift();
        }
        return EMPTY;
    };

    sp._consumeArgs = function() {
        var ret = [];
        while(this.statements[0] && this.statements[0].indexOf('@') !== 0) {
            ret.push(this.statements.shift());
        }
        return ret;
    };

    sp._parseStatement = function(statement) {
        this.statements = statement.split(/\s+/g);
        this.statements.unshift('@then');

        for (var token = this._consume(); token !== EMPTY; token = this._consume()) {          
            var processors = this.consumer[token].apply(this, this._consumeArgs());
            if (processors) {
                push[isArray(processors) ? 'apply' : 'call'](this.callbacks, processors);
            }
        }
    };

    sp.then = function(callbackOrStatement) {
        if (typeof callbackOrStatement === 'string') {
            this._parseStatement(callbackOrStatement);
        }
        else {
            this.callbacks.push(callbackOrStatement);
        }            
        return this;
    };

    sp.start = function(callback) {
        var i = -1;
        var context = this.context;
        var callbacks = this.callbacks;

        var run = function(input) {
            i += 1;
            if (i < callbacks.length) {
                collect(input, callbacks[i], context, run);
            }
            else {
                if (callback) {
                    callback.call(context, input);
                }
            }
        };

        run();          
    };

})(Statement.prototype);


module.exports = Story;
},{}]},{},[1])
(1)
});