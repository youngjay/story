var Story = require('../');
var events = require('backbone-events');

var mockajax = function(url, data, callback) {
    callback({
        name: 'ajax'
    })
}

var CustomizeStory = function() {
    Story.apply(this, arguments);
};

CustomizeStory.prototype = Object.create(Story.prototype);
CustomizeStory.prototype.constructor = CustomizeStory;
CustomizeStory.prototype['@ajax'] = function(args) {
    var url = args[0];
    this.callbacks.push(function(data, callback) {
        mockajax(url, data, callback)
    })
};

var obj = {
    container: {},

    url: '/a/b',

    render: function(data) {
        return this.container.innerHTML = '<div>' + data.name + '</div>';
    },

    getAjaxParams: function() {
        return {
            id: 1
        }
    }
};

describe('when', function() {
    it('should then work', function() {
        var s = new CustomizeStory(obj);

        s.when('getAjaxParams @ajax url @then render').start(function(html) {
            console.log(html)
        })
    })
});