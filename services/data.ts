import type { Registration, RegistrationDetail, InventoryTask, InventoryTaskDetail, AssetInfo, AssetDetails, Warehouse, Location, AssetType } from '../types';

export const MOCK_REGISTRATIONS: Record<string, Registration> = {
    "R012345": {
        id: "R012345",
        name: "Khai báo nội thất cho VP Defdi",
        createdAt: "30/08/2025 10:30",
        status: "pending",
    },
    "R012346": {
        id: "R012346",
        name: "Khai báo thiết bị IT kho mới",
        createdAt: "31/08/2025 17:30",
        status: "pending",
    },
    "R012347": {
        id: "R012347",
        name: "Khai báo bàn ghế phòng họp",
        createdAt: "01/09/2025 09:00",
        status: "completed",
    },
};

export const MOCK_REGISTRATION_DETAILS: Record<string, RegistrationDetail> = {
    "R012345": {
        ...MOCK_REGISTRATIONS["R012345"],
        createdBy: "Nguyễn Mạnh Trí",
        updatedAt: "30/10/2024 11:00",
        notes: "Thực hiện khai báo tài sản cho văn phòng",
        items: [
            { id: "item-1", name: "Bàn gỗ", quantityRequired: 10, quantityScanned: 0 },
            { id: "item-2", name: "Ghế điều chỉnh", quantityRequired: 10, quantityScanned: 0 },
            { id: "item-3", name: "Màn hình Dell", quantityRequired: 5, quantityScanned: 0 },
        ],
    },
     "R012346": {
        ...MOCK_REGISTRATIONS["R012346"],
        createdBy: "Trần Văn An",
        updatedAt: "31/08/2025 17:30",
        notes: "Khai báo máy tính, máy in cho kho hàng mới",
        items: [
            { id: "item-4", name: "Laptop ThinkPad", quantityRequired: 15, quantityScanned: 0 },
            { id: "item-5", name: "Máy in Canon", quantityRequired: 3, quantityScanned: 0 },
        ],
    },
    "R012347": {
        ...MOCK_REGISTRATIONS["R012347"],
        createdBy: "Lê Thị Bích",
        updatedAt: "01/09/2025 09:00",
        notes: "Đã hoàn thành",
        items: [
            { id: "item-6", name: "Bàn họp lớn", quantityRequired: 1, quantityScanned: 1 },
            { id: "item-7", name: "Ghế chân quỳ", quantityRequired: 8, quantityScanned: 8 },
        ],
    },
};

// Simulate a database of existing EPCs for the Declaration feature
export const EXISTING_EPCS = new Set(['3620100', '3620101', '3620102', '3620155', '3620123']);


// --- Data for Inventory Check Feature ---

// Master database of all assets in the system, mapping EPC to AssetInfo
export const ALL_ASSETS_DB: Record<string, AssetInfo> = {
    'EPC-A1-001': { assetId: 'ASSET-A1', assetType: 'Bàn làm việc', assetName: 'Bàn Gỗ Sồi 1.6m' },
    'EPC-A1-002': { assetId: 'ASSET-A1', assetType: 'Bàn làm việc', assetName: 'Bàn Gỗ Sồi 1.6m' },
    'EPC-B2-001': { assetId: 'ASSET-B2', assetType: 'Máy tính', assetName: 'Laptop Dell XPS 15' },
    'EPC-B2-002': { assetId: 'ASSET-B2', assetType: 'Máy tính', assetName: 'Laptop Dell XPS 15' },
    'EPC-B2-003': { assetId: 'ASSET-B2', assetType: 'Máy tính', assetName: 'Laptop Dell XPS 15' },
    'EPC-C3-001': { assetId: 'ASSET-C3', assetType: 'Ghế văn phòng', assetName: 'Ghế Ergonomic Pro' },
    'EPC-D4-001': { assetId: 'ASSET-D4', assetType: 'Màn hình', assetName: 'Màn hình LG 27"' }, // This one is surplus for the task
    'EPC-E5-001': { assetId: 'ASSET-E5', assetType: 'Máy in', assetName: 'Máy in HP LaserJet' }, // Another surplus item
};

export const MOCK_INVENTORY_TASKS: Record<string, InventoryTask> = {
    "IVT001": {
        id: "IVT001",
        name: "Kiểm kê kho IT quý 3 2024",
        createdAt: "01/09/2024 09:00",
        status: "pending",
    },
    "IVT002": {
        id: "IVT002",
        name: "Kiểm kê tài sản văn phòng",
        createdAt: "28/08/2024 14:00",
        status: "completed",
    }
};

export const MOCK_INVENTORY_DETAILS: Record<string, InventoryTaskDetail> = {
    "IVT001": {
        ...MOCK_INVENTORY_TASKS["IVT001"],
        location: "Kho A, Tầng 2",
        items: [
            { assetId: "ASSET-B2", assetType: "Máy tính", assetName: "Laptop Dell XPS 15", quantityRequired: 3, quantityScanned: 0, expectedEpcs: ['EPC-B2-001', 'EPC-B2-002', 'EPC-B2-003'] },
            { assetId: "ASSET-A1", assetType: "Bàn làm việc", assetName: "Bàn Gỗ Sồi 1.6m", quantityRequired: 2, quantityScanned: 0, expectedEpcs: ['EPC-A1-001', 'EPC-A1-002'] }
        ]
    },
    "IVT002": {
        ...MOCK_INVENTORY_TASKS["IVT002"],
        location: "Văn phòng Defdi",
        items: [
            { assetId: "ASSET-C3", assetType: "Ghế văn phòng", assetName: "Ghế Ergonomic Pro", quantityRequired: 1, quantityScanned: 1, expectedEpcs: ['EPC-C3-001'] }
        ]
    }
};

// --- Data for Asset Lookup Feature ---

export const ASSET_LOOKUP_DB: Record<string, AssetDetails> = {
    'EPC-A1-001': { id: 'ASSET-A1', assetType: 'Bàn làm việc', assetName: 'Bàn Gỗ Sồi 1.6m', location: 'Kho A, Tầng 2', epc: 'EPC-A1-001', barcode: 'BC-A1-001', unit: 'Cái' },
    'EPC-A1-002': { id: 'ASSET-A1', assetType: 'Bàn làm việc', assetName: 'Bàn Gỗ Sồi 1.6m', location: 'Kho A, Tầng 2', epc: 'EPC-A1-002', barcode: 'BC-A1-002', unit: 'Cái' },
    'EPC-B2-001': { id: 'ASSET-B2', assetType: 'Máy tính', assetName: 'Laptop Dell XPS 15', location: 'Kho IT', epc: 'EPC-B2-001', barcode: 'BC-B2-001', unit: 'Cái' },
    'EPC-B2-002': { id: 'ASSET-B2', assetType: 'Máy tính', assetName: 'Laptop Dell XPS 15', location: 'Kho IT', epc: 'EPC-B2-002', barcode: 'BC-B2-002', unit: 'Cái' },
    'EPC-B2-003': { id: 'ASSET-B2', assetType: 'Máy tính', assetName: 'Laptop Dell XPS 15', location: 'Kho IT', epc: 'EPC-B2-003', barcode: 'BC-B2-003', unit: 'Cái' },
    'EPC-C3-001': { id: 'ASSET-C3', assetType: 'Ghế văn phòng', assetName: 'Ghế Ergonomic Pro', location: 'Văn phòng Defdi', epc: 'EPC-C3-001', barcode: 'BC-C3-001', unit: 'Cái' },
    'EPC-D4-001': { id: 'ASSET-D4', assetType: 'Màn hình', assetName: 'Màn hình LG 27"', location: 'Kho A, Tầng 2', epc: 'EPC-D4-001', barcode: 'BC-D4-001', unit: 'Cái' },
    'EPC-E5-001': { id: 'ASSET-E5', assetType: 'Máy in', assetName: 'Máy in HP LaserJet', location: 'Văn phòng Defdi', epc: 'EPC-E5-001', barcode: 'BC-E5-001', unit: 'Cái' },
};

export const BARCODE_TO_EPC_MAP: Record<string, string> = Object.values(ASSET_LOOKUP_DB).reduce((acc, asset) => {
    acc[asset.barcode] = asset.epc;
    return acc;
}, {} as Record<string, string>);


// --- Data for Declaration Creation ---

export const MOCK_WAREHOUSES: Warehouse[] = [
    { id: 'WH01', name: 'Kho Trung tâm' },
    { id: 'WH02', name: 'Kho Vệ tinh 1' },
    { id: 'WH03', name: 'Kho Hàng trả' },
];

export const MOCK_LOCATIONS: Location[] = [
    { id: 'LOC01-A', name: 'Khu A', warehouseId: 'WH01' },
    { id: 'LOC01-B', name: 'Khu B', warehouseId: 'WH01' },
    { id: 'LOC01-C', name: 'Khu C', warehouseId: 'WH01' },
    { id: 'LOC02-A', name: 'Khu A', warehouseId: 'WH02' },
    { id: 'LOC02-B', name: 'Khu B', warehouseId: 'WH02' },
];

export const MOCK_ASSET_TYPES: AssetType[] = [
    { id: 'AT01', name: 'Bàn gỗ' },
    { id: 'AT02', name: 'Ghế điều chỉnh' },
    { id: 'AT03', name: 'Màn hình Dell' },
    { id: 'AT04', name: 'Laptop ThinkPad' },
    { id: 'AT05', name: 'Máy in Canon' },
    { id: 'AT06', name: 'Bàn họp lớn' },
    { id: 'AT07', name: 'Ghế chân quỳ' },
];