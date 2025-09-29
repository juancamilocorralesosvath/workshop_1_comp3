// Tipos para asistencias
export interface CheckInInput {
  userId: string;
  type: 'gym' | 'class';
}

export interface CheckOutInput {
  userId: string;
}

export interface AttendanceHistoryInput {
  userId: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  type?: 'gym' | 'class';
}

export interface AttendanceStatus {
  isInside: boolean;
  currentAttendance?: {
    id: string;
    entrance_dateTime: Date;
    type: 'gym' | 'class';
  };
  availableAttendances: {
    gym: number;
    classes: number;
  };
}

export interface AttendanceStatsResponse {
  totalGymAttendances: number;
  totalClassAttendances: number;
  monthlyStats: {
    month: string;
    gymCount: number;
    classCount: number;
  }[];
}


export interface AttendanceUserParams {
  userId: string;
}
