// Tipos para membresías
export interface CreateMembershipInput {
  name: string;
  cost: number;
  max_classes_assistance: number;
  max_gym_assistance: number;
  duration_months: number;
  status?: boolean;
}

export interface UpdateMembershipInput {
  name?: string;
  cost?: number;
  max_classes_assistance?: number;
  max_gym_assistance?: number;
  duration_months?: number;
  status?: boolean;
}

// Tipos de parámetros de ruta
export interface MembershipIdParams {
  id: string;
}
