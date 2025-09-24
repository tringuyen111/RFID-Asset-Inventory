
import React, { useMemo } from 'react';
import { useNavigation } from '../App';
import type { Registration } from '../types';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';

interface DeclarationListScreenProps {
  registrations: Registration[];
}

const DeclarationCard: React.FC<{ registration: Registration }> = ({ registration }) => {
    const { navigate } = useNavigation();
    return (
        <div onClick={() => navigate('declarationDetail', { registrationId: registration.id })}
             className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-400 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                        <ICONS.clipboard className="text-gray-500" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{registration.id}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${registration.status === 'pending' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {registration.status === 'pending' ? 'Chờ xử lý' : 'Hoàn thành'}
                </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                    <span className="font-medium">Tên phiếu</span>
                    <span>{registration.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Ngày tạo</span>
                    <span>{registration.createdAt}</span>
                </div>
            </div>
        </div>
    );
};


const DeclarationListScreen: React.FC<DeclarationListScreenProps> = ({ registrations }) => {
    const { navigate } = useNavigation();
    const pendingRegistrations = useMemo(() => 
        registrations.filter(reg => reg.status === 'pending'), 
        [registrations]
    );

    return (
        <Layout>
            <Header title="Khai báo" showBackButton={true} confirmOnBack={false} />
            <div className="p-4 flex-grow flex flex-col">
                <main className="flex-grow space-y-3 pb-24 custom-scrollbar overflow-y-auto">
                    {pendingRegistrations.map(reg => <DeclarationCard key={reg.id} registration={reg} />)}
                </main>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-transparent">
                 <button onClick={() => navigate('declarationCreate')} className="w-full bg-[#3D3799] text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg">
                    <span>+</span>
                    <span>Tạo mới</span>
                </button>
            </div>
        </Layout>
    );
};

export default DeclarationListScreen;