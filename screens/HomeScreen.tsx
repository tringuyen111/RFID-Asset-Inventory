import React from 'react';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { ICONS } from '../constants';

const HomeScreen: React.FC = () => {
  const { navigate } = useNavigation();

  const menuItems = [
    { title: 'Khai báo', icon: ICONS.declaration, action: () => navigate('declarationList'), notification: 0, color: 'text-blue-500' },
    { title: 'Kiểm kê', icon: ICONS.inventory, action: () => navigate('inventoryList'), notification: 1, color: 'text-indigo-500' },
    { title: 'Truy xuất thông tin', icon: ICONS.search, action: () => navigate('lookup'), notification: 0, color: 'text-purple-500' },
  ];

  return (
    <Layout>
      <Header title="Home" />
      <main className="flex-grow p-6 space-y-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center space-x-6 relative"
          >
            <div className={`p-3 rounded-lg bg-indigo-50`}>
                <item.icon className={item.color} />
            </div>
            <span className="text-lg font-semibold text-gray-700">{item.title}</span>
            {item.notification > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {item.notification}
              </div>
            )}
          </button>
        ))}
      </main>
    </Layout>
  );
};

export default HomeScreen;