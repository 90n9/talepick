"use client";

const steps = [
  {
    icon: "🎬",
    title: "รับชม",
    desc: "สัมผัสประสบการณ์การเล่าเรื่องผ่านฉากวิดีโอที่สมจริงและน่าตื่นตาตื่นใจ",
  },
  {
    icon: "⚡",
    title: "ตัดสินใจ",
    desc: "เลือกเส้นทางของคุณในเวลาที่กำหนด ทุกการตัดสินใจจะเปลี่ยนทิศทางของเนื้อเรื่อง",
  },
  {
    icon: "🔓",
    title: "ปลดล็อก",
    desc: "ค้นพบฉากจบที่หลากหลายและสะสมความสำเร็จที่ซ่อนอยู่",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-32 border-t border-white/5 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.3),transparent_70%)]"
        style={{ transform: `scale(${1 + scrollY * 0.0005})` }}
      />
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl font-bold text-white mb-20 font-serif reveal-on-scroll">
          วิธีการเล่น
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((item, index) => (
            <div
              key={item.title}
              className="reveal-on-scroll relative group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="text-6xl mb-8 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 font-serif">
                {item.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
