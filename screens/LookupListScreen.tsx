import React from 'react';
import { useNavigation } from '../App';
import type { AssetDetails } from '../types';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';

interface LookupListScreenProps {
  assets: AssetDetails[];
}

const AssetCard: React.FC<{ asset: AssetDetails }> = ({ asset }) => {
    const { navigate } = useNavigation();
    return (
        <div onClick={() => navigate('lookupResult', { asset, scannedWith: 'EPC' })}
             className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-400 transition-colors">
            <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                    <ICONS.qrCode className="text-gray-500" />
                </div>
                <div>
                    <p className="font-bold text-gray-800 text-lg">{asset.assetName}</p>
                    <p className="text-sm text-gray-500 font-mono">{asset.epc}</p>
                </div>
            </div>
        </div>
    );
};


const LookupListScreen: React.FC<LookupListScreenProps> = ({ assets }) => {
    return (
        <Layout>
            <Header title="Kết quả quét RFID" showBackButton={true} confirmOnBack={false} />
            <div className="p-4 flex-grow flex flex-col">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Tìm thấy {assets.length} tài sản</h3>
                </div>
                <main className="flex-grow space-y-3 pb-4 custom-scrollbar overflow-y-auto">
                    {assets.map(asset => <AssetCard key={asset.epc} asset={asset} />)}
                </main>
            </div>
        </Layout>
    );
};

export default LookupListScreen;
