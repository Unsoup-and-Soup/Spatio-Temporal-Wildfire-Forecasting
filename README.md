# Project

## Required Packages

We list all the required packages for our application.

## Fire Dataset

We use the spatio-temporal fire data from https://ftp.wildfire.gov/.
To download the dataset, run the following Python program:

```
$ python3 data/download/download_fire_data.py
```

## Visualization
After cloning/downloading this repository, navigate to this `/project` directory locally, and run the following python command (for Python 3.x or higher) to create a HTTP web server:

`python -m http.server 8080  (or python3 -m http.server 8080)`

Open your browser and navigate to http://localhost:8080/.
