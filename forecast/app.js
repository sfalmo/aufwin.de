import { cModels , cParameters , cMultiParameters , cSoundings , cMeteograms , cLayers , cDefaults } from './config.js';

// Divs for title and scales
var gImageOverlayLoadingAnimation = document.getElementById("loadingDiv");
gImageOverlayLoadingAnimation.style.visibility = 'hidden';

var gSoundingIcon = L.icon({
    iconUrl: cDefaults.soundingMarker,
    iconSize: [cDefaults.markerSize, cDefaults.markerSize]
});
var gMeteogramIcon = L.icon({
    iconUrl: cDefaults.meteogramMarker,
    iconSize: [cDefaults.markerSize, cDefaults.markerSize]
});

// Compact attribution

L.Control.Attribution.prototype._addTo = L.Control.Attribution.prototype.addTo;

L.Control.Attribution.prototype.addTo = function(map) {
    L.Control.Attribution.prototype._addTo.call(this, map);
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
    if (map._container.offsetWidth <= 700) {
        L.DomUtil.addClass(this._container, 'leaflet-compact-attribution');
    }
    // update on map resize
    map.on('resize', function() {
        if (map._container.offsetWidth > 700) {
            L.DomUtil.removeClass(this._container, 'leaflet-compact-attribution');
        } else {
            L.DomUtil.addClass(this._container, 'leaflet-compact-attribution');
        }
    }, this);
    return this;
};

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

L.Control.ValueIndicator = L.Control.extend({
    options: {
        position: 'topleft',
        emptyString: '-',
    },
    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-valueindicator');
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

L.control.valueIndicator = function (options) {
    return new L.Control.ValueIndicator(options);
};

L.RaspLayer = L.Layer.extend({
    options: {
        sideScaleContainerId: "sideScaleDiv",
        bottomScaleContainerId: "bottomScaleDiv",
    },
    initialize: function(options) {
        L.setOptions(this, options);
    },
    onAdd: function(map) {
        this._map = map;

        // Color scales
        var sideScaleContainer = document.getElementById(this.options.sideScaleContainerId);
        this.sideScaleUnits = L.DomUtil.create('div', 'scaleUnits', sideScaleContainer);
        this.sideScaleMax = L.DomUtil.create('div', 'scaleMax', sideScaleContainer);
        this.sideScaleCanvas = L.DomUtil.create('canvas', 'sideScaleCanvas', sideScaleContainer);
        this.sideScaleCanvas.height = 256;
        this.sideScaleCanvas.width = 1;
        this.sideScaleMin = L.DomUtil.create('div', 'scaleMin', sideScaleContainer);

        var bottomScaleContainer = document.getElementById(this.options.bottomScaleContainerId);
        this.bottomScaleMin = L.DomUtil.create('div', 'scaleMin', bottomScaleContainer);
        this.bottomScaleCanvas = L.DomUtil.create('canvas', 'bottomScaleCanvas', bottomScaleContainer);
        this.bottomScaleCanvas.height = 1;
        this.bottomScaleCanvas.width = 256;
        this.bottomScaleMax = L.DomUtil.create('div', 'scaleMax', bottomScaleContainer);
        this.bottomScaleUnits = L.DomUtil.create('div', 'scaleUnits', bottomScaleContainer);

        // Actual plot
        this._canvas = document.createElement('canvas');
        plotty.addColorScale("rasp", ["#004dff", "#01f8e9", "#34c00c", "#f8fd00", "#ff9b00", "#ff1400"], [0, 0.2, 0.4, 0.6, 0.8, 1]);
        plotty.addColorScale("clouds", ["#00000000", "#000000ff"], [0, 1]);
        this.plottyplot = new plotty.plot({
            canvas: this._canvas,
            domain: [0, 1],
            clampLow: true,
            clampHigh: true,
            noDataValue: -999999,
            colorScale: 'rasp',
        });
        this.overlay = L.imageOverlay(this._canvas.toDataURL(), [[0,1], [0,1]]).addTo(this._map); // Bounds get updated anyway

        // Value indicator
        this.valueIndicator = L.control.valueIndicator();
        this.valueIndicator.addTo(this._map);
        this._map.on('mousemove', this._onMouseMove, this);
        return this.valueIndicator;
    },
    onRemove: function() {
        this._map.off('mousemove', this._onMouseMove);
    },
    update: function(georaster, parameter) {
        this.georaster = georaster;
        this._updateDatasets(georaster);
        this._plotDatasets(georaster, parameter);
        this._updateValueIndicator(this._lastLat, this._lastLng);
    },
    _updateDatasets: function(georaster) {
        // It seems like the data has to be shifted down by 1 pixel, but I do not know why
        // This is a plotting issue, the data in georaster is definitely correct (checked with QGIS)
        let datasets = georaster.values.length;
        this.data = new Array(datasets);
        for (let d = 0; d < datasets; d++) {
            this.data[d] = new Float32Array(georaster.width * georaster.height);
            for (let i = 0; i < georaster.width; i++) {
                this.data[d][i] = georaster.noDataValue;
            }
            for (let i = 1; i < georaster.height; i++) {
                for (let j = 0; j < georaster.width; j++) {
                    this.data[d][i * georaster.width + j] = georaster.values[d][i-1][j];
                }
            }
        }
    },
    _plotDatasets: function(georaster, parameter) {
        if (this.plottyplot.datasetAvailable('dataset')) {
            this.plottyplot.removeDataset('dataset');
        }
        this.plottyplot.addDataset('dataset', this.data[0], georaster.width, georaster.height);
        if (parameter.domain) {
            this.plottyplot.setDomain(parameter.domain);
        }
        this.plottyplot.setColorScale('rasp'); // Default
        if (parameter.colorscale) {
            this.plottyplot.setColorScale(parameter.colorscale);
        }
        this._updateColorscale(this.plottyplot.domain, parameter.units);
        this.plottyplot.render();
        this.overlay.setBounds([[georaster.ymin, georaster.xmin], [georaster.ymax, georaster.xmax]]);
        this.overlay.setUrl(this._canvas.toDataURL());
    },
    _updateColorscale: function(domain, units) {
        let colorScaleCanvas = this.plottyplot.colorScaleCanvas;
        let colorScaleCtx = colorScaleCanvas.getContext('2d');
        let colorScaleData = colorScaleCtx.getImageData(0, 0, colorScaleCanvas.width, colorScaleCanvas.height);
        let bottomScaleCtx = this.bottomScaleCanvas.getContext('2d');
        bottomScaleCtx.putImageData(colorScaleData, 0, 0);
        // The color scale data has to be flipped for rendering it vertically in the side scale
        let sideScaleCtx = this.sideScaleCanvas.getContext('2d');
        let sideScaleData = sideScaleCtx.createImageData(colorScaleCanvas.height, colorScaleCanvas.width);
        for (let i = 0; i < colorScaleData.data.length; i+=4) {
            let r = colorScaleData.data.length - 4 - i;
            sideScaleData.data[i] = colorScaleData.data[r];
            sideScaleData.data[i+1] = colorScaleData.data[r+1];
            sideScaleData.data[i+2] = colorScaleData.data[r+2];
            sideScaleData.data[i+3] = colorScaleData.data[r+3];
        }
        sideScaleCtx.putImageData(sideScaleData, 0, 0);
        this._updateScaleAnnotation(domain[0], domain[1], units);
    },
    _updateScaleAnnotation: function(min, max, units) {
        this.units = units;
        this.sideScaleUnits.innerHTML = units;
        this.sideScaleMax.innerHTML = max;
        this.sideScaleMin.innerHTML = min;
        this.bottomScaleUnits.innerHTML = units;
        this.bottomScaleMax.innerHTML = max;
        this.bottomScaleMin.innerHTML = min;
    },
    quantize: function(value) {
        this.plottyplot.setExpression(`floor(dataset / ${value} + 0.5) * ${value}`);
    },
    unquantize: function() {
        this.plottyplot.setExpression("");
    },
    _updateValueIndicator(lat, lng) {
        this._lastLat = lat;
        this._lastLng = lng;
        var dataset = 0;
        var bounds = this.overlay.getBounds();
        var x = Math.floor((lng - bounds._southWest.lng) / (bounds._northEast.lng - bounds._southWest.lng) * this.plottyplot.currentDataset.width);
        var y = Math.floor((bounds._northEast.lat - lat) / (bounds._northEast.lat - bounds._southWest.lat) * this.plottyplot.currentDataset.height);
        var value = "-";
        if (x >= 0 && x < this.georaster.width && y >= 0 && y < this.georaster.height) {
            value = this.georaster.values[dataset][y][x].toFixed(0);
            if (value == this.georaster.noDataValue) {
                value = "-";
            }
        }
        this.valueIndicator.update(`${value} ${this.units}`);
    },
    _onMouseMove: function(e) {
        this._updateValueIndicator(e.latlng.lat, e.latlng.lng);
    }
});

L.raspLayer = function(options) {
    return new L.RaspLayer(options);
};

function getDataUrls(modelDir, parameter, time) {
    var baseUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/" + parameter + ".";
    var titleParameter = cMultiParameters[parameter] ? cMultiParameters[parameter][0] : parameter;
    var titleBaseUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/" + titleParameter + ".";
    if (parameter != "pfd_tot") { // Almost all parameters are time-dependent, PFD being the exception
        baseUrl += "curr."+time+"lst.d2.";
        titleBaseUrl += "curr."+time+"lst.d2.";
    }
    return {geotiffUrl: baseUrl + "data.tiff", titleUrl: titleBaseUrl + "title.json"};
}

function isValid(dateText, day) {
    var date = new Date(dateText);
    var today = new Date();
    var dateGoal = new Date(today);
    dateGoal.setDate(dateGoal.getDate() + +day);
    dateGoal.setHours(0,0,0,0);
    return date.valueOf() == dateGoal.valueOf();
}

function getCyclicNextIndex(select) {
    var index = select.selectedIndex;
    index++;
    if (index > select.length - 1) {
        index = 0;
    }
    return index;
}

function makePopup(e, imageUrl, popupImage) {
    var popupContent = document.createElement('div');
    var popupLink = document.createElement("A");
    popupLink.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 48 48'><path d='M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z'/></svg>";
    popupLink.href = imageUrl;
    popupLink.title = dict["Show in separate window"];
    popupLink.target = "_blank";
    popupContent.appendChild(popupLink);
    popupContent.appendChild(popupImage);
    L.popup({maxWidth: "auto"}).setLatLng(e.target.getLatLng()).setContent(popupContent).openOn(gMap);
    gImageOverlayLoadingAnimation.style.visibility = "hidden";
}


L.Control.RASPControl = L.Control.extend({
    onAdd: function(map) {
        this._map = map;
        this._initTitle();
        this._initPanel();
        this._initRaspLayer();

        this.opacityLevel = 0.7;
        this.opacityDelta = 0.1;
        this.setOpacity();
        this.selectedParameter = cDefaults.parameter; // remember last used parameter
        this.addModelDays();
        this.modelDayChange(); // Do the first setup of hours, parameters, overlay, title, scales

        return this._container;
    },
    _initTitle: function() {
        this._raspTitle = document.getElementById("titleDiv");
        this._raspTitle.parameter = L.DomUtil.create('h2', '', this._raspTitle);
        this._raspTitle.validInfo = L.DomUtil.create('h3', '', this._raspTitle);
        this._raspTitle.validSymbol1 = L.DomUtil.create('span', '', this._raspTitle.validInfo);
        this._raspTitle.validText = L.DomUtil.create('span', '', this._raspTitle.validInfo);
        this._raspTitle.validSymbol2 = L.DomUtil.create('span', '', this._raspTitle.validInfo);
        this._raspTitle.drjack = L.DomUtil.create('h6', '', this._raspTitle);
    },
    _initPanel: function() {
        var className = "leaflet-control-layers";
        this._container = L.DomUtil.create('div', className);
        L.DomUtil.addClass(this._container, 'rasp-control');
        if (!L.Browser.android) {
            L.DomEvent.on(this._container, {
                mouseenter: this.expand,
            }, this);
        }
        this._link = L.DomUtil.create('a', className + '-toggle', this._container);
		    this._link.href = '#';
        this._link.title = 'RASP Control';
        if (L.Browser.touch) {
            L.DomEvent.on(this._link, 'click', L.DomEvent.stop);
            L.DomEvent.on(this._link, 'click', this.expand, this);
        } else {
            L.DomEvent.on(this._link, 'focus', this.expand, this);
        }
        this.expand();
        L.DomEvent.disableClickPropagation(this._container);
        L.DomEvent.disableScrollPropagation(this._container);
        this._raspPanel = L.DomUtil.create('div', "leaflet-control-layers-list", this._container);

        var modelDayTimeParameterDiv = L.DomUtil.create('div', 'modelDayTimeParameterDiv', this._raspPanel);
        var modelDayTimeDiv = L.DomUtil.create('div', '', modelDayTimeParameterDiv);
        this.modelDaySelect = L.DomUtil.create('select', '', modelDayTimeDiv);
        this.modelDaySelect.onchange = () => { this.modelDayChange(); };
        this.modelDaySelect.title = dict["modelDaySelect_title"];
        this.timeSelect = L.DomUtil.create('select', '', modelDayTimeDiv);
        this.timeSelect.onchange = () => { this.timeChange(); };
        this.timeSelect.title = dict["timeSelect_title"];
        var parameterDiv = L.DomUtil.create('div', 'parameterDiv', modelDayTimeParameterDiv);
        var parameterListDiv = L.DomUtil.create('div', 'parameterListDiv', parameterDiv);
        this.parameterButton = L.DomUtil.create('button', 'parameterButton', parameterListDiv);
        this.parameterButton.onclick = () => { this.parameterListToggle(); };
        this.parameterButton.value = "short";
        this.parameterButton.title = dict["parameterButton_title"];
        this.parameterButton.innerHTML = "+";
        this.parameterSelect = L.DomUtil.create('select', 'parameterSelect', parameterListDiv);
        this.parameterSelect.onchange = () => { this.parameterChange(); };
        this.parameterSelect.title = dict["parameterSelect_title"];
        var parameterDetails = L.DomUtil.create('details', '', parameterDiv);
        var parameterSummary = L.DomUtil.create('summary', '', parameterDetails);
        parameterSummary.title = dict["parameterDetails_title"];
        parameterSummary.innerHTML = dict["parameterDetails_summary"];
        this.parameterDescription = L.DomUtil.create('span', 'parameterDescription', parameterDetails);

        var opacityDiv = L.DomUtil.create('div', '', this._raspPanel);
        var opacityDownButton = L.DomUtil.create('button', '', opacityDiv);
        opacityDownButton.onclick = () => { this.opacityDn(); };
        opacityDownButton.title = dict["opacityDecreaseButton_title"];
        opacityDownButton.innerHTML = "−";
        var opacityIcon = L.DomUtil.create('span', '', opacityDiv);
        opacityIcon.style = "font-size: 24";
        var opacityIconImg = L.DomUtil.create('img', 'icon', opacityIcon);
        opacityIconImg.src = 'img/opacity.svg';
        var opacityUpButton = L.DomUtil.create('button', '', opacityDiv);
        opacityUpButton.onclick = () => { this.opacityUp(); };
        opacityUpButton.title = dict["opacityIncreaseButton_title"];
        opacityUpButton.innerHTML = "+";

        var markerDiv = L.DomUtil.create('div', 'markerDiv', this._raspPanel);
        var soundingLabel = L.DomUtil.create('label', '', markerDiv);
        soundingLabel.title = dict["soundingCheckbox_label"];
        this.soundingCheckbox = L.DomUtil.create('input', '', soundingLabel);
        this.soundingCheckbox.type = 'checkbox';
        this.soundingCheckbox.onchange = () => { this.toggleSoundingsOrMeteograms(); };
        var soundingText = L.DomUtil.create('span', '', soundingLabel);
        soundingText.innerHTML = dict["Soundings"];
        var meteogramLabel = L.DomUtil.create('label', '', markerDiv);
        meteogramLabel.title = dict["meteogramCheckbox_label"];
        this.meteogramCheckbox = L.DomUtil.create('input', '', meteogramLabel);
        this.meteogramCheckbox.type = 'checkbox';
        this.meteogramCheckbox.onchange = () => { this.toggleSoundingsOrMeteograms(); };
        var meteogramText = L.DomUtil.create('span', '', meteogramLabel);
        meteogramText.innerHTML = dict["Meteograms"];

        this._collapseLink = L.DomUtil.create('a', 'leaflet-control-collapse-button', this._raspPanel);
        this._collapseLink.innerHTML = '⇱';
        this._collapseLink.title = 'Panel minimieren';
        this._collapseLink.href = '#collapse';
        L.DomEvent.on(this._collapseLink, 'click', this.collapse, this);
    },
    _initRaspLayer: function() {
        this._raspLayer = L.raspLayer();
        this._raspLayer.addTo(this._map);
    },
    onRemove: function(map) {
        // Nothing to do here
    },
    expand: function () {
        L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
        return this;
    },
    collapse: function () {
        L.DomUtil.removeClass(this._container, 'leaflet-control-layers-expanded');
        return this;
    },
    addModelDays: function() {
        const dayNames = [dict["Sunday"], dict["Monday"], dict["Tuesday"], dict["Wednesday"], dict["Thursday"], dict["Friday"], dict["Saturday"]];
        const monthNames = ["Jan", "Feb", dict["Mar"], "Apr", dict["May"], "Jun", "Jul", "Aug", "Sep", dict["Oct"], "Nov", dict["Dec"]];
        const dayRelative = [dict["Today"], dict["Tomorrow"]];

        var Now = new Date().getTime();        // current time in ms
        var millisInDay = 24 * 60 * 60 * 1000; // ms in a day
        var T = new Date();

        this.modelDaySelect.options.length = 0; // Empty list
        for (const modelKey of Object.keys(cModels)) {
            var model = cModels[modelKey];
            for (const day of model.days) { // Add all days
                var modelDescription = dayRelative[day];
                var modelDir = modelKey;
                if (day != 0) {
                    modelDir += "+" + day;
                }
                this.modelDaySelect.add(new Option(modelDescription, modelDir));
            }
        }
    },
    addModelHours: function(modelKey, day, selectedValue) {
        this.timeSelect.options.length = 0; // Clear all times
        var model = cModels[modelKey];
        for (const hour of model.hours[day]) {
            this.timeSelect.add(new Option(hour, hour));
        }
        this.timeSelect.value = selectedValue ? selectedValue : cDefaults.parameterTime;
    },
    addModelParameters: function(modelKey) {
        this.parameterSelect.options.length = 0; // Clear all parameters
        var onlyPrimary = this.parameterButton.value == "short"; // look at state of parameters button to decide if full or reduced set is shown
        var model = cModels[modelKey];
        for (const parameter of model.parameters) {
            if (onlyPrimary) {
                if (cParameters[parameter].primary) {
                    this.parameterSelect.add(new Option(cParameters[parameter].longname, parameter));
                }
            } else {
                this.parameterSelect.add(new Option(cParameters[parameter].longname, parameter));
            }
            if (parameter == this.selectedParameter) {
                this.parameterSelect.options[this.parameterSelect.options.length - 1].selected = true;
            }
        }
    },
    modelDayChange: function() {
        var {model, day} = this.getModelAndDay();
        this.addModelHours(model, day, this.timeSelect.value); // could have different hours
        this.addModelParameters(model); // could have different parameters
        this._raspTitle.drjack.innerHTML = "DrJack BLIPMAP " + dict["from"] + " RASP " + dict["GFSA-initiated"] + " " + cModels[model].resolution + "km " + dict["WRF-ARW model"];
        this._map.setView(cModels[model].center, cModels[model].zoom); // recenter the map
        this.soundingOverlay = this.getSoundingMarkers(model);
        this.meteogramOverlay = this.getMeteogramMarkers(model);
        this.parameterChange();
    },
    timeChange: function() {
        this.update();
    },
    parameterChange: function() {
        this.selectedParameter = this.parameterSelect.value; // keep a copy of what was last set
        this.parameterDescription.innerHTML = cParameters[this.parameterSelect.value].description;
        this.update();
    },
    parameterListToggle: function() {
        // Toggle button
        if (this.parameterButton.value == "short") {
            this.parameterButton.value = "long";
            this.parameterButton.innerHTML = "−";
        } else {
            this.parameterButton.value = "short";
            this.parameterButton.innerHTML = "+";
        }

        this.parameterSelect.options.length = 0; // Clear the parameters
        var {model, day} = this.getModelAndDay();
        this.addModelParameters(model); // Add the new ones
        this.parameterChange(); // Update overlays (parameter might not be there anymore)
    },
    update: function() {
        var modelDir = this.modelDaySelect.value;
        var {model, day} = this.getModelAndDay();
        var time = this.timeSelect.value;
        var parameter = this.parameterSelect.value;
        if (parameter == "pfd_tot") {
            this.timeSelect.disabled = true;
            this.disableOnMapClick();
        } else {
            this.timeSelect.disabled = false;
            this.enableOnMapClick();
        }
        var urls = getDataUrls(modelDir, parameter, time);
        this._updateTitle(urls.titleUrl, cParameters[parameter].longname, day);
        this._updatePlot(urls.geotiffUrl, cParameters[parameter]);
    },
    _updateTitle: function(titleUrl, parameterLongname, day) {
        this._raspTitle.parameter.innerHTML = parameterLongname;
        fetch(titleUrl)
            .then(response => {
                return response.json();
            })
            .then(titleJson => {
                this._raspTitle.validText.innerHTML = titleJson["validLocal"] + " (" + titleJson["validZulu"] + ") " + titleJson["validDate"] + " [" + titleJson["fcstTime"] + "]";
                var valid = isValid(titleJson["validDate"], day);
                this._raspTitle.validSymbol1.innerHTML = valid ? "✅" : "❌";
                this._raspTitle.validSymbol2.innerHTML = valid ? "✅" : "❌";
                this._raspTitle.validInfo.title = valid ? dict["isValid"] : dict["isNotValid"];
            })
            .catch(err => {
                this._raspTitle.validText.innerHTML = dict["validityUnknown"];
                this._raspTitle.validSymbol1.innerHTML = "⚠";
                this._raspTitle.validSymbol2.innerHTML = "⚠";
                this._raspTitle.validInfo.title = dict["isUnknownValid"];
            });
    },
    _updatePlot: function(geotiffUrl, parameter) {
        fetch(geotiffUrl)
            .then(response => response.arrayBuffer())
            .then(parseGeoraster)
            .then(georaster => this._raspLayer.update(georaster, parameter));
    },
    opacityUp: function() {
        this.opacityLevel = Math.min(this.opacityLevel + this.opacityDelta, 1);
        this.setOpacity();
    },
    opacityDn: function() {
        this.opacityLevel = Math.max(this.opacityLevel - this.opacityDelta, 0);
        this.setOpacity();
    },
    setOpacity: function() {
        this._raspLayer.overlay.setOpacity(this.opacityLevel);
    },
    getModelAndDay: function() {
        var resultSplit = this.modelDaySelect.value.split("+");
        if (resultSplit.length == 1) {
            return {model: this.modelDaySelect.value, day: "0"};
        } else {
            return {model: resultSplit[0], day: resultSplit[1]};
        }
    },
    onMapClick: function() {
        if (!gPopupPane.hasChildNodes()) {
            this.timeSelect.selectedIndex = getCyclicNextIndex(this.timeSelect);
            this.update();
        }
    },
    enableOnMapClick: function() {
        this._map.off('click');
        this._map.on('click', () => { this.onMapClick(); });
    },
    disableOnMapClick: function() {
        this._map.off('click');
    },
    toggleSoundingsOrMeteograms: function() {
        if (gRaspControl.soundingCheckbox.checked) {
            this.soundingOverlay.addTo(gMap);
        } else {
            this.soundingOverlay.remove();
        }
        if (gRaspControl.meteogramCheckbox.checked) {
            this.meteogramOverlay.addTo(gMap);
        } else {
            this.meteogramOverlay.remove();
        }
    },
    getSoundingMarkers: function(modelKey) {
        var markers = [];
        var soundings = cSoundings[modelKey];
        for (const soundingKey of Object.keys(soundings)) {
            var sounding = soundings[soundingKey];
            markers.push(
                L.marker(sounding.location, {icon: gSoundingIcon})
                    .bindTooltip(sounding.name)
                    .on('click', e => {
                        var modelDir = this.modelDaySelect.value;
                        var time = this.timeSelect.value;
                        var imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/sounding" + soundingKey + ".curr." + time + "lst.d2.png";
                        var popupImage = new Image();
                        popupImage.setAttribute("class", "imagePopup");
                        popupImage.onload = () => {
                            makePopup(e, imageUrl, popupImage);
                        };
                        popupImage.src = imageUrl;
                        setTimeout(() => {
                            if (!popupImage.complete) {
                                gImageOverlayLoadingAnimation.style.visibility = "visible";
                            }
                        }, cDefaults.loadingAnimationDelay);
                    })
            );
        }
        return L.layerGroup(markers);
    },
    getMeteogramMarkers: function(modelKey) {
        var markers = [];
        var meteograms = cMeteograms[modelKey];
        for (const meteogramKey of Object.keys(meteograms)) {
            var meteogram = meteograms[meteogramKey];
            markers.push(
                L.marker(meteogram.location, {icon: gMeteogramIcon})
                    .bindTooltip(meteogram.name)
                    .on('click', e => {
                        var modelDir = this.modelDaySelect.value;
                        var imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/meteogram_" + meteogramKey + ".png";
                        var popupImage = new Image();
                        popupImage.setAttribute("class", "imagePopup");
                        popupImage.onload = () => {
                            makePopup(e, imageUrl, popupImage);
                        };
                        popupImage.src = imageUrl;
                        setTimeout(() => {
                            if (!popupImage.complete) {
                                gImageOverlayLoadingAnimation.style.visibility = "visible";
                            }
                        }, cDefaults.loadingAnimationDelay);
                    })
            );
        }
        return L.layerGroup(markers);
    }
});

L.control.raspControl = function(options) {
    var raspControl = new L.Control.RASPControl(options);
    return raspControl;
};

var gRaspControl = L.control.raspControl({position: cDefaults.RASPControlLocation}).addTo(gMap);
console.log(gRaspControl);

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

var gPopupPane = document.getElementsByClassName("leaflet-popup-pane")[0];
