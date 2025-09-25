
import React, { useState } from 'react';
import type { InventoryTaskDetail, InventoryItem } from '../types';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';
import Popup from '../components/Popup';

interface InventoryDetailScreenProps {
  taskDetail: InventoryTaskDetail;
}

const StatusPill: React.FC<{ status: 'pending' | 'completed' }> = ({ status }) => (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status === 'pending' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
        {status === 'pending' ? 'Chờ xử lý' : 'Hoàn thành'}
    </span>
);

const InfoLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
    </div>
);

const ItemCard: React.FC<{ item: InventoryItem }> = ({ item }) => {
    const isItemCompleted = item.quantityScanned >= item.quantityRequired;

    return (
        <div className="w-full text-left bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">{item.assetType}</h3>
                    <p className="text-sm text-gray-500">{item.assetName}</p>
                </div>
            </div>
            
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                    <span>Số lượng cần kiểm kê</span>
                    <span className="font-semibold text-gray-800">{item.quantityRequired} <span className="text-gray-400">PCS</span></span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                    <span>Số lượng đã kiểm kê</span>
                    <span className={`font-semibold ${isItemCompleted ? 'text-green-600' : 'text-gray-800'}`}>{item.quantityScanned} <span className="text-gray-400">PCS</span></span>
                </div>
            </div>
        </div>
    );
};

const InventoryDetailScreen: React.FC<InventoryDetailScreenProps> = ({ taskDetail }) => {
    const { goBack, confirmInventoryTask, navigate } = useNavigation();
    const [isConfirmPopupVisible, setConfirmPopupVisible] = useState(false);
    const [isSavePopupVisible, setSavePopupVisible] = useState(false);
    
    const SaveButton = () => (
        <button onClick={() => setSavePopupVisible(true)} className="p-2 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        </button>
    );

    return (
        <Layout>
            <Header title="Chi Tiết Phiếu Kiểm Kê" showBackButton={true} rightAccessory={<SaveButton />} />
            <div className="flex flex-col h-full">
                <main className="flex-grow flex flex-col custom-scrollbar overflow-y-auto">
                    <div className="p-5 bg-white border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{taskDetail.id}</h2>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                            <InfoLine label="Tên phiếu:" value={taskDetail.name} />
                            <InfoLine label="Ngày tạo:" value={taskDetail.createdAt} />
                        </div>
                         <div className="flex items-center space-x-8 border-t border-gray-200 py-3">
                            <div className="flex items-center space-x-2">
                                <ICONS.location className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Vị trí</p>
                                    <p className="font-semibold text-gray-800">{taskDetail.location}</p>
                                </div>
                            </div>
                            <div className="border-l h-8 border-gray-200"></div>
                            <div className="flex items-center space-x-2">
                                <ICONS.clock className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Trạng thái</p>
                                      <StatusPill status={taskDetail.status} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow p-5 bg-[#F8F9FE]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Danh sách tài sản</h3>
                            <span className="bg-gray-200 text-gray-700 text-sm font-bold px-2.5 py-1 rounded-md">{taskDetail.items.length}</span>
                        </div>
                        <div className="space-y-3 pb-24">
                            {taskDetail.items.map(item => (
                                <ItemCard key={item.assetId} item={item} />
                            ))}
                        </div>
                    </div>
                </main>
                <div className="flex-shrink-0 p-4 bg-white border-t-2 border-gray-100 grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => navigate('inventoryScan', { taskId: taskDetail.id })}
                        className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2"
                        disabled={taskDetail.status === 'completed'}
                    >
                        <ICONS.scanIcon />
                        <span>Scan</span>
                    </button>
                    <button
                        onClick={() => setConfirmPopupVisible(true)}
                        className="w-full bg-[#3D3799] text-white py-4 rounded-lg font-semibold text-lg disabled:bg-gray-400"
                        disabled={taskDetail.status === 'completed'}
                    >
                        Confirm
                    </button>
                </div>
            </div>

            {isSavePopupVisible && (
                <Popup
                    isVisible={true}
                    title="Đã lưu"
                    message="Tiến độ kiểm kê của bạn đã được lưu lại."
                    onClose={() => setSavePopupVisible(false)}
                    buttonText="OK"
                />
            )}

            {isConfirmPopupVisible && (
                <Popup
                    isVisible={true}
                    title="Xác nhận kiểm kê"
                    message="Bạn có chắc chắn muốn hoàn thành phiếu kiểm kê này không? Hành động này không thể hoàn tác."
                    onClose={() => setConfirmPopupVisible(false)}
                    onConfirm={() => {
                        confirmInventoryTask(taskDetail.id);
                        setConfirmPopupVisible(false);
                        goBack();
                    }}
                    confirmButtonText="Xác nhận"
                    cancelButtonText="Hủy"
                />
            )}
        </Layout>
    );
};

export default InventoryDetailScreen;
