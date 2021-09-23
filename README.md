# [mplswinterparking.com](https://mplswinterparking.com)

Welcome to the mpls winter parking web app, an alternative to the official Minneapolis Snow Emergency App. This web app is designed for mobile but funtional in desktop environments. It is lightweight, using only flexbox for the UI layout and mapbox for the map component.

In the winter of 2020-2021, Minneapolis updated their snow emergency app and it is much more functional now. Therefore, I don't have much reason to keep maintaining full funtionality of this website. I will keep the domain up and update the data every year at the start of snow season but will be moonlighting the live snow emergency status; it will just be changed to a link to Minneapolis's snow emergency page.

The snow emergency route data is acquired from the [Minneapolis Open Data Portal](https://opendata.minneapolismn.gov/datasets/snow-emergency-routes) and is updated monthly during snow emergency season.

At the launch of the project, the City of Minneapolis did not have a public API for acquiring snow emergency status. The project used Google Firebase and a scheduled cloud function that scraped [http://www2.minneapolismn.gov/snow/index.htm](http://www2.minneapolismn.gov/snow/index.htm) every five minutes. It then wrote the extracted status to a Cloud Firestore db. On a user's page load, the database was read to determine the current snow emergency status and style the app accordingly. The logic for the scheduled cloud function is located in the functions/index.js file.
