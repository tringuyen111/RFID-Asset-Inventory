import React from 'react';
import { useNavigation } from '../App';
import type { AssetDetails } from '../types';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';

const InfoRow: React.FC<{ label: string; value: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = ({ label, value, icon: Icon }) => (
    <div className="flex items-start py-4 border-b border-gray-100 last:border-b-0">
        {Icon && <Icon className="w-5 h-5 text-gray-400 mt-1 mr-4 flex-shrink-0" />}
        <div className="flex-1">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800 break-words">{value}</p>
        </div>
    </div>
);

interface LookupResultScreenProps {
    asset: AssetDetails;
    scannedWith: 'EPC' | 'Barcode';
}

const LookupResultScreen: React.FC<LookupResultScreenProps> = ({ asset, scannedWith }) => {
    const { navigate, goBack } = useNavigation();

    return (
        <Layout>
            <Header title="Kết quả tra cứu" showBackButton={true} confirmOnBack={false}/>
            <main className="flex-grow p-5 custom-scrollbar overflow-y-auto">
                <div className="bg-white p-5 rounded-xl shadow-sm mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{asset.assetName}</h2>
                    <p className="text-gray-500">{asset.assetType}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm">
                    <InfoRow label="Vị trí" value={asset.location} icon={ICONS.location} />
                    <InfoRow label="EPC" value={asset.epc} icon={ICONS.scanIcon} />
                    <InfoRow label="Barcode" value={asset.barcode} icon={ICONS.qrCode} />
                    <InfoRow label="Đơn vị" value={asset.unit} icon={ICONS.clipboard} />
                </div>
            </main>
             <div className="flex-shrink-0 p-4 bg-white border-t-2 border-gray-100 grid grid-cols-2 gap-3">
                <button
                    onClick={() => goBack()}
                    className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold text-lg"
                >
                    Quét lại
                </button>
                <button
                    onClick={() => navigate('updateMapping', { asset, scannedWith })}
                    className="w-full bg-[#3D3799] text-white py-4 rounded-lg font-semibold text-lg"
                >
                    Cập nhật
                </button>
            </div>
        </Layout>
    );
};

export default LookupResultScreen;