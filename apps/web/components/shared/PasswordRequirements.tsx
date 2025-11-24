'use client';

import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  test: (pwd: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'Mínimo 8 caracteres', test: (pwd: string) => pwd.length >= 8 },
  { label: 'Una mayúscula', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: 'Una minúscula', test: (pwd: string) => /[a-z]/.test(pwd) },
  { label: 'Un número', test: (pwd: string) => /[0-9]/.test(pwd) },
  {
    label: 'Un símbolo especial (!@#$%^&*...)',
    test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
];

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  if (!password) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        Requisitos de contraseña:
      </p>
      <ul className="space-y-1">
        {passwordRequirements.map((req) => {
          const passed = req.test(password);
          return (
            <li key={req.label} className="flex items-center gap-2 text-sm">
              {passed ? (
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span
                className={passed ? 'text-foreground' : 'text-muted-foreground'}
              >
                {req.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
