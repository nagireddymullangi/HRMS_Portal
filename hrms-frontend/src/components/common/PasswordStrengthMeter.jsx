// src/components/common/PasswordStrengthMeter.jsx
import { FiCheck, FiX } from 'react-icons/fi';
import { checkPasswordStrength } from '../../utils/passwordUtils';

const PasswordStrengthMeter = ({ password, showChecklist = true }) => {
  const { score, label, color, checks } = checkPasswordStrength(password);

  const colorClasses = {
    gray: 'bg-gray-300',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  const textColorClasses = {
    gray: 'text-gray-500',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-600">
            Password Strength
          </span>
          <span className={`text-xs font-semibold ${
            textColorClasses[color]}`}>
            {label}
          </span>
        </div>
        <div className="flex gap-1 h-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all ${
                i <= score ? colorClasses[color] : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {/* Checklist */}
      {showChecklist && (
        <div className="grid grid-cols-2 gap-1 mt-3">
          {[
            { key: 'length', label: '8+ characters' },
            { key: 'uppercase', label: 'Uppercase' },
            { key: 'lowercase', label: 'Lowercase' },
            { key: 'number', label: 'Number' },
            { key: 'special', label: 'Special char' },
          ].map((check) => (
            <div key={check.key}
                 className={`flex items-center gap-1 text-xs ${
                   checks[check.key]
                     ? 'text-green-600'
                     : 'text-gray-400'}`}>
              {checks[check.key] ? (
                <FiCheck className="h-3 w-3" />
              ) : (
                <FiX className="h-3 w-3" />
              )}
              <span>{check.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;