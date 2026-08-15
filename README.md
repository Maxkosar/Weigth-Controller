# FitControl Pro

App de seguimiento físico (peso, calorías, entrenamientos y medidas) — instalable como PWA. 100% local: todos los datos se guardan en el navegador (`localStorage`), no hay backend.

## Qué se arregló y mejoró respecto al archivo original

- **Bug principal (el gráfico no funcionaba):** el gráfico de progreso usaba una escala de tipo `"time"` de Chart.js, que requiere un adaptador de fechas externo (`chartjs-adapter-date-fns` o similar) que no estaba incluido. Sin ese adaptador, Chart.js tira un error al dibujar y el gráfico queda vacío/roto. Se reemplazó por una escala numérica propia (días desde epoch + formateo manual de etiquetas), así no depende de una librería extra y funciona mejor offline.
- Chart.js pasó a cargarse desde una versión fija (`4.4.4`) en vez de `@latest`, para evitar que una actualización futura de la librería rompa la app sin aviso.
- Lectura/escritura de `localStorage` envuelta en `try/catch`, con aviso al usuario si el almacenamiento está lleno o no disponible (por ejemplo, en modo privado de Safari).
- Validación más estricta al importar un backup `.json` (antes solo chequeaba `config` y `weights`; ahora valida también `measures`, `foods`, `trainings` y `water`).
- Corregido el cálculo de IMC para no dividir por cero si la altura queda en 0.
- Convertida en **PWA instalable**: `manifest.json`, ícono en 3 tamaños (incluido uno *maskable* para Android) y `service-worker.js` con caché de la app para que funcione offline después de la primera carga.

## Estructura de archivos

```
fitcontrol/
├── index.html
├── manifest.json
├── service-worker.js
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

Todas las rutas dentro de `index.html` y `manifest.json` son **relativas** (`./icons/...`), así que funciona tanto en la raíz de un dominio como en un subpath tipo `usuario.github.io/repo/`.

## Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub (público, o privado si tenés plan que lo permita para Pages).
2. Subí estos archivos a la raíz del repo (o a una carpeta `docs/`, ver paso 4):
   ```bash
   git init
   git add .
   git commit -m "FitControl Pro PWA"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages**.
4. En "Build and deployment" → "Source", elegí **Deploy from a branch**, rama `main` y carpeta `/ (root)` (o `/docs` si subiste ahí).
5. Guardá. En 1-2 minutos la app queda publicada en `https://TU_USUARIO.github.io/TU_REPO/`.
6. Abrí esa URL desde el celular (Chrome/Android o Safari/iOS) y usá "Agregar a pantalla de inicio" / el ícono de instalar de Chrome — va a quedar instalada como app con ícono propio, y va a poder abrirse sin conexión gracias al service worker.

### Nota sobre HTTPS
GitHub Pages sirve todo por HTTPS automáticamente, que es un requisito obligatorio para que el service worker (y por lo tanto el modo offline/instalación) funcione. Si en algún momento probás la app en otro hosting, asegurate de que también sea HTTPS (o `localhost` para pruebas).

### Actualizar la app más adelante
Cada vez que cambies `index.html` (o cualquier archivo cacheado), subí el cambio a `CACHE_NAME` en `service-worker.js` (por ejemplo `fitcontrol-v2`). Así el service worker detecta la nueva versión, borra la caché vieja y sirve los archivos actualizados en la próxima visita.

## Datos y backups

Los datos viven solo en el navegador donde se usa la app (no se sincronizan entre dispositivos). Desde la pestaña **⚙️ Datos** podés:
- **Exportar**: descarga un `.json` con todo (pesos, comidas, entrenamientos, medidas, configuración).
- **Importar**: restaura un backup exportado previamente.
- **Borrar todos los datos**: resetea la app por completo (acción irreversible).

Recomendación: exportá un backup de vez en cuando, sobre todo antes de borrar el caché del navegador o cambiar de celular.
