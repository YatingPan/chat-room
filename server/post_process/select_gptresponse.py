import os
import shutil

# Define the directory paths
source_directory = '/srv/chat-room/server/private/gptResponses'
destination_directory = '/srv/chat-room/server/private/gptResponsesFinal'

# Create the destination directory if it doesn't exist
if not os.path.exists(destination_directory):
    os.makedirs(destination_directory)

# Function to rename files
def rename_file(file_path, new_name):
    directory, old_name = os.path.split(file_path)
    new_path = os.path.join(directory, new_name)
    os.rename(file_path, new_path)
    return new_path

# Iterate through all files in the source directory
for root, dirs, files in os.walk(source_directory):
    for file_name in files:
        if file_name.endswith('.json'):
            # Replace colons in the timestamp with dots
            new_name = file_name.replace(':', '.')

            # Full path to the original and new files
            old_file_path = os.path.join(root, file_name)
            new_file_path = rename_file(old_file_path, new_name)

            # If the file is a v3 file, rename "v3" to "full" and move it
            if 'v3' in new_name:
                final_name = new_name.replace('v3', 'full')
                final_file_path = rename_file(new_file_path, final_name)
                
                # Move the file to the final directory
                shutil.move(final_file_path, destination_directory)
