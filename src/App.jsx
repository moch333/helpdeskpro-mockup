import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'helpdeskpro_tickets_v1'
const SESSION_KEY = 'helpdeskpro_session_v1'

// Credenciales válidas de HelpDeskPro. En Orchestrator cada una correspondería
// a su propio Asset tipo Credential (p.ej. HelpDeskPro_Credentials_Supervisor),
// según qué robot/caso de prueba la use.
const VALID_USERS = [
  { user: 'supervisor', pass: 'demo2026', nombre: 'Supervisor', rol: 'Supervisor' },
  { user: 'tecnico1', pass: 'tecnico2026', nombre: 'J. Pérez', rol: 'Técnico' },
  { user: 'admin', pass: 'admin2026', nombre: 'Administrador', rol: 'Administrador' },
  { user: 'auditor', pass: 'auditor2026', nombre: 'Auditoría', rol: 'Auditor (solo lectura)' },
]

// slaMin = minutos de SLA restante AL MOMENTO de cargar/reiniciar el tablero.
// A partir de ahí, el SLA cuenta hacia atrás en tiempo real (ver makeDefaultTickets).
const defaultTicketSeeds = [
  { id: 'TKT-1001', empresa: 'Grupo Alfa', descripcion: 'No enciende la laptop corporativa', prioridad: 'Critica', slaMin: 12, estado: 'Abierto', tecnico: 'J. Pérez' },
  { id: 'TKT-1002', empresa: 'Constructora Beta', descripcion: 'Error al imprimir reportes mensuales', prioridad: 'Media', slaMin: 340, estado: 'Abierto', tecnico: 'L. Gómez' },
  { id: 'TKT-1003', empresa: 'Grupo Alfa', descripcion: 'Solicitud de acceso a VPN', prioridad: 'Baja', slaMin: 980, estado: 'Resuelto', tecnico: 'L. Gómez' },
  { id: 'TKT-1004', empresa: 'Soluciones Delta', descripcion: 'Caída intermitente del sistema de facturación', prioridad: 'Alta', slaMin: 25, estado: 'Abierto', tecnico: 'J. Pérez' },
  { id: 'TKT-1005', empresa: 'Comercial Omega', descripcion: '(sin descripción capturada)', prioridad: 'Media', slaMin: 60, estado: 'Abierto', tecnico: '—' },
]

// Convierte los minutos semilla en una fecha límite real (createdAt + slaMin),
// igual que en el diseño real: sla_limite = {{$now.plus({minutes: X})}}.
function makeDefaultTickets() {
  const now = Date.now()
  return defaultTicketSeeds.map((seed) => ({
    ...seed,
    createdAt: now,
    slaLimite: now + seed.slaMin * 60000,
  }))
}

function loadTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Si el tablero guardado es de una versión anterior (sin slaLimite),
      // se regenera con fechas límite nuevas en vez de romper.
      if (Array.isArray(parsed) && parsed.length && parsed[0].slaLimite) return parsed
    }
  } catch (e) { /* noop */ }
  return makeDefaultTickets()
}
function saveTickets(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch (e) { /* noop */ }
}
function getSessionUser() {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    // Limpia sesiones de un formato anterior (p.ej. el viejo valor "1")
    // que ya no corresponde a ningún usuario válido de la lista actual.
    if (stored && VALID_USERS.some((u) => u.user === stored)) return stored
    if (stored) localStorage.removeItem(SESSION_KEY)
    return null
  } catch (e) { return null }
}
function setSessionUser(username) {
  try {
    if (username) localStorage.setItem(SESSION_KEY, username)
    else localStorage.removeItem(SESSION_KEY)
  } catch (e) { /* noop */ }
}

function prioridadClass(p) {
  return { Critica: 'critica', Alta: 'alta', Media: 'media', Baja: 'baja' }[p] || 'media'
}
function estadoClass(e) {
  return { Resuelto: 'resuelto', Abierto: 'abierto', Escalado: 'escalado' }[e] || 'abierto'
}

export default function App() {
  const [sessionUser, setSessionUserState] = useState(getSessionUser())
  const loggedIn = !!sessionUser
  const [tickets, setTickets] = useState(loadTickets())
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(false)

  const [editId, setEditId] = useState(null)
  const [detailEstado, setDetailEstado] = useState('Abierto')
  const [detailTecnico, setDetailTecnico] = useState('')
  const [detailNota, setDetailNota] = useState('')

  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // Fuerza un re-render cada 15s para que el SLA restante cuente hacia atrás
  // en tiempo real (el valor en sí se calcula al vuelo contra Date.now()).
  const [, forceTick] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => forceTick((x) => x + 1), 15000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => { saveTickets(tickets) }, [tickets])

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  function handleLogin(ev) {
    ev.preventDefault()
    const match = VALID_USERS.find(
      (u) => u.user === username.trim() && u.pass === password
    )
    if (match) {
      setSessionUser(match.user)
      setSessionUserState(match.user)
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  function handleLogout() {
    setSessionUser(null)
    setSessionUserState(null)
    setUsername('')
    setPassword('')
    setLoginError(false)
  }

  const currentUser = VALID_USERS.find((u) => u.user === sessionUser) || null

  function handleResetBoard() {
    setTickets(makeDefaultTickets())
    showToast('Tablero reiniciado')
  }

  function openDetail(ticket) {
    setEditId(ticket.id)
    setDetailEstado(ticket.estado)
    setDetailTecnico(ticket.tecnico)
    setDetailNota('')
  }

  function closeDetail() {
    setEditId(null)
  }

  function saveDetail() {
    if (!editId) return
    setTickets((prev) =>
      prev.map((t) =>
        t.id === editId
          ? { ...t, estado: detailEstado, tecnico: detailTecnico.trim() || t.tecnico }
          : t
      )
    )
    const savedId = editId
    setEditId(null)
    showToast('Ticket ' + savedId + ' actualizado')
  }

  const editingTicket = tickets.find((t) => t.id === editId) || null

  return (
    <>
      <header>
        <div className="brand"><span className="logo">HD</span> HelpDeskPro</div>
        {loggedIn && currentUser && (
          <div id="header-session">
            <span className="session-info" id="session-user-label">
              Sesión: {currentUser.user} ({currentUser.rol})
            </span>
            <button id="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        )}
      </header>

      {!loggedIn && (
        <div id="login-screen">
          <div className="login-card">
            <h1>Iniciar sesión</h1>
            <p className="sub">Mesa de servicio — TecnoSoporte MX</p>
            {loginError && (
              <div id="login-error" className="visible">Usuario o contraseña incorrectos.</div>
            )}
            <form id="login-form" autoComplete="off" onSubmit={handleLogin}>
              <div className="field">
                <label htmlFor="username">Usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" id="btn-login">Entrar</button>
            </form>
          </div>
        </div>
      )}

      {loggedIn && (
        <div id="dashboard-screen">
          <div className="toolbar">
            <h2>Tickets — Mesa de servicio</h2>
            <div className="actions">
              <button className="btn-sm" id="btn-reset-data" onClick={handleResetBoard}>Reiniciar tablero</button>
            </div>
          </div>
          <table id="tickets-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Empresa</th>
                <th>Descripción</th>
                <th>Prioridad</th>
                <th>SLA restante</th>
                <th>Estado</th>
                <th>Técnico</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="tickets-body">
              {tickets.map((t) => {
                const now = Date.now()
                const totalMs = t.slaLimite - t.createdAt
                const remainingMs = t.slaLimite - now
                const remainingMin = Math.round(remainingMs / 60000)
                const percentRemaining = totalMs > 0 ? (remainingMs / totalMs) * 100 : 0
                const expired = remainingMs <= 0
                // Mismo umbral que el workflow de monitoreo: riesgo si queda <=20% del SLA, o ya venció.
                const atRisk = expired || percentRemaining <= 20
                const slaClass = atRisk ? 'sla-risk' : 'sla-ok'
                const slaText = expired ? 'Vencido' : remainingMin + ' min'
                return (
                  <tr key={t.id} data-ticket-id={t.id}>
                    <td className="col-folio">{t.id}</td>
                    <td className="col-empresa">{t.empresa}</td>
                    <td className="col-descripcion">{t.descripcion}</td>
                    <td className="col-prioridad">
                      <span className={'badge ' + prioridadClass(t.prioridad)}>{t.prioridad}</span>
                    </td>
                    <td className="col-sla">
                      <span className={slaClass}>{slaText}</span>
                    </td>
                    <td className="col-estado">
                      <span className={'badge estado ' + estadoClass(t.estado)}>{t.estado}</span>
                    </td>
                    <td className="col-tecnico">{t.tecnico}</td>
                    <td className="col-accion">
                      <button
                        className="btn-escalar"
                        data-action="editar"
                        data-id={t.id}
                        disabled={t.estado === 'Resuelto'}
                        title={t.estado === 'Resuelto' ? 'Ticket ya resuelto' : undefined}
                        onClick={() => openDetail(t)}
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingTicket && (
        <div id="detail-overlay">
          <div id="detail-modal">
            <h3 id="detail-folio">{editingTicket.id}</h3>
            <div className="folio-sub" id="detail-empresa-desc">
              {editingTicket.empresa} — {editingTicket.descripcion}
            </div>
            <div className="field">
              <label htmlFor="detail-estado">Estado</label>
              <select id="detail-estado" value={detailEstado} onChange={(e) => setDetailEstado(e.target.value)}>
                <option value="Abierto">Abierto</option>
                <option value="Escalado">Escalado</option>
                <option value="Resuelto">Resuelto</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="detail-tecnico">Técnico asignado</label>
              <input
                type="text"
                id="detail-tecnico"
                value={detailTecnico}
                onChange={(e) => setDetailTecnico(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="detail-nota">Nota de escalamiento</label>
              <textarea
                id="detail-nota"
                placeholder="Nota registrada por el robot o el supervisor..."
                value={detailNota}
                onChange={(e) => setDetailNota(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button id="btn-cancelar-detalle" type="button" onClick={closeDetail}>Cancelar</button>
              <button id="btn-guardar-detalle" type="button" onClick={saveDetail}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div id="save-toast">{toast}</div>}
    </>
  )
}
