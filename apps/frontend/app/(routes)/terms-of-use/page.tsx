import { APP_NAME } from '@lib/constants';
import { AlertCircle, FileText, Gavel, Shield, UserCheck } from 'lucide-react';

export default function TermsOfUsePage() {
  return (
    <div className='min-h-screen px-4 pb-20 pt-24 animate-fade-in'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-16 text-center'>
          <div className='mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm'>
            <FileText size={32} className='text-gray-300' />
          </div>
          <h1 className='mb-4 text-4xl font-serif font-bold text-white md:text-5xl'>
            ข้อตกลงการใช้งาน
          </h1>
          <p className='text-gray-400'>แก้ไขล่าสุด: 24 ตุลาคม 2024</p>
        </div>

        <div className='space-y-12 rounded-2xl border border-white/10 bg-surface/30 p-8 shadow-2xl backdrop-blur-md md:p-12'>
          <section className='space-y-4'>
            <h2 className='flex items-center gap-3 text-2xl font-bold text-white'>
              <Shield className='text-primary' size={24} />
              1. การยอมรับข้อตกลง
            </h2>
            <p className='leading-relaxed text-gray-300'>
              ยินดีต้อนรับสู่ {APP_NAME} (&ldquo;แพลตฟอร์ม&rdquo;)
              การเข้าถึงหรือใช้งานแพลตฟอร์มของเรา
              แสดงว่าคุณยอมรับและตกลงที่จะปฏิบัติตามข้อกำหนดและเงื่อนไขเหล่านี้
              หากคุณไม่เห็นด้วยกับส่วนหนึ่งส่วนใดของข้อกำหนด กรุณาหยุดใช้งานแพลตฟอร์มทันที
            </p>
          </section>

          <div className='h-px w-full bg-white/5' />

          <section className='space-y-4'>
            <h2 className='flex items-center gap-3 text-2xl font-bold text-white'>
              <UserCheck className='text-secondary' size={24} />
              2. บัญชีผู้ใช้
            </h2>
            <ul className='ml-2 list-disc list-inside space-y-2 text-gray-300'>
              <li>คุณต้องมีอายุอย่างน้อย 13 ปีจึงจะใช้งานแพลตฟอร์มนี้ได้</li>
              <li>คุณมีหน้าที่รับผิดชอบในการรักษาความปลอดภัยของรหัสผ่านและบัญชีของคุณ</li>
              <li>ข้อมูลที่คุณให้ในการลงทะเบียนต้องเป็นความจริงและเป็นปัจจุบัน</li>
              <li>เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีของคุณหากพบการละเมิดข้อตกลง</li>
            </ul>
          </section>

          <div className='h-px w-full bg-white/5' />

          <section className='space-y-4'>
            <h2 className='flex items-center gap-3 text-2xl font-bold text-white'>
              <Gavel className='text-accent' size={24} />
              3. ทรัพย์สินทางปัญญา
            </h2>
            <p className='mb-4 leading-relaxed text-gray-300'>
              เนื้อหาทั้งหมดบน {APP_NAME} รวมถึงแต่ไม่จำกัดเพียง ข้อความ กราฟิก โลโก้ วิดีโอแบบ
              Interactive และซอฟต์แวร์ เป็นทรัพย์สินของ {APP_NAME} หรือผู้ให้อนุญาตของเรา
              และได้รับความคุ้มครองตามกฎหมายลิขสิทธิ์
            </p>
            <div className='rounded-r-lg border-l-4 border-accent bg-white/5 p-4'>
              <p className='text-sm text-gray-300'>
                <span className='font-bold text-white'>ข้อห้าม:</span> ห้ามคัดลอก ดัดแปลง แจกจ่าย
                หรือขายเนื้อหาใดๆ จากแพลตฟอร์มโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
              </p>
            </div>
          </section>

          <div className='h-px w-full bg-white/5' />

          <section className='space-y-4'>
            <h2 className='flex items-center gap-3 text-2xl font-bold text-white'>
              <AlertCircle className='text-red-400' size={24} />
              4. ข้อจำกัดความรับผิด
            </h2>
            <p className='leading-relaxed text-gray-300'>
              {APP_NAME} ให้บริการในลักษณะ &ldquo;ตามที่เป็นอยู่&rdquo; (As is)
              เราไม่รับประกันว่าแพลตฟอร์มจะปราศจากข้อผิดพลาด หรือจะเปิดให้บริการตลอดเวลา
              เราจะไม่รับผิดชอบต่อความเสียหายใดๆ
              ที่เกิดจากการใช้งานหรือความไม่สามารถใช้งานแพลตฟอร์มได้
            </p>
          </section>

          <div className='h-px w-full bg-white/5' />

          <section className='space-y-4'>
            <h2 className='text-2xl font-bold text-white'>5. การเปลี่ยนแปลงข้อตกลง</h2>
            <p className='leading-relaxed text-gray-300'>
              เราอาจปรับปรุงข้อตกลงการใช้งานนี้เป็นครั้งคราว
              การเปลี่ยนแปลงจะมีผลทันทีเมื่อมีการประกาศบนหน้านี้
              การใช้งานต่อเนื่องของคุณถือว่าคุณยอมรับการเปลี่ยนแปลงดังกล่าว
            </p>
          </section>
        </div>

        <div className='mt-12 text-center'>
          <p className='text-gray-400'>
            หากมีคำถามเกี่ยวกับข้อตกลงนี้ โปรดติดต่อเราที่ <br />
            <a
              href='mailto:legal@chronos.app'
              className='mt-2 inline-block font-bold text-primary transition-colors hover:text-white'
            >
              legal@chronos.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
