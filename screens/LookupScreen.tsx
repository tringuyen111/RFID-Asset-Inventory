
import React, { useState, useCallback } from 'react';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';
import { lookupAssetByEpc, lookupAssetByBarcode } from '../services/api';
import Popup from '../components/Popup';
import type { AssetDetails } from '../types';
import { ASSET_LOOKUP_DB } from '../services/data';

type ScanMode = 'RFID' | 'Barcode';

const LookupScreen: React.FC = () => {
  const { navigate, goBack } = useNavigation();
  const [selectedMode, setSelectedMode] = useState<ScanMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  const handleRfidScanComplete = useCallback(async (epcs: string[]) => {
    goBack(); // Close radar
    if (epcs.length === 0) {
      setErrorPopup("Không tìm thấy thẻ RFID nào.");
      setIsLoading(false);
      setSelectedMode(null);
      return;
    }
    
    const results = await Promise.all(epcs.map(epc => lookupAssetByEpc(epc)));
    const foundAssets = results.filter((asset): asset is AssetDetails => asset !== null);

    setIsLoading(false);
    setSelectedMode(null);

    if (foundAssets.length > 0) {
      navigate('lookupList', { assets: foundAssets });
    } else {
      setErrorPopup(`Không tìm thấy tài sản nào tương ứng với ${epcs.length} thẻ RFID đã quét.`);
    }
  }, [navigate, goBack]);
  
  const handleBarcodeLookup = useCallback(async (barcode: string) => {
    const asset = await lookupAssetByBarcode(barcode);
    setIsLoading(false);
    setSelectedMode(null);
    if (asset) {
      navigate('lookupResult', { asset, scannedWith: 'Barcode' });
    } else {
      navigate('notFound', { scannedId: barcode, type: 'Barcode' });
    }
  }, [navigate]);

  const selectModeAndScan = (mode: ScanMode) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setSelectedMode(mode);

    if (mode === 'RFID') {
      const mockEpcsToScan = Object.keys(ASSET_LOOKUP_DB).slice(0, 5);
      setTimeout(() => navigate('radarScan', { onScanComplete: handleRfidScanComplete, mockEpcs: mockEpcsToScan }), 100);
    } else if (mode === 'Barcode') {
      // In a real app, this would open a camera. We simulate a successful scan.
      setTimeout(() => handleBarcodeLookup('BC-B2-001'), 700);
    }
  };

  const ModeButton: React.FC<{
    mode: ScanMode,
    label: string,
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
    colors: { bg: string, border: string, text: string, icon: string }
  }> = ({ mode, label, icon: Icon, colors }) => (
    <button 
      onClick={() => selectModeAndScan(mode)} 
      disabled={isLoading}
      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center space-y-2 h-32
        ${selectedMode === mode ? `${colors.bg} ${colors.border} shadow-md` : 'bg-white border-gray-200'}
        disabled:opacity-50`}
    >
      {isLoading && selectedMode === mode ? (
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
      ) : (
        <Icon className={`h-10 w-10 ${colors.icon}`} />
      )}
      <span className={`font-semibold ${colors.text}`}>{label}</span>
    </button>
  );

  return (
    <Layout>
      <Header title="Truy xuất thông tin" showBackButton={true} confirmOnBack={false} />
      <div className="flex flex-col flex-grow p-6 justify-center">
        <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Chọn chế độ quét</h2>
            <p className="text-gray-500 mb-6">Chọn phương thức để bắt đầu tra cứu thông tin tài sản.</p>
            <div className="grid grid-cols-2 gap-4">
                <ModeButton 
                  mode="RFID"
                  label="RFID"
                  icon={ICONS.scanIcon}
                  colors={{ bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800', icon: 'text-blue-600' }}
                />
                 <ModeButton 
                  mode="Barcode"
                  label="Barcode"
                  icon={ICONS.qrCode}
                  colors={{ bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', icon: 'text-green-600' }}
                />
            </div>
        </div>
        
        {errorPopup && (
          <Popup isVisible={true} title="Lỗi" message={errorPopup} onClose={() => setErrorPopup(null)} buttonText="OK" />
        )}
      </div>
    </Layout>
  );
};
export default LookupScreen;
