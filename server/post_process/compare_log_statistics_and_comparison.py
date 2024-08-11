import csv
import os

def extract_filename(file_path):
    return os.path.basename(file_path)

def compare_log4_files(comparison_csv, log_statistics_csv, output_missing_in_comparison, output_missing_in_log_statistics):
    # Read log_statistics.csv and collect log4 filenames
    log_statistics_log4 = set()
    with open(log_statistics_csv, 'r') as csvfile:
        csvreader = csv.reader(csvfile)
        header = next(csvreader)
        for row in csvreader:
            log_statistics_log4.add(row[4])  # The log4 filename is in the 5th column (index 4)

    # Read comparison.csv and collect log4 filenames
    comparison_log4 = set()
    with open(comparison_csv, 'r') as csvfile:
        csvreader = csv.reader(csvfile)
        header = next(csvreader)
        for row in csvreader:
            log4_filename = extract_filename(row[2])  # The log4 file path is in the 3rd column (index 2)
            comparison_log4.add(log4_filename)

    # Find log4 files in log_statistics.csv but not in comparison.csv
    missing_in_comparison = log_statistics_log4 - comparison_log4
    with open(output_missing_in_comparison, 'w') as txtfile:
        for log in missing_in_comparison:
            txtfile.write(log + '\n')

    # Find log4 files in comparison.csv but not in log_statistics.csv
    missing_in_log_statistics = comparison_log4 - log_statistics_log4
    with open(output_missing_in_log_statistics, 'w') as txtfile:
        for log in missing_in_log_statistics:
            txtfile.write(log + '\n')

if __name__ == "__main__":
    comparison_csv = '/srv/chat-room/chat-room.git/comparison.csv'
    log_statistics_csv = '/srv/chat-room/server/private/chatLogs/log_statistics.csv'
    output_missing_in_comparison = '/srv/chat-room/server/private/chatLogs/missing_in_comparison.txt'
    output_missing_in_log_statistics = '/srv/chat-room/server/private/chatLogs/missing_in_log_statistics.txt'

    compare_log4_files(comparison_csv, log_statistics_csv, output_missing_in_comparison, output_missing_in_log_statistics)

    print("Comparison completed. Results saved to missing_in_comparison.txt and missing_in_log_statistics.txt.")
