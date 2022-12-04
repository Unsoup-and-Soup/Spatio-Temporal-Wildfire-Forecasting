OVERVIEW

CSE 6242 - Data Visualization and Analytics
Prof. Polo
Final Project
Fall 2022

Unsoup and Soup Team:
    Balaram Behera
    William Boynton
    Sarah Cheah
    Jerry Cheung
    Shrey Patel
    Hui Min Tee


1 - DESCRIPTION

In the past decade, wildfires have caused millions of dollars in damage to both
natural preserves and thousands of homes. Understanding both the catalysts and
obstacles of wildfire spread can be effective in planning containment and
prevention strategies. In this application, we tackle the spatio-temporal
forecasting of wildfires. Given an initial fire perimeter, we predict 2, 4, and
6 days into the future. We train our model using the NIFC public server data
on fires in California since 2012. In our application, we have an interactive
grid where one can draw sample fire perimeters in different locations of Cali-
fornia and witness the prediction of the spread in the proceeding days.


2 - INSTALLATION

To install the application, first clone this repository. One only requires
Python on their local system to execute the full application, and an
internet connection is also not required as all JS libraries are downloaded.

In the "code/data/" folder, there exist some data files which are necessary
for the appplication, such as the California GeoJSON file. However, our
training dataset is not present as it is extremely large. We discuss gaining
and processing the data as we did at the end.

In the "code/data/machine_learning/" folder, the "train_model.ipynb" notebook
contains the code for training the model given our dataset. There are previews
in that code that display what the data looks like as a sample. We tested
multiple models, so their model layouts and structures are included along with
the preview of some of the tests we performed. The final report details these
experiments and evaluations. The required packages for the Python environment
are listed in the "requirements.txt" of that folder.

Lastly, the model is saved in the "code/data/model/" folder in the TensorflowJS
format. This is used by the application and should save any future iteration
of the model.


3 - EXECUTION

After installing this application, navigate to this "code/" directory locally.
In the terminal, run the following python command (for Python 3.x or higher)
to create a HTTP web server:

    $ python -m http.server 8080  (or with python3)

Open your browser and navigate to http://localhost:8080/ where you can view the
application.

The instructions on how to use the application are straightforward and are
listed on the home page.


A - DATA PROCESSING

We first downloaded all the spatio-temporal fire data from the public NIFC
server found at https://ftp.wildfire.gov/. The script for this process is in
the "get_ftp_data.ipynb" in the "code/data/machine_learning/" folder. We
only utilize the GIS data which is curated after fires, whereas the IR data
are heat perimeters which don't reflect the actual perimeter of the fire
accurately (though these can be processed such that they label the perimeter).

Then using the "unarchive.sh" script, we unzipped all archived files and
converted all GDB files to SHP files.

Then we had to manually organize the folders into the following file structure
in a "cleaned_fire_data" directory:

    { fire_name } -> { date in YYYYMMDD } -> GIS -> { perimeter SHP files }

This process took us many weeks due to high volume of unorganized data in
the folders. This process could not be automated. It took us from the 43 GB
dataset to around 3 GB of data.

For our training, we only used fires that had GIS data for at least 10 days,
which totalled to around 70 fires.

