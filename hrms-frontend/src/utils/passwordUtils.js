// src/utils/passwordUtils.js
export const checkPasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      label: '',
      color: 'gray',
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      }
    };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label = '';
  let color = '';

  if (score === 0) {
    label = '';
    color = 'gray';
  } else if (score <= 2) {
    label = 'Weak';
    color = 'red';
  } else if (score === 3) {
    label = 'Fair';
    color = 'yellow';
  } else if (score === 4) {
    label = 'Good';
    color = 'blue';
  } else {
    label = 'Strong';
    color = 'green';
  }

  return { score, label, color, checks };
};

export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('At least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('One number');
  }
  if (!/[@$!%*?&#]/.test(password)) {
    errors.push('One special character (@$!%*?&#)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};