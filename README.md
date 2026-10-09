# Tiandy Tech — Plataforma Web Unificada

Plataforma técnica profesional de catálogo, matriz de comparación cara a cara, base de conocimientos y panel de administración para equipamiento de seguridad electrónica **Tiandy Technologies** (Cámaras IP, NVRs y Switches PoE).

Desarrollada para reemplazar la planilla de Google Sheets y brindar a sub-distribuidores, integradores e instaladores una herramienta ágil, precisa y 100% de marca blanca.

---

## 🚀 Inicio Rápido

### 1. Entorno de Desarrollo Local (PC)
Para ejecutar y probar la aplicación localmente en el puerto predeterminado **`8090`**:

```bash
# Iniciar servidor unificado (Express API + Vite Hot Reload)
npm run dev
```

- **Catálogo Público:** [http://localhost:8090/](http://localhost:8090/)
- **Wiki Técnica & Calculadora DORI:** [http://localhost:8090/](http://localhost:8090/) (Pestaña "Wiki Técnica")
- **Panel de Control Backoffice:** [http://localhost:8090/admin](http://localhost:8090/admin)
- **API REST:** [http://localhost:8090/api/productos](http://localhost:8090/api/productos)

### 2. Carga Inicial de Datos (Seed)
Para poblar la base de datos SQLite (`data/tiandy.db`) analizando automáticamente las fichas técnicas en PDF (`02-DOCS/datasheets-ejemplo`):

```bash
npm run seed
```

---

## 🐳 Despliegue en NAS / Servidor Local (Docker)

El proyecto está listo para ser instalado en un servidor NAS (TrueNAS SCALE, OpenMediaVault, Synology o Docker standalone) mediante Docker Compose en el puerto **`1030`**.

### Archivo `docker-compose.yml`:
```yaml
version: '3.8'

services:
  tiandy-tech:
    container_name: tiandy-tech
    build:
      context: .
      dockerfile: Dockerfile
    image: tiandy-tech:latest
    restart: unless-stopped
    ports:
      - "1030:1030"
    environment:
      - PORT=1030
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:1030/api/stats"]
      interval: 30s
      timeout: 5s
      retries: 3
```

Para levantar el contenedor:
```bash
docker compose up -d
```
Acceso en la red local: `http://<IP-DEL-NAS>:1030/`

---

## 🛠️ Características Principales

1. **Catálogo Técnico Multidimensión:**
   - Vista en Cuadrícula de Tarjetas Técnicas y Vista en Planilla Densa (Spreadsheet).
   - Filtrado facetado por Serie (AK, Spark, Lite, Pro, Ultra, Panoramic), Resolución (2MP a 8MP), Formato (Bullet, Turret, Domo, PTZ), Visión Nocturna (ColorMaker, Dual Light, IR), Audio (Micrófono/Altavoz bidireccional), Canales NVR, Bahías SATA y Puertos PoE.
   - Precios netos en USD (sin IVA) y estados cualitativos de stock (`ENTREGA INMEDIATA`, `POCAS UNIDADES`, `PRÓXIMO ARRIBO`, `AGOTADO`).

2. **Comparador Cara a Cara (3 Productos):**
   - Comparación simultánea de hasta 3 equipos.
   - Barras visuales métricas de alcance DORI (Detectar, Observar, Reconocer, Identificar) bajo norma EN 62676-4.
   - Comparación de iluminación nocturna (IR vs Luz Cálida ColorMaker), analíticas de IA, E/S de alarma y consumo eléctrico.

3. **Wiki Técnica & Calculadora DORI:**
   - Calculadora óptica interactiva en tiempo real por megapíxeles y distancia focal (mm).
   - Explicación de tecnologías propietarias: ColorMaker F1.0, WDR Polar Day, Early Warning (EW), códec S+265 y modo extendido CCTV PoE 250m.

4. **Backoffice / Panel de Control (`/admin`):**
   - **Editor Rápido de Precios y Stock (Quick Batch):** Edición masiva en un solo clic.
   - **Extractor Inteligente de Datasheets:** Carga de PDFs con extracción automática de especificaciones técnicas mediante la Skill v2.0.

---

## 📂 Estructura del Proyecto

```text
├── 02-DOCS/                  # Especificación técnica, constitution y datasheets de muestra
├── data/                     # Base de datos SQLite (tiandy.db) y PDFs procesados
├── src/
│   ├── shared/               # Tipos TypeScript compartidos (Producto, DatosCamara, etc.)
│   ├── server/               # Backend Express, SQLite DB y Extractor PDF
│   └── client/               # Frontend React 18, Tailwind CSS, Lucide Icons
├── Dockerfile                # Multi-stage build para producción en NAS (Node 22 Alpine)
├── docker-compose.yml        # Configuración lista para despliegue en NAS (Puerto 1030)
└── package.json
```
