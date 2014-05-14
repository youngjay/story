var mixin = require('mixin-class');
var EMPTY = {};

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

var Story = mixin(
    function(context) {
        this.context = context;
        this.statements = [];
    },
    {
        when: function(statement) {
            var s = new Statement(this.context, statement, this);
            this.statements.push(s);
            return s;
        }
    }
);

var Statement = mixin(
    function(context, statement, consumer) {
        this.context = context;
        this.consumer = consumer;
        this.callbacks = [];
        this._parseStatement(statement);
    },
    {
        _consume: function() {
            if (this.statements.length) {
                return this.statements.shift();
            }
            return EMPTY;
        },

        _consumeArgs: function() {
            var ret = [];
            while(this.statements[0] && this.statements[0].indexOf('@') !== 0) {
                ret.push(this.statements.shift());
            }
            return ret;
        },

        _parseStatement: function(statement) {
            this.statements = statement.split(/\s+/g);
            this.statements.unshift('@then');

            for (var token = this._consume(); token !== EMPTY; token = this._consume()) {          
                this.consumer[token].call(this, this._consumeArgs());
            }         
        },

        then: function(callbackOrStatement) {
            if (typeof callbackOrStatement === 'string') {
                this._parseStatement(callbackOrStatement);
            }
            else {
                this.callbacks.push(callbackOrStatement);
            }            
            return this;
        },

        start: function(callback) {
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
        }
    }
);

var consumer = Story.prototype;

consumer['@then'] = function(args) {
    if (!args.length) {
        return;
    }

    var context = this.context;
    var fns = args.map(function(name) {
        if (name === 'me') {
            return function() {
                return this;
            }
        }

        return typeof context[name] === 'function' ? context[name]: function() {
            return this[name];
        };
    });

    this.callbacks.push(fns.length > 1 ? group(fns) : fns[0]);
};

consumer['@on'] = function(events) {
    this.callbacks.push(function(obj, callback) {
        events.forEach(function(event) {
            obj.on(event, callback);                   
        })
    });
};

module.exports = Story;