import { MaterialCopyCondition, MaterialCopyStatus } from './enums';
import { MaterialWithDetails } from './material';

// MaterialCopy types
export interface MaterialCopy {
  id: string;
  materialId: string;
  acquisitionDate: string;
  condition: MaterialCopyCondition;
  status: MaterialCopyStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MaterialCopyWithDetails extends MaterialCopy {
  material: MaterialWithDetails;
}

// API Request/Response types
export interface CreateMaterialCopyData {
  materialId: string;
  acquisitionDate: string;
  condition: MaterialCopyCondition;
  status: MaterialCopyStatus;
}

export interface UpdateMaterialCopyData
  extends Partial<CreateMaterialCopyData> {}

export interface MaterialCopyStats {
  available: number;
  total: number;
  borrowed: number;
}
