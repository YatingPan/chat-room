import os
import re
import shutil

def rename_and_copy_files(directory, final_directory):
    # Create the final directory if it does not exist
    if not os.path.exists(final_directory):
        os.makedirs(final_directory)

    # Define the pattern to match the filenames
    pattern = re.compile(r'^(pilot_study_\d+_\d{2}\.\d{2}\.\d{4}-\d{2}:\d{2}_v\d+)\.json$')

    # Iterate through the files in the given directory
    for filename in os.listdir(directory):
        match = pattern.match(filename)
        if match:
            # Extract the base name without the extension
            base_name = match.group(1)
            # Replace '.' and ':' with '-' in the base name
            new_base_name = base_name.replace('.', '-').replace(':', '-')
            # Construct the new filename
            new_filename = "{}.json".format(new_base_name)
            # Get full path of old and new filenames
            old_file = os.path.join(directory, filename)
            new_file = os.path.join(directory, new_filename)
            # Rename the file
            os.rename(old_file, new_file)
            print("Renamed '{}' to '{}'".format(filename, new_filename))

            # If the file ends with '_v3.json', copy it to the final directory
            if new_filename.endswith('_v3.json'):
                shutil.copy(new_file, final_directory)
                print("Copied '{}' to '{}'".format(new_filename, final_directory))

# Set the directories
source_directory = '/srv/chat-room/server/private/gptResponses'
final_directory = '/srv/chat-room/server/private/gptResponsesFinal'

# Call the function to rename and copy the files
rename_and_copy_files(source_directory, final_directory)
