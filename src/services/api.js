// Este archivo servirá como tu centro de comunicaciones con el backend

// Función para pedir el inventario completo
export const obtenerInventario = async () => {
    try {
        const response = await fetch('http://localhost:8000/inventario', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        // El backend devuelve algo como: { "total_paquetes": 2, "inventario": [...] }
        return data;
        
    } catch (error) {
        console.error("Error al obtener el inventario:", error);
        return { total_paquetes: 0, inventario: [] }; // Retorno seguro en caso de error
    }
};
