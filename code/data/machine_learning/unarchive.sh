#!/bin/bash

cd code/data/machine_learning/
find all_fire_data -name "*.zip" -exec sh -c 'unzip -o -d $(dirname {})/$(basename {} .zip) {}' \;
find download/fire_data/ -name "*.gdb" -exec sh -c 'echo {} && ogr2ogr -t_srs EPSG:3310 -skipfailures -f "ESRI Shapefile" $(dirname {})/shapefiles-$(basename {} .gdb) {}' \;