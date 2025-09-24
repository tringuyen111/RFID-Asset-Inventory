
export interface Registration {
  id: string;
  name: string;
  createdAt: string;
  status: 'pending' | 'completed';
}

export interface Item {
  id: string;
  name: string;
  quantityRequired: number;
  quantityScanned: number;
}

export interface RegistrationDetail extends Registration {
  createdBy: string;
  updatedAt: string;
  notes: string;
  items: Item[];
}

export interface ScannedEPC {
  epc: string;
  status: 'valid' | 'invalid_duplicate_session' | 'invalid_duplicate_system';
}

// New types for Inventory Check feature
export interface InventoryTask {
  id: string;
  name: string;
  createdAt: string;
  status: 'pending' | 'completed';
}

export interface InventoryItem {
    assetId: string;
    assetType: string;
    assetName: string;
    quantityRequired: number;
    quantityScanned: number;
    expectedEpcs: string[];
}

export interface InventoryTaskDetail extends InventoryTask {
    location: string;
    items: InventoryItem[];
}

export interface AssetInfo {
    assetId: string;
    assetType: string;
    assetName: string;
}

export interface ScannedInventoryEPC {
  epc: string;
  status: 'valid' | 'surplus' | 'error_not_found';
  assetInfo?: AssetInfo;
}

// New type for Asset Lookup feature
export interface AssetDetails {
  id: string;
  assetType: string;
  assetName: string;
  location: string;
  epc: string;
  barcode: string;
  unit: string;
}


export type Screen = 
  | { name: 'login'; params?: undefined }
  | { name: 'home'; params?: undefined }
  | { name: 'declarationList'; params?: undefined }
  | { name: 'declarationDetail'; params: { registrationId: string } }
  | { name: 'scan'; params: { registrationId: string; itemId: string } }
  | { name: 'radarScan'; params: { onScanComplete: (epcs: string[]) => void; mockEpcs?: string[] } }
  | { name: 'inventoryList'; params?: undefined }
  | { name: 'inventoryDetail'; params: { taskId: string } }
  | { name: 'inventoryScan'; params: { taskId: string; assetId: string; } }
  | { name: 'assetFinder'; params: { epc: string; assetName: string; } }
  // New screens for lookup feature
  | { name: 'lookup'; params?: undefined }
  | { name: 'lookupList'; params: { assets: AssetDetails[] } }
  | { name: 'lookupResult'; params: { asset: AssetDetails; scannedWith: 'EPC' | 'Barcode' } }
  | { name: 'notFound'; params: { scannedId: string; type: 'EPC' | 'Barcode' } }
  | { name: 'updateMapping'; params: { asset?: AssetDetails; scannedId?: string; scannedWith?: 'EPC' | 'Barcode' } };


export interface NavigationContextType {
  navigate: (name: Screen['name'], params?: any) => void;
  // FIX: Allow `goBack` to accept an optional `count` parameter to align with its implementation.
  goBack: (count?: number) => void;
  resetTo: (name: Screen['name'], params?: any) => void;
  requestGoBack: (count?: number) => void;
  confirmInventoryTask: (taskId: string) => void;
}
