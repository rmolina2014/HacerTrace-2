import { GoogleGenAI } from "@google/genai";
import { Ticket } from "../types";

// This is a mock service for demonstration if no API key is present, 
// but fully functional if the key is provided in env.

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeBacklog = async (tickets: Ticket[]): Promise<string> => {
  const ai = getAIClient();
  
  // Filter for relevant tickets to save tokens context
  const pendingTickets = tickets.filter(t => t.status !== 'Terminado' && t.status !== 'Mejora Futura');
  const ticketSummary = pendingTickets.map(t => 
    `- [${t.priority}] ${t.module}: ${t.title} (${t.status})`
  ).join('\n');

  const prompt = `
    Actúa como un Jefe de Proyectos para un equipo de desarrollo de software municipal.
    Analiza el siguiente backlog de incidencias pendientes:
    
    ${ticketSummary}
    
    Instrucciones:
    1. Identifica los 3 cuellos de botella más críticos basándote en la Prioridad y la importancia del Módulo (Pagos y Ventas suelen ser los más críticos para la operación municipal).
    2. Sugiere un plan de acción rápido y concreto para "Roberto" (el desarrollador principal).
    3. Proporciona una frase motivacional profesional para el equipo.
    
    Requisito indispensable: LA RESPUESTA DEBE SER EN ESPAÑOL.
    Mantén el tono profesional, conciso y utiliza formato Markdown para estructurar la respuesta.
  `;

  if (!ai) {
    // Fallback simulation if no API key
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
### Análisis de Backlog (Simulado)

**1. Cuellos de Botella Críticos:**
*   **Nichos - Datos faltantes (Alta):** Afecta la integridad de los registros de pago.
*   **Pagos - Error 2023 en Mausoleo (Alta):** Problema de consistencia de datos contables.
*   **Ventas - Descuento no reflejado (Alta):** Impacto financiero directo.

**2. Plan de Acción para Roberto:**
*   Priorizar el **Error 2023 en Mausoleo** ya que afecta la confianza del contribuyente.
*   Seguir con la corrección de **Descuentos en Ventas**.
*   Delegar o posponer cambios estéticos (Modo noche) hasta resolver inconsistencias de datos.

**3. Mensaje:**
> "La calidad nunca es un accidente; siempre es el resultado de un esfuerzo de la inteligencia." - John Ruskin
        `);
      }, 1500);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar respuesta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error conectando con el servicio de IA. Por favor verifique la configuración de la API Key.";
  }
};