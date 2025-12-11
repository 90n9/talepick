import React from 'react';
import { Coffee, Server, Film, Code, Heart, Sparkles } from 'lucide-react';

export const Support: React.FC = () => {
  return (
    <div className='pt-24 pb-20 px-4 min-h-screen animate-fade-in'>
      <div className='max-w-4xl mx-auto text-center'>
        <h2 className='text-4xl font-serif font-bold text-white mb-6'>ขับเคลื่อนเรื่องราว</h2>
        <p className='text-xl text-gray-300 mb-12 max-w-2xl mx-auto'>
          Chronos เป็นแพลตฟอร์มอิสระ การสนับสนุนของคุณช่วยให้เราสร้างสรรค์วิดีโอแบบ Interactive
          คุณภาพสูง ดูแลเซิร์ฟเวอร์ และพัฒนาฟีเจอร์ใหม่ๆ ต่อไป
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
          <a
            href='#'
            className='group block p-8 rounded-2xl bg-gradient-to-br from-[#2937f0] to-[#9f1ae2] text-white hover:scale-[1.02] transition-transform shadow-lg relative overflow-hidden'
          >
            <div className='relative z-10'>
              <Heart size={40} className='mb-4 text-white' />
              <h3 className='text-2xl font-bold mb-2'>สมัครสมาชิกรายเดือน</h3>
              <p className='opacity-90'>
                เข้าร่วมเป็นสมาชิกเพื่อรับชมเบื้องหลังสุดพิเศษและการเข้าถึงก่อนใคร
              </p>
            </div>
            <div className='absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700' />
          </a>

          <a
            href='#'
            className='group block p-8 rounded-2xl bg-[#00C9A7] text-black hover:scale-[1.02] transition-transform shadow-lg relative overflow-hidden'
          >
            <div className='relative z-10'>
              <Coffee size={40} className='mb-4 text-black' />
              <h3 className='text-2xl font-bold mb-2'>เลี้ยงกาแฟเราสักแก้ว</h3>
              <p className='opacity-80 font-medium'>
                บริจาคครั้งเดียวเพื่อเติมพลังคาเฟอีนให้นักพัฒนาและนักเขียนของเรา
              </p>
            </div>
          </a>
        </div>

        <h3 className='text-2xl font-bold text-white mb-8'>เงินสนับสนุนนำไปใช้อะไรบ้าง?</h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
          {[
            {
              icon: Film,
              title: 'การผลิต',
              desc: 'นักแสดง เครื่องแต่งกาย และฉากสำหรับเรื่องราวใหม่',
            },
            { icon: Server, title: 'โฮสติ้ง', desc: 'เซิร์ฟเวอร์สตรีมมิ่งวิดีโอความเร็วสูง' },
            { icon: Code, title: 'พัฒนา', desc: 'ฟีเจอร์แพลตฟอร์มและการแก้ไขบั๊ก' },
            { icon: Sparkles, title: 'AI', desc: 'พัฒนาความสามารถของเทพพยากรณ์และระบบเล่าเรื่อง' },
          ].map((item, i) => (
            <div key={i} className='p-6 rounded-xl bg-white/5 border border-white/5 text-center'>
              <div className='flex justify-center mb-4 text-primary'>
                <item.icon size={32} />
              </div>
              <h4 className='font-bold text-white mb-2'>{item.title}</h4>
              <p className='text-xs text-gray-400'>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
