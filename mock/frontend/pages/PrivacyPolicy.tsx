import React from 'react';
import { Lock, Eye, Database, Shield, Cookie, Mail } from 'lucide-react';
import { APP_NAME } from '../constants';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className='pt-24 pb-20 px-4 min-h-screen animate-fade-in'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6 shadow-lg backdrop-blur-sm'>
            <Lock size={32} className='text-gray-300' />
          </div>
          <h1 className='text-4xl md:text-5xl font-serif font-bold text-white mb-4'>
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className='text-gray-400'>แก้ไขล่าสุด: 24 ตุลาคม 2024</p>
        </div>

        {/* Content Container */}
        <div className='bg-surface/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl space-y-12'>
          <section className='space-y-4'>
            <h2 className='text-2xl font-bold text-white flex items-center gap-3'>
              <Eye className='text-primary' size={24} />
              1. บทนำ
            </h2>
            <p className='text-gray-300 leading-relaxed'>
              {APP_NAME} ("เรา") ให้ความสำคัญกับความเป็นส่วนตัวของคุณ
              นโยบายความเป็นส่วนตัวนี้อธิบายว่าเรารวบรวม ใช้
              และเปิดเผยข้อมูลส่วนบุคคลของคุณอย่างไรเมื่อคุณใช้งานแพลตฟอร์มของเรา
            </p>
          </section>

          <div className='h-px bg-white/5 w-full' />

          <section className='space-y-4'>
            <h2 className='text-2xl font-bold text-white flex items-center gap-3'>
              <Database className='text-secondary' size={24} />
              2. ข้อมูลที่เราเก็บรวบรวม
            </h2>
            <div className='space-y-4 text-gray-300'>
              <div>
                <h3 className='text-white font-bold mb-2'>2.1 ข้อมูลที่คุณให้โดยตรง</h3>
                <ul className='list-disc list-inside ml-2 space-y-1'>
                  <li>ข้อมูลบัญชี (ชื่อผู้ใช้, อีเมล, รหัสผ่าน)</li>
                  <li>ข้อมูลโปรไฟล์ (รูปภาพ, การตั้งค่า)</li>
                  <li>เนื้อหาที่คุณสร้าง (ความคิดเห็น, รีวิว)</li>
                </ul>
              </div>
              <div>
                <h3 className='text-white font-bold mb-2'>2.2 ข้อมูลการใช้งาน</h3>
                <ul className='list-disc list-inside ml-2 space-y-1'>
                  <li>ประวัติการเล่นและความคืบหน้าในเกม</li>
                  <li>การตัดสินใจและฉากจบที่คุณเลือก</li>
                  <li>ข้อมูลอุปกรณ์และ Log การเข้าใช้งาน</li>
                </ul>
              </div>
            </div>
          </section>

          <div className='h-px bg-white/5 w-full' />

          <section className='space-y-4'>
            <h2 className='text-2xl font-bold text-white flex items-center gap-3'>
              <Shield className='text-accent' size={24} />
              3. เราใช้ข้อมูลของคุณอย่างไร
            </h2>
            <ul className='list-disc list-inside space-y-2 text-gray-300 ml-2'>
              <li>เพื่อให้บริการและปรับปรุงแพลตฟอร์ม {APP_NAME}</li>
              <li>เพื่อจดจำความคืบหน้าและฉากจบที่คุณปลดล็อก</li>
              <li>เพื่อวิเคราะห์และแนะนำเนื้อหาที่เหมาะสมกับความชอบของคุณ</li>
              <li>เพื่อสื่อสารเกี่ยวกับบัญชีของคุณและการอัปเดตบริการ</li>
            </ul>
          </section>

          <div className='h-px bg-white/5 w-full' />

          <section className='space-y-4'>
            <h2 className='text-2xl font-bold text-white flex items-center gap-3'>
              <Cookie className='text-yellow-400' size={24} />
              4. คุกกี้ (Cookies)
            </h2>
            <p className='text-gray-300 leading-relaxed'>
              เราใช้คุกกี้เพื่อจดจำการตั้งค่าของคุณและวิเคราะห์การใช้งานเว็บไซต์
              คุณสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ได้ แต่อาจทำให้ฟีเจอร์บางอย่าง (เช่น
              การเข้าสู่ระบบอัตโนมัติ) ทำงานได้ไม่เต็มประสิทธิภาพ
            </p>
          </section>

          <div className='h-px bg-white/5 w-full' />

          <section className='space-y-4'>
            <h2 className='text-2xl font-bold text-white'>5. ความปลอดภัยของข้อมูล</h2>
            <p className='text-gray-300 leading-relaxed'>
              เราใช้มาตรการรักษาความปลอดภัยทางเทคนิคที่เหมาะสมเพื่อปกป้องข้อมูลของคุณจากการเข้าถึงโดยไม่ได้รับอนุญาต
              อย่างไรก็ตาม ไม่มีการส่งข้อมูลผ่านอินเทอร์เน็ตที่ปลอดภัย 100%
            </p>
          </section>
        </div>

        {/* Contact Footer */}
        <div className='mt-12 text-center'>
          <p className='text-gray-400 flex flex-col items-center gap-2'>
            หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว โปรดติดต่อเรา
            <a
              href='mailto:privacy@chronos.app'
              className='text-primary hover:text-white transition-colors font-bold inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10'
            >
              <Mail size={16} /> privacy@chronos.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
