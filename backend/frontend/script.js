// Update password strength meter and cracking times
document.getElementById('passwordInput').addEventListener('input', async function () {
  const password = this.value;

  if (!password) {
    // Reset UI when password field is empty
    document.getElementById('strengthBar').style.width = '0%';
    document.getElementById('bruteForceTime').textContent = '-';
    document.getElementById('dictionaryTime').textContent = '-';
    document.getElementById('onlineTime').textContent = '-';
    document.getElementById('breachResult').classList.remove('visible');
    document.getElementById('generatedPassword').classList.remove('visible');
    return;
  }

  // Call backend to analyze password
  try {
    const response = await fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();

    // Update strength meter
    const strengthBar = document.getElementById('strengthBar');
    strengthBar.style.width = `${Math.min(data.entropy, 100)}%`;
    
    // Set color based on entropy
    let color;
    if (data.entropy < 40) {
      color = '#e74c3c'; // Red for weak
    } else if (data.entropy < 60) {
      color = '#f39c12'; // Orange for medium
    } else if (data.entropy < 80) {
      color = '#3498db'; // Blue for strong
    } else {
      color = '#2ecc71'; // Green for very strong
    }
    
    strengthBar.style.backgroundColor = color;
    
    // Update cracking times
    const crackingTimes = data.cracking_times;
    document.getElementById('bruteForceTime').textContent = crackingTimes.brute_force;
    document.getElementById('dictionaryTime').textContent = crackingTimes.dictionary;
    document.getElementById('onlineTime').textContent = crackingTimes.online;
    
    // Update background gradient based on password strength
    if (data.entropy > 0) {
      // Only update color for non-empty passwords
      updateBackgroundGradient(data.entropy);
    }
  } catch (error) {
    console.error('Error analyzing password:', error);
  }
});

// Function to update background gradient based on password strength
function updateBackgroundGradient(entropy) {
  let colors;
  
  if (entropy < 40) {
    // Weak - red/orange theme
    colors = ['#0f0c29', '#8B0000', '#800000'];
  } else if (entropy < 60) {
    // Medium - orange/yellow theme
    colors = ['#1a0f3b', '#3E2E0E', '#4B371C'];
  } else if (entropy < 80) {
    // Strong - blue theme
    colors = ['#0f0c29', '#24243e', '#302b63'];
  } else {
    // Very strong - green/blue theme
    colors = ['#0B3B2E', '#0B4F3B', '#0f0c29'];
  }
  
  document.body.style.backgroundImage = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
}

// Check breach history
document.getElementById('checkBreach').addEventListener('click', async function () {
  const password = document.getElementById('passwordInput').value;
  
  if (!password) {
    document.getElementById('breachResult').textContent = 'Please enter a password to check.';
    document.getElementById('breachResult').style.backgroundColor = '#fffbe6'; // Light yellow
    document.getElementById('breachResult').style.color = '#ad8b00'; // Dark yellow
    document.getElementById('breachResult').classList.add('visible');
    return;
  }

  // Show loading state
  document.getElementById('breachResult').textContent = 'Checking breach history...';
  document.getElementById('breachResult').style.backgroundColor = '#e6f7ff'; // Light blue
  document.getElementById('breachResult').style.color = '#1890ff'; // Blue
  document.getElementById('breachResult').classList.add('visible');

  try {
    // Call backend to check breach history
    const response = await fetch('http://127.0.0.1:5000/check_breach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();

    // Update breach result
    const breachResult = document.getElementById('breachResult');
    if (data.breached) {
      breachResult.textContent = '⚠️ This password has been found in data breaches! Please change it immediately.';
      breachResult.style.backgroundColor = '#fff1f0'; // Light red
      breachResult.style.color = '#cf1322'; // Dark red
      breachResult.style.borderLeftColor = '#ff4d4f';
    } else {
      breachResult.textContent = ' Good news! This password hasn\'t been found in known data breaches.';
      breachResult.style.backgroundColor = '#f6ffed'; // Light green
      breachResult.style.color = '#389e0d'; // Dark green
      breachResult.style.borderLeftColor = '#52c41a';
    }
  } catch (error) {
    console.error('Error checking breach:', error);
    document.getElementById('breachResult').textContent = 'Failed to check breach history. Please try again.';
    document.getElementById('breachResult').style.backgroundColor = '#fff1f0'; // Light red
    document.getElementById('breachResult').style.color = '#cf1322'; // Dark red
  }
});

// Generate secure password
document.getElementById('generatePassword').addEventListener('click', async function () {
  const userPassword = document.getElementById('passwordInput').value();
  
  // Show loading state
  document.getElementById('generatedPassword').textContent = 'Generating secure password...';
  document.getElementById('generatedPassword').style.backgroundColor = '#e6f7ff'; // Light blue
  document.getElementById('generatedPassword').style.color = '#1890ff'; // Blue
  document.getElementById('generatedPassword').classList.add('visible');

  try {
    // Call backend to generate a secure password
    const response = await fetch('http://127.0.0.1:5000/generate_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: userPassword })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();

    // Update generated password result
    const generatedPassword = document.getElementById('generatedPassword');
    generatedPassword.innerHTML = `
      <strong>Generated Password:</strong><br>
      <span class="password-text">${data.password}</span>
      <button id="copyPassword" class="copy-button">Copy</button>
    `;
    generatedPassword.style.backgroundColor = '#f6ffed'; // Light green
    generatedPassword.style.color = '#389e0d'; // Dark green
    generatedPassword.style.borderLeftColor = '#52c41a';

    // Add event listener to copy button
    document.getElementById('copyPassword').addEventListener('click', function() {
      navigator.clipboard.writeText(data.password)
        .then(() => {
          this.textContent = 'Copied!';
          setTimeout(() => {
            this.textContent = 'Copy';
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    });
  } catch (error) {
    console.error('Error generating password:', error);
    document.getElementById('generatedPassword').textContent = 'Failed to generate password. Please try again.';
    document.getElementById('generatedPassword').style.backgroundColor = '#fff1f0'; // Light red
    document.getElementById('generatedPassword').style.color = '#cf1322'; // Dark red
  }
});

// Add some initial content
window.addEventListener('load', function() {
  document.getElementById('passwordEvolution').innerHTML = `
    <strong>Password Tips:</strong>
    <ul>
      <li>Use at least 12 characters</li>
      <li>Mix uppercase, lowercase, numbers, and symbols</li>
      <li>Avoid common patterns (123, abc)</li>
      <li>Don't use personal information</li>
    </ul>
  `;
  
  // Add random movements to particles
  const particles = document.querySelectorAll('.particle');
  particles.forEach((particle, index) => {
    // Randomize starting positions
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.left = `${Math.random() * 100}%`;
    
    // Create unique animation by adjusting animation properties
    particle.style.animationDuration = `${15 + Math.random() * 15}s`;
    particle.style.animationDelay = `${index * 0.5}s`;
    particle.style.width = `${30 + Math.random() * 50}px`;
    particle.style.height = particle.style.width;
    
    // Add subtle opacity and size variations
    particle.style.opacity = `${0.02 + Math.random() * 0.03}`;
  });
});

// Fix for the generatePassword function
document.getElementById('generatePassword').addEventListener('click', async function () {
  const userPassword = document.getElementById('passwordInput').value;
  
  // Rest of the function remains the same...
});

// Generate secure password
document.getElementById('generatePassword').addEventListener('click', async function () {
  const userPassword = document.getElementById('passwordInput').value;
  
  // Show loading state
  document.getElementById('generatedPassword').textContent = 'Generating secure password...';
  document.getElementById('generatedPassword').style.backgroundColor = '#e6f7ff'; // Light blue
  document.getElementById('generatedPassword').style.color = '#1890ff'; // Blue
  document.getElementById('generatedPassword').classList.add('visible');

  try {
    // Call backend to generate a secure password
    const response = await fetch('http://127.0.0.1:5000/generate_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: userPassword })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();

    // Update generated password result
    const generatedPassword = document.getElementById('generatedPassword');
    generatedPassword.innerHTML = `
      <strong>Generated Password:</strong><br>
      <span class="password-text">${data.password}</span>
      <button id="copyPassword" class="copy-button">Copy</button>
    `;
    generatedPassword.style.backgroundColor = '#f6ffed'; // Light green
    generatedPassword.style.color = '#389e0d'; // Dark green

    // Add event listener to copy button
    document.getElementById('copyPassword').addEventListener('click', function() {
      navigator.clipboard.writeText(data.password)
        .then(() => {
          this.textContent = 'Copied!';
          setTimeout(() => {
            this.textContent = 'Copy';
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    });
  } catch (error) {
    console.error('Error generating password:', error);
    document.getElementById('generatedPassword').textContent = 'Failed to generate password. Please try again.';
    document.getElementById('generatedPassword').style.backgroundColor = '#fff1f0'; // Light red
    document.getElementById('generatedPassword').style.color = '#cf1322'; // Dark red
  }
});


