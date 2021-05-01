L.Control.ValidIndicator = L.Control.extend({
    options: {
        position: 'topright',
        emptyString: '???',
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
    update: function (validInfoText) {
        this._container.innerHTML = validInfoText;
    }
});

export default function (options) {
    return new L.Control.ValidIndicator(options);
};
