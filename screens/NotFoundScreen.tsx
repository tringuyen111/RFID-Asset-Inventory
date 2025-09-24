import React from 'react';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import Header from '../components/Header';

interface NotFoundScreenProps {
  scannedId: string;
  type: 'EPC' | 'Barcode';
}

const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ scannedId, type }) => {
  const { goBack, navigate } = useNavigation();

  return (
    <Layout>
      <Header title="Không tìm thấy" showBackButton={true} confirmOnBack={false} />
      <div className="flex flex-col flex-grow items-center justify-center text-center p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">{type} không hợp lệ</h2>
          <p className="text-gray-600 mt-2 mb-4">
            {type} <span className="font-mono bg-gray-200 p-1 rounded">{scannedId}</span> không có trong hệ thống.
          </p>
      </div>
      <div className="flex-shrink-0 p-4 bg-white border-t-2 border-gray-100 grid grid-cols-2 gap-3">
            <button
                onClick={() => goBack()}
                className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold text-lg"
            >
                Thử lại
            </button>
            <button
                onClick={() => navigate('updateMapping', { scannedId, scannedWith: type })}
                className="w-full bg-[#3D3799] text-white py-4 rounded-lg font-semibold text-lg"
            >
                Cập nhật
            </button>
      </div>
    </Layout>
  );
};

export default NotFoundScreen;