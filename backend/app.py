from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import hashlib
import requests
import random
import string

app = Flask(__name__)
CORS(app)

# Function to calculate password entropy
def calculate_entropy(password):
    length = len(password)
    char_set_size = 0

    # Determine character set size
    has_lower = any(c.islower() for c in password)
    has_upper = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_symbol = any(not c.isalnum() for c in password)

    if has_lower: char_set_size += 26
    if has_upper: char_set_size += 26
    if has_digit: char_set_size += 10
    if has_symbol: char_set_size += 32  # Common symbols

    return length * math.log2(char_set_size) if char_set_size > 0 else 0

# Function to estimate cracking time
def estimate_cracking_time(password):
    entropy = calculate_entropy(password)
    possible_combinations = 2 ** entropy  # Total possible combinations

    # Realistic attack speeds (guesses per second)
    speeds = {
        "brute_force": 6e8,  # 600 million guesses per second (high-end processor)
        "dictionary": 400e6,  # 400 million guesses per second (dictionary attack)
        "online": 1000000000,        # 1 billion guesses per second (online attack)
    }

    cracking_times = {}
    for attack, speed in speeds.items():
        time_seconds = possible_combinations / speed

        # Adjust for common patterns (e.g., sequential numbers, repeated characters)
        if is_common_pattern(password):
            time_seconds /= 1000  # Reduce cracking time significantly for common patterns

        cracking_times[attack] = format_time(time_seconds)

    return cracking_times

# Function to check for common patterns
def is_common_pattern(password):
    # Check for sequential numbers (e.g., 123, 456)
    if any(str(i) * 3 in password for i in range(0, 8)):
        return True

    # Check for repeated characters (e.g., aaa, 111)
    if any(c * 3 in password for c in password):
        return True

    # Check for common keyboard patterns (e.g., qwerty, asdf)
    common_keyboard_patterns = ["qwerty", "asdf", "zxcv", "12345", "123456"]
    if any(pattern in password.lower() for pattern in common_keyboard_patterns):
        return True

    return False

# Function to format time into human-readable format
def format_time(seconds):
    if seconds < 1:
        return "less than a second"
    elif seconds < 60:
        return f"{int(seconds)} seconds"
    elif seconds < 3600:
        return f"{int(seconds / 60)} minutes"
    elif seconds < 86400:
        return f"{int(seconds / 3600)} hours"
    elif seconds < 31536000:
        return f"{int(seconds / 86400)} days"
    else:
        return f"{int(seconds / 31536000)} years"

# Password strength analysis endpoint
@app.route('/analyze', methods=['POST'])
def analyze_password():
    data = request.json
    password = data.get('password', '')

    entropy = calculate_entropy(password)
    cracking_times = estimate_cracking_time(password)

    return jsonify({
        'entropy': entropy,
        'cracking_times': cracking_times
    })

# Breach check endpoint
@app.route('/check_breach', methods=['POST'])
def check_breach():
    data = request.json
    password = data.get('password', '')

    # Hash the password using SHA-1
    sha1_password = hashlib.sha1(password.encode()).hexdigest().upper()
    prefix, suffix = sha1_password[:5], sha1_password[5:]

    # Query Have I Been Pwned API
    url = f'https://api.pwnedpasswords.com/range/{prefix}'
    response = requests.get(url)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to check breach history.'}), 500

    breached = any(line.startswith(suffix) for line in response.text.splitlines())
    return jsonify({'breached': breached})

# Secure password generator endpoint
@app.route('/generate_password', methods=['POST'])
def generate_password():
    data = request.json
    user_password = data.get('password', '')

    # Define the character set
    charset = string.ascii_letters + string.digits + '!@#$%^&*'

    # Ensure the password meets the minimum length requirement
    min_length = 12
    if len(user_password) < min_length:
        # Add random characters to meet the minimum length
        additional_chars = random.choices(charset, k=min_length - len(user_password))
        new_password = user_password + ''.join(additional_chars)
    else:
        # Use the user's password as a base
        new_password = user_password

    # Shuffle the password to mix characters
    password_list = list(new_password)
    random.shuffle(password_list)
    new_password = ''.join(password_list)

    # Ensure the password contains at least one uppercase letter, one lowercase letter, one digit, and one symbol
    def meets_complexity(password):
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_symbol = any(not c.isalnum() for c in password)
        return has_upper and has_lower and has_digit and has_symbol

    # If the password doesn't meet complexity requirements, add missing character types
    while not meets_complexity(new_password):
        if not any(c.isupper() for c in new_password):
            new_password += random.choice(string.ascii_uppercase)
        if not any(c.islower() for c in new_password):
            new_password += random.choice(string.ascii_lowercase)
        if not any(c.isdigit() for c in new_password):
            new_password += random.choice(string.digits)
        if not any(not c.isalnum() for c in new_password):
            new_password += random.choice('!@#$%^&*')

    return jsonify({'password': new_password})

if __name__ == '__main__':
    app.run(debug=True)