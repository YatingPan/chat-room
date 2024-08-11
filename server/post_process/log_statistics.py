import os
import json
import csv
from datetime import datetime, timedelta
import re

def parse_timestamp(filename):
    match = re.search(r'_(\d{2}\.\d{2}\.\d{4}-\d{2}\.\d{2})_', filename)
    if match:
        return datetime.strptime(match.group(1), "%d.%m.%Y-%H.%M")
    return None

def find_unique_users(directories, output_txt):
    unique_users = {}
    user_file_mapping = {}

    for directory in directories:
        for filename in os.listdir(directory):
            if filename.endswith("_log.json"):
                file_path = os.path.join(directory, filename)
                with open(file_path, 'r') as file:
                    data = json.load(file)
                    for user in data.get("users", []):
                        pid = user.get("prolificPid")
                        name = user.get("name")
                        if pid not in unique_users:
                            unique_users[pid] = set()
                            user_file_mapping[pid] = set()
                        unique_users[pid].add(name)
                        user_file_mapping[pid].add(filename)

    with open(output_txt, 'w') as f:
        for pid, names in unique_users.items():
            if len(names) > 1:
                f.write("PID {0} with names {1} appears in files: {2}\n".format(
                    pid, ', '.join(names), ', '.join(user_file_mapping[pid])
                ))

def count_users_in_logs(directories, output_csv, output_txt):
    log_stats = []
    pattern = re.compile(r'pilot_study_(\d+)_\d{2}\.\d{2}\.\d{4}-\d{2}\.\d{2}_(\d)_log\.json')
    user_speaks_count = {}

    for directory in directories:
        for filename in os.listdir(directory):
            if filename.endswith("_log.json"):
                match = pattern.match(filename)
                if match and match.group(2) == '4':  # Only process log version 4
                    room_id = int(match.group(1))
                    timestamp = parse_timestamp(filename)
                    file_path = os.path.join(directory, filename)
                    with open(file_path, 'r') as file:
                        data = json.load(file)
                        name_to_pid = {user["name"]: user["prolificPid"] for user in data.get("users", [])}
                        user_speaks = {pid: False for pid in name_to_pid.values()}

                        for comment in data.get("comments", []):
                            if comment["userName"] in name_to_pid:
                                user_speaks[name_to_pid[comment["userName"]]] = True

                        num_users_speak = sum(user_speaks.values())
                        user_speaks_count.setdefault(num_users_speak, []).append(filename)

                        log_stats.append({
                            "room_id": room_id,
                            "timestamp": timestamp,
                            "num_users": len(name_to_pid),
                            "num_users_speak": num_users_speak,
                            "file": filename
                        })

    with open(output_csv, 'wb') as csvfile:
        fieldnames = ['room_id', 'num_users', 'num_users_speak', 'timestamp', 'file']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for log in log_stats:
            writer.writerow(log)

    with open(output_txt, 'w') as f:
        for count, files in user_speaks_count.items():
            f.write("Rooms with {0} users speaking: {1}\n".format(count, len(files)))
            bot_counts = {'Alex': 0, 'Alex(Moderator)': 0, 'null': 0}
            for file in files:
                room_id = int(file.split('_')[2])
                bot_type = 'Alex(Moderator)' if room_id % 3 == 1 else 'Alex' if room_id % 3 == 2 else 'null'
                bot_counts[bot_type] += 1
            f.write("Bot counts for {0} users speaking: {1}\n".format(count, bot_counts))

directories = [
    '/srv/chat-room/chat-room.git/chatlog_07_19_morning',
    '/srv/chat-room/chat-room.git/chatlog_07_19_afternoon',
    '/srv/chat-room/chat-room.git/chatlog_07_18_morning',
    '/srv/chat-room/chat-room.git/chatlog_07_18_afternoon',
    '/srv/chat-room/chat-room.git/chatlog_07_22',
    '/srv/chat-room/chat-room.git/chatlog_07_23',
    '/srv/chat-room/chat-room.git/chatlog_07_17',
    ]
output_csv = '/srv/chat-room/server/private/chatLogs/log_statistics.csv'
output_txt = '/srv/chat-room/server/private/chatLogs/speaking_stats.txt'
output_users_txt = '/srv/chat-room/server/private/chatLogs/duplicate_usernames.txt'

# First, find unique users and note duplicates across all directories
find_unique_users(directories, output_users_txt)

# Then, process logs to gather statistics and speaking counts
count_users_in_logs(directories, output_csv, output_txt)
