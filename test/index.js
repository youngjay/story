var Story = require('../');
var events = require('backbone-events');

var obj = {
    container: {},

    add1: function(n, callback) {
        callback(n + this.num);
    },

    getNumber: function() {
        return this.num;
    },

    log: function(o) {
        console.log('log:' + o)
        return o;
    },

    write: function(o) {
        console.log('write:' + o)
        return o;
    },

    num: 1001,

    element: Object.create(events),

    ajax: function(params, callback) {
        callback({
            name: 2
        })
    },

    render: function(data) {
        this.container.innerHTML = '<div>' + data.name + '</div>';
        return data;
    },

    getAjaxParams: function() {
        return {
            id: 1
        }
    }
};

describe('when', function() {
    it('should then work', function() {

        var s = new Story(obj);

        s.when('@then element @on keypress keyup').then(function() {
            return this.num
        }).then('log write').start();

        obj.element.trigger('keypress', 'on keypress11');

        s.when('getAjaxParams @then ajax @then render log').start(function() {
            console.log(this.container)
        })

    })
});