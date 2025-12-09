
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  Users, BookOpen, Star, AlertCircle, Coins, Zap, Trophy, 
  Activity, TrendingUp, AlertTriangle, FileText
} from 'lucide-react';
import { 
  DAILY_STATS, DASHBOARD_STATS, MOCK_STORIES, 
  FUNNEL_DATA, CREDIT_HEATMAP_DATA, USER_DISTRIBUTION_DATA, SYSTEM_LOGS 
} from '../services/mockData';

const StatCard = ({ title, value, subValue, icon: Icon, color, subText }: { title: string, value: string, subValue?: string, icon: any, color: string, subText?: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between text-sm">
      {subValue && (
        <span className={`${subValue.startsWith('+') ? 'text-green-600' : 'text-red-600'} font-medium`}>
          {subValue}
        </span>
      )}
      {subText && (
        <span className="text-gray-400">{subText}</span>
      )}
    </div>
  </div>
);

const HeatmapCell = ({ intensity }: { intensity: number }) => {
  const getColor = (i: number) => {
    switch(i) {
      case 1: return 'bg-amber-50';
      case 2: return 'bg-amber-100';
      case 3: return 'bg-amber-200';
      case 4: return 'bg-amber-300';
      case 5: return 'bg-amber-400';
      default: return 'bg-gray-50';
    }
  };
  return <div className={`h-8 w-full rounded ${getColor(intensity)} hover:opacity-80 transition-opacity`} title={`ความหนาแน่น: ${intensity}/5`}></div>;
};

export const Dashboard: React.FC = () => {
  // Sort stories by rating/players for Top 5
  const topStories = [...MOCK_STORIES]
    .sort((a, b) => b.totalPlayers - a.totalPlayers)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ</h1>
           <p className="text-sm text-gray-500 mt-1">สถิติและข้อมูลการใช้งานประจำวัน {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
        </div>
        <div className="flex space-x-2">
           <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center">
             <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
             ระบบทำงานปกติ
           </span>
        </div>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="ผู้ใช้งานที่ลงทะเบียน" 
          value={DASHBOARD_STATS.registeredUsers.toLocaleString()} 
          subValue="+125" 
          subText="ในวันนี้"
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="จำนวนการเล่นวันนี้" 
          value={DASHBOARD_STATS.storyPlaysToday.toLocaleString()} 
          subValue="+8.2%" 
          subText="เทียบกับเมื่อวาน"
          icon={BookOpen} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="เครดิตที่ใช้วันนี้" 
          value={DASHBOARD_STATS.creditsConsumedToday.toLocaleString()} 
          subValue="-2.4%" 
          subText="เทียบกับเมื่อวาน"
          icon={Coins} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="รายได้โดยประมาณ" 
          value="฿12,450" 
          subValue="+15%" 
          subText="เป้าหมาย ฿10,000"
          icon={TrendingUp} 
          color="bg-green-500" 
        />
      </div>

      {/* Row 2: Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Star size={20} /></div>
               <div>
                  <p className="text-xs text-gray-500">รีวิววันนี้</p>
                  <h4 className="text-lg font-bold">{DASHBOARD_STATS.ratingsToday}</h4>
               </div>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Trophy size={20} /></div>
               <div>
                  <p className="text-xs text-gray-500">ปลดล็อคความสำเร็จ</p>
                  <h4 className="text-lg font-bold">{DASHBOARD_STATS.achievementsToday}</h4>
               </div>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>
               <div>
                  <p className="text-xs text-gray-500">ข้อผิดพลาดระบบ</p>
                  <h4 className="text-lg font-bold">{DASHBOARD_STATS.errors}</h4>
               </div>
            </div>
         </div>
      </div>

      {/* Row 3: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Active Users Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">ผู้ใช้งานรายวัน (DAU)</h2>
              <p className="text-xs text-gray-500">แนวโน้มกิจกรรมผู้ใช้งานในรอบ 7 วัน</p>
            </div>
            <select className="text-sm border-gray-200 rounded-md shadow-sm bg-gray-50 px-2 py-1 outline-none">
              <option>7 วันล่าสุด</option>
              <option>30 วันล่าสุด</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_STATS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                />
                <Area type="monotone" dataKey="uv" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
           <h2 className="text-lg font-semibold text-gray-800 mb-1">สัดส่วนผู้ใช้งาน</h2>
           <p className="text-xs text-gray-500 mb-6">เทียบระหว่างสมาชิกและผู้เยี่ยมชม</p>
           
           <div className="flex-1 min-h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={USER_DISTRIBUTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {USER_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                 <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">{DASHBOARD_STATS.dailyActive.toLocaleString()}</span>
                    <p className="text-xs text-gray-500">Active Total</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Row 4: Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Story Funnel */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">อัตราการเล่นจนจบ (Funnel)</h2>
            <p className="text-xs text-gray-500 mb-6">จำนวนผู้เล่นที่ผ่านแต่ละช่วงของนิยายโดยเฉลี่ย</p>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FUNNEL_DATA} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="name" tick={{fontSize: 12}} />
                     <YAxis tick={{fontSize: 12}} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                        {FUNNEL_DATA.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={`rgba(99, 102, 241, ${1 - (index * 0.15)})`} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Credit Heatmap */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">ช่วงเวลาการใช้เครดิต</h2>
                <p className="text-xs text-gray-500">ความหนาแน่นการใช้งานรายชั่วโมง (Heatmap)</p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                 <span className="w-3 h-3 bg-amber-50 rounded"></span><span>น้อย</span>
                 <span className="w-3 h-3 bg-amber-400 rounded"></span><span>มาก</span>
              </div>
            </div>
            
            <div className="space-y-2">
               {/* Time Labels Mock */}
               <div className="grid grid-cols-7 gap-1 text-[10px] text-gray-400 text-center pl-8">
                  <span>00-04</span><span>04-08</span><span>08-12</span><span>12-16</span><span>16-20</span><span>20-24</span>
               </div>
               
               {CREDIT_HEATMAP_DATA.map((dayData, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                     <span className="text-xs font-medium text-gray-500 w-6">{dayData.day}</span>
                     <div className="grid grid-cols-6 gap-1 flex-1">
                        {dayData.slots.map((intensity, slotIdx) => (
                           <HeatmapCell key={slotIdx} intensity={intensity} />
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Row 5: Tables & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Top Stories Table */}
         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
               <h2 className="text-lg font-semibold text-gray-800">นิยายยอดนิยม 5 อันดับแรก</h2>
            </div>
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อเรื่อง</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ผู้เล่น</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">เล่นจบ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">คะแนน</th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {topStories.map((story, i) => (
                        <tr key={story.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                 <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                                 <div>
                                    <div className="text-sm font-medium text-gray-900">{story.title}</div>
                                    <div className="text-xs text-gray-500">{story.genre}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-center text-sm text-gray-600">{story.totalPlayers.toLocaleString()}</td>
                           <td className="px-6 py-4 text-center">
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">{story.completionRate}%</span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end font-bold text-gray-900">
                                 <Star size={14} className="text-yellow-400 fill-current mr-1" />
                                 {story.rating}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Error Logs */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-lg font-semibold text-gray-800">บันทึกข้อผิดพลาด</h2>
               <button className="text-xs text-indigo-600 hover:text-indigo-800">ดูทั้งหมด</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {SYSTEM_LOGS.map((log) => (
                  <div key={log.id} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                     <div className={`mt-0.5 mr-3 flex-shrink-0 ${log.type === 'error' ? 'text-red-500' : (log.type === 'warning' ? 'text-amber-500' : 'text-blue-500')}`}>
                        {log.type === 'error' ? <AlertCircle size={16} /> : (log.type === 'warning' ? <AlertTriangle size={16} /> : <Activity size={16} />)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{log.message}</p>
                        <div className="flex justify-between items-center mt-1">
                           <span className="text-xs text-gray-500 flex items-center"><FileText size={10} className="mr-1"/> {log.location}</span>
                           <span className="text-[10px] text-gray-400">{log.time}</span>
                        </div>
                     </div>
                  </div>
               ))}
               <div className="text-center pt-2">
                  <p className="text-xs text-green-600 flex items-center justify-center">
                     <Zap size={12} className="mr-1"/> ระบบกำลังตรวจสอบอัตโนมัติ
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
