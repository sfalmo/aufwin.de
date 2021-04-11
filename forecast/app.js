import { cModels , cParameters , cSoundings , cMeteograms , cLayers , cDefaults } from './config.js';

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


L.RaspRenderer.Plotty = L.RaspRenderer.extend({
    options: {
        sideScaleContainerId: "sideScaleDiv",
        bottomScaleContainerId: "bottomScaleDiv",
    },
    initialize: function(canvas, options) {
        this.targetCanvas = canvas;
        this.workingCanvas = document.createElement("canvas");

        // Color scales
        var sideScaleContainer = document.getElementById(this.options.sideScaleContainerId);
        this.sideScaleUnit = L.DomUtil.create('div', 'scaleUnit', sideScaleContainer);
        this.sideScaleMax = L.DomUtil.create('div', 'scaleMax', sideScaleContainer);
        var sideScaleCanvasContainer = L.DomUtil.create('div', 'sideScaleCanvasDiv', sideScaleContainer);
        this.sideScaleCanvas = L.DomUtil.create('canvas', '', sideScaleCanvasContainer);
        this.sideScaleCanvas.height = 256;
        this.sideScaleCanvas.width = 1;
        this.sideScaleIndicator = L.DomUtil.create('div', 'sideScaleIndicator', sideScaleCanvasContainer);
        this.sideScaleIndicatorMarker = L.DomUtil.create('div', 'sideScaleIndicatorMarker', this.sideScaleIndicator);
        this.sideScaleIndicatorValue = L.DomUtil.create('div', 'sideScaleIndicatorValue', this.sideScaleIndicator);
        this.sideScaleMin = L.DomUtil.create('div', 'scaleMin', sideScaleContainer);

        var bottomScaleContainer = document.getElementById(this.options.bottomScaleContainerId);
        this.bottomScaleMin = L.DomUtil.create('div', 'scaleMin', bottomScaleContainer);
        var bottomScaleCanvasContainer = L.DomUtil.create('div', 'bottomScaleCanvasDiv', bottomScaleContainer);
        this.bottomScaleCanvas = L.DomUtil.create('canvas', '', bottomScaleCanvasContainer);
        this.bottomScaleCanvas.height = 1;
        this.bottomScaleCanvas.width = 256;
        this.bottomScaleIndicator = L.DomUtil.create('div', 'bottomScaleIndicator', bottomScaleCanvasContainer);
        this.bottomScaleIndicatorMarker = L.DomUtil.create('div', 'bottomScaleIndicatorMarker', this.bottomScaleIndicator);
        this.bottomScaleIndicatorValue = L.DomUtil.create('div', 'bottomScaleIndicatorValue', this.bottomScaleIndicator);
        this.bottomScaleMax = L.DomUtil.create('div', 'scaleMax', bottomScaleContainer);
        this.bottomScaleUnit = L.DomUtil.create('div', 'scaleUnit', bottomScaleContainer);

        plotty.addColorScale("rasp", ["#004dff", "#01f8e9", "#34c00c", "#f8fd00", "#ff9b00", "#ff1400"], [0, 0.2, 0.4, 0.6, 0.8, 1]);
        plotty.addColorScale("bsratio", ["#00000040", "#00000020", "#00000020", "#00000000"], [0.2999999, 0.3, 0.6999999, 0.7]);
        plotty.addColorScale("clouds", ["#ffffff", "#000000"], [0, 1]);
        plotty.addColorScale("cloudpotential", ["#004dff", "#ffffbf", "#ff1400"], [0, 0.5, 1]);
        plotty.addColorScale("pfd", ["#ffffff", "#fec6fe", "#fc64fc", "#7f93e2", "#2e5de5", "#009900", "#57fc00", "#ffe900", "#f08200", "#ae1700"], [0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1]);
        this.plottyplot = new plotty.plot({
            canvas: this.workingCanvas,
            domain: [0, 1],
            clampLow: true,
            clampHigh: true,
            noDataValue: -999999,
            colorScale: 'rasp',
        });
    },
    render: function(georaster, options) {
        this._updateDataset(georaster, options.append);
        this.plottyplot.setDomain(options.domain);
        this.plottyplot.setColorScale(options.colorscale ? options.colorscale : 'rasp'); // Default to rasp
        this.plottyplot.render();
        if (!options.append) {
            this.targetCanvas.width = this.workingCanvas.width;
            this.targetCanvas.height = this.workingCanvas.height;
            this._updateScale(options.domain, options.unit);
        }
        this.targetCanvas.getContext('2d').drawImage(this.workingCanvas, 0, 0);
    },
    _updateDataset: function(georaster, append) {
        if (this.plottyplot.datasetAvailable('dataset')) {
            this.plottyplot.removeDataset('dataset');
        }
        // It seems like the data has to be shifted down by 1 pixel, but I do not know why
        // This is a plotting issue, the data in georaster is definitely correct (checked with QGIS)
        this.data = new Float32Array(georaster.width * georaster.height);
        for (let i = 0; i < georaster.width; i++) {
            this.data[i] = georaster.noDataValue;
        }
        for (let i = 1; i < georaster.height; i++) {
            for (let j = 0; j < georaster.width; j++) {
                this.data[i * georaster.width + j] = georaster.values[0][i-1][j];
            }
        }
        this.plottyplot.addDataset('dataset', this.data, georaster.width, georaster.height);
    },
    _updateScale: function(domain, unit) {
        this._updateColorscale(domain, unit);
        this._updateScaleAnnotation(domain[0], domain[1], unit);
    },
    _updateColorscale: function(domain, unit) {
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
    },
    _updateScaleAnnotation: function(min, max, scaleUnit) {
        this.sideScaleUnit.innerHTML = scaleUnit;
        this.sideScaleMax.innerHTML = max;
        this.sideScaleMin.innerHTML = min;
        this.bottomScaleUnit.innerHTML = scaleUnit;
        this.bottomScaleMax.innerHTML = max;
        this.bottomScaleMin.innerHTML = min;
    },
    updateScaleIndicator: function(value) {
        this.sideScaleIndicator.style.visibility = 'visible';
        this.bottomScaleIndicator.style.visibility = 'visible';
        var posPercent = (value - this.sideScaleMin.innerHTML) / (this.sideScaleMax.innerHTML - this.sideScaleMin.innerHTML) * 100;
        posPercent = Math.max(0, Math.min(100, posPercent));
        this.sideScaleIndicator.style.bottom = `${posPercent}%`;
        this.bottomScaleIndicator.style.left = `${posPercent}%`;
        this.sideScaleIndicatorValue.innerHTML = value;
        this.bottomScaleIndicatorValue.innerHTML = value;
    },
    hideScaleIndicator: function() {
        this.sideScaleIndicator.style.visibility = 'hidden';
        this.bottomScaleIndicator.style.visibility = 'hidden';
    },
    quantize: function(value) {
        this.plottyplot.setExpression(`floor(dataset / ${value} + 0.5) * ${value}`);
    },
    unquantize: function() {
        this.plottyplot.setExpression("");
    }
});

L.raspRenderer.plotty = function(canvas, options) {
    return new L.RaspRenderer.Plotty(canvas, options);
};

L.RaspRenderer.Windbarbs = L.RaspRenderer.extend({
    initialize: function(layerGroup) {
        this.layerGroup = layerGroup;
    },
    render: function(georasterSpeed, georasterAngle) {
        this.barbs = [];
        this.minDistDeg = 0.5;
        var strideX = Math.ceil(this.minDistDeg / georasterSpeed.pixelWidth);
        var strideY = Math.ceil(this.minDistDeg / georasterSpeed.pixelHeight);
        for (let i = Math.floor(strideY / 2); i < georasterSpeed.height - Math.floor(strideY / 2); i += strideY) {
            for (let j = Math.floor(strideX / 2); j < georasterSpeed.width - Math.floor(strideX / 2); j += strideX) {
                var speed = georasterSpeed.values[0][i][j];
                var angle = georasterAngle.values[0][i][j];
                if (speed != georasterSpeed.noDataValue && angle != georasterAngle.noDataValue) {
                    var svg = this._getBarb(speed * 1.94384, angle, 80);
                    var divIcon = L.divIcon({
                        className: "leaflet-data-marker",
                        iconSize: [80, 80],
                        iconAnchor: [40, 40],
                        html: L.Util.template(svg)
                    });
                    this.barbs.push({position: this._getPosition(georasterSpeed, i, j), icon: divIcon});
                }
            }
        }
        this.barbs.forEach(barb => {
            if (barb.position) {
                this.layerGroup.addLayer(L.marker(barb.position, {
                    icon: barb.icon,
                    interactive: false,
                    keyboard: false
                }));
            }
        });
    },
    _getPosition(georaster, i, j) {
        var lat = georaster.ymax - (i + 0.5) * georaster.pixelHeight;
        var lng = georaster.xmin + (j + 0.5) * georaster.pixelHeight;
        return [lat, lng];
    },
    _getFlagSvgPath: function(speed) {
        var ten   = 0;
        var five  = 0;
        var fifty = 0;
        var index = 0;
        var i;
        var path = "";
        if (speed > 0) {
            if (speed <= 7) {
                path += "M0 2 L8 2 ";
                index = 1;
            } else {
                path += "M1 2 L8 2 ";
            }
            five = Math.floor(speed / 5);
            if (speed % 5 >= 3) {
                five += 1;
            }
            fifty = Math.floor(five / 10);
            five -= fifty * 10;
            ten = Math.floor(five / 2);
            five -= ten * 2;
        }
        var j;
        for (i = 0; i < fifty; i++) {
            j = index + 2 * i;
            path += "M" + j + " 0 L" + (j + 1) + " 2 L" + j + " 2 L" + j + " 0 ";
        }
        if (fifty > 0) {
            index += 2 * (fifty - 0.5);
        }
        for (i = 0; i < ten; i++) {
            j = index + i;
            path += "M" + j + " 0 L" + (j + 1) + " 2 ";
        }
        index += ten;
        for (i = 0; i < five; i++) {
            j = index + i;
            path += "M" + (j + 0.5) + " 1 L" + (j + 1) + " 2 ";
        }
        path += "Z";
        return path;
    },
    _getBarb: function(speedKt, angle, size) {
        var flagPath = this._getFlagSvgPath(speedKt);
        var halfsize = Math.floor(size / 2);
        size = halfsize * 2;
        return `<svg width="${size}" height="${size}" viewBox="0 0 20 20"><path transform='translate(10 10) rotate(${angle + 90} 0 0) translate(-8 -2)' stroke='#000' stroke-width='0.5' d='${flagPath}'/></svg>`;
    }
});

L.raspRenderer.windbarbs = function(canvas, options) {
    return new L.RaspRenderer.Windbarbs(canvas, options);
};


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
        this.plottyRenderer = L.raspRenderer.plotty(this.canvas);
        this.windbarbRenderer = L.raspRenderer.windbarbs(this.layerGroup);

        // Value indicator
        this.valueIndicator = L.control.valueIndicator();
        this.valueIndicator.addTo(this._map);
        this._map.on('mousemove', this._onMouseMove, this);
        return this.valueIndicator;
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
                // TODO
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
                var value = georaster.values[0][y][x].toFixed(0);
                if (value != georaster.noDataValue) {
                    values[i] = value;
                }
            });
        }
        var valueIndicatorText = "-";
        if (values.length != 0) {
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
        this._updateValueIndicator(e.latlng.lat, e.latlng.lng);
    }
});

L.raspLayer = function(options) {
    return new L.RaspLayer(options);
};

function getDataUrls(modelDir, parameterKey, time) {
    var baseUrls = [cDefaults.forecastServerRoot + "/" + modelDir + "/" + parameterKey + "."]; // Default (no composite parameter)
    if (cParameters[parameterKey].composite) {
        baseUrls = cParameters[parameterKey].composite.of.map(key => cDefaults.forecastServerRoot + "/" + modelDir + "/" + key + ".");
    }
    if (parameterKey != "pfd_tot") { // Almost all parameters are time-dependent, PFD being the exception
        baseUrls = baseUrls.map(base => base + "curr."+time+"lst.d2.");
    }
    var geotiffUrls = baseUrls.map(base => base + "data.tiff");
    var titleUrl = baseUrls[0] + "title.json";
    return {geotiffUrls: geotiffUrls, titleUrl: titleUrl};
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


L.Control.RASPControl = L.Control.extend({
    onAdd: function(map) {
        this._map = map;
        this._initTitle();
        this._initPanel();
        this._initRaspLayer();

        this._map.on('popupclose', (e) => {
            console.log("Popup close");
            this.currentPopup = null;
        });

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
        var parameterKey = this.parameterSelect.value;
        if (parameterKey == "pfd_tot") {
            this.timeSelect.disabled = true;
            this.disableOnMapClick();
        } else {
            this.timeSelect.disabled = false;
            this.enableOnMapClick();
        }
        var parameter = cParameters[parameterKey];
        var urls = getDataUrls(modelDir, parameterKey, time);
        this._updateTitle(urls.titleUrl, parameter.longname, day);
        this._updatePlot(urls.geotiffUrls, parameter);
        if (this.currentPopup && this.currentPopup.type == "sounding") {
            this.currentPopup.imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/sounding" + this.currentPopup.key + ".curr." + time + "lst.d2.png";
            this.currentPopup.image.src = this.currentPopup.imageUrl;
        }
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
    _updatePlot: function(geotiffUrls, parameter) {
        Promise.all(geotiffUrls.map(url => fetch(url)))
            .then(responses => {
                return Promise.all(responses.map(response => response.arrayBuffer()));
            })
            .then(buffers => {
                return Promise.all(buffers.map(parseGeoraster));
            })
            .then(georasters => this._raspLayer.update(georasters, parameter));
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
    getPopupContent: function(imageUrl, imageBlob) {
        var popupContent = document.createElement('div');
        var popupLink = document.createElement("A");
        popupLink.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 48 48'><path d='M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z'/></svg>";
        popupLink.href = imageUrl;
        popupLink.title = dict["Show in separate window"];
        popupLink.target = "_blank";
        popupContent.appendChild(popupLink);
        var popupImage = document.createElement('img');
        popupImage.setAttribute("class", "imagePopup");
        popupImage.src = URL.createObjectURL(imageBlob);
        popupContent.appendChild(popupImage);
        return popupContent;
    },
    updatePopup: function() {
        var popupContent = document.createElement('div');
        var popupLink = document.createElement("A");
        popupLink.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 48 48'><path d='M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z'/></svg>";
        popupLink.href = this.currentPopup.imageUrl;
        popupLink.title = dict["Show in separate window"];
        popupLink.target = "_blank";
        popupContent.appendChild(popupLink);
        popupContent.appendChild(this.currentPopup.image);
        this.currentPopup.popup.setContent(popupContent);
        gImageOverlayLoadingAnimation.style.visibility = "hidden";
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
                        this.currentPopup = {type: "sounding", key: soundingKey};
                        this.currentPopup.imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/sounding" + soundingKey + ".curr." + time + "lst.d2.png";
                        this.currentPopup.popup = L.popup({maxWidth: "auto"})
                            .setLatLng(e.target.getLatLng())
                            .openOn(this._map);
                        this.currentPopup.image = new Image();
                        this.currentPopup.image.setAttribute("class", "imagePopup");
                        this.currentPopup.image.onload = () => {
                            this.updatePopup();
                        };
                        this.currentPopup.image.src = this.currentPopup.imageUrl;
                        setTimeout(() => {
                            if (!this.currentPopup.image.complete) {
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
                        this.currentPopup = {type: "meteogram", key: meteogramKey};
                        this.currentPopup.imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/meteogram_" + meteogramKey + ".png";
                        this.currentPopup.popup = L.popup({maxWidth: "auto"})
                            .setLatLng(e.target.getLatLng())
                            .openOn(this._map);
                        this.currentPopup.image = new Image();
                        this.currentPopup.image.setAttribute("class", "imagePopup");
                        this.currentPopup.image.onload = () => {
                            this.updatePopup();
                        };
                        this.currentPopup.image.src = this.currentPopup.imageUrl;
                        setTimeout(() => {
                            if (!this.currentPopup.image.complete) {
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
