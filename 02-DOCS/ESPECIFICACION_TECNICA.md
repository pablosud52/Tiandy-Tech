# Especificación Técnica Integral del Proyecto: Tiandy Tech

---

## 1. Visión General y Hoja de Ruta por Fases

### 1.1 Propósito
Desarrollo de una plataforma web técnica, interactiva, ligera y de alto rendimiento orientada a la consulta, especificación y comparación de equipos de videovigilancia y conectividad **Tiandy** (Cámaras IP, Grabadores NVR y Switches PoE).

La solución reemplaza las planillas de cálculo tradicionales por una aplicación moderna, ágil y de alta densidad técnica, orientada a subdistribuidores, integradores e instaladores.

### 1.2 Estrategia de Implementación por Fases

* **Fase 1 (Alcance Actual - Local-First & NAS):**
  * **Aplicación Web Unificada:** Una sola aplicación autocontenida que reúne la web pública del catálogo y el panel de administración privado en el mismo entorno.
  * **Persistencia Local SQLite:** Base de datos relacional local (`tiandy.db`) para almacenar fichas técnicas, series, precios y estados de stock.
  * **Motor Extractor de Datasheets PDF (Skill v2.0):** Procesamiento directo de hojas de datos oficiales de Tiandy para autocompletar especificaciones y validar técnicamente antes de guardar.
  * **Carga Manual Comercial:** Precios en USD netos y estados cualitativos de stock cargados y editables desde el panel del NAS (incluyendo *Quick Batch Editor* masivo).
  * **Despliegue Local y NAS:** 
    * Entorno PC de desarrollo: puerto `8090` (`http://localhost:8090`) con recarga en caliente vía `npm run dev`.
    * Entorno NAS (TrueNAS / OMV): despliegue vía Docker Compose (`docker-compose.yml`) en puerto `1030` (`http://[IP-NAS]:1030`) con volúmenes persistentes.
  * **Sin Autenticación Externa en Fase 1:** Precios y catálogo accesibles en la red para facilitar pruebas y validación inmediata con clientes e instaladores.

* **Fase 2 (Alcance Futuro - Cloud & Sincronización Automática):**
  * Despliegue estático del frontend público en **Cloudflare Pages**.
  * Sincronización automática de stock y precios con el software de facturación / ERP de la empresa.
  * Capa de seguridad comercial y autenticación (Google OAuth con aprobación previa) para restringir precios mayoristas.

---

## 2. Identidad Visual y Regla de Marca Blanca

* **Línea Gráfica:** Adhesión a la identidad oficial de Tiandy (azul institucional `#00529B` / `#0066CC`, gris técnico `#4A5568` / `#2D3748`, y fondos limpios `#FFFFFF` / `#F8FAFC`).
* **Neutralidad Absoluta (Marca Blanca):** Sin menciones, marcas de agua ni datos de contacto del importador/distribuidor mayorista. Los subdistribuidores pueden compartir la URL con clientes finales sin revelar al proveedor de origen.
* **Privacidad y No-Intermediación:** La plataforma no recolecta datos de clientes finales ni solicita información comercial invasiva.
* **Referencia Visual:** Inspirada en la sobriedad técnica de *michaelpcmaster.com* (interfaz ágil, centrada en especificaciones duras y sin textos publicitarios).
* **Temas:** Base principal en **Light Mode**, con soporte para **Dark Mode** mediante toggle en la cabecera.
* **Doble Modo de Visualización:**
  * **Modo Grid (Tarjetas):** Fichas visuales con fotografía, badges tecnológicos y resumen técnico directo.
  * **Modo Tabla Técnica (Spreadsheet / Excel):** Vista tabular densa y compacta con ordenamiento rápido de columnas.

---

## 3. Arquitectura del Sistema e Infraestructura

### 3.1 Topología Unificada (Fase 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   APLICACIÓN WEB UNIFICADA (TIANDY TECH)                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 🌐 INTERFAZ PÚBLICA (Ruta: "/")                                       │  │
│  │ • Catálogo de Cámaras IP, NVRs y Switches PoE                         │  │
│  │ • Buscador global inteligente multi-término                           │  │
│  │ • Filtros técnicos facetados por hardware                             │  │
│  │ • Comparador técnico ampliado (DORI, IR/LED, Matriz IA, PoE Watts)    │  │
│  │ • Selector de vista: Modo Fichas (Grid) vs Modo Tabla (Spreadsheet)   │  │
│  │ • Base de Conocimiento (Wiki Técnica DORI, ColorMaker, Polar Day)     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 🛠️ PANEL DE CONTROL BACKOFFICE (Ruta: "/admin")                       │  │
│  │ • Extractor asistido de Datasheets PDF (Skill v2.0)                   │  │
│  │ • Formulario de revisión técnica y validación del operador            │  │
│  │ • Quick Batch Editor: Edición masiva rápida de precios y stock en USD │  │
│  │ • Gestor de Sellos / Badges (ColorMaker, Polar Day, Nuevo, etc.)      │  │
│  │ • Previsualizador en vivo del catálogo y visor de cambios (Diff)      │  │
│  │ • Motor de Respaldo: Exportación e importación completa (.zip)        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 💾 CAPA DE PERSISTENCIA LOCAL (SQLite)                                │  │
│  │ • Archivo tiandy.db: Tablas de productos, series, precios y badges    │  │
│  │ • Almacenamiento multimedia local: /data/img/ y /data/docs/           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Puertos y Entornos de Ejecución

| Entorno | Propósito | Comando de Inicio | Puerto Web | URL de Acceso |
|---|---|---|---|---|
| **PC de Desarrollo (Windows)** | Desarrollo activo, pruebas locales y depuración | `npm run dev` | **8090** | `http://localhost:8090` |
| **NAS LAN (TrueNAS / OMV)** | Producción local en servidor doméstico/empresarial | `docker compose up -d` | **1030** | `http://[IP-NAS]:1030` |

### 3.3 Especificación del Archivo de Despliegue Docker Compose (`docker-compose.yml`)

El proyecto incluirá en su raíz el archivo YAML listo para desplegar en TrueNAS SCALE (Container Manager) o en OpenMediaVault (Compose plugin / Portainer):

```yaml
version: '3.8'

services:
  tiandy-tech:
    container_name: tiandy-tech
    build: .
    image: tiandy-tech:latest
    restart: unless-stopped
    ports:
      - "1030:1030"
    environment:
      - NODE_ENV=production
      - PORT=1030
      - DATABASE_PATH=/app/data/tiandy.db
      - UPLOADS_PATH=/app/data/uploads
    volumes:
      - ./data:/app/data
```

---

## 4. Modelo de Datos y Gestión Comercial (Fase 1)

### 4.1 Esquema Comercial y Stock
* **Moneda:** Dólares Americanos (USD), netos **sin impuestos** (sin IVA).
* **Aviso Legal (Pie de página obligatorio):**
  > * Los precios están expresados en Dólares Americanos y no incluyen impuestos.
  > * Mercadería sujeta a stock.
  > * Los precios pueden variar sin previo aviso.
* **Estados Cualitativos de Stock:**
  * `ENTREGA_INMEDIATA`
  * `POCAS_UNIDADES` (o `ULTIMA_UNIDAD`)
  * `PROXIMO_ARRIBO (DD/MM aprox)`
  * `AGOTADO`
  * `CONSULTAR`

### 4.2 Taxonomía Dinámica de Series
Las series no están hardcodeadas en código; se administran dinámicamente en SQLite:
* Cámaras: `AK`, `AK2`, `SK`, `SK2`, `LK`, `LK2`, `TURBO AI+`, `Spark Series`, `Lite Series`, `Pro Series`, `Panoramic Series`.
* NVRs: `AK2`, `SPARK`, `Lite-CUBE`, `Lite-K`, `Face Recognition`, `IA Nuevo (4HA / 4HB)`.

---

## 5. Pipeline de Extracción de Datasheets PDF (Skill v2.0)

1. **Carga del PDF:** El operador arrastra o selecciona un archivo oficial de Tiandy en `/admin`.
2. **Extracción Estructurada:** El motor parsea el documento según la Skill `datasheet-extractor (v2.0)`:
   * Identifica modelo, especificación y serie desde encabezado y banner gráfico.
   * Detecta badges automáticos (`ColorMaker`, `Polar Day`, `Early Warning`, `Dual Sensor`, `4K`, etc.).
   * Extrae tablas de especificaciones según el tipo de dispositivo (`CAMARA`, `NVR` o `SWITCH`).
   * Calcula o extrae métricas DORI (metros numéricos).
3. **Revisión del Operador:** Formulario con los campos autocompletados para validación humana.
4. **Carga Comercial:** El operador ingresa precio USD y estado de stock.
5. **Persistencia:** Al presionar "Aprobar y Guardar", el equipo se persiste en SQLite y las imágenes y PDF se optimizan y almacenan localmente.

---

## 6. Funcionalidades del Catálogo Técnico Público

* **Pestañas Madre:**
  1. `[ Cámaras IP ]`
  2. `[ NVRs / Grabadores ]`
  3. `[ Conectividad / Switches PoE ]`
  4. `[ Wiki Técnica ]`
* **Buscador Inteligente:** Búsqueda en vivo por múltiples palabras en cualquier orden sobre modelo, serie y características.
* **Filtros Técnicos por Categoría:**
  * *Cámaras:* Formato, lente, resolución, visión nocturna, conectividad, audio, alarmas, PoE.
  * *NVRs:* Canales, PoE integrado, IA en NVR, bahías SATA, ancho de banda.
  * *Switches:* Puertos PoE, uplink, SFP, velocidad, presupuesto PoE (Watts), funciones CCTV (Extend 250m, Watchdog).
* **Comparador Técnico Gráfico:**
  * Enfrentamiento de hasta 3 equipos en simultáneo.
  * Gráficas comparativas de alcance DORI (m).
  * Comparativa de alcance de iluminación (IR vs Luz Blanca).
  * Matriz visual de analíticas IA.
  * Consumo PoE en Watts.
* **Badges Oficiales en Fotos:** Renderizado uniforme en esquinas de tarjetas y fichas (ColorMaker, Polar Day, Nuevo, etc.).

---

## 7. Estructura de Directorios del Proyecto Unificado

```text
Tiandy Tech/
├── .gemini/                    # Configuración de asistente Antigravity
├── .rsc/                       # Arnés RSC v3.0 (roles, hooks, memoria)
├── 01-TOOLS/                   # Scripts y utilidades de automatización
├── 02-DOCS/                    # Documentación y especificaciones
│   ├── ESPECIFICACION_TECNICA.md # Este documento rector
│   ├── wiki/                   # Base de conocimiento y constitución
│   └── datasheets-ejemplo/     # Muestras reales (CAMARAS, NVRs, SWITCHES)
├── skills/                     # Skills del proyecto (datasheet-extractor v2.0)
│   └── datasheet-extractor/
│       └── SKILL.md
├── src/                        # Código fuente unificado
│   ├── client/                 # Frontend: Catálogo público y componentes UI
│   │   ├── components/         # Grid, Table, Filtros, Comparador, DORI, Badges
│   │   ├── pages/              # Catálogo ("/"), Wiki, Ficha Detallada
│   │   └── admin/              # Panel de gestión (" /admin ")
│   ├── server/                 # Backend Node.js / Express
│   │   ├── api/                # Endpoints REST (productos, pdf-extract, batch-edit)
│   │   ├── db/                 # Conexión y esquema SQLite (tiandy.db)
│   │   └── services/           # Extractor PDF, optimizador WebP, backup ZIP
│   └── shared/                 # Tipos TypeScript y schemas JSON compartidos
├── data/                       # Almacenamiento local persistente (SQLite, /img, /docs)
│   ├── tiandy.db
│   ├── uploads/
│   └── img/
├── Dockerfile                  # Empaquetado Docker para producción (puerto 1030)
├── docker-compose.yml          # Stack YAML para TrueNAS / OMV
├── package.json                # Scripts npm (dev puerto 8090, build, start)
└── .gitignore
```
