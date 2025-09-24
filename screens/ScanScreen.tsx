import React, { useState, useMemo, useCallback } from 'react';
import type { Item, ScannedEPC } from '../types';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';
import { checkEpcDuplicate } from '../services/api';
import Popup from '../components/Popup';

interface ScanScreenProps {
  item: Item;
  registrationId: string;
  onConfirmScan: (registrationId: string, itemId: string, scannedCount: number) => void;
}

const EpcListItem: React.FC<{
    scan: ScannedEPC;
    isInvalid: boolean;
    isSwiped: boolean;
    onSwipe: () => void;
    onDelete: () => void;
}> = ({ scan, isInvalid, isSwiped, onSwipe, onDelete }) => {
    return (
        <div className="relative bg-white rounded-lg shadow-sm overflow-hidden">
            <div
                onClick={onSwipe}
                className={`p-4 flex items-center justify-between transition-transform duration-300 ease-in-out ${isSwiped ? '-translate-x-20' : 'translate-x-0'}`}
                style={{ cursor: isInvalid ? 'pointer' : 'default' }}
            >
                <div className="flex items-center space-x-4">
                    <ICONS.qrCode className="text-gray-500" />
                    <span className="text-gray-500 font-mono">EPC</span>
                </div>
                <span className="font-semibold text-gray-800 font-mono">{scan.epc}</span>
            </div>
            {isInvalid && (
                <button
                    onClick={onDelete}
                    aria-label={`Delete EPC ${scan.epc}`}
                    className="absolute top-0 right-0 h-full w-20 bg-red-500 text-white flex items-center justify-center text-sm font-bold transition-opacity"
                    style={{ opacity: isSwiped ? 1 : 0, pointerEvents: isSwiped ? 'auto' : 'none' }}
                >
                    Xóa
                </button>
            )}
        </div>
    );
};


const ScanScreen: React.FC<ScanScreenProps> = ({ item, registrationId, onConfirmScan }) => {
    const { goBack, navigate } = useNavigation();
    const [activeTab, setActiveTab] = useState<'valid' | 'invalid'>('valid');
    const [scannedEPCs, setScannedEPCs] = useState<ScannedEPC[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [swipedInvalidEpc, setSwipedInvalidEpc] = useState<string | null>(null);
    const [popupInfo, setPopupInfo] = useState<{isVisible: boolean; type: 'insufficient' | 'overscan_reset' | 'success' | null}>({ isVisible: false, type: null });

    const validScans = useMemo(() => scannedEPCs.filter(s => s.status === 'valid'), [scannedEPCs]);
    const invalidScans = useMemo(() => scannedEPCs.filter(s => s.status !== 'valid'), [scannedEPCs]);
    
    const handleScanResults = useCallback(async (epcs: string[]) => {
        if (epcs.length === 0) return;
        
        setIsProcessing(true);
        const newScans: ScannedEPC[] = [];
        const currentEpcs = new Set(scannedEPCs.map(s => s.epc));
        const uniqueNewEpcs = epcs.filter(epc => !currentEpcs.has(epc));

        let hasInvalid = false;
        for (const epc of uniqueNewEpcs) {
            const { isDuplicate } = await checkEpcDuplicate(epc);
            if (isDuplicate) {
                newScans.push({ epc, status: 'invalid_duplicate_system' });
                hasInvalid = true;
            } else {
                newScans.push({ epc, status: 'valid' });
            }
        }

        if (newScans.length > 0) {
            setScannedEPCs(prevScans => [...prevScans, ...newScans]);
        }

        if (hasInvalid) {
            setActiveTab('invalid');
        }
        
        setIsProcessing(false);

    }, [scannedEPCs]);

    const handleScan = () => {
        navigate('radarScan', { onScanComplete: handleScanResults });
    };

    const handleConfirm = () => {
        if (validScans.length > item.quantityRequired) {
            setPopupInfo({ isVisible: true, type: 'overscan_reset' });
            return;
        }

        if (validScans.length < item.quantityRequired) {
            setPopupInfo({ isVisible: true, type: 'insufficient' });
            return;
        }
        
        if (validScans.length === item.quantityRequired) {
            setPopupInfo({ isVisible: true, type: 'success' });
        }
    };

    const handleDeleteInvalidScan = (epcToDelete: string) => {
        setScannedEPCs(prev => prev.filter(s => s.epc !== epcToDelete));
        setSwipedInvalidEpc(null);
    };

    const EpcList = ({ epcs, isInvalidList = false }: { epcs: ScannedEPC[], isInvalidList?: boolean }) => (
        <div className="space-y-3">
            {epcs.map((scan, index) => (
                 <EpcListItem
                    key={`${scan.epc}-${index}`}
                    scan={scan}
                    isInvalid={isInvalidList}
                    isSwiped={isInvalidList && swipedInvalidEpc === scan.epc}
                    onSwipe={() => {
                        if (isInvalidList) {
                            setSwipedInvalidEpc(prev => prev === scan.epc ? null : scan.epc);
                        }
                    }}
                    onDelete={() => handleDeleteInvalidScan(scan.epc)}
                />
            ))}
            {epcs.length === 0 && (
                <div className="text-center text-gray-500 pt-10">
                    <p>No EPCs scanned yet.</p>
                </div>
            )}
        </div>
    );

    const renderPopup = () => {
        if (!popupInfo.isVisible) return null;
        
        const closePopup = () => setPopupInfo({ isVisible: false, type: null });

        if (popupInfo.type === 'insufficient') {
            return <Popup
                isVisible={true}
                title="Thông báo"
                message="Chưa scan đủ số lượng. Vui lòng hoàn tất thao tác!"
                onClose={closePopup}
                buttonText="OK"
            />
        }

        if (popupInfo.type === 'overscan_reset') {
            return <Popup
                isVisible={true}
                title="Cảnh báo"
                message="Số lượng quét vượt quá yêu cầu. Dữ liệu đã được xóa. Vui lòng quét lại."
                onClose={() => {
                     setScannedEPCs([]);
                     setSwipedInvalidEpc(null);
                     setActiveTab('valid');
                     closePopup();
                }}
                buttonText="Đã hiểu"
            />
        }

        if (popupInfo.type === 'success') {
            return <Popup
                isVisible={true}
                title="Thành công"
                message="Khai báo thành công!"
                onClose={() => {
                     onConfirmScan(registrationId, item.id, validScans.length);
                     goBack();
                }}
                buttonText="OK"
            />
        }
        
        return null;
    }


    return (
        <Layout>
            <Header title={item.name} showBackButton={true} />
            <div className="p-4 flex-grow flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-500 text-white p-3 rounded-xl flex flex-col items-center justify-center shadow-lg text-center">
                        <span className="font-semibold text-base">Số lượng cần khai báo</span>
                        <span className="text-3xl font-bold">{item.quantityRequired}</span>
                    </div>
                    <div className={`text-white p-3 rounded-xl flex flex-col items-center justify-center shadow-lg text-center ${validScans.length > item.quantityRequired ? 'bg-red-500' : (validScans.length === item.quantityRequired ? 'bg-green-500' : 'bg-yellow-500')}`}>
                        <span className="font-semibold text-base">Đã quét</span>
                        <span className="text-3xl font-bold">{validScans.length}</span>
                    </div>
                </div>

                <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('valid')} className={`flex-1 py-3 font-semibold transition-colors ${activeTab === 'valid' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        Danh sách hợp lệ
                    </button>
                    <button onClick={() => setActiveTab('invalid')} className={`flex-1 py-3 font-semibold transition-colors relative ${activeTab === 'invalid' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        Danh sách không hợp lệ
                        {invalidScans.length > 0 && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{invalidScans.length}</span>
                        )}
                    </button>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-bold text-gray-800">Danh sách EPC</h3>
                    <span className="bg-gray-200 text-gray-700 text-sm font-bold px-2.5 py-1 rounded-md">
                        {activeTab === 'valid' ? validScans.length : invalidScans.length}
                    </span>
                </div>

                <div className="flex-grow custom-scrollbar overflow-y-auto pb-40">
                    {activeTab === 'valid' ? <EpcList epcs={validScans} /> : <EpcList epcs={invalidScans} isInvalidList={true} />}
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 grid grid-cols-2 gap-3">
                <button
                    onClick={handleScan}
                    disabled={isProcessing}
                    className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                    {isProcessing ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                    ) : (
                        <>
                            <ICONS.scanIcon />
                            <span>Scan</span>
                        </>
                    )}
                </button>
                <button 
                    onClick={handleConfirm}
                    className="w-full bg-[#3D3799] text-white py-4 rounded-lg font-semibold text-lg"
                >
                    Confirm
                </button>
            </div>
            {renderPopup()}
        </Layout>
    );
};

export default ScanScreen;