
import React, { useState, useCallback, createContext, useContext } from 'react';
// FIX: `NavigationContextType` was not imported. It's needed for the NavigationContext.
import type { Screen, Registration, RegistrationDetail, InventoryTaskDetail, NavigationContextType, AssetDetails, DeclarationItem, InventoryItem, AssetInfo } from './types';
import { MOCK_REGISTRATIONS, MOCK_REGISTRATION_DETAILS, MOCK_INVENTORY_DETAILS } from './services/data';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import DeclarationListScreen from './screens/DeclarationListScreen';
import DeclarationDetailScreen from './screens/DeclarationDetailScreen';
import DeclarationCreateScreen from './screens/DeclarationCreateScreen';
import ScanScreen from './screens/ScanScreen';
import RadarScanScreen from './screens/RadarScanScreen';
import InventoryListScreen from './screens/InventoryListScreen';
import InventoryDetailScreen from './screens/InventoryDetailScreen';
import InventoryScanScreen from './screens/InventoryScanScreen';
import AssetFinderScreen from './screens/AssetFinderScreen';
import Popup from './components/Popup';
import LookupScreen from './screens/LookupScreen';
import LookupListScreen from './screens/LookupListScreen';
import LookupResultScreen from './screens/LookupResultScreen';
import NotFoundScreen from './screens/NotFoundScreen';
import UpdateMappingScreen from './screens/UpdateMappingScreen';


const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

const App: React.FC = () => {
  const [navigationStack, setNavigationStack] = useState<Screen[]>([{ name: 'login' }]);
  const [registrations, setRegistrations] = useState<Record<string, Registration>>(MOCK_REGISTRATIONS);
  const [declarationData, setDeclarationData] = useState<Record<string, RegistrationDetail>>(MOCK_REGISTRATION_DETAILS);
  const [inventoryData, setInventoryData] = useState<Record<string, InventoryTaskDetail>>(MOCK_INVENTORY_DETAILS);
  const [backPopup, setBackPopup] = useState<{ isVisible: boolean, proceed: () => void }>({ isVisible: false, proceed: () => {} });


  const currentScreen = navigationStack[navigationStack.length - 1];
  const isRadarScanActive = currentScreen.name === 'radarScan';
  const displayScreen = isRadarScanActive && navigationStack.length > 1
    ? navigationStack[navigationStack.length - 2]
    : currentScreen;


  const navigate = useCallback((name: Screen['name'], params?: Screen['params']) => {
    // FIX: Cast to Screen to resolve TypeScript error. The compiler creates a type that's too wide
    // for the `{ name, params }` object because it doesn't know that a specific `name`
    // corresponds to a specific `params` structure. The cast tells TypeScript to trust
    // that the combination is a valid `Screen` type.
    setNavigationStack(prev => [...prev, { name, params } as Screen]);
  }, []);

  const goBack = useCallback((count: number = 1) => {
    if (navigationStack.length > count) {
      setNavigationStack(prev => prev.slice(0, -count));
    }
  }, [navigationStack.length]);
  
  const requestGoBack = useCallback((count: number = 1) => {
    const proceed = () => {
        goBack(count);
        setBackPopup({ isVisible: false, proceed: () => {} });
    };
    
    setBackPopup({ isVisible: true, proceed });
  }, [goBack]);

  const resetTo = useCallback((name: Screen['name'], params?: Screen['params']) => {
    // FIX: Cast to Screen to resolve TypeScript error. The compiler creates a type that's too wide
    // for the `{ name, params }` object because it doesn't know that a specific `name`
    // corresponds to a specific `params` structure. The cast tells TypeScript to trust
    // that the combination is a valid `Screen` type.
    setNavigationStack([{ name, params } as Screen]);
  }, []);

  const updateScannedData = useCallback((registrationId: string, itemId: string, scannedCount: number) => {
    setDeclarationData(prevData => {
        const updatedDetails = { ...prevData };
        const registration = updatedDetails[registrationId];
        if (registration) {
            const itemIndex = registration.items.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                registration.items[itemIndex].quantityScanned = scannedCount;
            }
        }
        return updatedDetails;
    });
  }, []);

  const updateInventoryTaskCounts = useCallback((taskId: string, validScans: { assetInfo?: AssetInfo }[]) => {
    setInventoryData(prevData => {
        const updatedDetails = { ...prevData };
        const task = JSON.parse(JSON.stringify(updatedDetails[taskId])); // Deep copy for mutation
        if (task) {
            const itemMap = new Map<string, InventoryItem>(task.items.map((i: InventoryItem) => [i.assetId, i]));
            
            // Reset counts for all items in the task
            for (const item of itemMap.values()) {
                item.quantityScanned = 0;
            }

            // Recalculate counts based on the new valid scan list
            for (const scan of validScans) {
                if (scan.assetInfo) {
                    const item = itemMap.get(scan.assetInfo.assetId);
                    if (item) {
                        item.quantityScanned += 1;
                    }
                }
            }
            
            task.items = Array.from(itemMap.values());
            updatedDetails[taskId] = task;
        }
        return updatedDetails;
    });
  }, []);

  const confirmInventoryTask = useCallback((taskId: string) => {
    setInventoryData(prevData => {
        const updatedDetails = { ...prevData };
        const task = updatedDetails[taskId];
        if (task) {
            task.status = 'completed';
        }
        return updatedDetails;
    });
  }, []);

  const createDeclaration = useCallback((data: { name: string; warehouseId: string; locationId?: string | null; items: DeclarationItem[] }) => {
    const newId = `R${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newRegistration: Registration = {
        id: newId,
        name: data.name,
        createdAt: formattedDate,
        status: 'pending',
    };

    const newDetail: RegistrationDetail = {
        ...newRegistration,
        createdBy: "CurrentUser",
        updatedAt: formattedDate,
        notes: "Phiếu tạo từ ứng dụng.",
        warehouseId: data.warehouseId,
        locationId: data.locationId || undefined,
        items: data.items.map((item, index) => ({
            id: `item-${newId}-${index}`,
            name: item.assetTypeName,
            quantityRequired: item.quantity,
            quantityScanned: 0,
        })),
    };
    
    setRegistrations(prev => ({...prev, [newId]: newRegistration}));
    setDeclarationData(prev => ({...prev, [newId]: newDetail}));
    
  }, []);


  const renderScreen = (screen: Screen) => {
    switch (screen.name) {
      case 'login':
        return <LoginScreen />;
      case 'home':
        return <HomeScreen registrations={Object.values(registrations)} inventoryTasks={Object.values(inventoryData)} />;
      case 'declarationList':
        return <DeclarationListScreen registrations={Object.values(registrations)} />;
      case 'declarationDetail':
        const detail = declarationData[screen.params?.registrationId || ''];
        return detail ? <DeclarationDetailScreen registrationDetail={detail} /> : <div>Loading...</div>;
      case 'declarationCreate':
        return <DeclarationCreateScreen />;
      case 'scan':
        const registration = declarationData[screen.params?.registrationId || ''];
        const item = registration?.items.find(i => i.id === screen.params?.itemId);
        return item ? <ScanScreen 
            item={item} 
            registrationId={screen.params!.registrationId!} 
            onConfirmScan={updateScannedData}
            /> : <div>Item not found</div>;
      case 'inventoryList':
        return <InventoryListScreen />;
      case 'inventoryDetail':
        const taskDetail = inventoryData[screen.params?.taskId || ''];
        return taskDetail ? <InventoryDetailScreen taskDetail={taskDetail} /> : <div>Loading...</div>;
      case 'inventoryScan':
         const taskDetailForScan = inventoryData[screen.params.taskId];
         return taskDetailForScan ? <InventoryScanScreen 
            taskDetail={taskDetailForScan} 
            onConfirmScan={updateInventoryTaskCounts}
          /> : <div>Task not found</div>;
       case 'assetFinder':
         return <AssetFinderScreen epc={screen.params.epc} assetName={screen.params.assetName} />;
      // New cases for lookup feature
      case 'lookup':
        return <LookupScreen />;
      case 'lookupList':
        return <LookupListScreen assets={screen.params.assets} />;
      case 'lookupResult':
        return <LookupResultScreen asset={screen.params.asset} scannedWith={screen.params.scannedWith} />;
      case 'notFound':
        return <NotFoundScreen scannedId={screen.params.scannedId} type={screen.params.type} />;
      case 'updateMapping':
        return <UpdateMappingScreen asset={screen.params.asset} scannedId={screen.params.scannedId} scannedWith={screen.params.scannedWith} />;
      case 'radarScan':
        // This case is now handled by the overlay logic, but we keep it to prevent errors.
        // The underlying screen will be rendered.
        return null;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <NavigationContext.Provider value={{ navigate, goBack, resetTo, requestGoBack, confirmInventoryTask, createDeclaration, updateInventoryTaskCounts }}>
      <div className="w-full h-full bg-gray-50 flex flex-col font-sans relative">
        {renderScreen(displayScreen)}
        {isRadarScanActive && currentScreen.name === 'radarScan' && (
           <div className="absolute inset-0 z-50">
             <RadarScanScreen onScanComplete={currentScreen.params.onScanComplete} mockEpcs={currentScreen.params.mockEpcs} />
           </div>
        )}
        {backPopup.isVisible && (
            <Popup
                isVisible={true}
                title="Cảnh báo"
                message="Hành động này sẽ không lưu dữ liệu đã thay đổi. Bạn có chắc chắn muốn quay lại?"
                onClose={() => setBackPopup({ isVisible: false, proceed: () => {} })}
                onConfirm={backPopup.proceed}
                confirmButtonText="Xác nhận"
                cancelButtonText="Hủy"
            />
        )}
      </div>
    </NavigationContext.Provider>
  );
};

export default App;
