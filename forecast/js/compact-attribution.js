L.Control.Attribution.Compact = L.Control.Attribution.extend({
    addTo: function(map) {
        L.Control.Attribution.prototype.addTo.call(this, map);
        // use the css checkbox hack to toggle the attribution
        var parent     = this._container.parentNode;
        parent.onclick = event => event.stopPropagation();
        var checkbox   = document.createElement('input');
        var label      = document.createElement('label');
        var checkboxId = map._container.id + '-attribution-toggle';
        checkbox.setAttribute('id', checkboxId);
        checkbox.setAttribute('type', 'checkbox');
        checkbox.classList.add('leaflet-compact-attribution-toggle');
        parent.insertBefore(checkbox, parent.firstChild);
        label.setAttribute('for', checkboxId);
        label.classList.add('leaflet-control');
        label.classList.add('leaflet-compact-attribution-label');
        parent.appendChild(label);
        // initial setup for map load
        if (window.innerWidth < 700 || window.matchMedia("(orientation: portrait)").matches) {
            L.DomUtil.addClass(this._container, 'leaflet-compact-attribution');
        }
        // update on map resize
        map.on('resize', function() {
            if (window.innerWidth < 700 || window.matchMedia("(orientation: portrait)").matches) {
                L.DomUtil.addClass(this._container, 'leaflet-compact-attribution');
            } else {
                L.DomUtil.removeClass(this._container, 'leaflet-compact-attribution');
            }
        }, this);
        return this;
    },
});

export default function(options) {
    return new L.Control.Attribution.Compact(options);
}
