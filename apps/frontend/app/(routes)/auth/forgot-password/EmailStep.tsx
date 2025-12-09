import type { FormEvent } from 'react';
import { Mail, Send } from 'lucide-react';

type EmailStepProps = {
  email: string;
  isLoading: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function EmailStep({ email, isLoading, error, onChange, onSubmit }: EmailStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-slide-up-fade">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </div>
      )}
      <div className="relative group">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" size={18} />
        <input
          type="email"
          required
          placeholder="ที่อยู่อีเมลของคุณ"
          value={email}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>รับรหัส OTP</span>
            <Send size={18} />
          </>
        )}
      </button>
    </form>
  );
}
