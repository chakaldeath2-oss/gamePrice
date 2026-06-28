const fs = require('fs');
const path = require('path');

// ID del juego (Triangle Strategy para Nintendo Switch)
const PRODUCT_ID = "045496429393";
const API_URL = `https://webuy.io{PRODUCT_ID}`;
const FILE_PATH = path.join(__dirname, 'historial.csv');

async function obtenerPrecios() {
    try {
        // Realizamos la petición a la API de CeX
        const respuesta = await fetch(API_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            }
        });

        if (!respuesta.ok) throw new Error(`Error en la web: ${respuesta.status}`);

        const datos = await respuesta.json();
        const box = datos.response?.data?.boxDetails;

        if (!box) {
            console.log("No se encontraron los detalles del producto.");
            return;
        }

        // Extraemos los datos exactos que necesitas
        const nombre = box.boxName || "Juego Desconocido";
        const precioEfectivo = box.cashPrice || 0.0;
        const precioCupon = box.exchangePrice || 0.0;
        
        // Formateamos la fecha actual (Año-Mes-Día Hora:Minutos)
        const fecha = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // Preparamos la línea que vamos a escribir en el CSV
        const nuevaLinea = `"${fecha}","${nombre}",${precioEfectivo},${precioCupon}\n`;

        // Si el archivo no existe, le añadimos primero los títulos de las columnas
        if (!fs.existsSync(FILE_PATH)) {
            const cabecera = "Fecha,Juego,Precio Efectivo,Precio Cupon\n";
            fs.writeFileSync(FILE_PATH, cabecera, 'utf8');
        }

        // Añadimos la nueva línea al final del archivo sin borrar lo anterior
        fs.appendFileSync(FILE_PATH, nuevaLinea, 'utf8');
        console.log(`✅ ¡Guardado! ${nombre} -> Efectivo: ${precioEfectivo}€ | Cupón: ${precioCupon}€`);

    } catch (error) {
        console.error("Hubo un problema al extraer los precios:", error.message);
    }
}

// Ejecutamos la función
obtenerPrecios();
