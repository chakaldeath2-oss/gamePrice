const fs = require('fs');
const path = require('path');

const PRODUCT_ID = "045496429393";
// Cambiamos a la URL de consulta directa regional
const API_URL = `https://webuy.io{PRODUCT_ID}`;
const FILE_PATH = path.join(__dirname, 'historial.csv');

async function obtenerPrecios() {
    try {
        console.log("Iniciando conexión segura con CeX...");
        
        const respuesta = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'es-ES,es;q=0.9',
                'Origin': 'https://es.webuy.com',
                'Referer': 'https://es.webuy.com/',
                'Cache-Control': 'no-cache'
            }
        });

        if (!respuesta.ok) throw new Error(`La tienda respondió con código: ${respuesta.status}`);

        const datos = await respuesta.json();
        const box = datos.response?.data?.boxDetails;

        if (!box) throw new Error("No se localizaron los detalles del producto en la respuesta.");

        const nombre = box.boxName || "Triangle Strategy";
        const precioEfectivo = box.cashPrice || 0.0;
        const precioCupon = box.exchangePrice || 0.0;
        
        // Formato de fecha estándar Año-Mes-Día para JavaScript
        const fecha = new Date().toISOString().split('T')[0];
        const nuevaLinea = `"${fecha}","${nombre}",${precioEfectivo},${precioCupon}\n`;

        if (!fs.existsSync(FILE_PATH)) {
            const cabecera = "Fecha,Juego,Precio Efectivo,Precio Cupon\n";
            fs.writeFileSync(FILE_PATH, cabecera, 'utf8');
        }

        fs.appendFileSync(FILE_PATH, nuevaLinea, 'utf8');
        console.log(`✅ ¡Precios guardados! Efectivo: ${precioEfectivo}€ | Cupón: ${precioCupon}€`);

    } catch (error) {
        console.error("❌ Fallo en el extractor:", error.message);
        process.exit(1); 
    }
}

obtenerPrecios();
