import AuthLayout from '@ui/AuthLayout';

export default function SignupPage() {
  return (
    <AuthLayout title="สร้างบัญชีใหม่" subtitle="เริ่มต้นผจญภัยใน TalePick">
      <div className="space-y-4 text-neutral-100">
        <p className="text-sm text-gray-200">Placeholder for migrated Signup content.</p>
        <div className="space-y-2">
          <input
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-400 focus:border-white/30"
            placeholder="อีเมล"
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-400 focus:border-white/30"
            placeholder="รหัสผ่าน"
            type="password"
          />
          <button className="w-full rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-black transition hover:bg-white">
            สมัครสมาชิก
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
