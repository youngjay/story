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
CustomizeStory.prototype['@ajax'] = function(url) {
    return function(data, callback) {
        mockajax(url, data, callback)
    }
};
CustomizeStory.prototype['@live'] = function(selector, event) {
    return function(target, callback) {
        target.live(selector, event, callback)
    }
};


/**********************************/

var obj = {
    container: {},

    render: function(data) {
        return this.container.innerHTML = '<div>' + data.name + '</div>';
    },

    getAjaxParams: function() {
        return {
            id: 1
        }
    }
};




var s = new CustomizeStory(obj);

s.when('getAjaxParams @ajax /a/b/c @then render').start(function(html) {
    console.log(html)
})