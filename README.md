<p align="center">
  <a href="https://aufwin.de/">
    <img src="logo.svg" alt="aufwin.de logo">
  </a>

  <h1 align="center">aufwin.de</h1>

  <p align="center">
    A web app for viewing RASP weather forecasts targeted at glider pilots
  </p>
</p>

## How do I get RASP forecasts?

This web app is a frontend for visualizing meteorological data obtained by running Dr. John W. "DrJack" Glendening's Regional Atmospheric Soaring Prediction (RASP) program.
To get started with RASP, check out [the official website](http://www.drjack.info/RASP/index.html), [the RASP forum](http://www.drjack.info/cgi-bin/rasp-forum.cgi) and [this repository](https://github.com/sfalmo/rasp-from-scratch) which contains the config files for RASP runs on [aufwin.de](https://aufwin.de).

## Forecast Viewer

The main implementations are in [`forecast/app.js`](forecast/app.js). If you want to use this viewer for your own site, change the variables in [`forecast/config.js`](forecast/config.js) to your needs.
Most importantly, adapt the server root to the location of the base directory of your RASP output files. This can be a mere subfolder (e.g. `forecast/results`) or the url of a separate server producing the RASP output files.
