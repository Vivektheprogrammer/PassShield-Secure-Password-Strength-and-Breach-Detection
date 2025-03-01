#include <stdio.h>
#include <math.h>
#include <string.h>
#include <ctype.h>

// Function to calculate password entropy
double calculate_entropy(const char *password) {
    int length = strlen(password);
    int char_set_size = 0;

    // Determine character set size
    int has_lower = 0, has_upper = 0, has_digit = 0, has_symbol = 0;
    for (int i = 0; i < length; i++) {
        if (islower(password[i])) has_lower = 1;
        else if (isupper(password[i])) has_upper = 1;
        else if (isdigit(password[i])) has_digit = 1;
        else has_symbol = 1;
    }

    if (has_lower) char_set_size += 26;
    if (has_upper) char_set_size += 26;
    if (has_digit) char_set_size += 10;
    if (has_symbol) char_set_size += 32; // Common symbols

    return length * log2(char_set_size);
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage: %s <password>\n", argv[0]);
        return 1;
    }

    const char *password = argv[1];
    double entropy = calculate_entropy(password);
    printf("%f", entropy);  // Output entropy to stdout
    return 0;
}
