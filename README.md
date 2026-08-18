# Fractal Instabilities — Standalone GitHub Pages

This version has **no Google Sheets dependency**.

## Data model

- `data.js` contains the local fractal/instability data.
- `data.js` also contains the 15-set daily rotation.
- The website calculates the daily set from the selected date.
- The rotation resets to Set 1 at the start of each year, matching the Guild Wars 2 Wiki description.
- `script.js` contains the display/filter logic.
- `index.html` and `style.css` are the website.

## GitHub Pages

1. Create a GitHub repository.
2. Upload all files/folders from this project to the `main` branch.
3. Open **Settings → Pages**.
4. Choose **GitHub Actions** as the source.
5. GitHub will deploy the included workflow.

## Updating instability data

Edit `data.js` when the instability schedule changes. The website does not contact Google Sheets.

## Daily rotation

The 15 daily sets are based on the Guild Wars 2 Wiki's Daily Fractal Schedule.
