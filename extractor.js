const fs = require('fs');
const path = require('path');

const PRODUCT_ID = "045496429393";
const API_URL = `https://webuy.io{PRODUCT_ID}`;
const FILE_PATH = path.join(__dirname, 'historial.csv');

async function obtenerPrecios() {
    try {
        console.log("Conectando con la API de CeX...");
        const respuesta = await fetch(API_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            }
        });

        if (!respuesta.ok) throw new Error(`Error de conexión: ${respuesta.status}`);

        const datos = await respuesta.json();
        const box = datos.response?.data?.boxDetails;

        if (!box) throw new Error("La API de CeX no ha devuelto datos del producto.");

        const nombre = box.boxName || "Triangle Strategy";
        const precioEfectivo = box.cashPrice || 0.0;
        const precioCupon = box.exchangePrice || 0.0;
        
        // Conseguimos la fecha de hoy en formato AAAA-MM-DD
        const fecha = new Date().toISOString().split('T')[0];

        const nuevaLinea = `"${fecha}","${nombre}",${precioEfectivo},${precioCupon}\n`;

        if (!fs.existsSync(FILE_PATH)) {
            const cabecera = "Fecha,Juego,Precio Efectivo,Precio Cupon\n";
            fs.writeFileSync(FILE_PATH, cabecera, 'utf8');
        }

        fs.appendFileSync(FILE_PATH, nuevaLinea, 'utf8');
        console.log(`✅ ¡Éxito! Guardado: ${nombre} -> Efectivo: ${precioEfectivo}€ | Cupón: ${precioCupon}€`);

    } catch (error) {
        console.error("❌ ERROR CRÍTICO DENTRO DEL SCRIPT:", error.message);
        process.exit(1); // Fuerza al robot a avisar si algo sale mal
    }
}

obtenerPrecios();
