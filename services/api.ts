import { EXISTING_EPCS, MOCK_INVENTORY_TASKS, MOCK_INVENTORY_DETAILS, ALL_ASSETS_DB, ASSET_LOOKUP_DB, BARCODE_TO_EPC_MAP, MOCK_WAREHOUSES, MOCK_LOCATIONS, MOCK_ASSET_TYPES } from './data';
import type { InventoryTask, InventoryTaskDetail, ScannedInventoryEPC, AssetDetails, Warehouse, Location, AssetType } from '../types';

// Mock API functions with simulated delay
export const login = (user: string, pass: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(user === 'admin' && pass === 'password');
        }, 1000);
    });
};

export const getWarehouses = (): Promise<Warehouse[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_WAREHOUSES);
        }, 300);
    });
};

export const getLocations = (): Promise<Location[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_LOCATIONS);
        }, 300);
    });
};

export const getAssetTypes = (): Promise<AssetType[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_ASSET_TYPES);
        }, 300);
    });
};

export const checkEpcDuplicate = (epc: string): Promise<{ isDuplicate: boolean }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ isDuplicate: EXISTING_EPCS.has(epc) });
        }, 300);
    });
};


// --- API for Inventory Check Feature ---

export const getInventoryTasks = (): Promise<InventoryTask[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(Object.values(MOCK_INVENTORY_TASKS));
        }, 500);
    });
};

export const getInventoryTaskDetail = (taskId: string): Promise<InventoryTaskDetail | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_INVENTORY_DETAILS[taskId]);
        }, 500);
    });
};

export const checkEpcInInventory = (epc: string, taskId: string): Promise<Omit<ScannedInventoryEPC, 'epc'>> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const assetInfo = ALL_ASSETS_DB[epc];
            if (!assetInfo) {
                resolve({ status: 'error_not_found' });
                return;
            }

            const taskDetail = MOCK_INVENTORY_DETAILS[taskId];
            const isEpcInTask = taskDetail?.items.some(item => item.expectedEpcs.includes(epc));

            if (isEpcInTask) {
                resolve({ status: 'valid', assetInfo });
            } else {
                resolve({ status: 'surplus', assetInfo });
            }
        }, 200);
    });
};

export const postInventoryCount = (data: { taskId: string, note: string, items: { epc: string, assetId?: string }[] }): Promise<{ success: boolean }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("Submitting Inventory Data:", data);
            resolve({ success: true });
        }, 1500);
    });
};

// --- API for Asset Lookup Feature ---

export const lookupAssetByEpc = (epc: string): Promise<AssetDetails | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const asset = ASSET_LOOKUP_DB[epc];
            resolve(asset || null);
        }, 700);
    });
};

export const lookupAssetByBarcode = (barcode: string): Promise<AssetDetails | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const epc = BARCODE_TO_EPC_MAP[barcode];
            if (epc) {
                const asset = ASSET_LOOKUP_DB[epc];
                resolve(asset || null);
            } else {
                resolve(null);
            }
        }, 700);
    });
};

export const updateAssetDetails = (assetData: AssetDetails): Promise<{ success: boolean; error?: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("Updating asset:", assetData);
            if (!assetData.assetName) {
                resolve({ success: false, error: "Tên vật tư là bắt buộc." });
                return;
            }
            // Update our mock DB
            ASSET_LOOKUP_DB[assetData.epc] = assetData;
            if (assetData.barcode) {
                BARCODE_TO_EPC_MAP[assetData.barcode] = assetData.epc;
            }
            resolve({ success: true });
        }, 1200);
    });
};