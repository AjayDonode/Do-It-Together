// src/components/common/PasswordStrengthMeter.tsx
import React from 'react';
import './PasswordStrengthMeter.css';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (pwd: string): { level: number; label: string; color: string } => {
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

    return {
      level: strength,
      label: labels[strength],
      color: colors[strength]
    };
  };

  if (!password) {
    return null;
  }

  const strength = calculateStrength(password);
  const percentage = (strength.level / 4) * 100;

  return (
    <div className="password-strength-meter">
      <div className="strength-header">
        <span className="strength-label">Password Strength:</span>
        <span className="strength-text" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>

      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: strength.color
          }}
        />
      </div>

      <div className="strength-requirements">
        <div className={`requirement ${password.length >= 8 ? 'met' : ''}`}>
          <span className="check">✓</span> At least 8 characters
        </div>
        <div className={`requirement ${/[A-Z]/.test(password) ? 'met' : ''}`}>
          <span className="check">✓</span> Uppercase letter (A-Z)
        </div>
        <div className={`requirement ${/[0-9]/.test(password) ? 'met' : ''}`}>
          <span className="check">✓</span> Number (0-9)
        </div>
        <div className={`requirement ${/[^A-Za-z0-9]/.test(password) ? 'met' : ''}`}>
          <span className="check">✓</span> Special character (!@#$%^&*)
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
