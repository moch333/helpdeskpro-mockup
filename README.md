# HelpDeskPro — Mockup en React (para GitHub Pages)

Réplica en React del mockup de HelpDeskPro usado como "sistema empresarial" que
el robot de UiPath automatiza en el proyecto final (n8n + UiPath). Se hospeda
en GitHub Pages para tener una URL pública y estable — a diferencia de un
artifact de claude.ai, que no es el destino pensado para que un robot externo
lo scrapee de forma repetible.

Mantiene exactamente los mismos `id`, clases y atributos `data-*` que el
mockup original, para que los selectores de UiPath (`#username`, `#password`,
`#btn-login`, `[data-ticket-id="TKT-100X"]`, `[data-action="editar"]`,
`#detail-estado`, `#detail-tecnico`, `#detail-nota`, `#btn-guardar-detalle`,
etc.) sigan funcionando sin cambios.

**Credenciales de prueba** (no se muestran en la interfaz, solo aquí — igual
que el Asset `HelpDeskPro_Credentials` en Orchestrator, que tampoco es visible
para el robot, solo consumido):

| Usuario | Contraseña | Rol | Pensado para |
|---|---|---|---|
| `supervisor` | `demo2026` | Supervisor | Flujo principal de escalamiento (UiPath) |
| `tecnico1` | `tecnico2026` | Técnico | Pruebas de reasignación/gestión de ticket |
| `admin` | `admin2026` | Administrador | Pruebas de acceso elevado / configuración |
| `auditor` | `auditor2026` | Auditor (solo lectura) | Casos de prueba de solo consulta |

## 1. Probarlo en local

```bash
npm install
npm run dev
```

Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`).

## 2. Antes de subirlo a GitHub — ajusta 2 archivos

El nombre de tu repositorio debe coincidir en estos 2 lugares (si tu repo se
llama distinto a `helpdeskpro-mockup`, cámbialo en ambos):

- `vite.config.js` → `base: '/helpdeskpro-mockup/'`
- `package.json` → `"homepage": "https://TU-USUARIO-GITHUB.github.io/helpdeskpro-mockup/"`

## 3. Subir a GitHub y activar Pages

```bash
git init
git add .
git commit -m "HelpDeskPro mockup en React"
git branch -M main
git remote add origin https://github.com/TU-USUARIO-GITHUB/helpdeskpro-mockup.git
git push -u origin main
```

Luego, en GitHub: **Settings → Pages → Build and deployment → Source →
"GitHub Actions"**. El workflow en `.github/workflows/deploy.yml` ya está
incluido: cada `push` a `main` construye el proyecto (`npm run build`) y lo
publica automáticamente. En unos 1-2 minutos tu página estará en:

```
https://TU-USUARIO-GITHUB.github.io/helpdeskpro-mockup/
```

Esa URL es la que debes usar en:
- El `Data/config.json` del proyecto de UiPath (la URL del mockup).
- El Asset `HelpDeskPro_Credentials` lo manejas aparte en Orchestrator; esta
  URL solo apunta al sitio.

## 4. Datos de prueba ya cargados

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
