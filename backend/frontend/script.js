// Update password strength meter and cracking times
document.getElementById('passwordInput').addEventListener('input', async function () {
  const password = this.value;

  // Call backend to analyze password
  const response = await fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
  });
  const data = await response.json();

  // Update strength meter
  const strengthBar = document.getElementById('strengthBar');
  strengthBar.style.width = `${Math.min(data.entropy, 100)}%`;
  strengthBar.style.backgroundColor = data.entropy < 50 ? 'red' : data.entropy < 75 ? 'orange' : 'green';

  // Update cracking times
  const crackingTimes = data.cracking_times;
  document.getElementById('bruteForceTime').textContent = crackingTimes.brute_force;
  document.getElementById('dictionaryTime').textContent = crackingTimes.dictionary;
  document.getElementById('onlineTime').textContent = crackingTimes.online;
});

// Check breach history
document.getElementById('checkBreach').addEventListener('click', async function () {
  const password = document.getElementById('passwordInput').value;

  // Call backend to check breach history
  const response = await fetch('http://127.0.0.1:5000/check_breach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
  });
  const data = await response.json();

  document.getElementById('breachResult').textContent = data.breached ? 'Password breached!' : 'Password safe.';
});

// Generate secure password
document.getElementById('generatePassword').addEventListener('click', async function () {
  const userPassword = document.getElementById('passwordInput').value;

  // Call backend to generate a secure password
  const response = await fetch('http://127.0.0.1:5000/generate_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: userPassword })
  });
  const data = await response.json();

  document.getElementById('generatedPassword').textContent = `Generated Password: ${data.password}`;
});