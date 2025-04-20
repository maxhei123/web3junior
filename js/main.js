// Central state management
const state = {
  mods: [
    {
      title: 'Skyrim Enhanced Graphics',
      description: 'Complete graphics overhaul with next-gen textures and lighting effects',
      category: 'Graphics',
      game: 'Skyrim',
      downloads: '324K',
      image: 'https://picsum.photos/300/200'
    },
    {
      title: 'Ultimate Vehicle Pack',
      description: 'Add 50+ new custom vehicles to your game',
      category: 'Vehicles', 
      game: 'GTA V',
      downloads: '156K',
      image: 'https://picsum.photos/300/201'
    },
    {
      title: 'RTX Shaders Pro',
      description: 'Realistic lighting and shadows for Minecraft',
      category: 'Graphics',
      game: 'Minecraft', 
      downloads: '892K',
      image: 'https://picsum.photos/300/202'
    }
  ],
  handlers: new Map(),
  searchTimeout: null
};

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initMods();
  initSearch();
  initLoginSystem();
  initSignupSystem();
});

// Centralized event handler registration
const addHandler = (element, event, handler) => {
  if (!element || state.handlers.has(`${element}-${event}`)) return;
  element.addEventListener(event, handler);
  state.handlers.set(`${element}-${event}`, handler);
};

// Improved mod rendering with error handling
const renderMods = (modsToRender) => {
  const modsGrid = document.querySelector('.mods-grid');
  if (!modsGrid) return;

  try {
    const fragment = document.createDocumentFragment();
    modsToRender.forEach((mod, index) => {
      if (!mod.title || !mod.image) return; // Skip invalid mods
      fragment.appendChild(createModCard(mod, index));
    });

    modsGrid.innerHTML = '';
    modsGrid.appendChild(fragment);
    setupModInteractions();
  } catch (error) {
    console.error('Error rendering mods:', error);
    modsGrid.innerHTML = '<p class="error-message">Failed to load mods. Please try again.</p>';
  }
};

// Improved mod card creation
const createModCard = (mod, index) => {
  const card = document.createElement('div');
  card.className = 'mod-card';
  card.style.setProperty('--card-index', index);
  
  card.innerHTML = `
    <div class="mod-banner">
      <img loading="lazy" src="${mod.image}" alt="${mod.title}">
      <span class="category">${mod.category}</span>
    </div>
    <div class="mod-info">
      <h3>${mod.title}</h3>
      <p>${mod.description}</p>
      <div class="mod-meta">
        <span class="game">${mod.game}</span>
        <span class="downloads">${mod.downloads} Downloads</span>
      </div>
      <button class="download-btn">Download Mod</button>
    </div>
  `;
  
  return card;
};

// Unified initialization functions
const initMods = () => renderMods(state.mods);

// Improved search initialization
const initSearch = () => {
  const searchInput = document.querySelector('.search-bar input');
  if (!searchInput) return;

  const searchCache = new Map();

  addHandler(searchInput, 'input', (e) => {
    clearTimeout(state.searchTimeout);
    
    state.searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchCache.has(searchTerm)) {
        renderMods(searchCache.get(searchTerm));
        return;
      }

      const filteredMods = state.mods.filter(mod => 
        Object.values(mod).some(val => 
          val.toString().toLowerCase().includes(searchTerm)
        )
      );

      searchCache.set(searchTerm, filteredMods);
      renderMods(filteredMods);
    }, 300);
  });
};

// Improved login system with better session management
const initLoginSystem = () => {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', handleLoginSubmit);
    setupPasswordToggle(form);
  }
  checkAndUpdateLoginState();
};

// Enhanced session management
const checkAndUpdateLoginState = () => {
  const sessionData = JSON.parse(localStorage.getItem('userSession') || '{}');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' && 
                     sessionData.expires > Date.now();

  if (!isLoggedIn && sessionData.expires) {
    // Clear expired session
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userSession');
  }

  updateLoginButtonState(isLoggedIn, sessionData.email);
  return isLoggedIn;
};

// Improved login button state management
const updateLoginButtonState = (isLoggedIn, email) => {
  const loginButtons = document.querySelectorAll('.login-btn');
  loginButtons.forEach(btn => {
    if (isLoggedIn) {
      btn.textContent = `Logout (${email})`;
      btn.classList.add('logged-in');
      btn.onclick = handleLogout;
    } else {
      btn.textContent = 'Login';
      btn.classList.remove('logged-in');
      btn.onclick = () => window.location.href = 'login.html';
    }
  });
};

// New logout handler
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userSession');
  window.location.reload();
};

// Improved login submit handler with better validation
const handleLoginSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('.submit-btn');
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;
  const rememberMe = form.querySelector('input[name="remember"]').checked;
  
  // Clear any previous error states
  clearLoginErrors(form);
  
  if (!email || !password) {
    showFieldErrors(form, { 
      email: !email ? 'Email is required' : '',
      password: !password ? 'Password is required' : ''
    });
    return;
  }
  
  if (!isValidEmail(email)) {
    showFieldErrors(form, { email: 'Please enter a valid email address' });
    return;
  }
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Logging in...</span><div class="loading-dots"></div>';
    
    // Simulate API call with validation
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, this would be an actual API call
        if (!email.includes('@')) {
          reject(new Error('Invalid email format'));
          return;
        }
        if (password.length < 6) {
          reject(new Error('Invalid password'));
          return;
        }
        resolve();
      }, 1000);
    });
    
    // Set session with secure expiry
    const sessionData = {
      email,
      expires: rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (24 * 60 * 60 * 1000), // 30 days if remember me, else 24 hours
      lastActivity: Date.now(),
      sessionId: generateSessionId()
    };
    
    // Store session data securely
    securelyStoreSession(sessionData);
    
    submitBtn.innerHTML = '<span>Success!</span>✓';
    submitBtn.style.background = '#4ecca3';
    
    // Smooth transition to index page
    setTimeout(() => {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.5s ease';
      setTimeout(() => window.location.href = 'index.html', 500);
    }, 1000);
  } catch (error) {
    showLoginError(submitBtn, error.message);
    logFailedAttempt(email); // Track failed attempts for security
  }
};

// New helper for showing login errors
const showLoginError = (submitBtn, message) => {
  submitBtn.disabled = false;
  submitBtn.innerHTML = message;
  submitBtn.style.background = '#ff4444';
  
  setTimeout(() => {
    submitBtn.innerHTML = 'Login';
    submitBtn.style.background = '';
  }, 3000);
};

// Enhanced password visibility toggle
const setupPasswordToggle = (form) => {
  const toggleBtn = form.querySelector('.toggle-password');
  const passwordInput = form.querySelector('#password');
  
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      toggleBtn.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
  }
};

// Optimized event handlers
const setupModInteractions = () => {
  const cards = document.querySelectorAll('.mod-card');
  
  cards.forEach(card => {
    const handleMouseEnter = () => {
      const grid = card.closest('.mods-grid');
      grid?.classList.add('card-hovered');
      cards.forEach(otherCard => {
        if (otherCard !== card && otherCard.closest('.mods-grid') === grid) {
          otherCard.classList.add('card-dimmed');
        }
      });
    };

    const handleMouseLeave = () => {
      const grid = card.closest('.mods-grid');
      grid?.classList.remove('card-hovered');
      cards.forEach(otherCard => otherCard.classList.remove('card-dimmed'));
    };

    const downloadBtn = card.querySelector('.download-btn');
    if (downloadBtn) {
      addHandler(downloadBtn, 'click', (e) => 
        handleDownload(e.target, card.querySelector('h3').textContent)
      );
    }

    addHandler(card, 'mouseenter', handleMouseEnter);
    addHandler(card, 'mouseleave', handleMouseLeave);
  });
};

// Simplified download handler
const handleDownload = (button, modTitle) => {
  if (button.classList.contains('downloading')) return;
  
  button.classList.add('downloading');
  const originalText = button.textContent;
  button.innerHTML = '<span>Downloading...</span><div class="download-progress"></div>';
  
  simulateDownload(button, originalText);
};

// Helper function for download simulation
const simulateDownload = (button, originalText) => {
  const progress = button.querySelector('.download-progress');
  let width = 0;
  
  const downloadInterval = setInterval(() => {
    if (width >= 100) {
      clearInterval(downloadInterval);
      button.innerHTML = 'Downloaded!';
      button.classList.add('downloaded');
      
      setTimeout(() => {
        button.classList.remove('downloading', 'downloaded');
        button.textContent = originalText;
      }, 2000);
      return;
    }
    width += Math.random() * 15;
    progress.style.width = `${Math.min(width, 100)}%`;
  }, 200);
};

// Remove mobile menu setup
const setupMobileMenu = () => {
  // Remove this function entirely
};

// Enhanced login button update
const updateLoginButton = () => {
  const loginBtn = document.querySelector('.login-btn');
  if (!loginBtn) return;

  const sessionData = JSON.parse(localStorage.getItem('userSession') || '{}');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' && 
                     sessionData.expires > Date.now();

  if (!isLoggedIn && sessionData.expires) {
    // Session expired
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userSession');
  }

  loginBtn.textContent = isLoggedIn ? `Logout (${sessionData.email})` : 'Login';
  loginBtn.classList.toggle('logged-in', isLoggedIn);

  loginBtn.addEventListener('click', () => {
    if (isLoggedIn) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userSession');
      window.location.reload();
    } else {
      window.location.href = 'login.html';
    }
  });
};

// Initialize signup system
const initSignupSystem = () => {
  const form = document.getElementById('signupForm');
  if (form) {
    setupPasswordToggles(form);
    setupFormValidation(form);
    form.addEventListener('submit', handleSignupSubmit);
  }
};

// Enhanced password toggles for multiple password fields
const setupPasswordToggles = (form) => {
  const passwordInputs = form.querySelectorAll('.password-input');
  
  passwordInputs.forEach(container => {
    const input = container.querySelector('input[type="password"]');
    const toggle = container.querySelector('.toggle-password');
    
    if (toggle && input) {
      toggle.addEventListener('click', () => {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        toggle.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️';
      });
    }
  });
};

// Password strength checker
const checkPasswordStrength = (password) => {
  const strength = {
    score: 0,
    messages: []
  };

  if (password.length >= 8) strength.score++;
  else strength.messages.push('At least 8 characters');

  if (/[A-Z]/.test(password)) strength.score++;
  else strength.messages.push('At least one uppercase letter');

  if (/[a-z]/.test(password)) strength.score++;
  else strength.messages.push('At least one lowercase letter');

  if (/[0-9]/.test(password)) strength.score++;
  else strength.messages.push('At least one number');

  if (/[^A-Za-z0-9]/.test(password)) strength.score++;
  else strength.messages.push('At least one special character');

  return strength;
};

// Enhanced input validation
const validateInput = (input) => {
  const validationMessage = input.nextElementSibling?.classList.contains('validation-message') 
    ? input.nextElementSibling 
    : input.parentElement.nextElementSibling;

  let isValid = true;
  let message = '';

  switch (input.name) {
    case 'username':
      if (input.value.length < 3) {
        isValid = false;
        message = 'Username must be at least 3 characters long';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(input.value)) {
        isValid = false;
        message = 'Username can only contain letters, numbers, underscores, and hyphens';
      }
      break;
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
      break;
      
    case 'password':
      const strength = checkPasswordStrength(input.value);
      if (strength.score < 3) {
        isValid = false;
        message = strength.messages.join(', ');
      }
      // Update password confirmation validation when password changes
      const confirmInput = document.getElementById('confirmPassword');
      if (confirmInput?.value) {
        validateInput(confirmInput);
      }
      break;
      
    case 'confirmPassword':
      const password = document.getElementById('password');
      if (input.value !== password.value) {
        isValid = false;
        message = 'Passwords do not match';
      }
      break;
  }

  if (validationMessage) {
    validationMessage.textContent = message;
    validationMessage.style.color = isValid ? '#4ecca3' : '#ff4444';
    input.classList.toggle('invalid', !isValid);
    input.classList.toggle('valid', isValid);
  }

  return isValid;
};

// Enhanced signup form submission handler
const handleSignupSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('.submit-btn');
  
  // Generate CSRF token
  const csrfToken = btoa(Math.random().toString(36));
  localStorage.setItem('csrfToken', csrfToken);
  
  // Validate all inputs
  const inputs = form.querySelectorAll('input');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!validateInput(input)) {
      isValid = false;
    }
  });
  
  if (!isValid) {
    const firstError = form.querySelector('.invalid');
    firstError?.focus();
    return;
  }
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Creating Account...</span><div class="loading-dots"></div>';
    
    // Simulate API call with network delay and potential failures
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random failure for testing (10% chance)
        if (Math.random() < 0.1) {
          reject(new Error('Network error. Please try again.'));
          return;
        }
        resolve();
      }, 1500);
    });
    
    // Store user data with better security
    const userData = {
      username: form.username.value,
      email: form.email.value,
      expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      csrfToken
    };
    
    // Encrypt sensitive data (simulate)
    const encryptedData = btoa(JSON.stringify(userData));
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userSession', encryptedData);
    
    // Success animation
    submitBtn.innerHTML = '<span>Success!</span>✨';
    submitBtn.style.background = '#4ecca3';
    
    // Redirect with smooth transition
    setTimeout(() => {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.5s ease';
      setTimeout(() => window.location.href = 'index.html', 500);
    }, 1000);
  } catch (error) {
    submitBtn.innerHTML = `Sign Up Failed: ${error.message}`;
    submitBtn.style.background = '#ff4444';
    
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Create Account';
      submitBtn.style.background = '';
    }, 3000);
  }
};

// Setup form validation
const setupFormValidation = (form) => {
  if (!form) return;

  const inputs = form.querySelectorAll('input');
  const passwordInputs = form.querySelectorAll('input[type="password"]');
  
  inputs.forEach(input => {
    input.addEventListener('input', () => validateInput(input));
    input.addEventListener('blur', () => validateInput(input));
  });

  // Add password strength meter
  passwordInputs.forEach(input => {
    const meter = document.createElement('div');
    meter.className = 'password-strength-meter';
    input.parentElement.appendChild(meter);

    input.addEventListener('input', () => {
      const strength = checkPasswordStrength(input.value);
      meter.style.setProperty('--strength', (strength.score / 5) * 100 + '%');
      meter.style.backgroundColor = `hsl(${strength.score * 30}, 70%, 45%)`;
    });
  });
};

// Helper functions for login system
const clearLoginErrors = (form) => {
  form.querySelectorAll('.error-message').forEach(el => el.remove());
  form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
};

const showFieldErrors = (form, errors) => {
  Object.entries(errors).forEach(([field, message]) => {
    if (!message) return;
    const input = form.querySelector(`#${field}`);
    if (!input) return;
    
    input.classList.add('field-error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
  });
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateSessionId = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const securelyStoreSession = (sessionData) => {
  try {
    // In a real app, you might want to encrypt this data
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    
    // Store last activity time for session timeout
    localStorage.setItem('lastActivity', Date.now().toString());
  } catch (error) {
    console.error('Failed to store session:', error);
    // Fallback to session storage if localStorage is full
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userSession', JSON.stringify(sessionData));
  }
};

const logFailedAttempt = (email) => {
  const attempts = JSON.parse(sessionStorage.getItem('failedAttempts') || '{}');
  attempts[email] = (attempts[email] || 0) + 1;
  
  if (attempts[email] >= 5) {
    // Implement temporary lockout
    const lockoutTime = Date.now() + (15 * 60 * 1000); // 15 minutes
    attempts[`${email}_lockout`] = lockoutTime;
  }
  
  sessionStorage.setItem('failedAttempts', JSON.stringify(attempts));
};
