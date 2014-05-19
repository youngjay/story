var Story = require('../');
var events = require('backbone-events');

var obj = {
    container: {},

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


var s = new Story(obj);


s.when('getAjaxParams @then ajax @then render').start(function() {
    console.log(this.container)
})
