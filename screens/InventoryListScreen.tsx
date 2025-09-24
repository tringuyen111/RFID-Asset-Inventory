
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../App';
import type { InventoryTask } from '../types';
import { getInventoryTasks } from '../services/api';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';

const InventoryTaskCard: React.FC<{ task: InventoryTask }> = ({ task }) => {
    const { navigate } = useNavigation();
    const statusConfig = {
        pending: { text: 'Chờ xử lý', bg: 'bg-blue-100', text_color: 'text-blue-600' },
        completed: { text: 'Hoàn thành', bg: 'bg-green-100', text_color: 'text-green-600' }
    };
    const currentStatus = statusConfig[task.status];

    return (
        <div onClick={() => navigate('inventoryDetail', { taskId: task.id })}
             className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-400 transition-colors">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <ICONS.inventoryTaskIcon className="text-gray-500 w-6 h-6" />
                    </div>
                    <p className="font-bold text-lg text-gray-800">{task.id}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${currentStatus.bg} ${currentStatus.text_color}`}>
                    {currentStatus.text}
                </span>
            </div>
            <div className="mt-4 grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                <p className="text-gray-500">Tên phiếu</p>
                <p className="font-medium text-gray-800 truncate">{task.name}</p>
                <p className="text-gray-500">Ngày kiểm kê</p>
                <p className="font-medium text-gray-800">{task.createdAt}</p>
            </div>
        </div>
    );
};


const InventoryListScreen: React.FC = () => {
    const [tasks, setTasks] = useState<InventoryTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            const fetchedTasks = await getInventoryTasks();
            setTasks(fetchedTasks);
            setIsLoading(false);
        }
        loadTasks();
    }, []);

    const pendingTasks = useMemo(() => 
        tasks.filter(task => task.status === 'pending'), 
        [tasks]
    );

    return (
        <Layout>
            <Header title="Kiểm kê" showBackButton={true} confirmOnBack={false} />
            <div className="p-4 flex flex-col flex-grow">
                {isLoading ? (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <main className="flex-grow space-y-3 custom-scrollbar overflow-y-auto">
                        {pendingTasks.length > 0 ? (
                            pendingTasks.map(task => <InventoryTaskCard key={task.id} task={task} />)
                        ) : (
                            <p className="text-center text-gray-500 mt-8">Không tìm thấy phiếu nào.</p>
                        )}
                    </main>
                )}
            </div>
        </Layout>
    );
};

export default InventoryListScreen;