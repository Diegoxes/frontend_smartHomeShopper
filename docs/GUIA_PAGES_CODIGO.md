# Guía con código real — Pages línea por línea

> Cada sección muestra **fragmentos del archivo real** y debajo explica **qué hace cada línea**.

---

## 1. AuthPage.tsx — Login y registro

**Cuándo aparece:** usuario sin sesión (`App.tsx` → `if (!isAuthenticated) return <AuthPage />`).

### Bloque A — Imports y tipo (líneas 1–8)

```tsx
import { useState, useEffect } from 'react'
import { authService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

type Mode = 'login' | 'register'
```

| Línea | Qué hace |
|-------|----------|
| `useState` | Guardar datos del formulario, tab activo, loading. |
| `useEffect` | Llamar API de mantenimiento al montar la page. |
| `authService` | Funciones HTTP: login, register, maintenanceStatus. |
| `useAuth` | Contexto global: `login()` guarda JWT y usuario. |
| `toast` | Mensajes flotantes éxito/error. |
| `Mode` | Solo puede ser `'login'` o `'register'`. |

### Bloque B — Estado (líneas 10–15)

```tsx
export default function AuthPage() {
  const { login } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', whatsappNumber: '' })
  const [busy, setBusy] = useState(false)
  const [maintenanceOn, setMaintenanceOn] = useState(false)
```

| Línea | Qué hace |
|-------|----------|
| `login` | Función del contexto para persistir sesión tras API OK. |
| `mode` | Tab visible: login o registro. |
| `form` | Objeto con todos los inputs controlados. |
| `busy` | `true` mientras login/register está en curso. |
| `maintenanceOn` | Si backend reporta mantenimiento activo. |

### Bloque C — useEffect mantenimiento (líneas 18–23)

```tsx
useEffect(() => {
  authService
    .maintenanceStatus()
    .then(s => setMaintenanceOn(s.enabled))
    .catch(() => {})
}, [])
```

| Línea | Qué hace |
|-------|----------|
| `useEffect(..., [])` | Corre **una vez** al entrar a la page. |
| `maintenanceStatus()` | GET público (sin token). |
| `.then(s => setMaintenanceOn(s.enabled))` | Promise llama `setMaintenanceOn` con la respuesta. |
| `.catch(() => {})` | Si falla la red, no rompe la UI. |

### Bloque D — Helper inputs (líneas 25–26)

```tsx
const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm(f => ({ ...f, [k]: e.target.value }))
```

| Parte | Qué hace |
|-------|----------|
| `set('email')` | Devuelve handler para ese campo. |
| `{ ...f, [k]: ... }` | Copia el form y cambia solo un campo (inmutable). |

### Bloque E — Submit (líneas 28–42)

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setBusy(true)
  try {
    const res = mode === 'login'
      ? await authService.login({ email: form.email, password: form.password })
      : await authService.register(form)
    login(res)
    toast.success(`Bienvenido, ${res.name}!`)
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Error al conectar...')
  } finally {
    setBusy(false)
  }
}
```

| Línea | Qué hace |
|-------|----------|
| `preventDefault` | Evita recargar la página al submit. |
| `setBusy(true)` | Deshabilita botón, muestra "Cargando...". |
| ternario `mode` | Login solo email/password; register envía todo el form. |
| `login(res)` | Guarda token → App detecta sesión y cambia de page. |
| `finally` | Siempre quita busy, haya error o no. |

### Bloque F — JSX clave

```tsx
{maintenanceOn && ( <div>...banner mantenimiento...</div> )}

{(['login', 'register'] as Mode[]).map(m => (
  <button key={m} onClick={() => setMode(m)}>...</button>
))}

{mode === 'register' && ( <input value={form.name} onChange={set('name')} /> )}

<button type="submit" disabled={busy}>...</button>
```

| Patrón | Qué hace |
|--------|----------|
| `{cond && <JSX>}` | Render condicional. |
| `.map(m => ...)` | Genera 2 tabs dinámicamente. |
| `mode === 'register' &&` | Campos extra solo en registro. |
| `disabled={busy}` | Evita doble submit. |

---

## 2. OnboardingPage.tsx — Crear organización

**Cuándo aparece:** usuario logueado sin `orgId` (`needsOnboarding`).

### Bloque A — Estado (líneas 11–20)

```tsx
const { login } = useAuth()
const [form, setForm] = useState({
  name: '',
  industry: 'General',
  currency: 'MXN',
  country: 'MX',
  timezone: 'America/Mexico_City',
})
const [busy, setBusy] = useState(false)
```

| Campo | Qué hace |
|-------|----------|
| `name` | Nombre de la empresa (obligatorio). |
| `industry` | Rubro del negocio. |
| `currency`, `country`, `timezone` | Config regional con defaults México. |

### Bloque B — Submit (líneas 22–35)

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setBusy(true)
  try {
    const res = await organizationService.onboard(form)
    login(res)   // ← JWT nuevo con orgId
    toast.success('¡Negocio configurado!')
  } catch (err: unknown) { ... }
  finally { setBusy(false) }
}
```

| Línea | Qué hace |
|-------|----------|
| `onboard(form)` | POST crea organización en backend. |
| `login(res)` | **Crucial:** reemplaza token viejo por uno con org y permisos. |
| Tras esto | `needsOnboarding` pasa a false → App muestra dashboard. |

### Bloque C — Inputs (ejemplo línea 83–90)

```tsx
<input
  value={form.name}
  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
  required
  autoFocus
/>
```

| Línea | Qué hace |
|-------|----------|
| `value={form.name}` | Input controlado: React es la fuente de verdad. |
| `onChange` | Cada tecla actualiza estado → re-render con nuevo valor. |
| `autoFocus` | Cursor en nombre al abrir la page. |

---

## 3. DashboardPage.tsx — Resumen operativo

### Bloque A — Hooks y permisos (líneas 27–36)

```tsx
const { user } = useAuth()
const inv = modulePerm(user, MOD.INVENTORY)
const { data, isLoading } = useDashboard()
const { data: exec } = useQuery({ queryKey: ['executive'], queryFn: () => dashboardService.executive() })
const deleteProduct = useDeleteProduct()
const [modal, setModal] = useState<ModalState>(null)
const gridCaps = { edit: inv.canUpdate, delete: inv.canDelete, adjust: inv.canUpdate }
```

| Línea | Qué hace |
|-------|----------|
| `modulePerm` | Extrae canCreate/canUpdate/canDelete del módulo INVENTORY. |
| `useDashboard()` | useQuery wrapper → KPIs + listas de alertas. |
| `useQuery executive` | Segunda query: valor stock, compras mes, estancados. |
| `useDeleteProduct()` | Objeto mutación; usar `.mutate(id)` para borrar. |
| `modal` | `null` = sin modal; `{ type: 'form' }` = crear producto. |
| `gridCaps` | Qué botones ve cada tarjeta de producto. |

### Bloque B — Delete handler (líneas 38–41)

```tsx
const handleDelete = (id: string) => {
  if (!confirm('¿Eliminar este producto?')) return
  deleteProduct.mutate(id)
}
```

| Línea | Qué hace |
|-------|----------|
| `confirm` | Diálogo nativo del navegador. |
| `mutate(id)` | React Query ejecuta DELETE + actualiza cache + toast. |

### Bloque C — Loading early return (líneas 43–50)

```tsx
if (isLoading) return ( <div>...spinner...</div> )
```

| Qué hace |
|----------|
| Si dashboard aún no cargó, **no** pinta KPIs vacíos; solo spinner. |
| `return` aquí **termina** el componente; el JSX de abajo no corre. |

### Bloque D — KPIs (líneas 67–94)

```tsx
<StatCard label="Total productos" value={data?.totalProducts ?? 0} ... />
<StatCard label="Valor stock" value={`$${exec?.totalStockValue?.toFixed(0) ?? 0}`} ... />
```

| Operador | Qué hace |
|----------|----------|
| `data?.totalProducts` | Si `data` es undefined, no explota; devuelve undefined. |
| `?? 0` | Si es null/undefined, muestra 0. |
| `` `$${...}` `` | Template string para prefijo $. |

### Bloque E — Modales (líneas 146–149)

```tsx
{modal?.type === 'form' && <ProductModal product={modal.data} onClose={() => setModal(null)} />}
{(modal?.type === 'consume' || modal?.type === 'restock') && (
  <AdjustModal product={modal.data} mode={modal.type} onClose={() => setModal(null)} />
)}
```

| Línea | Qué hace |
|-------|----------|
| `modal?.type` | Optional chaining: seguro si modal es null. |
| `ProductModal` | Crear/editar producto. |
| `AdjustModal` | Consumir o reponer stock. |
| `setModal(null)` | Cierra cualquier modal. |

---

## 4. AlertsPage.tsx — Vista de alertas

Casi igual que Dashboard pero **solo alertas**, con cards rojas/ámbar.

### Bloque A — Setup (líneas 13–24)

```tsx
const { user } = useAuth()
const inv = modulePerm(user, MOD.INVENTORY)
const gridCaps = { edit: inv.canUpdate, delete: inv.canDelete, adjust: inv.canUpdate }
const { data, isLoading } = useDashboard()   // ← mismos datos que Dashboard
const deleteProduct = useDeleteProduct()
const [modal, setModal] = useState<ModalState>(null)

const handleDelete = (id: string) => {
  if (!confirm('¿Eliminar este producto?')) return
  deleteProduct.mutate(id)
}
```

**Idea clave:** reutiliza `useDashboard()` — no duplica fetch; React Query comparte cache.

### Bloque B — Variables derivadas (líneas 35–36)

```tsx
const noAlerts = !data?.lowStockProducts?.length && !data?.expiringProducts?.length
const totalAlerts = (data?.lowStockProducts?.length ?? 0) + (data?.expiringProducts?.length ?? 0)
```

| Variable | Qué hace |
|----------|----------|
| `noAlerts` | true si ambas listas vacías o undefined. |
| `totalAlerts` | Suma para el subtítulo "N alertas activas". |

### Bloque C — Render condicional (líneas 53–107)

```tsx
{noAlerts && ( <div>Todo en orden</div> )}

{(data?.lowStockProducts?.length ?? 0) > 0 && (
  <section>
    <div className="card bg-red-50">...</div>
    <ProductGrid products={data!.lowStockProducts} ... />
  </section>
)}
```

| Patrón | Qué hace |
|--------|----------|
| `noAlerts &&` | Empty state amigable. |
| `length ?? 0) > 0` | Comprueba hay items sin error si data es null. |
| `data!` | Le dice a TypeScript "aquí data no es null" (ya verificamos length). |

---

## 5. InventoryPage.tsx — Catálogo con filtros

### Bloque A — Estado filtros (líneas 23–27)

```tsx
const [modal, setModal] = useState<ModalState>(null)
const [search, setSearch] = useState('')
const [cat, setCat] = useState('')
const [lowStock, setLowStock] = useState(false)
const [expiringSoon, setExpiringSoon] = useState(false)
```

Cada filtro es estado local → al cambiar, React re-renderiza y `useQuery` refetch.

### Bloque B — useQuery productos (líneas 29–37)

```tsx
const { data: products = [], isPending, isFetching } = useQuery({
  queryKey: ['products', search, cat, lowStock, expiringSoon],
  queryFn: () => productService.getAll({
    q: search || undefined,
    category: cat || undefined,
    lowStock: lowStock || undefined,
    expiringSoon: expiringSoon || undefined,
  }),
})
```

| Línea | Qué hace |
|-------|----------|
| `queryKey` | ID de la query. **Si search cambia, key cambia → nuevo fetch.** |
| `products = []` | Default vacío mientras carga. |
| `search \|\| undefined` | No envía string vacío al API. |
| `isPending` | Primera carga sin datos. |
| `isFetching` | Cualquier request en vuelo. |

### Bloque C — Toggle filtros (líneas 92–107)

```tsx
<button
  className={lowStock ? 'btn-primary' : 'btn-secondary'}
  onClick={() => setLowStock(v => !v)}
>
  Stock bajo
</button>
```

| Línea | Qué hace |
|-------|----------|
| `v => !v` | Invierte true/false (toggle). |
| Cambio en `lowStock` | queryKey cambia → refetch automático. |

### Bloque D — Ternario anidado contenido (líneas 111–132)

```tsx
{showLoading ? (
  <Spinner />
) : products.length === 0 ? (
  <Empty hasFilters={hasFilters} />
) : (
  <ProductGrid products={products} ... />
)}
```

| Estado | Qué ve el usuario |
|--------|-------------------|
| `showLoading` | Spinner |
| 0 productos | Mensaje vacío o "ajusta filtros" |
| Hay productos | Grid |

---

## 6. StatsPage.tsx — Reportes

### Bloque A — Queries (líneas 16–18)

```tsx
const { data: inv, isLoading } = useQuery({ queryKey: ['report-inventory'], queryFn: () => reportService.inventory() })
const { data: rotation } = useQuery({ queryKey: ['report-rotation'], queryFn: () => reportService.rotation() })
```

Dos queries **independientes** en paralelo al montar la page.

### Bloque B — Export Excel (líneas 21–29)

```tsx
const exportReport = async () => {
  const blob = await reportService.exportXlsx()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'reporte-inventario.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}
```

| Línea | Qué hace |
|-------|----------|
| `blob` | Archivo binario del backend. |
| `createObjectURL` | URL temporal en memoria del navegador. |
| `<a download>` | Truco para descargar sin salir de la page. |
| `revokeObjectURL` | Libera memoria. |

### Bloque C — Lista rotación (líneas 119–120)

```tsx
(rotation?.rows ?? []).slice(0, 10).map((r, idx) => ( ... ))
```

| Parte | Qué hace |
|-------|----------|
| `?? []` | Si rotation null, array vacío. |
| `.slice(0, 10)` | Solo top 10 productos. |
| `idx + 1` | Ranking 1, 2, 3... |

---

## 7. PurchasesPage.tsx — Historial compras

### Bloque A — Estado + useEffect (líneas 7–12)

```tsx
const [data, setData] = useState<PurchasesPage | null>(null)

useEffect(() => {
  purchaseService.list().then(setData).catch(() => setData({ items: [], periodTotalSpend: 0 }))
}, [])
```

| Línea | Qué hace |
|-------|----------|
| `null` inicial | Primera render: aún no hay datos. |
| `.then(setData)` | Promise **llama** `setData(respuestaApi)` — tú pasas la función, la Promise inyecta el argumento. |
| `.catch(...)` | Si API falla, pone objeto vacío para no dejar `null` forever. |
| `[]` | Solo al montar. |

### Bloque B — Gasto del periodo (líneas 33–35)

```tsx
${data?.periodTotalSpend?.toFixed(2) ?? '0.00'}
```

Muestra gasto con 2 decimales; si `data` null → `'0.00'`.

### Bloque C — Tabla (líneas 73–89)

```tsx
{data.items.map(p => (
  <tr key={p.id}>
    <td>{new Date(p.purchasedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
    <td>{p.productName}</td>
    <td>{p.supplierName ?? '—'}</td>
    <td>{p.quantity}</td>
    <td>${p.totalAmount?.toFixed(2) ?? '—'}</td>
  </tr>
))}
```

| Línea | Qué hace |
|-------|----------|
| `key={p.id}` | React necesita key única en listas. |
| `new Date(...).toLocaleDateString` | Formato fecha en español México. |
| `?? '—'` | Guión si no hay proveedor o monto. |

---

## 8. SuppliersPage.tsx — Proveedores

### Bloque A — load + useEffect (líneas 9–14)

```tsx
const [items, setItems] = useState<Supplier[]>([])
const [name, setName] = useState('')

const load = () => supplierService.list().then(setItems).catch(() => toast.error('...'))

useEffect(() => { load() }, [])
```

| Línea | Qué hace |
|-------|----------|
| `load` | Función reutilizable para refrescar lista. |
| `useEffect` | Carga inicial al montar. |
| Mismo patrón `.then(setItems)` | Promise pasa respuesta a setItems. |

### Bloque B — Crear (líneas 16–22)

```tsx
const create = async (e: React.FormEvent) => {
  e.preventDefault()
  await supplierService.create({ name })
  setName('')
  load()
  toast.success('Proveedor creado')
}
```

| Línea | Qué hace |
|-------|----------|
| `await create` | Espera POST termine. |
| `setName('')` | Limpia input. |
| `load()` | Vuelve a pedir lista actualizada. |

---

## 9. OrgTeamPage.tsx — Equipo de la org

### Bloque A — Estado (líneas 9–15)

```tsx
const [members, setMembers] = useState<OrgMemberDto[]>([])
const [form, setForm] = useState({ email: '', password: '', name: '', orgRole: 'MEMBER' })
const [showForm, setShowForm] = useState(false)

const load = () => organizationService.members().then(setMembers).catch(...)
useEffect(() => { load() }, [])
```

### Bloque B — Agregar miembro (líneas 17–28)

```tsx
const add = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await organizationService.addMember(form)
    toast.success('Miembro agregado')
    setShowForm(false)
    setForm({ email: '', password: '', name: '', orgRole: 'MEMBER' })
    load()
  } catch {
    toast.error('No se pudo agregar miembro')
  }
}
```

| Línea | Qué hace |
|-------|----------|
| `addMember(form)` | POST crea usuario en la org. |
| `setShowForm(false)` | Oculta formulario. |
| Reset form | Deja campos limpios para próxima invitación. |

### Bloque C — Avatar iniciales (línea 143)

```tsx
{m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
```

"Juan Pérez" → `"JP"` para el círculo del avatar.

### Bloque D — Proteger MANAGER (líneas 158–169)

```tsx
{m.orgRole !== 'MANAGER' ? (
  <button onClick={() => remove(m.id)}>Eliminar</button>
) : (
  <span>No se puede eliminar</span>
)}
```

El manager de la org no se puede borrar desde aquí.

---

## 10. WhatsAppPage.tsx — Solo documentación

**No usa hooks.** Es UI estática.

### Bloque A — Constantes (líneas 7–30)

```tsx
const STEPS = [ 'Entra a twilio.com...', ... ]
const COMMANDS = [ { cmd: 'inventario', desc: '...' }, ... ]
```

Datos fijos en memoria; no vienen del API.

### Bloque B — Render listas (líneas 52–58)

```tsx
{STEPS.map((step, i) => (
  <div key={i}>
    <div>{i + 1}</div>
    <p>{step}</p>
  </div>
))}
```

| Línea | Qué hace |
|-------|----------|
| `.map((step, i) =>` | Por cada paso, crea un div. |
| `i + 1` | Número humano 1, 2, 3... (i empieza en 0). |

---

## 11. PlatformAdminPage.tsx — Admin plataforma

### Bloque A — load doble (líneas 13–18)

```tsx
const load = () => {
  platformService.organizations().then(setOrgs).catch(...)
  platformService.users().then(setUsers).catch(...)
}
useEffect(() => { load() }, [])
```

Dos fetches en paralelo al montar (orgs y users).

### Bloque B — Tabs (líneas 40–57)

```tsx
const [tab, setTab] = useState<'orgs' | 'users'>('orgs')

<button onClick={() => setTab('orgs')}>Organizaciones</button>
<button onClick={() => setTab('users')}>Usuarios</button>

{tab === 'orgs' && ( <table>...</table> )}
{tab === 'users' && ( <table>...</table> )}
```

Solo una tabla visible según tab activo.

### Bloque C — Límite miembros (líneas 95–103)

```tsx
onClick={() => updateMax(o.id, o.maxMembers + 5)}
onClick={() => updateMax(o.id, Math.max(1, o.maxMembers - 5))}
```

| Botón | Qué hace |
|-------|----------|
| +5 | Sube límite de miembros de la org. |
| -5 | Baja límite, mínimo 1 (`Math.max(1, ...)`). |

---

## 12. AdminRolesPage.tsx — RBAC (la más compleja)

### Bloque A — Helpers (líneas 26–34)

```tsx
const ORG_ROLE_NAMES = new Set(['MANAGER', 'MEMBER', 'VIEWER'])

function isOrgRoleName(name: string | undefined): boolean {
  return !!name && ORG_ROLE_NAMES.has(name)
}

function cellKey(roleId: number, moduleId: number) {
  return `${roleId}-${moduleId}`
}
```

| Función | Qué hace |
|---------|----------|
| `isOrgRoleName` | ¿Este rol necesita organización? |
| `cellKey` | Clave única para permiso rol+módulo en el mapa. |

### Bloque B — 5 useQuery (líneas 39–58)

```tsx
const { data: rbac, isLoading: rbacLoading } = useQuery({ queryKey: ['admin', 'rbac'], queryFn: () => adminService.getRbac() })
const { data: roles } = useQuery({ queryKey: ['admin', 'roles'], ... })
const { data: maint } = useQuery({ queryKey: ['admin', 'maintenance'], ... })
const { data: users, isLoading: usersLoading } = useQuery({ queryKey: ['admin', 'users'], ... })
const { data: organizations = [] } = useQuery({ queryKey: ['platform', 'organizations'], ... })
```

Al montar, pide en paralelo: matriz RBAC, roles, mantenimiento, usuarios, orgs.

### Bloque C — useEffect sync permMap (líneas 73–80)

```tsx
useEffect(() => {
  if (!rbac?.permissions) return
  const next: Record<string, RoleModuleCellDto> = {}
  for (const p of rbac.permissions) {
    next[cellKey(p.roleId, p.moduleId)] = { ...p }
  }
  setPermMap(next)
}, [rbac])
```

| Línea | Qué hace |
|-------|----------|
| Guard `if (!rbac?.permissions)` | Espera datos antes de procesar. |
| Loop | Convierte array API → objeto `{ "1-2": { canRead: true, ... } }`. |
| `[rbac]` | Re-corre cuando llega/actualiza rbac. |

**Por qué permMap local:** editas checkboxes sin guardar hasta click "Guardar permisos".

### Bloque D — useMutation savePerms (líneas 100–114)

```tsx
const savePerms = useMutation({
  mutationFn: () => adminService.updatePermissions(Object.values(permMap)),
  onSuccess: async () => {
    toast.success('Permisos guardados')
    qc.invalidateQueries({ queryKey: ['admin', 'rbac'] })
    await refreshUser().catch(() => {})
  },
})
```

| Línea | Qué hace |
|-------|----------|
| `Object.values(permMap)` | Convierte mapa → array para el API. |
| `invalidateQueries` | Marca cache rbac como stale → refetch. |
| `refreshUser()` | Actualiza permisos del usuario logueado en contexto. |

### Bloque E — useMemo sort (líneas 183–192)

```tsx
const rolesSorted = useMemo(
  () => [...availableRoles].sort((a, b) => a.id - b.id),
  [availableRoles],
)
```

Ordena roles solo cuando `availableRoles` cambia.

### Bloque F — Toggle mantenimiento (líneas 229–236)

```tsx
<button
  disabled={setMaint.isPending}
  onClick={() => setMaint.mutate(!(maint?.enabled ?? false))}
>
  {maint?.enabled ? 'Desactivar mantenimiento' : 'Activar mantenimiento'}
</button>
```

| Línea | Qué hace |
|-------|----------|
| `!(maint?.enabled ?? false)` | Invierte estado actual. |
| `setMaint.mutate(...)` | POST al backend activar/desactivar. |
| `isPending` | Deshabilita botón mientras procesa. |

### Bloque G — Matriz permisos checkbox (líneas 577–595)

```tsx
{(['canCreate', 'canRead', 'canUpdate', 'canDelete'] as const).map(([field, checked]) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={e => togglePerm(role.id, mod.id, field, e.target.checked)}
  />
))}
```

| Línea | Qué hace |
|-------|----------|
| `as const` | TypeScript sabe que field es uno de los 4 permisos. |
| `togglePerm` | Actualiza permMap local (draft, no guardado aún). |
| Botón "Guardar permisos" | `savePerms.mutate()` envía todo al API. |

---

## Resumen: qué hook usa cada page

```
AuthPage         → useState + useEffect
OnboardingPage   → useState
DashboardPage    → useState + useQuery + useMutation (hook)
AlertsPage       → useState + useQuery (useDashboard) + useMutation
InventoryPage    → useState + useQuery x2 + useMutation
StatsPage        → useQuery x2
PurchasesPage    → useState + useEffect
SuppliersPage    → useState + useEffect
OrgTeamPage      → useState + useEffect
PlatformAdminPage→ useState + useEffect
AdminRolesPage   → useState + useEffect + useMemo + useQuery x5 + useMutation x4
WhatsAppPage     → (ninguno — solo JSX)
```

---

*Ver también `DOCUMENTACION_PAGES.md` para teoría de hooks (capítulo 0).*
