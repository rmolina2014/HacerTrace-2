import { Ticket, Priority, Status, Module, User } from './types';

export const INITIAL_PROJECTS = ['Cem-Muni9', 'MesaEntrad-Muni9'];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Roberto', role: 'Desarrollador' },
  { id: 'u2', name: 'Laura', role: 'Funcional' },
  { id: 'u3', name: 'Carlos', role: 'Desarrollador' },
  { id: 'u4', name: 'Admin', role: 'Funcional' },
];

// Map specific modules to projects
export const INITIAL_MODULES_BY_PROJECT: Record<string, string[]> = {
  'Cem-Muni9': [Module.General, Module.Parcelas, Module.Nichos, Module.Ventas, Module.Pagos, Module.BD],
  'MesaEntrad-Muni9': ['General', 'Expedientes', 'Digitalización', 'Reportes']
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-001',
    legacyId: 1,
    project: 'Cem-Muni9',
    module: Module.General,
    title: 'Problema en campo Buscar',
    description: 'No trae registros o paginación errónea en el listado general.',
    priority: Priority.Medium,
    status: Status.Pending,
    createdAt: 'Feb-25'
  },
  {
    id: 'T-002',
    legacyId: 2,
    project: 'Cem-Muni9',
    module: Module.Parcelas,
    title: 'Ocupación: Fondo oscuro ilegible',
    description: 'El modo noche afecta la legibilidad de las letras en la vista de ocupación.',
    priority: Priority.Low,
    status: Status.Pending,
    createdAt: 'Feb-25'
  },
  {
    id: 'T-003',
    legacyId: 6,
    project: 'Cem-Muni9',
    module: Module.Nichos,
    title: 'Datos faltantes en Mantenimiento',
    description: 'Agregar N° Comprobante, Año de Pago y Forma de Pago en pantalla de mantenimiento.',
    priority: Priority.High,
    status: Status.Pending,
    createdAt: 'Feb-25'
  },
  {
    id: 'T-004',
    legacyId: 13,
    project: 'Cem-Muni9',
    module: Module.Ventas,
    title: 'Consulta de Ventas por Tipo',
    description: 'Nueva consulta de ventas filtrando por Tipo y Nro Documento.',
    priority: Priority.Medium,
    status: Status.InProgress,
    assignee: 'Roberto',
    createdAt: 'Mayo-25'
  },
  {
    id: 'T-005',
    legacyId: 39,
    project: 'Cem-Muni9',
    module: Module.Pagos,
    title: 'Anulación de comprobantes',
    description: 'Generar contra-asiento/débito al anular.',
    priority: Priority.Medium,
    status: Status.Future,
    createdAt: 'Mayo-25'
  },
  {
    id: 'T-006',
    legacyId: 1,
    project: 'Cem-Muni9',
    module: Module.General,
    title: 'Reimprimir comprobante',
    description: 'Botón directo para volver a imprimir comprobante generado.',
    priority: Priority.Medium,
    status: Status.Testing,
    assignee: 'Roberto',
    createdAt: 'Jun-25'
  },
  {
    id: 'T-007',
    legacyId: 5,
    project: 'Cem-Muni9',
    module: Module.Pagos,
    title: 'Error pago 2023 en Mausoleo',
    description: 'Figura pago 2023 en un mausoleo que no debería tenerlo acreditado.',
    priority: Priority.High,
    status: Status.Testing,
    createdAt: 'Jun-25'
  },
  {
    id: 'T-008',
    legacyId: 1,
    project: 'Cem-Muni9',
    module: Module.Parcelas,
    title: 'Pago Unificado Mantenimiento',
    description: 'Emitir 1 solo comprobante para todos los niveles.',
    priority: Priority.Medium,
    status: Status.Done,
    assignee: 'Roberto',
    createdAt: 'Ago-25'
  },
  {
    id: 'T-009',
    legacyId: 2,
    project: 'Cem-Muni9',
    module: Module.BD,
    title: 'Modificación tablas pagos',
    description: 'Ajuste de estructura DB para soporte de pagos multinivel.',
    priority: Priority.High,
    status: Status.Done,
    assignee: 'Roberto',
    createdAt: 'Ago-25'
  },
  {
    id: 'T-010',
    legacyId: 1,
    project: 'Cem-Muni9',
    module: Module.Pagos,
    title: 'Error Crítico: Titularidad Comprobante',
    description: 'El comprobante sale a nombre de otra persona aleatoria.',
    priority: Priority.High,
    status: Status.Done,
    assignee: 'Roberto',
    createdAt: 'Nov-25'
  },
  {
    id: 'T-011',
    legacyId: 2,
    project: 'Cem-Muni9',
    module: Module.Pagos,
    title: 'Error PDF Consulta Pagos',
    description: 'Fallo al generar PDF en el reporte de pagos por fecha.',
    priority: Priority.High,
    status: Status.Done,
    assignee: 'Roberto',
    createdAt: 'Nov-25'
  },
  {
    id: 'T-012',
    legacyId: 6,
    project: 'Cem-Muni9',
    module: Module.Ventas,
    title: 'Carga Factura ARCA',
    description: 'Permitir cargar factura de ARCA posterior a la venta.',
    priority: Priority.Medium,
    status: Status.Pending,
    createdAt: 'Nov-25'
  }
];

export const ARCHITECTURE_PROPOSAL = `
# Propuesta de Arquitectura del Sistema

Para reemplazar la "bitácora" en Word y profesionalizar el flujo de trabajo de la Municipalidad, se recomiendan las siguientes opciones basadas en el stack actual (PHP).

## Opción A: Modernización Conservadora (Recomendada)
Esta opción aprovecha el conocimiento existente en PHP pero introduce estructura moderna.

*   **Backend**: Laravel (PHP 8.2+). Framework robusto, seguro y estándar de la industria. Facilita APIs REST.
*   **Frontend**: Vue.js o React (SPA). Integrado con Laravel (vía Inertia.js o API separada) para una interfaz ágil sin recargas.
*   **Base de Datos**: MySQL. Continuar con el motor actual pero normalizando tablas (Usuarios, Tickets, Módulos).
*   **Infraestructura**: Docker containers para entorno de desarrollo homogéneo.

## Opción B: Stack Ágil (Python)
Si se busca rapidez de prototipado y facilitar tareas de análisis de datos futuros.

*   **Backend**: FastAPI o Django.
*   **Frontend**: React.
*   **Ventaja**: Python facilita integraciones futuras con IA o Scripts de migración de datos complejos.

## Base de Datos Sugerida (Modelo Simplificado)
*   **tickets**: id, titulo, descripcion, estado_id, prioridad_id, user_id (asignado), creador_id, timestamps.
*   **historial_cambios**: id, ticket_id, campo_modificado, valor_anterior, valor_nuevo, fecha.
*   **adjuntos**: Para evidencias de errores (screenshots).
`;