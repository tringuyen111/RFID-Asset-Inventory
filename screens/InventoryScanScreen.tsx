import React, { useState, useMemo, useCallback } from 'react';
import type { InventoryItem, ScannedInventoryEPC } from '../types';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';
import { checkEpcInInventory } from '../services/api';
import Popup from '../components/Popup';

interface InventoryScanScreenProps {
  item: InventoryItem;
  taskId: string;
  onConfirmScan: (taskId: string, assetId: string, scannedCount: number) => void;
}

// Internal state type for UI purposes
type UIStatus = 'valid' | 'invalid_duplicate' | 'invalid_wrong_asset' | 'invalid_surplus' | 'invalid_not_found';
interface ScannedEpcUI extends ScannedInventoryEPC {
    uiStatus: UIStatus;
}

const getStatusMessage = (scan: ScannedEpcUI): string => {
    switch (scan.uiStatus) {
        case 'invalid_duplicate': return 'Duplicate EPC in this session.';
        case 'invalid_wrong_asset': return `Tài sản sai. Đã quét: ${scan.assetInfo?.assetName || 'Unknown'}`;
        case 'invalid_surplus': return 'Tài sản thừa không có trong phiếu.';
        case 'invalid_not_found': return 'EPC không tìm thấy trong hệ thống.';
        default: return scan.epc;
    }
}

const EpcListItem: React.FC<{
    scan: ScannedEpcUI;
    isInvalid: boolean;
    isSwiped: boolean;
    onSwipe: () => void;
    onDelete: () => void;
}> = ({ scan, isInvalid, isSwiped, onSwipe, onDelete }) => {
    const translateX = isSwiped ? '-translate-x-24' : 'translate-x-0';

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
                onClick={onSwipe}
                className={`relative bg-white p-4 flex flex-col transition-transform duration-300 ease-in-out ${translateX}`}
                style={{ cursor: isInvalid ? 'pointer' : 'default', zIndex: 1 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <ICONS.qrCode className="text-gray-500" />
                        <span className="text-gray-500 font-mono">EPC</span>
                    </div>
                    <span className="font-semibold text-gray-800 font-mono">{scan.epc}</span>
                </div>
                 {isInvalid && <p className="text-red-600 text-sm mt-2 pl-10">{getStatusMessage(scan)}</p>}
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
                        <p className="text-yellow-700 text-sm">{getStatusMessage(scan)}</p>
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


const InventoryScanScreen: React.FC<InventoryScanScreenProps> = ({ item, taskId, onConfirmScan }) => {
    const { goBack, navigate } = useNavigation();
    const [activeTab, setActiveTab] = useState<'valid' | 'surplus' | 'error'>('valid');
    const [scannedEPCs, setScannedEPCs] = useState<ScannedEpcUI[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [swipedInvalidEpc, setSwipedInvalidEpc] = useState<string | null>(null);
    const [popupInfo, setPopupInfo] = useState<{isVisible: boolean; type: 'confirm_submit' | null}>({ isVisible: false, type: null });

    const validScans = useMemo(() => scannedEPCs.filter(s => s.uiStatus === 'valid'), [scannedEPCs]);
    const surplusScans = useMemo(() => scannedEPCs.filter(s => s.uiStatus === 'invalid_surplus' || s.uiStatus === 'invalid_wrong_asset'), [scannedEPCs]);
    const errorScans = useMemo(() => scannedEPCs.filter(s => s.uiStatus === 'invalid_not_found'), [scannedEPCs]);
    
    const handleScanResults = useCallback(async (epcs: string[]) => {
        if (epcs.length === 0) return;
        
        setIsProcessing(true);
        const newScans: ScannedEpcUI[] = [];
        const currentEpcs = new Set(scannedEPCs.map(s => s.epc));

        // Simulate a more realistic scan including valid, surplus, wrong asset, and error EPCs
        const mockNewEpcs = [
            ...epcs,
            ...(item.expectedEpcs.slice(0, 2)), // Scan up to 2 valid EPCs for the current asset
            'EPC-E5-001', // Surplus: Exists in DB, not in this task.
            'EPC-A1-001', // Wrong Asset: Belongs to another asset in the same task.
            'UNKNOWN-EPC-123', // Error: Not in the system DB at all.
        ];
        const uniqueEpcs = [...new Set(mockNewEpcs)];


        for (const epc of uniqueEpcs) {
            if (currentEpcs.has(epc)) {
                // Already processed in this session
                continue;
            }
            
            const result = await checkEpcInInventory(epc, taskId);
            let uiStatus: UIStatus;

            if (result.status === 'error_not_found') {
                uiStatus = 'invalid_not_found';
            } else if (result.status === 'surplus') {
                uiStatus = 'invalid_surplus';
            } else if (result.assetInfo?.assetId !== item.assetId) {
                uiStatus = 'invalid_wrong_asset';
            } else {
                uiStatus = 'valid';
            }
            newScans.push({ epc, ...result, uiStatus });
            currentEpcs.add(epc);
        }

        if (newScans.length > 0) {
            setScannedEPCs(prevScans => [...prevScans, ...newScans]);
        }

        const hasError = newScans.some(s => s.uiStatus === 'invalid_not_found');
        const hasSurplus = newScans.some(s => s.uiStatus === 'invalid_surplus' || s.uiStatus === 'invalid_wrong_asset');

        if (hasError) {
            setActiveTab('error');
        } else if (hasSurplus) {
            setActiveTab('surplus');
        }
        
        setIsProcessing(false);
    }, [scannedEPCs, taskId, item.assetId, item.expectedEpcs]);

    const handleScan = () => {
        navigate('radarScan', { onScanComplete: handleScanResults });
    };

    const handleConfirm = () => {
        setPopupInfo({ isVisible: true, type: 'confirm_submit' });
    };

    const handleDeleteInvalidScan = (epcToDelete: string) => {
        setScannedEPCs(prev => prev.filter(s => s.epc !== epcToDelete));
        setSwipedInvalidEpc(null);
    };

    const EpcList = ({ epcs, isInvalidList = false }: { epcs: ScannedEpcUI[], isInvalidList?: boolean }) => (
        <div className="space-y-3">
            {epcs.map((scan) => (
                 <EpcListItem
                    key={scan.epc}
                    scan={scan}
                    isInvalid={isInvalidList}
                    isSwiped={isInvalidList && swipedInvalidEpc === scan.epc}
                    onSwipe={() => isInvalidList && setSwipedInvalidEpc(prev => prev === scan.epc ? null : scan.epc)}
                    onDelete={() => handleDeleteInvalidScan(scan.epc)}
                />
            ))}
            {epcs.length === 0 && (
                <div className="text-center text-gray-500 pt-10">
                    <p>Chưa có EPC nào được quét.</p>
                </div>
            )}
        </div>
    );
    
    const renderActiveList = () => {
        switch(activeTab) {
            case 'valid':
                return <EpcList epcs={validScans} />;
            case 'surplus':
                 return (
                    <div className="space-y-3">
                        {surplusScans.map((scan) => <SurplusEpcListItem key={scan.epc} scan={scan} />)}
                        {surplusScans.length === 0 && (
                            <div className="text-center text-gray-500 pt-10">
                                <p>Chưa có EPC nào được quét.</p>
                            </div>
                        )}
                    </div>
                );
            case 'error':
                return <EpcList epcs={errorScans} isInvalidList={true} />;
            default:
                return null;
        }
    }

    const renderPopup = () => {
        if (!popupInfo.isVisible) return null;
        const closePopup = () => setPopupInfo({ isVisible: false, type: null });

        if (popupInfo.type === 'confirm_submit') {
             return <Popup
                isVisible={true}
                title="Xác nhận kiểm kê"
                message={`Bạn có chắc chắn muốn xác nhận ${validScans.length} tài sản đã quét?`}
                onClose={closePopup}
                onConfirm={() => {
                    onConfirmScan(taskId, item.assetId, validScans.length);
                    goBack();
                }}
                confirmButtonText="Xác nhận"
                cancelButtonText="Hủy"
            />
        }
        return null;
    }
    
    const getTabCount = (tab: typeof activeTab) => {
        switch(tab) {
            case 'valid': return validScans.length;
            case 'surplus': return surplusScans.length;
            case 'error': return errorScans.length;
        }
    }

    return (
        <Layout>
            <Header title={item.assetName} showBackButton={true} />
            <div className="p-4 flex-grow flex flex-col overflow-hidden">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-500 text-white p-3 rounded-xl flex flex-col items-center justify-center shadow-lg text-center">
                        <span className="font-semibold text-base">Số lượng theo hệ thống</span>
                        <span className="text-3xl font-bold">{item.quantityRequired}</span>
                    </div>
                    <div className="bg-yellow-500 text-white p-3 rounded-xl flex flex-col items-center justify-center shadow-lg text-center">
                        <span className="font-semibold text-base">Đã quét</span>
                        <span className="text-3xl font-bold">{validScans.length}</span>
                    </div>
                </div>

                <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('valid')} className={`flex-1 py-3 font-semibold transition-colors text-sm ${activeTab === 'valid' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        Hợp lệ
                    </button>
                    <button onClick={() => setActiveTab('surplus')} className={`flex-1 py-3 font-semibold transition-colors text-sm ${activeTab === 'surplus' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        <div className="flex items-center justify-center space-x-2">
                            <span>Thừa</span>
                            {surplusScans.length > 0 && <span className="bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{surplusScans.length}</span>}
                        </div>
                    </button>
                    <button onClick={() => setActiveTab('error')} className={`flex-1 py-3 font-semibold transition-colors text-sm ${activeTab === 'error' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                         <div className="flex items-center justify-center space-x-2">
                            <span>Lỗi</span>
                            {errorScans.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{errorScans.length}</span>}
                        </div>
                    </button>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-bold text-gray-800">Danh sách EPC</h3>
                    <span className="bg-gray-200 text-gray-700 text-sm font-bold px-2.5 py-1 rounded-md">{getTabCount(activeTab)}</span>
                </div>

                <div className="flex-grow custom-scrollbar overflow-y-auto">
                    {renderActiveList()}
                </div>
            </div>
            
            <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 grid grid-cols-2 gap-3">
                <button onClick={handleScan} disabled={isProcessing} className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 disabled:opacity-50">
                    {isProcessing ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div> : <><ICONS.scanIcon /><span>Scan</span></>}
                </button>
                <button onClick={handleConfirm} className="w-full bg-[#3D3799] text-white py-4 rounded-lg font-semibold text-lg">
                    Confirm
                </button>
            </div>
            {renderPopup()}
        </Layout>
    );
};

export default InventoryScanScreen;