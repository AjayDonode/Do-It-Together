// src/components/common/FormField.tsx
import React from 'react';
import { IonItem, IonLabel, IonInput, IonTextarea, IonIcon, IonText } from '@ionic/react';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import './FormField.css';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: string;
  helperText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  icon,
  helperText
}) => {
  const isValid = value && !error;
  const hasError = !!error;

  return (
    <div className={`form-field ${hasError ? 'error' : ''} ${isValid ? 'valid' : ''}`}>
      <div className="custom-label">
        {label} {required && <span className="required">*</span>}
      </div>
      <IonItem className="form-item" lines="none">
        {type === 'textarea' ? (
          <IonTextarea
            value={value}
            onIonChange={(e) => onChange(e.detail.value || '')}
            placeholder={placeholder}
            disabled={disabled}
            className="form-input"
            autoGrow={true}
          />
        ) : (
          <IonInput
            type={type as 'text' | 'email' | 'password' | 'tel' | 'number'}
            value={value}
            onIonChange={(e) => onChange(e.detail.value || '')}
            placeholder={placeholder}
            disabled={disabled}
            className="form-input"
            clearInput
          />
        )}
        {isValid && <IonIcon icon={checkmarkCircle} className="icon-valid" slot="end" />}
        {hasError && <IonIcon icon={closeCircle} className="icon-error" slot="end" />}
      </IonItem>

      {helperText && !hasError && (
        <p className="helper-text">{helperText}</p>
      )}

      {hasError && (
        <IonText className="error-text">
          <p>{error}</p>
        </IonText>
      )}
    </div>
  );
};

export default FormField;
