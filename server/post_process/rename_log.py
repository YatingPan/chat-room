import os
from datetime import datetime, timedelta

def correct_and_rename_logs(directory):
    # Prepare to collect all relevant logs
    logs = {}
    
    if not os.path.exists(directory):
        print("Directory does not exist:", directory)
        return
    if not os.listdir(directory):
        print("Directory is empty.")
        return

    # Scan through the directory containing the logs
    for filename in os.listdir(directory):
        if filename.startswith("pilot_study_") and filename.endswith(".log.json"):
            print("Processing file:", filename)
            # Parse the original file name
            parts = filename.split('_')
            room_id = parts[2]
            date_time_part = parts[3]
            log_version = parts[4].split('.')[0]
            date_time_corrected = date_time_part.replace(":", ".")
            room_date_key = '_'.join(parts[:4])
            if room_date_key not in logs:
                logs[room_date_key] = []
            logs[room_date_key].append((log_version, filename, date_time_corrected))
    
    # Debugging output
    for key, value in logs.items():
        print("Key:", key, "Files:", value)

    # Rename files according to new specifications, regardless of count
    for key, files in logs.items():
        # Sort files by version number, although sorting may be irrelevant for single log files
        sorted_files = sorted(files, key=lambda x: x[0])

        for i, (version, filename, date_time) in enumerate(sorted_files):
            new_filename = filename.replace('.log.json', '_log.json').replace(":", ".")
            if i == 3 and len(sorted_files) > 4:  # Check if the fourth log exists and there is a fifth log
                fifth_log_version, fifth_log_filename, _ = sorted_files[4]
                # Rename the fifth log if the time condition is met
                fourth_time = datetime.strptime(date_time, "%d.%m.%Y-%H.%M")
                fifth_time = datetime.strptime(sorted_files[4][2], "%d.%m.%Y-%H.%M")
                if fifth_time - fourth_time <= timedelta(minutes=2):
                    new_fifth_log_filename = fifth_log_filename.replace("4.log.json", "5_log.json").replace(":", ".")
                    os.rename(os.path.join(directory, fifth_log_filename), os.path.join(directory, new_fifth_log_filename))
                    print("Renamed fifth log:", fifth_log_filename, "to", new_fifth_log_filename)
            os.rename(os.path.join(directory, filename), os.path.join(directory, new_filename))
            print("Renamed:", filename, "to", new_filename)

# Example usage:
log_directory = '/srv/chat-room/chat-room.git/chatlog_07_23'
correct_and_rename_logs(log_directory)
