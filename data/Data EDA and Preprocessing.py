# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')


import pandas as pd
import os
import glob
import matplotlib.pyplot as plt
import seaborn as sns


base_path = '/content/drive/MyDrive/usa'




#########################################################
#### Concatenate files to create nationwide datasets ####
#########################################################

# Define the list of CSV files to concatenate
csv_files = ['reviews.csv', 'reviews_detailed.csv', 'calendar.csv', 'listings.csv', 'listings_detailed.csv', 'neighbourhoods.csv']


# Concatenate file
for file in csv_files:
  all_data = []

  for city_folder in os.listdir(base_path):
      city_path = os.path.join(base_path, city_folder)

      if os.path.isdir(city_path):  # Ensure we are dealing with a folder, not a file
          csv_path = os.path.join(city_path, file)

          if os.path.exists(csv_path):
              try:
                  city_data = pd.read_csv(csv_path)
                  all_data.append(city_data)

              except pd.errors.EmptyDataError:
                  print(f"Warning: Empty file found at {csv_path}")
              except pd.errors.ParserError:
                  print(f"Warning: Parsing error encountered for {csv_path}")

  if all_data:
    combined_df = pd.concat(all_data, ignore_index=True)

    # Save the combined data to a new CSV file
    output_filename = file[:-4] # removes the '.csv' extension
    output_path = os.path.join(base_path, f"{output_filename}_combined.csv") # Construct the full path
    combined_df.to_csv(output_path, index=False)
    print(f"Created {output_filename}_combined.csv")
  else:
      print(f"No files named '{file}' found in any city folders.")



# Concatenate listings_detailed file include a column "city" with the city folder name
csv_files = ['listings_detailed.csv']

all_dataframes = []

for city_folder in os.listdir(base_path):
    city_path = os.path.join(base_path, city_folder)
    if os.path.isdir(city_path):
        for file in csv_files:
            csv_path = os.path.join(city_path, file)
            if os.path.exists(csv_path):
                try:
                    df = pd.read_csv(csv_path)

                    # Add a 'city' column with the city folder name
                    df['city'] = city_folder

                    all_dataframes.append(df)
                except pd.errors.EmptyDataError:
                    print(f"Warning: Empty file found at {csv_path}")
                except pd.errors.ParserError:
                    print(f"Warning: Parsing error encountered for {csv_path}")


	if all_dataframes:
	    combined_df = pd.concat(all_dataframes, ignore_index=True)


	    output_filename = 'listings_detailed_combined.csv'
	    output_path = os.path.join(base_path, output_filename)
	    combined_df.to_csv(output_path, index=False)
	    print(f"Created {output_filename}")
	else:
	    print(f"No files found matching the specified criteria.")







####################################################
#### Basic EDA for all files ####
####################################################

# List of combined CSV files
combined_files = ['calendar_combined.csv', 'listings_combined.csv', 'listings_detailed_combined.csv',
                  'neighbourhoods_combined.csv', 'reviews_combined.csv', 'reviews_detailed_combined.csv']

missing_threshold = 0.5

for file in combined_files:
    file_path = os.path.join(base_path, file)
    if os.path.exists(file_path):
        try:

            df = pd.read_csv(file_path)
            print(f"------ EDA for {file} ------")
            # print(df.head())
            # print(df.info())
            # print(df.describe())

            # Display the DataFrame head with styling
            print(f"\n---Head of {file}---")
            display(df.head().style.set_table_styles([{'selector': 'th', 'props': [('background-color', '#f0f0f0'), ('color', 'black'), ('font-weight', 'bold')]},
                                                        {'selector': 'td', 'props': [('text-align', 'center')]}])
                   )

            # Display DataFrame info as a styled table
            print(f"\n---Info of {file}---")
            info_df = pd.DataFrame(df.info())
            display(info_df.style.set_table_styles([{'selector': 'th', 'props': [('background-color', '#f0f0f0'), ('color', 'black'), ('font-weight', 'bold')]},
                                                      {'selector': 'td', 'props': [('text-align', 'left')]}])
                   )

            # Display DataFrame describe with styling
            print(f"\n---Describe of {file}---")
            display(df.describe().style.set_table_styles([{'selector': 'th', 'props': [('background-color', '#f0f0f0'), ('color', 'black'), ('font-weight', 'bold')]},
                                                           {'selector': 'td', 'props': [('text-align', 'center')]}])
                   )

            # Missing Value Summary
            missing_percent = df.isnull().sum() * 100 / len(df)
            missing_summary = missing_percent[missing_percent > missing_threshold].sort_values(ascending=False)
            if not missing_summary.empty:
                print("\n---Missing Value Summary (>10% missing):---")
                print(missing_summary)

            # Data Type Summary
            num_cols = df.select_dtypes(include=['number']).columns.tolist()
            cat_cols = df.select_dtypes(include=['object']).columns.tolist()
            print(f"\n---Numerical Columns: {len(num_cols)}, Categorical Columns: {len(cat_cols)}---")

            # Unique Value Count for Categorical Columns
            unique_counts = df[cat_cols].nunique().sort_values()
            print("\n---Unique Value Count for Categorical Variables:---")
            print(unique_counts[unique_counts < 20])

            # Plot Histograms for Numerical Features (first 3 columns)
            for col in num_cols[:3]:
                plt.figure(figsize=(6, 4))
                sns.histplot(df[col].dropna(), kde=True)
                plt.title(f'Distribution of {col}')
                plt.show()

            # Correlation Heatmap
            if len(num_cols) > 1:
                plt.figure(figsize=(8, 6))
                sns.heatmap(df[num_cols].corr(), annot=True, cmap='coolwarm', fmt=".2f")
                plt.title(f'Correlation Matrix for {file}')
                plt.show()

            # Additional Categorical Visualizations
            for col in cat_cols:
                if df[col].nunique() < 20:  # Limit to categorical variables with fewer unique values
                    plt.figure(figsize=(6, 4))
                    df[col].value_counts().plot(kind='bar')
                    plt.title(f'Counts of {col}')
                    plt.xlabel(col)
                    plt.ylabel("Frequency")
                    plt.xticks(rotation=45)
                    plt.show()


            # Example visualizations (customize as needed)
            # Numerical features: Histograms
            numerical_cols = df.select_dtypes(include=['number']).columns
            for col in numerical_cols:
                plt.figure()
                sns.histplot(df[col].dropna(), kde=True)
                plt.title(f'Distribution of {col}')
                plt.show()

            # Categorical features: Bar plots
            categorical_cols = df.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                if df[col].nunique() < 20:  # Limit to categories with fewer unique values for better visualization
                    plt.figure()
                    df[col].value_counts().plot(kind='bar')
                    plt.title(f'Counts of {col}')
                    plt.show()

            # Correlation matrix (for numerical features)
            if len(numerical_cols) > 1:
                plt.figure(figsize=(10, 8))
                sns.heatmap(df[numerical_cols].corr(), annot=True, cmap='coolwarm')
                plt.title(f'Correlation Matrix for {file}')
                plt.show()


            # Save EDA results to a formatted table (e.g., CSV)
            eda_results = {
                "File": file,
                "Shape": df.shape,
                "Missing Value Summary": missing_summary.to_string() if not missing_summary.empty else "No missing values > 10%",
                "Numerical Columns": len(num_cols),
                "Categorical Columns": len(cat_cols),
                "Unique Value Counts": unique_counts[unique_counts < 20].to_string() if not unique_counts[unique_counts < 20].empty else "No categorical variables with <20 unique values"
            }
            eda_df = pd.DataFrame([eda_results])

            # Create the output directory if it doesn't exist
            output_dir = os.path.join(base_path, 'eda_results')
            os.makedirs(output_dir, exist_ok=True)

            # Construct the output file path
            output_file = os.path.join(output_dir, f"{file[:-4]}_eda_results.csv")

            # Save the EDA results to a CSV file
            if not os.path.exists(output_file):
              eda_df.to_csv(output_file, index=False)
            else:
              eda_df.to_csv(output_file, mode='a', header=False, index=False)


            print(f"EDA results saved to {output_file}")
        except pd.errors.ParserError:
            print(f"Error parsing {file}. Please check the file format.")
    else:
        print(f"File not found: {file_path}")









####################################################
#### preprocessng listings_combined, listings_details_combined data file 
####################################################


base_path = "/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata"
listings_file = "listings_detailed_combined.csv"
listings_path = os.path.join(base_path, listings_file)

df = pd.read_csv(listings_path)

df.info()

# select columns 
columns_listings = ['id', 'name', 'host_id', 'neighbourhood', 'room_type']
columns_listings_detailed = [
    'id', 'description', 'listing_url', 'picture_url',
    'bedrooms', 'beds', 'number_of_reviews', 'accommodates', 'instant_bookable', 'review_scores_rating'
]
df_listings = df[columns_listings].copy()
df_listings_detailed = df[columns_listings_detailed].copy()

# deal with mull
df_listings = df_listings.dropna(subset=['name', 'neighbourhood']).reset_index(drop=True)
df_listings_detailed = df_listings_detailed.dropna(subset=['review_scores_rating']).reset_index(drop=True)

# convert id to numeric
df['id'] = pd.to_numeric(df['id'], errors='coerce', downcast='integer')
df['host_id'] = pd.to_numeric(df['host_id'], errors='coerce', downcast='integer')
df_listings_detailed = df_listings_detailed[df_listings_detailed['id'].isin(df_listings['id'])]

# remove duplicates
if df_listings['id'].is_unique:
    print("'id' in df_listings is unique.")
else:
    print("'id' in df_listings is NOT unique.")
    print(df_listings['id'].value_counts()[df_listings['id'].value_counts() > 1])

if df_listings_detailed['id'].is_unique:
    print("'id' in df_listings_detailed is unique.")
else:
    print("'id' in df_listings_detailed is NOT unique.")
    print(df_listings_detailed['id'].value_counts()[df_listings_detailed['id'].value_counts() > 1])

df_listings.drop_duplicates(subset='id', inplace=True)
df_listings_detailed.drop_duplicates(subset='id', inplace=True)

print(df_listings['id'].is_unique)
print(df_listings_detailed['id'].is_unique)

# Drop invalid values
df_listings.dropna(subset=['id', 'host_id'], inplace=True)
df_listings['id'] = pd.to_numeric(df_listings['id'], errors='coerce').astype('Int64')
df_listings['host_id'] = pd.to_numeric(df_listings['host_id'], errors='coerce').astype('Int64')
df_listings.drop_duplicates(inplace=True)

df_listings_detailed.dropna(subset=['id'], inplace=True)
df_listings_detailed['id'] = pd.to_numeric(df_listings_detailed['id'], errors='coerce').astype('Int64')
df_listings_detailed.drop_duplicates(inplace=True)


# output
listings_output_path = os.path.join(base_path, "DB_listings.csv")
listings_detailed_output_path = os.path.join(base_path, "DB_listings_detailed.csv")

df_listings.to_csv(listings_output_path, index=False)
df_listings_detailed.to_csv(listings_detailed_output_path, index=False)









####################################################
#### preprocessng amenities data file ####
####################################################

df = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/listings_detailed_combined.csv')

# count amenities frequence
amenities_count = defaultdict(int)

for amenities_str in df['amenities']:
    if isinstance(amenities_str, str):
        amenities_list = amenities_str.replace('[', '').replace(']', '').replace('"', '').replace('\'', '').split(',')
        for amenity in amenities_list:
            amenity = amenity.strip()
            if amenity:
                amenities_count[amenity] += 1

for amenity, count in amenities_count.items():
    print(f"{amenity}: {count}")

print(f"Number of key-value pairs in amenities_count: {len(amenities_count)}")

sorted_amenities = dict(sorted(amenities_count.items(), key=lambda item: item[1], reverse=True))

# select only top 200 amenities with most frequence
top_200_amenities = dict(list(sorted_amenities.items())[:200])

cleaned_amenities = {}
for amenity, count in top_200_amenities.items():
  cleaned_amenity = amenity.encode('utf-8').decode('unicode_escape')  
  cleaned_amenities[cleaned_amenity] = count

top_amenities_df = pd.DataFrame({"amenities": cleaned_amenities.keys()})

top_amenities_df['amenity_id'] = range(1, len(top_amenities_df) + 1)

# Save the DataFrame to a CSV file
output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/amenities.csv'
top_amenities_df.to_csv(output_file_path, index=False, encoding='utf-8-sig')






####################################################
#### preprocessng listings_amenities data file ####
####################################################


df_listing_id_amenities = df[['id', 'amenities']]
df_listing_id_amenities.head()

df_listing_id_amenities.loc[:, 'amenities'] = df_listing_id_amenities['amenities'].str.replace('[', '', regex=False).replace(']', '', regex=False).replace('"', '', regex=False).replace('\'', '', regex=False)
df_listing_id_amenities.loc[:, 'amenities'] = df_listing_id_amenities['amenities'].str.split(',')
df_listing_id_amenities.head()

print(df_listing_id_amenities[df_listing_id_amenities['id']==2384])

df_exploded = df_listing_id_amenities.explode('amenities')

df_exploded[df_exploded['id'] == 2384]

df_exploded.head()

df_exploded['amenities'] = df_exploded['amenities'].str.strip()

# deal with unicode 
import codecs

def decode_unicode(val):
    if isinstance(val, str):
        try:
            return codecs.decode(val, 'unicode_escape')
        except Exception:
            return val  
    return val

df_exploded['amenities'] = df_exploded['amenities'].apply(decode_unicode)

has_amenity = df_exploded.merge(top_amenities_df, on='amenities', how='left')[['id', 'amenity_id']]

print(has_amenity[has_amenity['id'] == 2384])

output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/has_amenity.csv'


has_amenity.to_csv(output_file_path, index=False, encoding='utf-8-sig')

print(f"has_amenity DataFrame saved to {output_file_path}")

# Read the CSV file
df_has_amenity = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_has_amenity.csv')


df_has_amenity.head()

len(df_has_amenity)

# Remove rows with null amenity_id
df_has_amenity = df_has_amenity.dropna(subset=['amenity_id'])

# Convert amenity_id to int
df_has_amenity.loc[:,'amenity_id'] = df_has_amenity['amenity_id'].astype(int)

print(len(df_has_amenity))
df_has_amenity.head()

output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_has_amenity1.csv'
df_has_amenity.to_csv(output_file_path, index=False, encoding='utf-8-sig')


# update has amenity table
df_has_amenity = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_has_amenity1.csv')

listing_ids_df_listings = set(df_listings['id'].unique())
listing_ids_df_has_amenity = set(df_has_amenity['id'].unique())

missing_listing_ids = listing_ids_df_has_amenity - listing_ids_df_listings
len(missing_listing_ids)

# Remove rows with missing_listing_ids from df_calendar
df_has_amenity = df_has_amenity[~df_has_amenity['id'].isin(missing_listing_ids)]

# remove duplicates
df_has_amenity = df_has_amenity.drop_duplicates(subset=['id', 'amenity_id'], keep='first')
len(df_has_amenity)

output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_has_amenity2.csv'
df_has_amenity.to_csv(output_file_path, index=False, encoding='utf-8-sig')

print(f"df_has_amenity DataFrame saved to {output_file_path}")

df_amenities = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_amenities.csv')









####################################################
#### preprocessng calendar_combined data file 
####################################################


df_calendar = pd.read_csv(base_path+'calendar_combined.csv')

# Get info about the DataFrame
df_calendar.info()
df_calendar.head()


# Convert 'date' column to datetime objects
df_calendar['date'] = pd.to_datetime(df_calendar['date'])


# Filter out rows where the year is 2024 and the month is in (3, 4, 5)
df_calendar = df_calendar[~((df_calendar['date'].dt.year == 2024) & (df_calendar['date'].dt.month.isin([3, 4, 5])))]

# Filter df_listings_detailed to keep only rows with IDs present in df_listings
valid_listing_ids = set(df_listings['id'].unique())
df_calendar = df_calendar[df_calendar['listing_id'].isin(valid_listing_ids)]

## since the dataset is too large, doing multiple processing steps will crash the program. After each processing step We save the dataset to csv, restart program and then do next process
#output
output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/calendar_remove_2024_3_5.csv'
df_calendar.to_csv(output_file_path, index=False, encoding='utf-8-sig')
print(f"df_calendar DataFrame saved to {output_file_path}")


# convert price to float
df_calendar = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/calendar_remove_2024_3_5.csv')
df_calendar.loc[:,'price'] = df_calendar['price'].str.replace('$', '', regex=False).str.replace(',', '', regex=False).fillna(0).astype(float)
print('price finished')

#output
output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/calendar_remove_price_int.csv'
df_calendar.to_csv(output_file_path, index=False, encoding='utf-8-sig')
print(f"df_calendar DataFrame saved to {output_file_path}")


#remove duplicate
df_calendar = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/calendar_remove_price_int.csv')
df_calendar = df_calendar.drop_duplicates(subset=['listing_id', 'date'], keep='first')


# convert minimum_nights, maximum_nights to int
df_calendar.loc[:,'minimum_nights'] = df_calendar['minimum_nights'].fillna(0).astype(int)
df_calendar.loc[:,'maximum_nights'] = df_calendar['maximum_nights'].fillna(0).astype(int)
df_calendar.info()

#output
output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_calendar2.csv'
df_calendar.to_csv(output_file_path, index=False, encoding='utf-8-sig')
print(f"df_calendar DataFrame saved to {output_file_path}")

# convert adjust_price to float
df_calendar = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_calendar2.csv')
df_calendar.loc[:,'adjusted_price'] = df_calendar['adjusted_price'].str.replace('$', '', regex=False).str.replace(',', '', regex=False).fillna(0).astype(float)
print('adjusted_price finished')
df_calendar['adjusted_price'] = pd.to_numeric(df_calendar['adjusted_price'], errors='coerce')
df_calendar['adjusted_price'] = df_calendar['adjusted_price'].fillna(0)
#output
output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_calendar3.csv'
df_calendar.to_csv(output_file_path, index=False, encoding='utf-8-sig')
print(f"df_calendar DataFrame saved to {output_file_path}")


#check distribution fo  adjust_price

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Count the number of 0 values in 'adjusted_price'
num_zero_prices = (df_calendar['adjusted_price'] == 0).sum()
print(f"Number of 0 values in 'adjusted_price': {num_zero_prices}")

# Plot the distribution of 'adjusted_price'
plt.figure(figsize=(10, 6))
sns.histplot(df_calendar['adjusted_price'], kde=True)
plt.title('Distribution of Adjusted Prices')
plt.xlabel('Adjusted Price')
plt.ylabel('Frequency')
plt.show()


# Calculate the 50th, 90th, 95th percentiles and the maximum of 'adjusted_price'
percentiles = df_calendar['adjusted_price'].quantile([0.5, 0.9, 0.95, 0.99])
max_price = df_calendar['adjusted_price'].max()

print("50th Percentile:", percentiles[0.5])
print("90th Percentile:", percentiles[0.9])
print("95th Percentile:", percentiles[0.95])
print("99th Percentile:", percentiles[0.99])
print("Maximum Price:", max_price)


# convert available column to boolean
null_available_count = df_calendar['available'].isnull().sum()
print(f"Number of null values in 'available' column: {null_available_count}")

df_calendar['available_boo'] = df_calendar['available'].map({'t': True, 'f': False})

available_boo_counts = df_calendar.groupby('available_boo').size().reset_index(name='count')
available_boo_counts

df_calendar = df_calendar.drop(columns=['available'])


# Remove rows where 'adjusted_price' is greater than 6000
count_high_prices = len(df_calendar[df_calendar['adjusted_price'] > 6000])
print(f"Number of rows with adjusted_price greater than 6000: {count_high_prices}")
df_calendar = df_calendar[df_calendar['adjusted_price'] <= 6000]


# output
output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_calendar4.csv'
df_calendar.to_csv(output_file_path, index=False, encoding='utf-8-sig')
print(f"Updated df_calendar DataFrame saved to {output_file_path}")










####################################################
#### preprocessng review data file 
# check if id is unique
# check if id has null value
# remove rows with duplicate id
# output the cleaned dataset to csv
####################################################


df_reviews = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/reviews_combined.csv')
df_reviews.head()

df_reviews_detailed = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/reviews_detailed_combined.csv')
df_reviews_detailed.head()

# Count the number of rows in df_reviews_detailed
num_rows = len(df_reviews_detailed)
print(f"Number of rows in df_reviews_detailed: {num_rows}")

# Check if 'id' is unique
is_id_unique = df_reviews_detailed['id'].is_unique
print(f"Is 'id' unique: {is_id_unique}")

# Check if 'id' has any null values
has_null_id = df_reviews_detailed['id'].isnull().any()
print(f"Does 'id' have any null values: {has_null_id}")

duplicate_ids = df_reviews_detailed['id'].duplicated(keep=False)
duplicate_rows = df_reviews_detailed[duplicate_ids]

print(f"Number of duplicate 'id' values: {duplicate_rows['id'].nunique()}")
duplicate_rows

# remove duplicates
id_with_duplicate=duplicate_rows['id']
df_reviews_detailed_clean = df_reviews_detailed[~df_reviews_detailed['id'].isin(id_with_duplicate)]
len(df_reviews_detailed_clean)


df_reviews_detailed_clean = df_reviews_detailed_clean.rename(columns={'id': 'review_id'})
output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_reviews.csv'
df_reviews_detailed_clean.to_csv(output_file_path, index=False, encoding='utf-8-sig')


####################################################
#### preprocessng hosts data file 
#check if host_id is unique
#check if host_id has null value
#remove rows with duplicate host_id
#output the cleaned dataset to csv
####################################################


df_listing_details = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/listings_detailed_combined.csv')

host_columns = [col for col in df_listing_details.columns if "host" in col]
df_host = df_listing_details[host_columns]

df_host.head()

if 'host_verifications' in df_host.columns:
  df_host = df_host.drop('host_verifications', axis=1)
if 'host_about' in df_host.columns:
  df_host = df_host.drop('host_about', axis=1)

df_host.head()

len(df_host)

#remove duplicates
df_host_dedup = df_host.drop_duplicates(subset=['host_id'], keep='first')

print(len(df_host_dedup))
is_id_unique=df_host_dedup['host_id'].is_unique
print(f"Is 'host_id' unique: {is_id_unique}")
has_null_id=df_host_dedup['host_id'].isnull().any()
print(f"Does 'host_id' have any null values: {has_null_id}")

df_host_dedup.head()

# select columns 
df_host_dedup = df_host_dedup[['host_id', 'host_url', 'host_name',  'host_since', 'host_location', 'host_response_time',
                   'host_is_superhost', 'host_identity_verified', 'host_has_profile_pic',
                   'host_listings_count', 'host_total_listings_count']]

# output
output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_host.csv'
df_host_dedup.to_csv(output_file_path, index=False, encoding='utf-8-sig')






####################################################
#### preprocessng is_super_host data file ####
####################################################

df_host = pd.read_csv('/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_is_super_host.csv')

df_host.info()
df_host.head()

host_is_superhost_counts = df_host.groupby('host_is_superhost_boo').size().reset_index(name='count')

host_is_superhost_counts

df_host = df_host[['host_id', 'host_is_superhost']]


# Create 'host_is_superhost_boo' column
df_host['host_is_superhost_boo'] = df_host['host_is_superhost'].map({'t': True, 'f': False})

# Fill null with False
df_host['host_is_superhost_boo'] = df_host['host_is_superhost_boo'].fillna(False)


null_superhost_rows = df_host[df_host['host_is_superhost_boo'].isnull()]
print(len(null_superhost_rows))

df_host = df_host[['host_id', 'host_is_superhost_boo']]

# output
output_file_path = '/content/drive/Shareddrives/550_project/CIS550FinalProject/combineddata/DB_is_super_host.csv'
df_host.to_csv(output_file_path, index=False, encoding='utf-8-sig')
print(f"Updated df_host DataFrame saved to {output_file_path}")









