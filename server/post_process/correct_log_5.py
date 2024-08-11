import os
from datetime import datetime

def resolve_double_four_log_issue(directory):
    # This dictionary will hold the file paths grouped by room and date only (without specific times)
    log_groups = {}

    # Check if the directory exists
    if not os.path.exists(directory):
        print("Directory does not exist:", directory)
        return
    
    # Check if the directory is empty
    if not os.listdir(directory):
        print("Directory is empty.")
        return

    # Scan through the directory containing the logs
    for filename in os.listdir(directory):
        if filename.startswith("pilot_study_") and filename.endswith("_log.json"):
            print("Found log file:", filename)
            parts = filename.split('_')
            room_id = parts[2]
            date = parts[3]
            room_date_key = '_'.join(parts[:4])  # should use room and date (without the exact time)
            room_date_key = room_date_key.rsplit('-', 1)[0]  # Remove the time part
            
            # Collect files under the same room and date
            if room_date_key not in log_groups:
                log_groups[room_date_key] = []
            log_groups[room_date_key].append(filename)

    print("Total groups found:", len(log_groups))

    # Process each group to find and rename the late "4_log"
    for key, files in log_groups.items():
        print("Processing group:", key, "with", len(files), "files")
        # Filter to get only those ending with "4_log.json"
        four_logs = [f for f in files if f.endswith("_4_log.json")]
        if len(four_logs) == 2:
            print("Two 4_log files found in group:", key)
            # Sort based on the timestamp in the filename
            four_logs_sorted = sorted(four_logs, key=lambda x: datetime.strptime(x.split('_')[3], "%d.%m.%Y-%H.%M"))
            # The later file needs to be renamed to "_5_log.json"
            old_name = four_logs_sorted[1]
            new_name = old_name.replace("_4_log.json", "_5_log.json")
            os.rename(os.path.join(directory, old_name), os.path.join(directory, new_name))
            print("Renamed:", old_name, "to", new_name)
        elif len(four_logs) == 1:
            print("Only one 4_log file found in group:", key)
        else:
            print("No 4_log file or more than two found in group:", key)

# Example usage
log_directory = '/srv/chat-room/chat-room.git/chatlog_07_23'
resolve_double_four_log_issue(log_directory)
