import React from 'react';
import { Shield, FileText, AlertCircle, Gavel, UserCheck } from 'lucide-react';
import { APP_NAME } from '../constants';

export const TermsOfUse: React.FC = () => {
  return (
    <div className="pt-24 pb-20 px-4 min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6 shadow-lg backdrop-blur-sm">
            <FileText size={32} className="text-gray-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">ข้อตกลงการใช้งาน</h1>
          <p className="text-gray-400">แก้ไขล่าสุด: 24 ตุลาคม 2024</p>
        </div>

        {/* Content Container */}
        <div className="bg-surface/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl space-y-12">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="text-primary" size={24} />
              1. การยอมรับข้อตกลง
            </h2>
            <p className="text-gray-300 leading-relaxed">
              ยินดีต้อนรับสู่ {APP_NAME} ("แพลตฟอร์ม") การเข้าถึงหรือใช้งานแพลตฟอร์มของเรา แสดงว่าคุณยอมรับและตกลงที่จะปฏิบัติตามข้อกำหนดและเงื่อนไขเหล่านี้ หากคุณไม่เห็นด้วยกับส่วนหนึ่งส่วนใดของข้อกำหนด กรุณาหยุดใช้งานแพลตฟอร์มทันที
            </p>
          </section>

          <div className="h-px bg-white/5 w-full" />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <UserCheck className="text-secondary" size={24} />
              2. บัญชีผู้ใช้
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-2">
              <li>คุณต้องมีอายุอย่างน้อย 13 ปีจึงจะใช้งานแพลตฟอร์มนี้ได้</li>
              <li>คุณมีหน้าที่รับผิดชอบในการรักษาความปลอดภัยของรหัสผ่านและบัญชีของคุณ</li>
              <li>ข้อมูลที่คุณให้ในการลงทะเบียนต้องเป็นความจริงและเป็นปัจจุบัน</li>
              <li>เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีของคุณหากพบการละเมิดข้อตกลง</li>
            </ul>
          </section>

          <div className="h-px bg-white/5 w-full" />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Gavel className="text-accent" size={24} />
              3. ทรัพย์สินทางปัญญา
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              เนื้อหาทั้งหมดบน {APP_NAME} รวมถึงแต่ไม่จำกัดเพียง ข้อความ กราฟิก โลโก้ วิดีโอแบบ Interactive และซอฟต์แวร์ เป็นทรัพย์สินของ {APP_NAME} หรือผู้ให้อนุญาตของเรา และได้รับความคุ้มครองตามกฎหมายลิขสิทธิ์
            </p>
            <div className="bg-white/5 border-l-4 border-accent p-4 rounded-r-lg">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-white">ข้อห้าม:</span> ห้ามคัดลอก ดัดแปลง แจกจ่าย หรือขายเนื้อหาใดๆ จากแพลตฟอร์มโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
              </p>
            </div>
          </section>

          <div className="h-px bg-white/5 w-full" />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <AlertCircle className="text-red-400" size={24} />
              4. ข้อจำกัดความรับผิด
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {APP_NAME} ให้บริการในลักษณะ "ตามที่เป็นอยู่" (As is) เราไม่รับประกันว่าแพลตฟอร์มจะปราศจากข้อผิดพลาด หรือจะเปิดให้บริการตลอดเวลา เราจะไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการใช้งานหรือความไม่สามารถใช้งานแพลตฟอร์มได้
            </p>
          </section>

           <div className="h-px bg-white/5 w-full" />

           <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. การเปลี่ยนแปลงข้อตกลง</h2>
            <p className="text-gray-300 leading-relaxed">
              เราอาจปรับปรุงข้อตกลงการใช้งานนี้เป็นครั้งคราว การเปลี่ยนแปลงจะมีผลทันทีเมื่อมีการประกาศบนหน้านี้ การใช้งานต่อเนื่องของคุณถือว่าคุณยอมรับการเปลี่ยนแปลงดังกล่าว
            </p>
          </section>

        </div>

        {/* Contact Footer */}
        <div className="mt-12 text-center">
            <p className="text-gray-400">
                หากมีคำถามเกี่ยวกับข้อตกลงนี้ โปรดติดต่อเราที่ <br/>
                <a href="mailto:legal@chronos.app" className="text-primary hover:text-white transition-colors font-bold mt-2 inline-block">legal@chronos.app</a>
            </p>
        </div>
      </div>
    </div>
  );
};