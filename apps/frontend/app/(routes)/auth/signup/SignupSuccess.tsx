import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignupSuccess() {
  const router = useRouter();

  return (
    <div className="text-center space-y-4 animate-scale-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
        <Check size={32} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">สมัครสมาชิกสำเร็จ</h3>
        <p className="text-gray-300 text-sm">บัญชีของคุณถูกสร้างแล้ว ระบบจะนำคุณไปยังคลังนิยาย</p>
      </div>
      <button
        onClick={() => router.push('/stories')}
        className="w-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        ไปหน้าคลังนิยาย
      </button>
    </div>
  );
}
