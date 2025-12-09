import type { FormEvent } from 'react';
import { CheckCircle, Lock } from 'lucide-react';
import { getStrengthClass } from '@lib/password-utils';

type NewPasswordStepProps = {
  newPassword: string;
  confirmPassword: string;
  strength: number;
  isValid: boolean;
  isLoading: boolean;
  message: string | null;
  error: string | null;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function NewPasswordStep({
  newPassword,
  confirmPassword,
  strength,
  isValid,
  isLoading,
  message,
  error,
  onPasswordChange,
  onConfirmChange,
  onSubmit,
}: NewPasswordStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-slide-up-fade">
      {(message || error) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message ? 'border-green-500/30 bg-green-500/10 text-green-100' : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
          role="alert"
        >
          {message || error}
        </div>
      )}
      <div className="relative group">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary" size={18} />
        <input
          type="password"
          required
          placeholder="รหัสผ่านใหม่"
          value={newPassword}
          onChange={(event) => onPasswordChange(event.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        />
        {newPassword && (
          <div className="absolute -bottom-5 left-0 w-full flex items-center gap-2 px-1">
            <div className="flex-grow h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 ${getStrengthClass(strength)}`} style={{ width: `${(strength / 5) * 100}%` }} />
            </div>
            <span className="text-[10px] text-gray-400">ความปลอดภัย</span>
          </div>
        )}
      </div>
      <div className="relative group pt-2">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary" size={18} />
        <input
          type="password"
          required
          placeholder="ยืนยันรหัสผ่านใหม่"
          value={confirmPassword}
          onChange={(event) => onConfirmChange(event.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>เปลี่ยนรหัสผ่าน</span>
            <CheckCircle size={18} />
          </>
        )}
      </button>
    </form>
  );
}
