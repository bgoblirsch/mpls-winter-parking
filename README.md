# [mplswinterparking.com](https://mplswinterparking.com)

## 2021 update

In the winter of 2020-2021, Minneapolis updated their snow emergency app and it is much more functional now. Therefore, there is not much reason to maintain this web app. I will keep the domain up until the end of the season in 2022.

---

Welcome to the Minneapolis Winter Parking web app, an alternative to the official Minneapolis Snow Emergency App. This web app is designed for mobile but funtional in desktop environments. It is lightweight, using only flexbox for the UI layout and mapbox for the map component.

The snow emergency route data was acquired from the [Minneapolis Open Data Portal](https://opendata.minneapolismn.gov/datasets/snow-emergency-routes) and was updated at the start of every snow emergency season.

At the launch of the project, the City of Minneapolis did not have a public API for acquiring snow emergency status. The project used Google Firebase and a scheduled cloud function that scraped [http://www2.minneapolismn.gov/snow/index.htm](http://www2.minneapolismn.gov/snow/index.htm) every five minutes. It then wrote the extracted status to a Cloud Firestore db. On a user's page load, the database was read to determine the current snow emergency status and style the app accordingly. The logic for the scheduled cloud function is located in the functions/index.js file.
