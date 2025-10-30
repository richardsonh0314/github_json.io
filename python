# preprocessing.py - Run this first to create the required CSV files

import pandas as pd

# Read the original social media data
df = pd.read_csv('socialMedia.csv')

# ============================================
# Part 2.2: Create socialMediaAvg.csv
# ============================================
# Group by Platform and PostType, calculate average of Likes
avg_likes = df.groupby(['Platform', 'PostType'])['Likes'].mean().reset_index()
avg_likes.columns = ['Platform', 'PostType', 'AvgLikes']
avg_likes['AvgLikes'] = avg_likes['AvgLikes'].round(2)
avg_likes.to_csv('socialMediaAvg.csv', index=False)

print("socialMediaAvg.csv created:")
print(avg_likes)
print("\n")

# ============================================
# Part 2.3: Create socialMediaTime.csv
# ============================================
# Convert Date column to datetime if it's not already
df['Date'] = pd.to_datetime(df['Date'])

# Create a formatted date string with day of week
df['DateFormatted'] = df['Date'].dt.strftime('%m/%d/%Y') + ' (' + df['Date'].dt.strftime('%A') + ')'

# Group by the formatted date and calculate average of Likes
time_avg = df.groupby(['DateFormatted'])['Likes'].mean().reset_index()
time_avg.columns = ['Date', 'AvgLikes']
time_avg['AvgLikes'] = time_avg['AvgLikes'].round(2)

# Sort by actual date (extract date from formatted string for sorting)
time_avg['SortDate'] = pd.to_datetime(time_avg['Date'].str.split(' ').str[0], format='%m/%d/%Y')
time_avg = time_avg.sort_values('SortDate')
time_avg = time_avg[['Date', 'AvgLikes']]  # Drop the sort column

time_avg.to_csv('socialMediaTime.csv', index=False)

print("socialMediaTime.csv created:")
print(time_avg)
