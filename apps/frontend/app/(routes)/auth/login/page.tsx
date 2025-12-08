import AuthLayout from '@ui/AuthLayout';

export default function LoginPage() {
  return (
    <AuthLayout title="เข้าสู่ระบบ" subtitle="กลับมาสานต่อการผจญภัยของคุณ">
      <div className="space-y-4 text-neutral-100">
        <p className="text-sm text-gray-200">Placeholder for migrated Login content.</p>
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
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
