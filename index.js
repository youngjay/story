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

var Story = function(context) {
    this.context = context;
};

(function(consumer) {

    consumer.when = function(statement) {
        return new Statement(this.context, statement, this);
    };

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
            this.consumer[token].call(this, this._consumeArgs());
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