---
type: constitution
title: Tiandy Tech — Constitution
description: Constitución fundacional ratificada para Tiandy Tech según la especificación técnica integral.
tags: [sdd, constitution]
timestamp: 2026-10-09T03:33:00Z
topic: sdd
status: ratified
version: 1.0.0
---

# Tiandy Tech — Constitution

> **Documento rector del arnés SDD v1.0.0.**
> Rige las decisiones arquitectónicas, calidad, seguridad y convenciones del proyecto.
> La especificación detallada canónica reside en [`02-DOCS/ESPECIFICACION_TECNICA.md`](../ESPECIFICACION_TECNICA.md).

## Known facts

- **Objetivo:** Plataforma web técnica interactiva Tiandy Tech (Cámaras IP, NVRs, Switches PoE).
- **Alcance:** Monorepo con Frontend (Cloudflare Pages), Backoffice (Docker en NAS TrueNAS / OMV) y Capa Comercial (Supabase).
- **Flujo de trabajo:** Directo en rama principal (`main`).
- **Marca Blanca:** Neutralidad absoluta sin datos ni marcas del importador mayorista. Cero recopilación de datos invasivos de clientes.

## 1. Stack canon

- **Frontend:** Single Page Application estática con Vite + React / TypeScript + Tailwind CSS. Alojada en **Cloudflare Pages** con despliegue continuo desde subdirectorio `frontend/`.
- **Backoffice LAN:** Aplicación en Node.js / TypeScript + SQLite persistente, desplegada mediante **Docker Compose** en la red local del NAS (TrueNAS SCALE / OMV).
- **Capa Comercial & Auth:** **Supabase** (Google OAuth + políticas RLS para control estricto de visibilidad de precios y stocks).
- **Procesamiento de Documentos:** Extractor asistido de Datasheets PDF para carga técnica ágil y validación de operador.
- **Procesamiento Multimedia:** Conversión y optimización de imágenes a WebP (`sharp`) y renderizado de sellos/badges oficiales (ColorMaker, Polar Day, etc.).

## 2. Quality bar

- **TypeScript:** Modo estricto (`strict: true`) en frontend y backoffice.
- **Rendimiento:** Puntuación Lighthouse en frontend > 90 en Performance y Accesibilidad.
- **Integridad de Datos:** Todo producto cargado debe contar con validación técnica de hardware y previsualización antes de persistir.
- **Respaldo:** Soporte nativo en backoffice para exportación e importación de copias de seguridad completas (`.zip` con SQLite, `/img/` y `/docs/`).

## 3. Conventions

- **Estructura del Proyecto (Monorepo):**
  - `frontend/`: Código fuente de la web pública para Cloudflare Pages.
  - `backoffice/`: Código fuente y `docker-compose.yml` para el NAS.
  - `01-TOOLS/`: Scripts auxiliares de desarrollo y administración.
  - `02-DOCS/`: Especificaciones, wiki técnica y manuales de arquitectura.
- **Idioma:** Español para nombres de especificaciones técnicas, atributos de producto de cara al usuario y documentación técnica; inglés para código y APIs internas.
- **Precios y Stocks:** Moneda en Dólares Americanos (USD) netos sin impuestos. Estados de stock cualitativos (`ENTREGA_INMEDIATA`, `POCAS_UNIDADES`, `PROXIMO_ARRIBO`, `AGOTADO`, `CONSULTAR`).

## 4. Branching & shipping

- Desarrollo directo en `main`.
- Despliegue automático en Cloudflare Pages activado por `git push`.
- El backoffice en el NAS compila `catalogo.json`, valida assets, actualiza Supabase y ejecuta `git commit & push` al presionar "Publicar".

## 5. Security & privacy floor

- **Privacidad de Precios:** Los precios mayoristas nunca residen en código ni en el JSON público. RLS en Supabase restringe la entrega de precios exclusivamente a cuentas de Google con estado `APROBADO`.
- **Seguridad del NAS:** El NAS no abre puertos públicos ni requiere port forwarding en el router; opera 100% en LAN y sus peticiones a Supabase y GitHub son salientes seguras vía HTTPS.
- **Control de Acceso en el NAS (RBAC):** Cuentas locales con roles granulares modulares y registro de auditoría (*Audit Log*).

## 6. UX / accessibility floor

- Soporte nativo para **Light Mode** (predeterminado) y **Dark Mode**.
- Doble modo de visualización: **Modo Grid (Tarjetas visuales)** y **Modo Tabla Técnica (Spreadsheet denso)**.
- Comparador visual con gráficas métricas de alcance DORI (m), alcance de iluminación IR/LED y consumo PoE (W).

## 7. Performance budgets

- Bundle inicial del frontend < 200 KB gzipped.
- Imágenes servidas exclusivamente en formato WebP optimizado.

## 8. Knowledge & decisions

- Especificación maestra: [`02-DOCS/ESPECIFICACION_TECNICA.md`](../ESPECIFICACION_TECNICA.md).
- Registro de decisiones arquitectónicas en `02-DOCS/wiki/harness/decisions.md`.

## Definition of Done

1. Código tipado y sin errores de compilación (`tsc --noEmit`).
2. Ficha técnica compatible con la taxonomía dinámica de series Tiandy.
3. Validación de permisos RLS antes de exponer cualquier dato comercial.
4. Pruebas de previsualización local antes de publicar cambios a producción.

## Amendment log (append-only)

| Date | Version | Change | Why |
|------|---------|--------|-----|
| 2026-10-09 | 1.0.0 | Ratificación inicial de la constitución del proyecto Tiandy Tech. | Alineación formal con la especificación técnica integral y el arnés rsc v3.0. |
