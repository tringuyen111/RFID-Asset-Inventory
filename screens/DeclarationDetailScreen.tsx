
import React from 'react';
import type { RegistrationDetail, Item } from '../types';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';

interface DeclarationDetailScreenProps {
  registrationDetail: RegistrationDetail;
}

const StatusPill: React.FC<{ status: 'pending' | 'completed' }> = ({ status }) => (
    <span className={`px-4 py-1.5 text-xs font-semibold rounded-full ${status === 'pending' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
        {status === 'pending' ? 'Chờ xử lý' : 'Hoàn thành'}
    </span>
);

const InfoLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
    </div>
);

const TimeStatusLine: React.FC<{ label: string; value: string; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="flex items-center space-x-2">
        <ICONS.clock className="text-gray-400" />
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-800">{value}</p>
              {children}
            </div>
        </div>
    </div>
);

const ItemCard: React.FC<{ item: Item; registrationId: string }> = ({ item, registrationId }) => {
    const { navigate } = useNavigation();
    return (
        <div onClick={() => navigate('scan', { registrationId, itemId: item.id })}
             className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-400">
            <h3 className="font-bold text-gray-800 text-lg mb-3">{item.name}</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                    <span>Số lượng cần khai báo</span>
                    <span className="font-semibold text-gray-800">{item.quantityRequired} <span className="text-gray-400">PCS</span></span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                    <span>Số lượng đã khai báo</span>
                    <span className="font-semibold text-gray-800">{item.quantityScanned} <span className="text-gray-400">PCS</span></span>
                </div>
            </div>
        </div>
    );
};

const DeclarationDetailScreen: React.FC<DeclarationDetailScreenProps> = ({ registrationDetail }) => {
    return (
        <Layout>
            <Header title="Chi Tiết Phiếu Khai Báo" showBackButton={true} />
            <main className="flex-grow flex flex-col custom-scrollbar overflow-y-auto">
                <div className="p-5 bg-white border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{registrationDetail.id}</h2>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                        <InfoLine label="Người tạo:" value={registrationDetail.createdBy} />
                        <InfoLine label="Ngày tạo:" value={registrationDetail.createdAt} />
                    </div>
                    <div className="flex items-center space-x-8 border-t border-b border-gray-200 py-3">
                        <TimeStatusLine label="Thời gian cập nhật" value={registrationDetail.updatedAt} />
                        <div className="border-l h-8 border-gray-200"></div>
                        <TimeStatusLine label="Trạng thái" value=""><StatusPill status={registrationDetail.status} /></TimeStatusLine>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Ghi chú</p>
                        <p className="text-gray-800">{registrationDetail.notes}</p>
                    </div>
                </div>

                <div className="flex-grow p-5 bg-[#F8F9FE]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Danh sách Item</h3>
                        <span className="bg-gray-200 text-gray-700 text-sm font-bold px-2.5 py-1 rounded-md">{registrationDetail.items.length}</span>
                    </div>
                    <div className="space-y-3 pb-6">
                        {registrationDetail.items.map(item => (
                            <ItemCard key={item.id} item={item} registrationId={registrationDetail.id}/>
                        ))}
                    </div>
                </div>
            </main>
        </Layout>
    );
};

export default DeclarationDetailScreen;