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
L.control.layers(cLayers.baseLayers, cLayers.overlays).addTo(gMap);

cLayers.baseLayers[cDefaults.baseLayer].addTo(gMap);
for (const overlay of cDefaults.overlays) {
    cLayers.overlays[overlay].addTo(gMap);
}

// This sets up all RASP related controls and layers
var gRaspControl = L.control.raspControl({position: cDefaults.RASPControlLocation}).addTo(gMap);

// Leaflet needs this because the flexbox it is in does not evaluate to the right height at the beginning
// Otherwise, bottom tiles are not loaded (because leaflet thinks they are outside of the viewport)
window.onload = () => {
    gRaspControl.update();
    gMap.invalidateSize();
};
