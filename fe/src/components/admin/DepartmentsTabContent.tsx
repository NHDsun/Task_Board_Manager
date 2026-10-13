import React from 'react';
import { Building2, Edit2, Trash2, ArrowRightLeft, Users, Loader2 } from 'lucide-react';
import type { DepartmentItem, DirectoryUser } from '../../store/useUserStore';
import { getAvatarUrl } from '../../utils/avatar';

interface DepartmentsTabContentProps {
  departments: DepartmentItem[];
  filteredDepartments: DepartmentItem[];
  users: DirectoryUser[];
  isLoadingDepartments: boolean;
  deptSearchQuery: string;
  setDeptSearchQuery: (v: string) => void;
  onOpenCreateDept: () => void;
  onOpenEditDept: (dept: DepartmentItem) => void;
  onOpenDeleteDept: (dept: DepartmentItem) => void;
  onOpenTransferToDept: (dept: DepartmentItem) => void;
}

export const DepartmentsTabContent: React.FC<DepartmentsTabContentProps> = ({
  departments,
  filteredDepartments,
  users,
  isLoadingDepartments,
  deptSearchQuery,
  setDeptSearchQuery,
  onOpenCreateDept,
  onOpenEditDept,
  onOpenDeleteDept,
  onOpenTransferToDept,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={deptSearchQuery}
            onChange={(e) => setDeptSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mã phòng ban (VD: ENG, QA)..."
            className="w-full pl-3 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>Tổng số:</span>
          <strong className="text-amber-400">{departments.length} phòng ban</strong>
        </div>
      </div>

      {isLoadingDepartments ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-medium">Đang tải danh sách phòng ban...</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="py-16 text-center solar-glass-card rounded-3xl bg-[#0F172A]/80 border border-slate-800 space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Chưa có phòng ban nào được tạo</h3>
          <p className="text-xs text-slate-500">
            Bấm nút &quot;Thêm Phòng Ban Mới&quot; ở góc trên để khởi tạo phòng ban đầu tiên.
          </p>
          <button
            onClick={onOpenCreateDept}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400"
          >
            + Khởi Tạo Phòng Ban
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDepartments.map((dept) => {
            const deptMembers = users.filter((u) => u.department === dept.name);
            const memberCount = dept.totalMembers !== undefined ? dept.totalMembers : deptMembers.length;
            const memberRatio = users.length > 0 ? Math.round((memberCount / users.length) * 100) : 0;

            return (
              <div
                key={dept.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-200 space-y-4 flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-mono font-bold text-xs shrink-0">
                        {dept.code}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {dept.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-mono">Mã: {dept.code}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditDept(dept)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="Sửa phòng ban"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenDeleteDept(dept)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Xóa phòng ban"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    {dept.description || 'Chưa có mô tả chi tiết về chức năng của khối phòng ban này.'}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Thành Viên Trực Thuộc:
                      </span>
                      <span className="text-slate-200 font-bold">
                        {memberCount} nhân sự ({memberRatio}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(memberRatio, 4)}%` }}
                      />
                    </div>
                  </div>

                  {deptMembers.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {deptMembers.slice(0, 5).map((member) => (
                          <img
                            key={member.id}
                            src={getAvatarUrl(member)}
                            alt={member.fullName}
                            title={`${member.fullName} (${member.jobTitle})`}
                            className="w-6 h-6 rounded-full object-cover border border-slate-800 bg-slate-900"
                          />
                        ))}
                      </div>
                      {deptMembers.length > 5 && (
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          +{deptMembers.length - 5} nhân sự khác
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-800/60">
                  <button
                    onClick={() => onOpenTransferToDept(dept)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span>Điều Chuyển Nhân Sự Đến Khối Này</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
