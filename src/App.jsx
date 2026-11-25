import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'helpdeskpro_tickets_v1'
const SESSION_KEY = 'helpdeskpro_session_v1'
const VALID_USER = 'supervisor'
const VALID_PASS = 'demo2026'

const defaultTickets = [
  { id: 'TKT-1001', empresa: 'Grupo Alfa', descripcion: 'No enciende la laptop corporativa', prioridad: 'Critica', slaMin: 12, estado: 'Abierto', tecnico: 'J. Pérez' },
  { id: 'TKT-1002', empresa: 'Constructora Beta', descripcion: 'Error al imprimir reportes mensuales', prioridad: 'Media', slaMin: 340, estado: 'Abierto', tecnico: 'L. Gómez' },
  { id: 'TKT-1003', empresa: 'Grupo Alfa', descripcion: 'Solicitud de acceso a VPN', prioridad: 'Baja', slaMin: 980, estado: 'Resuelto', tecnico: 'L. Gómez' },
  { id: 'TKT-1004', empresa: 'Soluciones Delta', descripcion: 'Caída intermitente del sistema de facturación', prioridad: 'Alta', slaMin: 25, estado: 'Abierto', tecnico: 'J. Pérez' },
  { id: 'TKT-1005', empresa: 'Comercial Omega', descripcion: '(sin descripción capturada)', prioridad: 'Media', slaMin: 60, estado: 'Abierto', tecnico: '—' },
]

function loadTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* noop */ }
  return defaultTickets.slice()
}
function saveTickets(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch (e) { /* noop */ }
}
function isLoggedIn() {
  try { return localStorage.getItem(SESSION_KEY) === '1' } catch (e) { return false }
}
function setLoggedInStorage(v) {
  try {
    if (v) localStorage.setItem(SESSION_KEY, '1')
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
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())
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

  useEffect(() => { saveTickets(tickets) }, [tickets])

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  function handleLogin(ev) {
    ev.preventDefault()
    if (username.trim() === VALID_USER && password === VALID_PASS) {
      setLoggedInStorage(true)
      setLoggedIn(true)
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  function handleLogout() {
    setLoggedInStorage(false)
    setLoggedIn(false)
    setUsername('')
    setPassword('')
    setLoginError(false)
  }

  function handleResetBoard() {
    const fresh = defaultTickets.slice()
    setTickets(fresh)
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
        {loggedIn && (
          <div id="header-session">
            <span className="session-info" id="session-user-label">Sesión: {VALID_USER}</span>
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
                const slaClass = t.slaMin <= 30 ? 'sla-risk' : 'sla-ok'
                return (
                  <tr key={t.id} data-ticket-id={t.id}>
                    <td className="col-folio">{t.id}</td>
                    <td className="col-empresa">{t.empresa}</td>
                    <td className="col-descripcion">{t.descripcion}</td>
                    <td className="col-prioridad">
                      <span className={'badge ' + prioridadClass(t.prioridad)}>{t.prioridad}</span>
                    </td>
                    <td className="col-sla">
                      <span className={slaClass}>{t.slaMin} min</span>
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
