// Punto único donde se elige qué servicio usa la aplicación.
// Hoy: datos de prueba (mock). Cuando B entregue el adaptador de Supabase,
// solo hay que cambiar esta línea, por ejemplo:
//   import { supabaseServices as services } from "./supabase";
import { mockServices } from "./mock";

export const services = mockServices;
