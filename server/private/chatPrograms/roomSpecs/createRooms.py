import json
import os

# Directory where the room files are stored
directory = "/srv/chat-room/server/private/chatPrograms/roomSpecs/"

# Number of rooms to create
total_rooms = 87

# Parameters for the room files
room_base = {
    "roomName": "the online discussion room",
    "startTime": "",
    "postName": "prompt_test_chat.json",
    "duration": 10,
    "outboundLink": "https://ipz.qualtrics.com/jfe/form/SV_3lVg6EgK5fV78eG",
    "comments": []
}

# Function to determine the botType based on the room id
def get_bot_type(room_id):
    if room_id % 3 == 1:
        return "Alex (Moderator)"
    elif room_id % 3 == 2:
        return "Alex"
    else:
        return ""

# Function to create room files
def create_room_files(directory, total_rooms, room_base):
    if not os.path.exists(directory):
        os.makedirs(directory)
        
    for room_id in range(1, total_rooms + 1):
        room_data = room_base.copy()
        room_data["botType"] = get_bot_type(room_id)
        room_file_path = os.path.join(directory, "pilot_study_{}.json".format(room_id))
        
        with open(room_file_path, 'w') as room_file:
            json.dump(room_data, room_file, indent=2)
        
        print("Created room file: {}".format(room_file_path))

# Create the room files
create_room_files(directory, total_rooms, room_base)
