
import React, { useState, useEffect } from 'react';
import { MOCK_ADMINS, MOCK_ADMIN_LOGS } from '../services/mockData';
import { AdminAccount, AdminRole, AdminLog } from '../types';
import { 
  Shield, UserPlus, Search, Edit, Trash2, Lock, Unlock, 
  Activity, Clock, FileText, User as UserIcon, Settings, DollarSign, X, Save
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { Pagination } from '../components/Pagination';

export const AdminTeamPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'logs'>('members');
  const [admins, setAdmins] = useState<AdminAccount[]>(MOCK_ADMINS);
  const [logs, setLogs] = useState<AdminLog[]>(MOCK_ADMIN_LOGS);
  
  // Search / Filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Partial<AdminAccount> | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { addToast } = useToast();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // --- MEMBER ACTIONS ---

  const handleCreate = () => {
    setEditingAdmin({
      username: '',
      email: '',
      role: AdminRole.VIEWER,
      status: 'active',
      avatar: 'https://ui-avatars.com/api/?name=New+Admin&background=random'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (admin: AdminAccount) => {
    setEditingAdmin({ ...admin });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingAdmin?.username || !editingAdmin.email) {
      addToast('กรุณากรอกชื่อผู้ใช้และอีเมล', 'warning');
      return;
    }

    if (editingAdmin.id) {
      // Update
      setAdmins(admins.map(a => a.id === editingAdmin.id ? { ...a, ...editingAdmin } as AdminAccount : a));
      addToast('แก้ไขข้อมูลผู้ดูแลระบบเรียบร้อยแล้ว', 'success');
    } else {
      // Create
      const newAdmin: AdminAccount = {
        ...editingAdmin,
        id: `adm${Date.now()}`,
        lastActive: new Date().toISOString(),
      } as AdminAccount;
      setAdmins([...admins, newAdmin]);
      addToast('เพิ่มผู้ดูแลระบบเรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
    setEditingAdmin(null);
  };

  const handleToggleStatus = (id: string) => {
    setAdmins(admins.map(a => {
      if (a.id === id) {
        const newStatus = a.status === 'active' ? 'inactive' : 'active';
        addToast(`เปลี่ยนสถานะเป็น ${newStatus === 'active' ? 'ใช้งาน' : 'ระงับ'} เรียบร้อยแล้ว`, 'info');
        return { ...a, status: newStatus };
      }
      return a;
    }));
  };

  const handleDelete = (id: string) => {
    if (!confirm('ยืนยันการลบบัญชีผู้ดูแลระบบนี้?')) return;
    setAdmins(admins.filter(a => a.id !== id));
    addToast('ลบบัญชีเรียบร้อยแล้ว', 'success');
  };

  // --- FILTERING ---
  
  const filteredAdmins = admins.filter(a => 
    a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: AdminRole) => {
    switch (role) {
      case AdminRole.SUPER_ADMIN: return 'bg-red-100 text-red-800';
      case AdminRole.STORY_EDITOR: return 'bg-blue-100 text-blue-800';
      case AdminRole.USER_MANAGER: return 'bg-green-100 text-green-800';
      case AdminRole.ACHIEVEMENT_MANAGER: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (type: string) => {
    switch(type) {
      case 'story': return <FileText size={16} className="text-blue-500"/>;
      case 'user': return <UserIcon size={16} className="text-green-500"/>;
      case 'system': return <Settings size={16} className="text-gray-500"/>;
      case 'finance': return <DollarSign size={16} className="text-yellow-500"/>;
      default: return <Activity size={16} className="text-gray-400"/>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">จัดการทีมผู้ดูแล</h1>
           <p className="text-sm text-gray-500 mt-1">กำหนดสิทธิ์และตรวจสอบการทำงานของผู้ดูแลระบบ</p>
        </div>
        {activeTab === 'members' && (
          <button onClick={handleCreate} className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium shadow-sm transition-colors">
             <UserPlus size={18} className="mr-2" />
             เพิ่มผู้ดูแล
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="border-b border-gray-100 flex">
           <button 
              onClick={() => setActiveTab('members')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'members' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
              <Shield size={16} className="mr-2" /> รายชื่อทีมงาน
           </button>
           <button 
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'logs' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
              <Activity size={16} className="mr-2" /> บันทึกกิจกรรม (Audit Logs)
           </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
           <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
               <input 
                 type="text" 
                 placeholder={activeTab === 'members' ? "ค้นหาชื่อ, อีเมล..." : "ค้นหากิจกรรม, ผู้กระทำ..."}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
               />
           </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
           {activeTab === 'members' && (
             <div className="min-w-full">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ดูแล</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บทบาท (Role)</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ใช้งานล่าสุด</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {filteredAdmins.map((admin) => (
                     <tr key={admin.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <img className="h-10 w-10 rounded-full" src={admin.avatar} alt="" />
                           <div className="ml-4">
                             <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                             <div className="text-xs text-gray-500">{admin.email}</div>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                           {admin.role}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                         <button 
                           onClick={() => handleToggleStatus(admin.id)}
                           className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${admin.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}
                         >
                           <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${admin.status === 'active' ? 'translate-x-5' : 'translate-x-1'}`} />
                         </button>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-500">
                          {new Date(admin.lastActive).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button onClick={() => handleEdit(admin)} className="text-indigo-600 hover:text-indigo-900 mx-2 p-1 hover:bg-indigo-50 rounded">
                           <Edit size={16} />
                         </button>
                         {admin.role !== AdminRole.SUPER_ADMIN && (
                           <button onClick={() => handleDelete(admin.id)} className="text-red-600 hover:text-red-900 mx-2 p-1 hover:bg-red-50 rounded">
                             <Trash2 size={16} />
                           </button>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}

           {activeTab === 'logs' && (
             <div className="min-w-full">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ดำเนินการ</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">กิจกรรม</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เป้าหมาย</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {filteredLogs.map((log) => (
                     <tr key={log.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                         <div className="flex items-center">
                            <Clock size={14} className="mr-1.5 text-gray-400"/>
                            {new Date(log.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                             <span className="text-sm font-medium text-gray-900">{log.adminName}</span>
                             <span className="text-[10px] text-gray-500">{log.role}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                             <div className="mr-2 p-1 bg-gray-100 rounded">
                                {getActionIcon(log.type)}
                             </div>
                             <span className="text-sm text-gray-700">{log.action}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-600">
                          {log.target}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                 <h3 className="font-bold text-gray-900 text-lg">
                    {editingAdmin.id ? 'แก้ไขข้อมูลผู้ดูแล' : 'เพิ่มผู้ดูแลใหม่'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
                    <input 
                       type="text" 
                       value={editingAdmin.username} 
                       onChange={(e) => setEditingAdmin({...editingAdmin, username: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input 
                       type="email" 
                       value={editingAdmin.email} 
                       onChange={(e) => setEditingAdmin({...editingAdmin, email: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท (Role)</label>
                    <select 
                       value={editingAdmin.role} 
                       onChange={(e) => setEditingAdmin({...editingAdmin, role: e.target.value as AdminRole})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-gray-500 outline-none"
                    >
                       {Object.values(AdminRole).map(role => (
                          <option key={role} value={role}>{role}</option>
                       ))}
                    </select>
                 </div>

                 {!editingAdmin.id && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800 flex items-start">
                       <Lock size={14} className="mt-0.5 mr-2 flex-shrink-0" />
                       ระบบจะส่งรหัสผ่านชั่วคราวไปยังอีเมลที่ระบุเพื่อให้ผู้ดูแลเข้าสู่ระบบครั้งแรก
                    </div>
                 )}
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50">
                 <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg"
                 >
                    ยกเลิก
                 </button>
                 <button 
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium shadow-sm"
                 >
                    <Save size={16} className="mr-2" /> บันทึก
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
