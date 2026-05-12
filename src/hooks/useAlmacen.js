import { useEffect, useState } from "react";
import { obtenerInventario } from "../services/api";

export default function useAlmacen() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function obtenerDatos() {
      try {
        console.log('Intentando conectar con la API local (Backend G4)...');
        const data = await obtenerInventario();
        
        // El backend devuelve { total_paquetes: 2, inventario: [...] }
        const paquetesOriginales = data.inventario || [];
        
        // Mapeamos los nombres de la Base de Datos a los que espera tu Frontend
        const paquetesMapeados = paquetesOriginales.map(item => {
          // Extraemos la letra de categoría del SKU (ej: "CAJA-A100" -> "A")
          const categoria = item.sku.includes('-A') ? 'A' : 
                            item.sku.includes('-B') ? 'B' : 'C';

          return {
            id: item.id,
            producto_id: item.sku,
            trayectoria: 1, // Valor por defecto
            ubicacion: `${categoria}${item.pos_x || 1}`, 
            estado: item.status === 'stored' ? 'almacenado' : item.status,
            timestamp: item.created_at || new Date().toISOString()
          };
        });

        console.log('Datos procesados para la UI:', paquetesMapeados);
        setItems(paquetesMapeados);

      } catch (err) {
        console.error('Error en useAlmacen:', err);
        setError(err.message || 'Error de conexión con el servidor local');
      } finally {
        setCargando(false);
      }
    }

    obtenerDatos();
  }, []);

  return { items, cargando, error };
}
