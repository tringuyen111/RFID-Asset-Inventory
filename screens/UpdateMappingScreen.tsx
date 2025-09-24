import React, { useState } from 'react';
import { useNavigation } from '../App';
import type { AssetDetails } from '../types';
import { updateAssetDetails } from '../services/api';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Popup from '../components/Popup';

interface UpdateMappingScreenProps {
  asset?: AssetDetails;
  scannedId?: string;
  scannedWith?: 'EPC' | 'Barcode';
}

const FormInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }> = ({ label, value, onChange, placeholder, disabled=false }) => (
    <div>
        <label className="text-gray-600 text-sm font-semibold mb-2 block">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
            disabled={disabled}
        />
    </div>
);

const UpdateMappingScreen: React.FC<UpdateMappingScreenProps> = ({ asset, scannedId, scannedWith }) => {
  const { goBack } = useNavigation();

  const isCreatingNew = !asset && !!scannedId;

  // Logic to disable fields based on context (creating vs. updating)
  const isAssetInfoDisabled = !isCreatingNew;
  let isEpcDisabled = false;
  let isBarcodeDisabled = false;

  if (isCreatingNew) {
      // Creating a new asset: info fields are editable, scanned ID is locked.
      isEpcDisabled = scannedWith === 'EPC';
      isBarcodeDisabled = scannedWith === 'Barcode';
  } else {
      // Updating an existing asset: info fields are locked, only the opposite ID is editable.
      isEpcDisabled = scannedWith !== 'Barcode';
      isBarcodeDisabled = scannedWith !== 'EPC';
  }


  const [formData, setFormData] = useState<Omit<AssetDetails, 'id'>>({
    assetName: asset?.assetName || '',
    assetType: asset?.assetType || '',
    location: asset?.location || '',
    epc: asset?.epc || (scannedWith === 'EPC' ? scannedId : '') || '',
    barcode: asset?.barcode || (scannedWith === 'Barcode' ? scannedId : '') || '',
    unit: asset?.unit || 'Cái',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    const submissionData: AssetDetails = {
        id: asset?.id || `ASSET-${Date.now()}`, // Generate new ID if creating
        ...formData,
    };
    const result = await updateAssetDetails(submissionData);
    setIsLoading(false);

    if (result.success) {
      setPopup({ type: 'success', message: 'Cập nhật thành công!' });
    } else {
      setPopup({ type: 'error', message: result.error || 'Đã có lỗi xảy ra.' });
    }
  };
  
  const handlePopupClose = () => {
    if (popup?.type === 'success') {
      goBack(2); // Go back past result/not-found and list screen
    } else {
      setPopup(null);
    }
  };

  return (
    <Layout>
      <Header title={asset ? "Cập nhật tài sản" : "Thêm tài sản mới"} showBackButton={true} />
      <main className="flex-grow p-5 custom-scrollbar overflow-y-auto space-y-4">
        <FormInput label="Tên vật tư" value={formData.assetName} onChange={v => handleInputChange('assetName', v)} disabled={isAssetInfoDisabled} />
        <FormInput label="Loại vật tư" value={formData.assetType} onChange={v => handleInputChange('assetType', v)} disabled={isAssetInfoDisabled} />
        <FormInput label="Vị trí" value={formData.location} onChange={v => handleInputChange('location', v)} disabled={isAssetInfoDisabled} />
        <FormInput label="Đơn vị" value={formData.unit} onChange={v => handleInputChange('unit', v)} disabled={isAssetInfoDisabled} />
        <FormInput label="EPC" value={formData.epc} onChange={v => handleInputChange('epc', v)} disabled={isEpcDisabled} />
        <FormInput label="Barcode" value={formData.barcode} onChange={v => handleInputChange('barcode', v)} disabled={isBarcodeDisabled} />
      </main>
      <div className="flex-shrink-0 p-4 bg-white border-t-2 border-gray-100">
        <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#3D3799] text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg disabled:bg-gray-400"
        >
            {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Xác nhận'}
        </button>
      </div>
      {popup && (
        <Popup
            isVisible={true}
            title={popup.type === 'success' ? 'Thành công' : 'Lỗi'}
            message={popup.message}
            onClose={handlePopupClose}
            buttonText="OK"
        />
      )}
    </Layout>
  );
};

export default UpdateMappingScreen;