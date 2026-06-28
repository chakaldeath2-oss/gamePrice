const fs = require('fs');
const path = require('path');

// ID de Triangle Strategy para Nintendo Switch
const PRODUCT_ID = "045496429393";
const API_URL = `https://webuy.io{PRODUCT_ID}`;
const FILE_PATH = path.join(__dirname, 'historial.csv');

async function obtenerPrecios() {
    try {
        const respuesta = await fetch(API_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            }
        });

        if (!respuesta.ok) throw new Error(`Error de conexión con CeX: ${respuesta.status}`);

        const datos = await respuesta.json();
        const box = datos.response?.data?.boxDetails;

        if (!box) {
            console.log("No se pudo acceder a los detalles del juego.");
            return;
        }

        // Guardamos los datos asociándolos a las columnas en español de la web
        const nombre = box.boxName || "Triangle Strategy";
        const precioEfectivo = box.cashPrice || 0.0;  // El de 14.00€
        const precioCupon = box.exchangePrice || 0.0; // El de 19.00€
        
        // Ponemos la fecha en un formato limpio para el gráfico
        const fecha = new Date().toISOString().substring(0, 10);

        // Creamos la fila para el CSV separada por comas exactas
        const nuevaLinea = `"${fecha}","${nombre}",${precioEfectivo},${precioCupon}\n`;

        // Si es la primera vez que corre, ponemos los títulos de columna idénticos a la web
        if (!fs.existsSync(FILE_PATH)) {
            const cabecera = "Fecha,Juego,Precio Efectivo,Precio Cupon\n";
            fs.writeFileSync(FILE_PATH, cabecera, 'utf8');
        }

        fs.appendFileSync(FILE_PATH, nuevaLinea, 'utf8');
        console.log(`✅ ¡Precios cazados! Efectivo: ${precioEfectivo}€ | Cupón: ${precioCupon}€`);

    } catch (error) {
        console.error("Fallo en el extractor:", error.message);
    }
}

obtenerPrecios();
