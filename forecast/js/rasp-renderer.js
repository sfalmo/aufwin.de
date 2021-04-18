L.RaspRenderer = L.Class.extend({
    initialize: function(canvas, options) {
        this.canvas = canvas;
        L.setOptions(this, options);
    },
    render: function() {
        throw new Error("Abstract class");
    }
});

L.raspRenderer = function(canvas, options) {
    return new L.RaspRenderer(canvas, options);
};
