import os
import re

def rename_files(directory):
    # Define the pattern to match the filenames
    pattern = re.compile(r'^(pilot_study_\d+_\d{2}\.\d{2}\.\d{4}-\d{2}:\d{2}_\d)\.log\.json$')

    # Iterate through the files in the given directory
    for filename in os.listdir(directory):
        match = pattern.match(filename)
        if match:
            # Extract the base name without the extension
            base_name = match.group(1)
            # Replace '.' and ':' with '-' in the base name
            new_base_name = base_name.replace('.', '-').replace(':', '-')
            # Construct the new filename
            new_filename = "{}_log.json".format(new_base_name)
            # Get full path of old and new filenames
            old_file = os.path.join(directory, filename)
            new_file = os.path.join(directory, new_filename)
            # Rename the file
            os.rename(old_file, new_file)
            print("Renamed '{}' to '{}'".format(filename, new_filename))

# Set the directory containing the files
directory = '/srv/chat-room/server/private/chatLogs'

# Call the function to rename the files
rename_files(directory)
