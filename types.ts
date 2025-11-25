export enum Priority {
  Low = 'Baja',
  Medium = 'Media',
  High = 'Alta',
  Critical = 'Crítica'
}

export enum Status {
  Pending = 'Pendiente',
  InProgress = 'En Desarrollo',
  Testing = 'Testing',
  Done = 'Terminado',
  Future = 'Mejora Futura'
}

// We keep this for backward compatibility or default values, 
// but the app now supports dynamic strings for modules.
export enum Module {
  General = 'General',
  Parcelas = 'Parcelas',
  Nichos = 'Nichos',
  Ventas = 'Ventas',
  Pagos = 'Pagos',
  BD = 'Base de Datos'
}

export type UserRole = 'Desarrollador' | 'Funcional';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Ticket {
  id: string;
  legacyId?: number; 
  project: string; 
  title: string;
  description: string;
  module: string; // Changed from Module enum to string to support dynamic ABM
  priority: Priority;
  status: Status;
  assignee?: string; 
  createdAt: string; 
}

export interface BoardColumn {
  id: Status;
  title: string;
  tickets: Ticket[];
}