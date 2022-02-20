<p align="center">
  <a href="https://aufwin.de/">
    <img src="logo.svg" alt="aufwin.de logo">
  </a>

  <h1 align="center">aufwin.de</h1>

  <p align="center">
    A web app for viewing RASP weather forecasts
  </p>
</p>

## How do I get RASP forecasts?

This web app is a frontend for visualizing meteorological data obtained by running Dr. John W. "DrJack" Glendening's Regional Atmospheric Soaring Prediction (RASP) program.
RASP is a set of numerical weather prediction tools which are specialized to produce detailed weather forecasts for glider pilots.
To get started with RASP, check out [the official website](http://www.drjack.info/RASP/index.html) and [the RASP forum](http://www.drjack.info/cgi-bin/rasp-forum.cgi).

The RASP forecasts on [aufwin.de](https://aufwin.de) are produced with assets contained in [this repository](https://github.com/sfalmo/rasp-from-scratch).

## Forecast Viewer

If you want to use this viewer for your own RASP forecasts, change the variables in [`forecast/config.js`](forecast/config.js) to your needs.
Most importantly, adapt the server root to the location of your RASP `OUT` directory (containing the forecasts for different regions and days).
Note that this can be a mere subfolder or symbolic link (e.g. `forecast/results`).

## Development

Spin up a web server from this base directory (e.g. with `python -m http.server` or `php -S localhost:8000`) and visit `localhost:8000`.
You should now see the landing page.

Then (in another terminal), go into the `forecast` directory, and run `npm run watch`.
You can now do your programming and a javascript bundle will be built automatically on every change.

To bundle for production, run `npm run build`.
