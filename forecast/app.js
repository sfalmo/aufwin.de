import { cModels , cParameters , cSoundings , cMeteograms , cLayers , cDefaults } from './config.js';

import './js/compact-attribution.js';
import './js/rasp-control.js';

// Create the map
var gMap = L.map('map', {
    center: cModels[cDefaults.model].center,
    zoom: cDefaults.zoom,
    zoomControl: false,
    doubleClickZoom: false
});
// Add default controls
L.control.scale({position: cDefaults.scaleLocation}).addTo(gMap);
L.control.zoom({position: cDefaults.zoomLocation}).addTo(gMap);

// Leaflet needs this because the flexbox it is in does not evaluate to the right height at the beginning
// Otherwise, bottom tiles are not loaded (because leaflet thinks they are out of scope)
window.onload = () => {
    gRaspControl.update();
    gMap.invalidateSize();
};

cLayers.baseLayers[cDefaults.baseLayer].addTo(gMap);
for (const overlay of cDefaults.overlays) {
    cLayers.overlays[overlay].addTo(gMap);
}

// Add layer control
var customLayerControl = L.Control.Layers.extend({
    expand: function () {
        gRaspControl.disableOnMapClick();
        L.Control.Layers.prototype.expand.call(this);
    },
    collapse: function () {
        gRaspControl.enableOnMapClick();
        L.Control.Layers.prototype.collapse.call(this);
    },
});

var gLayerControl = new customLayerControl(cLayers.baseLayers, cLayers.overlays).addTo(gMap);

var gRaspControl = L.control.raspControl({position: cDefaults.RASPControlLocation}).addTo(gMap);
