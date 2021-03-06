import valueIndicator from './value-indicator.js';
import raspRendererPlotty from './rasp-renderer-plotty.js';
import raspRendererWindbarbs from './rasp-renderer-windbarbs.js';

L.RaspLayer = L.Layer.extend({
    initialize: function(options) {
        L.setOptions(this, options);
    },
    onAdd: function(map) {
        this._map = map;

        this.canvas = document.createElement('canvas');
        this.overlay = L.imageOverlay(this.canvas.toDataURL(), [[0,1], [0,1]]).addTo(this._map); // Bounds get updated anyway
        this.layerGroup = L.layerGroup([]).addTo(this._map);

        // Renderers
        this.plottyRenderer = raspRendererPlotty(this.canvas);
        this.windbarbRenderer = raspRendererWindbarbs(this.layerGroup);

        // Value indicator
        this.valueIndicator = valueIndicator();
        this.valueIndicator.addTo(this._map);
        this._map.on('mousemove', this._onMouseMove, this);
        return this;
    },
    onRemove: function() {
        this._map.off('mousemove', this._onMouseMove);
    },
    update: function(georasters, parameter) {
        this.georasters = georasters;
        if (parameter.composite) {
            this.units = parameter.composite.units;
            this.domains = parameter.composite.domains;
        } else {
            this.units = [parameter.unit];
            this.domains = [parameter.domain];
        }
        this._plot(georasters, parameter);
        this._updateValueIndicator(this._lastLat, this._lastLng);
    },
    _plot: function(georasters, parameter) {
        this.layerGroup.clearLayers();
        this.overlay.setBounds([[georasters[0].ymin, georasters[0].xmin], [georasters[0].ymax, georasters[0].xmax]]);
        // The base parameter is always displayed as a heatmap (currently realized via the plotty renderer)
        if (!parameter.composite) {
            this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0], colorscale: parameter.colorscale});
        } else {
            // For composite parameters, the additional fields must also be rendered according to the composite type
            if (parameter.composite.type == "wstar_bsratio") {
                this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0]});
                this.plottyRenderer.render(georasters[1], {domain: this.domains[1], unit: this.units[1], colorscale: 'bsratio', append: true});
            }
            if (parameter.composite.type == "wind") {
                this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0]});
                this.windbarbRenderer.render(georasters[0], georasters[1]);
            }
            if (parameter.composite.type == "clouds") {
                this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0], colorscale: 'clouds', dummy: true});
                this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0], colorscale: 'clouds_low', append: true});
                this.plottyRenderer.render(georasters[1], {domain: this.domains[1], unit: this.units[1], colorscale: 'clouds_mid', append: true});
                this.plottyRenderer.render(georasters[2], {domain: this.domains[2], unit: this.units[2], colorscale: 'clouds_high', append: true});
            }
            if (parameter.composite.type == "press") {
                this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0]});
                this.windbarbRenderer.render(georasters[1], georasters[2]);
            }
        }
        this.overlay.setUrl(this.canvas.toDataURL());
    },
    _updateValueIndicator(lat, lng) {
        this._lastLat = lat;
        this._lastLng = lng;
        var bounds = this.overlay.getBounds();
        var x = Math.floor((lng - bounds._southWest.lng) / (bounds._northEast.lng - bounds._southWest.lng) * this.georasters[0].width);
        var y = Math.floor((bounds._northEast.lat - lat) / (bounds._northEast.lat - bounds._southWest.lat) * this.georasters[0].height);
        var values = [];
        if (x >= 0 && x < this.georasters[0].width && y >= 0 && y < this.georasters[0].height) { // we are inside the domain
            this.georasters.forEach((georaster, i) => {
                values[i] = georaster.values[0][y][x].toFixed(0);
            });
        }
        var valueIndicatorText = "-";
        if (values.length != 0 && values[0] != this.georasters[0].noDataValue) {
            valueIndicatorText = "";
            values.forEach((value, i) => {
                if (i != 0) {
                    valueIndicatorText += ", ";
                } else {
                    this.plottyRenderer.updateScaleIndicator(value);
                }
                valueIndicatorText += `${value} ${this.units[i]}`;
            });
        } else {
            this.plottyRenderer.hideScaleIndicator();
        }
        this.valueIndicator.update(valueIndicatorText);
    },
    _onMouseMove: function(e) {
        if (this.georasters) {
            this._updateValueIndicator(e.latlng.lat, e.latlng.lng);
        }
    }
});

export default function(options) {
    return new L.RaspLayer(options);
};
