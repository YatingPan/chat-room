import os
import json
import csv
import re
from datetime import datetime, timedelta
from collections import OrderedDict

def parse_datetime_from_filename(filename):
    match = re.search(r'(\d{2}\.\d{2}\.\d{4}-\d{2}\.\d{2})', filename)
    if match:
        return datetime.strptime(match.group(1), '%d.%m.%Y-%H.%M')
    return None

def get_room_id_from_filename(filename):
    match = re.search(r'pilot_study_(\d+)_', filename)
    if match:
        return int(match.group(1))
    return None

def load_json_ordered(filename):
    with open(filename, 'r') as f:
        return json.load(f, object_pairs_hook=OrderedDict)

def process_directory(directory, output_dir, comparison_data, log_count_filename):
    log4_files = {}
    log5_files = {}
    missing_log5_files = []

    # Step 1: Collect all log4 and log5 files
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('_4_log.json'):
                room_id = get_room_id_from_filename(file)
                if room_id not in log4_files:
                    log4_files[room_id] = []
                log4_files[room_id].append(os.path.join(root, file))
            elif file.endswith('_5_log.json'):
                room_id = get_room_id_from_filename(file)
                if room_id not in log5_files:
                    log5_files[room_id] = []
                log5_files[room_id].append(os.path.join(root, file))

    # Write the count of log4 and log5 files to a text file
    with open(log_count_filename, 'a') as f:
        f.write("Directory: {}\n".format(directory))
        f.write("Number of log4 files: {}\n".format(sum(len(v) for v in log4_files.values())))
        f.write("Number of log5 files: {}\n".format(sum(len(v) for v in log5_files.values())))

    # Step 2: Find matching log5 for each log4 by room_id and timestamp difference
    for room_id in log4_files:
        if room_id not in log5_files:
            missing_log5_files.extend(log4_files[room_id])
            continue

        for log4_path in log4_files[room_id]:
            log4_datetime = parse_datetime_from_filename(log4_path)
            timestamp = log4_datetime.strftime('%Y-%m-%d %H:%M:%S') if log4_datetime else 'null'
            corresponding_log5 = None

            for log5_path in log5_files[room_id]:
                log5_datetime = parse_datetime_from_filename(log5_path)
                if log4_datetime and log5_datetime and log5_datetime - log4_datetime in (timedelta(minutes=1), timedelta(minutes=2)):
                    corresponding_log5 = log5_path
                    break

            if not corresponding_log5:
                missing_log5_files.append(log4_path)
                continue

            log4_data, log5_data = None, None
            if log4_path:
                log4_data = load_json_ordered(log4_path)
                print("Loaded log4 data for {}: {}".format(log4_path, json.dumps(log4_data, indent=2)))  # Debug print

            if corresponding_log5:
                log5_data = load_json_ordered(corresponding_log5)
                print("Loaded log5 data for {}: {}".format(corresponding_log5, json.dumps(log5_data, indent=2)))  # Debug print

            if log4_data and log5_data:
                log4_comments = log4_data.get('comments', [])
                log5_comments = log5_data.get('comments', [])

                if log4_comments != log5_comments:
                    log4_len = len(log4_comments)
                    log5_len = len(log5_comments)
                    if log4_len > log5_len:
                        full_log = log4_data
                        full_log_filename = log4_path
                        longer_log = 'log4'
                    else:
                        full_log = log5_data
                        full_log_filename = corresponding_log5
                        longer_log = 'log5'
                else:
                    # If they are the same, select log4 as the full log
                    full_log = log4_data
                    full_log_filename = log4_path
                    longer_log = 'log4'

                # Ensure full log retains the original structure including users
                full_log_output_path = os.path.join(output_dir, os.path.basename(full_log_filename).replace('_log', '_full_log'))
                with open(full_log_output_path, 'w') as f:
                    json.dump(full_log, f, indent=2)

                # Check for duplicates in comparison_data
                entry = [
                    room_id,
                    timestamp,
                    log4_path,
                    corresponding_log5,
                    'Different' if log4_comments != log5_comments else 'Same',
                    longer_log
                ]
                if entry not in comparison_data:
                    comparison_data.append(entry)
            else:
                comparison_data.append([
                    room_id,
                    timestamp,
                    log4_path if log4_path else 'null',
                    corresponding_log5 if corresponding_log5 else 'null',
                    'Missing log4 or log5',
                    'null'
                ])

    # Write missing log5 files to the same log count file
    with open(log_count_filename, 'a') as f:
        f.write("\nLog4 files without corresponding log5 files:\n")
        for log4_path in missing_log5_files:
            f.write("{}\n".format(log4_path))

def make_sure_path_exists(path):
    try:
        os.makedirs(path)
    except OSError:
        if not os.path.isdir(path):
            raise

if __name__ == "__main__":
    base_directory = '/srv/chat-room/chat-room.git/' # the base directory containing the chatlog directories
    output_directory = '/srv/chat-room/chat-room.git/full_logs/'
    comparison_csv = '/srv/chat-room/chat-room.git/comparison.csv'
    log_count_txt = '/srv/chat-room/chat-room.git/log_counts.txt'

    # Ensure the output directory exists
    make_sure_path_exists(output_directory)

    directories_to_process = [
        'chatlog_07_18_afternoon', 
        'chatlog_07_18_morning', 
        'chatlog_07_19_morning', 
        'chatlog_07_19_afternoon', 
        'chatlog_07_22', 
        'chatlog_07_23'
    ]  # Add more directories as needed

    # Initialize comparison data list
    comparison_data = []

    for directory in directories_to_process:
        print("Processing directory: {}".format(directory))
        process_directory(os.path.join(base_directory, directory), output_directory, comparison_data, log_count_txt)

    # Write comparison data to CSV after processing all directories
    with open(comparison_csv, 'wb') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(['Room ID', 'Timestamp', 'Log4 Filename', 'Log5 Filename', 'Different?', 'Selected Log'])
        csvwriter.writerows(comparison_data)

    print("Processing completed.")
