export const getPasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return 0;
  if (password.length > 7) score += 1;
  if (password.length > 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

export const getStrengthLabel = (strength: number) => {
  if (strength === 0) return '';
  if (strength < 3) return 'อ่อน';
  if (strength < 4) return 'ปานกลาง';
  return 'แข็งแรง';
};

export const getStrengthClass = (strength: number) => {
  if (strength < 3) return 'bg-red-500';
  if (strength < 4) return 'bg-yellow-500';
  return 'bg-green-500';
};
