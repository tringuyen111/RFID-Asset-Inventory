
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { InventoryTaskDetail, InventoryItem, ScannedInventoryEPC, AssetInfo } from '../types';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';
import { ALL_ASSETS_DB } from '../services/data';
import Popup from '../components/Popup';

// Internal state type for UI purposes
type UIStatus = 'valid' | 'invalid_surplus' | 'invalid_not_found';
interface ScannedEpcUI extends ScannedInventoryEPC {
    uiStatus: UIStatus;
}

const EpcListItem: React.FC<{
    scan: ScannedEpcUI;
    onDelete: () => void;
}> = ({ scan, onDelete }) => {
    const [isSwiped, setIsSwiped] = useState(false);
    return (
        <div className="relative bg-gray-100 rounded-lg shadow-sm overflow-hidden">
             <div className="absolute top-0 right-0 h-full w-24 flex items-center justify-center">
                 <button
                    onClick={onDelete}
                    aria-label={`Delete EPC ${scan.epc}`}
                    className={`bg-red-500 text-white font-bold h-12 w-20 flex items-center justify-center rounded-lg text-sm transition-opacity duration-300 ${isSwiped ? 'opacity-100' : 'opacity-0'}`}
                    style={{ pointerEvents: isSwiped ? 'auto' : 'none' }}
                >
                    Xóa
                </button>
            </div>
            <div
                onClick={() => setIsSwiped(!isSwiped)}
                className={`relative bg-white p-4 flex flex-col transition-transform duration-300 ease-in-out ${isSwiped ? '-translate-x-24' : 'translate-x-0'}`}
                style={{ cursor: 'pointer', zIndex: 1 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <ICONS.qrCode className="text-gray-500" />
                        <span className="text-gray-500 font-mono">EPC</span>
                    </div>
                    <span className="font-semibold text-gray-800 font-mono">{scan.epc}</span>
                </div>
                <p className="text-red-600 text-sm mt-2 pl-10">EPC không tìm thấy trong hệ thống.</p>
            </div>
        </div>
    );
};

const SurplusEpcListItem: React.FC<{ scan: ScannedEpcUI }> = ({ scan }) => {
    const { navigate } = useNavigation();
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <ICONS.qrCode className="text-gray-500" />
                    <div>
                        <span className="font-semibold text-gray-800 font-mono">{scan.epc}</span>
                        <p className="text-yellow-700 text-sm">{`Tài sản thừa: ${scan.assetInfo?.assetName || 'Không rõ'}`}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('assetFinder', {
                        epc: scan.epc,
                        assetName: scan.assetInfo?.assetName ?? 'Unknown Asset'
                    })}
                    className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-semibold text-sm hover:bg-blue-200 transition-colors"
                >
                    <ICONS.locate className="w-5 h-5" />
                    <span>Định vị</span>
                </button>
            </div>
        </div>
    );
};

const MatchedAssetGroup: React.FC<{
    item: InventoryItem;
    scannedCount: number;
}> = ({ item, scannedCount }) => {
    const isCompleted = scannedCount >= item.quantityRequired;
    const isOver = scannedCount > item.quantityRequired;
    
    let statusColor = 'text-gray-800';
    if (isCompleted && !isOver) statusColor = 'text-green-600';
    if (isOver) statusColor = 'text-red-600';

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">{item.assetType}</h3>
                    <p className="text-sm text-gray-500">{item.assetName}</p>
                </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Số lượng đã quét / cần quét</span>
                <span className={`font-semibold ${statusColor}`}>
                    {scannedCount} / {item.quantityRequired} <span className="text-gray-400">PCS</span>
                </span>
            </div>
        </div>
    );
};


interface InventoryScanScreenProps {
  taskDetail: InventoryTaskDetail;
  onConfirmScan: (taskId: string, validScans: ScannedEpcUI[]) => void;
}

const InventoryScanScreen: React.FC<InventoryScanScreenProps> = ({ taskDetail, onConfirmScan }) => {
    const { goBack, navigate } = useNavigation();
    const [activeTab, setActiveTab] = useState<'matched' | 'surplus' | 'error'>('matched');
    const [scannedEPCs, setScannedEPCs] = useState<ScannedEpcUI[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);

    const expectedEpcMap = useMemo(() => {
        const map = new Map<string, string>(); // epc -> assetId
        taskDetail.items.forEach(item => {
            item.expectedEpcs.forEach(epc => {
                map.set(epc, item.assetId);
            });
        });
        return map;
    }, [taskDetail.items]);

    const handleScanResults = useCallback((epcs: string[]) => {
        if (epcs.length === 0) return;
        
        setIsProcessing(true);
        const newScans: ScannedEpcUI[] = [];
        const currentEpcs = new Set(scannedEPCs.map(s => s.epc));

        const uniqueNewEpcs = epcs.filter(epc => !currentEpcs.has(epc));

        for (const epc of uniqueNewEpcs) {
            let uiStatus: UIStatus;
            const assetInfo = ALL_ASSETS_DB[epc];
            let status: ScannedInventoryEPC['status'] = 'error_not_found';
            
            if (assetInfo) { // Found in system DB
                if (expectedEpcMap.has(epc)) {
                    uiStatus = 'valid';
                    status = 'valid';
                } else {
                    uiStatus = 'invalid_surplus';
                    status = 'surplus';
                }
            } else { // Not in system DB
                uiStatus = 'invalid_not_found';
                status = 'error_not_found';
            }
            newScans.push({ epc, status, assetInfo, uiStatus });
        }

        if (newScans.length > 0) {
            setScannedEPCs(prevScans => [...prevScans, ...newScans]);
        }
        
        const hasError = newScans.some(s => s.uiStatus === 'invalid_not_found');
        const hasSurplus = newScans.some(s => s.uiStatus === 'invalid_surplus');

        if (hasError) setActiveTab('error');
        else if (hasSurplus) setActiveTab('surplus');
        
        setIsProcessing(false);
    }, [scannedEPCs, expectedEpcMap]);

    const matchedScans = useMemo(() => scannedEPCs.filter(s => s.uiStatus === 'valid'), [scannedEPCs]);
    const surplusScans = useMemo(() => scannedEPCs.filter(s => s.uiStatus === 'invalid_surplus'), [scannedEPCs]);
    const errorScans = useMemo(() => scannedEPCs.filter(s => s.uiStatus === 'invalid_not_found'), [scannedEPCs]);

    const matchedItemsData = useMemo(() => {
        const groupedByAssetId = new Map<string, number>();
        matchedScans.forEach(scan => {
            const assetId = scan.assetInfo?.assetId;
            if (assetId) {
                groupedByAssetId.set(assetId, (groupedByAssetId.get(assetId) || 0) + 1);
            }
        });

        return taskDetail.items.map(item => ({
            item,
            scannedCount: groupedByAssetId.get(item.assetId) || 0,
        }));
    }, [matchedScans, taskDetail.items]);

    const handleConfirm = () => {
        setPopupVisible(true);
    };

    const confirmAndGoBack = () => {
        onConfirmScan(taskDetail.id, matchedScans);
        goBack();
    }

    const handleDeleteErrorScan = (epcToDelete: string) => {
        setScannedEPCs(prev => prev.filter(s => s.epc !== epcToDelete));
    };

    const handleScan = () => {
        const mockEpcs = [
            ...taskDetail.items[0].expectedEpcs.slice(0, 2), // 2 valid for item 1
            ...taskDetail.items[1].expectedEpcs.slice(0, 1), // 1 valid for item 2
            'EPC-D4-001', // surplus
            'EPC-E5-001', // surplus
            'UNKNOWN-EPC-001', // error
            'UNKNOWN-EPC-002', // error
        ];
        navigate('radarScan', { onScanComplete: handleScanResults, mockEpcs });
    };

    useEffect(() => {
        // Automatically start scanning when the screen is opened for the first time.
        handleScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // This effect runs only once on component mount.

    const renderActiveList = () => {
        switch(activeTab) {
            case 'matched':
                return (
                    <div className="space-y-3">
                        {matchedItemsData.map(data => <MatchedAssetGroup key={data.item.assetId} {...data} />)}
                    </div>
                );
            case 'surplus':
                 return (
                    <div className="space-y-3">
                        {surplusScans.map((scan) => <SurplusEpcListItem key={scan.epc} scan={scan} />)}
                        {surplusScans.length === 0 && <p className="text-center text-gray-500 pt-10">Không có tài sản thừa.</p>}
                    </div>
                );
            case 'error':
                 return (
                    <div className="space-y-3">
                        {errorScans.map((scan) => <EpcListItem key={scan.epc} scan={scan} onDelete={() => handleDeleteErrorScan(scan.epc)} />)}
                        {errorScans.length === 0 && <p className="text-center text-gray-500 pt-10">Không có EPC lỗi.</p>}
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <Layout>
            <Header title="Kết quả quét" showBackButton={true} />
            <div className="p-4 flex-grow flex flex-col overflow-hidden">
                <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('matched')} className={`flex-1 py-3 font-semibold transition-colors text-sm ${activeTab === 'matched' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        Khớp ({matchedScans.length})
                    </button>
                    <button onClick={() => setActiveTab('surplus')} className={`flex-1 py-3 font-semibold transition-colors text-sm ${activeTab === 'surplus' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        Thừa ({surplusScans.length})
                    </button>
                    <button onClick={() => setActiveTab('error')} className={`flex-1 py-3 font-semibold transition-colors text-sm ${activeTab === 'error' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        Lỗi ({errorScans.length})
                    </button>
                </div>
                
                <div className="flex-grow custom-scrollbar overflow-y-auto pb-40">
                    {renderActiveList()}
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 grid grid-cols-2 gap-3">
                <button onClick={handleScan} disabled={isProcessing} className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 disabled:opacity-50">
                    {isProcessing ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div> : <><ICONS.scanIcon /><span>Tiếp tục Scan</span></>}
                </button>
                <button onClick={handleConfirm} className="w-full bg-[#3D3799] text-white py-4 rounded-lg font-semibold text-lg">
                    Xác nhận
                </button>
            </div>
            {popupVisible && (
                <Popup
                    isVisible={true}
                    title="Xác nhận kết quả"
                    message="Bạn có chắc chắn muốn xác nhận kết quả quét này? Số lượng đã kiểm kê sẽ được cập nhật."
                    onClose={() => setPopupVisible(false)}
                    onConfirm={confirmAndGoBack}
                    confirmButtonText="Xác nhận"
                    cancelButtonText="Hủy"
                />
            )}
        </Layout>
    );
};

export default InventoryScanScreen;