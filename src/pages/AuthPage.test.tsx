import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthPage from '@/pages/AuthPage'
import { authService } from '@/services/api'
import toast from 'react-hot-toast'

const loginMock = vi.fn()

vi.mock('@/services/api', () => ({
  authService: {
    maintenanceStatus: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  },
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ login: loginMock }),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.maintenanceStatus).mockResolvedValue({ enabled: false })
  })

  it('renderiza formulario de login por defecto', async () => {
    render(<AuthPage />)
    expect(screen.getByRole('heading', { name: 'SmartInventory' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
    expect(screen.queryByLabelText(/Nombre completo/i)).not.toBeInTheDocument()
    await waitFor(() => {
      expect(authService.maintenanceStatus).toHaveBeenCalled()
    })
  })

  it('muestra aviso cuando hay mantenimiento activo', async () => {
    vi.mocked(authService.maintenanceStatus).mockResolvedValue({ enabled: true })
    render(<AuthPage />)
    expect(await screen.findByText(/Mantenimiento activo/i)).toBeInTheDocument()
  })

  it('cambia a modo registro y muestra campos extra', async () => {
    const user = userEvent.setup()
    render(<AuthPage />)
    await user.click(screen.getByRole('button', { name: 'Registrarse' }))
    expect(screen.getByPlaceholderText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('+51999999999')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
  })

  it('login exitoso llama authService y persiste sesión', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockResolvedValue({
      token: 'jwt-123',
      userId: 'u1',
      name: 'Ana',
      email: 'ana@test.com',
      role: 'MANAGER',
      orgRole: 'MANAGER',
      orgId: 'org-1',
      permissions: [],
    })

    render(<AuthPage />)
    await user.type(screen.getByPlaceholderText('tu@empresa.com'), 'ana@test.com')
    await user.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'secret123')
    await user.click(screen.getByRole('button', { name: /Entrar/i }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'ana@test.com',
        password: 'secret123',
      })
    })
    expect(loginMock).toHaveBeenCalledWith(expect.objectContaining({ token: 'jwt-123' }))
    expect(toast.success).toHaveBeenCalledWith('Bienvenido, Ana!')
  })

  it('muestra error si el login falla', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockRejectedValue({
      response: { data: { error: 'Credenciales inválidas' } },
    })

    render(<AuthPage />)
    await user.type(screen.getByPlaceholderText('tu@empresa.com'), 'bad@test.com')
    await user.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'wrong')
    await user.click(screen.getByRole('button', { name: /Entrar/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Credenciales inválidas')
    })
  })
})
