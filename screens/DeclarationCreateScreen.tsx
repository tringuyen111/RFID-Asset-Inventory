import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Popup from '../components/Popup';
import { getWarehouses, getLocations, getAssetTypes } from '../services/api';
import type { Warehouse, Location, AssetType, DeclarationItem } from '../types';

const FormInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder?: string; }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="text-gray-600 text-sm font-semibold mb-2 block">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
        />
    </div>
);

const FormSelect: React.FC<{ label: string; value: string; onChange: (value: string) => void; children: React.ReactNode; disabled?: boolean; }> = ({ label, value, onChange, children, disabled = false }) => (
    <div>
        <label className="text-gray-600 text-sm font-semibold mb-2 block">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
            disabled={disabled}
        >
            {children}
        </select>
    </div>
);


const AddItemModal: React.FC<{
    isVisible: boolean;
    onClose: () => void;
    onAddItem: (item: DeclarationItem) => void;
    assetTypes: AssetType[];
    existingTypeIds: Set<string>;
}> = ({ isVisible, onClose, onAddItem, assetTypes, existingTypeIds }) => {
    const [selectedType, setSelectedType] = useState<{ id: string, name: string } | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [error, setError] = useState('');

    const availableAssetTypes = useMemo(() => assetTypes.filter(at => !existingTypeIds.has(at.id)), [assetTypes, existingTypeIds]);

    useEffect(() => {
        if (isVisible) {
            if (availableAssetTypes.length > 0) {
                setSelectedType(availableAssetTypes[0]);
            } else {
                setSelectedType(null);
            }
            setQuantity('1');
            setError('');
        }
    }, [isVisible, availableAssetTypes]);


    if (!isVisible) return null;

    const handleAdd = () => {
        const numQuantity = parseInt(quantity, 10);
        if (!selectedType) {
            setError('Vui lòng chọn loại tài sản.');
            return;
        }
        if (isNaN(numQuantity) || numQuantity <= 0) {
            setError('Số lượng phải là một số lớn hơn 0.');
            return;
        }
        onAddItem({
            assetTypeId: selectedType.id,
            assetTypeName: selectedType.name,
            quantity: numQuantity,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 m-4 max-w-sm w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Thêm vật tư</h3>
                <div className="space-y-4">
                    <FormSelect label="Loại tài sản" value={selectedType?.id || ''} onChange={(id) => {
                        const type = assetTypes.find(t => t.id === id);
                        if(type) setSelectedType(type);
                    }}>
                        {availableAssetTypes.length > 0 ? (
                            availableAssetTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)
                        ) : (
                            <option value="" disabled>Không có tài sản nào để thêm</option>
                        )}
                    </FormSelect>
                    <div>
                        <label className="text-gray-600 text-sm font-semibold mb-2 block">Số lượng</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập số lượng"
                            min="1"
                        />
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex items-center space-x-3 mt-6">
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold">Hủy</button>
                    <button onClick={handleAdd} className="w-full bg-[#3D3799] text-white py-3 rounded-lg font-semibold">Thêm</button>
                </div>
            </div>
        </div>
    );
};

const DeclarationCreateScreen: React.FC = () => {
    const { goBack, createDeclaration } = useNavigation();

    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);

    const [name, setName] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [items, setItems] = useState<DeclarationItem[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [popup, setPopup] = useState<{ type: 'error' | 'success', message: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [wh, loc, at] = await Promise.all([
                getWarehouses(),
                getLocations(),
                getAssetTypes(),
            ]);
            setWarehouses(wh);
            setLocations(loc);
            setAssetTypes(at);
        };
        fetchData();
    }, []);

    const availableLocations = useMemo(() => {
        if (!selectedWarehouse) return [];
        return locations.filter(loc => loc.warehouseId === selectedWarehouse);
    }, [locations, selectedWarehouse]);
    
    const existingItemTypeIds = useMemo(() => new Set(items.map(item => item.assetTypeId)), [items]);

    const handleAddItem = (item: DeclarationItem) => {
        setItems(prev => [...prev, item]);
        setIsModalVisible(false);
    };

    const handleRemoveItem = (assetTypeIdToRemove: string) => {
        setItems(prev => prev.filter(item => item.assetTypeId !== assetTypeIdToRemove));
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setPopup({ type: 'error', message: 'Tên phiếu không được để trống.' });
            return;
        }
        if (!selectedWarehouse) {
            setPopup({ type: 'error', message: 'Vui lòng chọn một kho.' });
            return;
        }
        if (items.length === 0) {
            setPopup({ type: 'error', message: 'Vui lòng thêm ít nhất một vật tư.' });
            return;
        }

        setIsSubmitting(true);
        createDeclaration({
            name,
            warehouseId: selectedWarehouse,
            locationId: selectedLocation || null,
            items,
        });
        setIsSubmitting(false);
        setPopup({ type: 'success', message: 'Tạo phiếu khai báo thành công!' });
    };

    const handlePopupClose = () => {
        if (popup?.type === 'success') {
            goBack();
        }
        setPopup(null);
    };

    return (
        <Layout>
            <Header title="Tạo Phiếu Khai Báo" showBackButton={true} />
            <main className="flex-grow p-5 custom-scrollbar overflow-y-auto space-y-4">
                <FormInput label="Tên phiếu khai báo" value={name} onChange={setName} placeholder="VD: Khai báo nội thất VP Defdi" />
                <FormSelect label="Chọn Kho (bắt buộc)" value={selectedWarehouse} onChange={(id) => {
                    setSelectedWarehouse(id);
                    setSelectedLocation(''); // Reset location on warehouse change
                }}>
                    <option value="" disabled>-- Chọn kho --</option>
                    {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                </FormSelect>
                <FormSelect label="Chọn Location (không bắt buộc)" value={selectedLocation} onChange={setSelectedLocation} disabled={!selectedWarehouse}>
                    <option value="">-- Không chọn --</option>
                    {availableLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </FormSelect>
                
                <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-gray-800">Danh sách vật tư</h3>
                         <button onClick={() => setIsModalVisible(true)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm">+ Thêm</button>
                    </div>
                    <div className="space-y-2">
                        {items.length > 0 ? items.map(item => (
                            <div key={item.assetTypeId} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{item.assetTypeName}</p>
                                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                </div>
                                <button onClick={() => handleRemoveItem(item.assetTypeId)} className="text-red-500 font-bold p-2">Xóa</button>
                            </div>
                        )) : (
                            <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
                                <p>Chưa có vật tư nào được thêm.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
            <div className="flex-shrink-0 p-4 bg-white border-t-2 border-gray-100">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#3D3799] text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg disabled:bg-gray-400"
                >
                    {isSubmitting ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Tạo phiếu'}
                </button>
            </div>

            <AddItemModal 
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onAddItem={handleAddItem}
                assetTypes={assetTypes}
                existingTypeIds={existingItemTypeIds}
            />

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

export default DeclarationCreateScreen;
