# Aplicación creada con Claude para fines de demostración en el proyecto final de RPA

# HelpDeskPro — Mockup en React (para GitHub Pages)

Réplica en React del mockup de HelpDeskPro usado como "sistema empresarial" que
el robot de UiPath automatiza en el proyecto final (n8n + UiPath). Se hospeda
en GitHub Pages para tener una URL pública y estable


**Credenciales de prueba** 

| Usuario | Contraseña | Rol | Pensado para |
|---|---|---|---|
| `supervisor` | `demo2026` | Supervisor | Flujo principal de escalamiento (UiPath) |
| `tecnico1` | `tecnico2026` | Técnico | Pruebas de reasignación/gestión de ticket |
| `admin` | `admin2026` | Administrador | Pruebas de acceso elevado / configuración |
| `auditor` | `auditor2026` | Auditor (solo lectura) | Casos de prueba de solo consulta |


## Datos de prueba ya cargados

| Folio | Caso |
|---|---|
| TKT-1001 | SLA en riesgo (≤30 min) |
| TKT-1003 | Ya "Resuelto" — botón deshabilitado (excepción de negocio) |
| TKT-1004 | SLA en riesgo (≤30 min) |
| TKT-1005 | Descripción y técnico incompletos (dato incompleto) |

Botón "Reiniciar tablero" restaura estos datos (se guardan en `localStorage`
del navegador, por sesión/dispositivo).

## Estructura

```
helpdeskpro-react/
├── .github/workflows/deploy.yml   # Despliegue automático a GitHub Pages
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                    # Toda la lógica (login, tabla, modal)
    └── index.css
```
