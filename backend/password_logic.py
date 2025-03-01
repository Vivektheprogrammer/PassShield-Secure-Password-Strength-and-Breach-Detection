import subprocess
import os

def calculate_entropy(password):
    try:
        # Call the .exe file with the password as an argument
        result = subprocess.run(
            ['./password_logic.exe', password],  # Path to the .exe file
            capture_output=True,
            text=True,
            check=True
        )
        # Get the output from the .exe file
        return float(result.stdout.strip())
    except subprocess.CalledProcessError as e:
        print(f"Error calling .exe file: {e}")
        return 0.0  # Return a default value in case of error

def suggest_improvements(password):
    suggestions = []
    if len(password) < 8: suggestions.append('Increase length to at least 8 characters.')
    if not any(c.isupper() for c in password): suggestions.append('Add uppercase letters.')
    if not any(c.isdigit() for c in password): suggestions.append('Add numbers.')
    if not any(not c.isalnum() for c in password): suggestions.append('Add symbols.')
    return suggestions if suggestions else ['Password is strong!']