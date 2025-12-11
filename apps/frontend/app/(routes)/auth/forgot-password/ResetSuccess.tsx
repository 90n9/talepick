import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResetSuccess() {
  const router = useRouter();

  return (
    <div className='text-center animate-scale-in space-y-4'>
      <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-2 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]'>
        <CheckCircle size={32} />
      </div>
      <h3 className='text-xl font-bold text-white'>สำเร็จ!</h3>
      <p className='text-gray-400 text-sm'>
        รหัสผ่านของคุณถูกเปลี่ยนแปลงเรียบร้อยแล้ว <br />
        คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
      </p>
      <button
        onClick={() => router.push('/auth/login')}
        className='w-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-white font-bold py-3 rounded-lg transition-all'
      >
        ไปหน้าเข้าสู่ระบบ
      </button>
    </div>
  );
}
