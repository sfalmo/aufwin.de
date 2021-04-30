L.Control.ValueIndicator = L.Control.extend({
    options: {
        position: 'topleft',
        emptyString: '-',
    },
    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-indicator');
        L.DomEvent.disableClickPropagation(this._container);
        this._container.innerHTML = this.options.emptyString;
        return this._container;
    },
    onRemove: function (map) {
        // Nothing to do
    },
    update: function (text) {
        this._container.innerHTML = text;
    }
});

export default function (options) {
    return new L.Control.ValueIndicator(options);
};
