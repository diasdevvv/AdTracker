'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { updateUserProfile, resetDashboard } from '../offers/actions'
import { User, ShieldAlert, Key, Eye, EyeOff, Loader2 } from 'lucide-react'

interface SettingsClientProps {
  initialData: {
    name: string
    avatarUrl: string
    email: string
  }
}

export default function SettingsClient({ initialData }: SettingsClientProps) {
  const router = useRouter()
  
  // States for Profile Form
  const [name, setName] = useState(initialData.name)
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [isProfilePending, startProfileTransition] = useTransition()

  // States for Security Form
  const [email, setEmail] = useState(initialData.email)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [securityError, setSecurityError] = useState<string | null>(null)
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null)
  const [isSecurityPending, startSecurityTransition] = useTransition()

  // States for Reset Dialog
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [isResetPending, startResetTransition] = useTransition()

  // Submit Profile Changes
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)

    startProfileTransition(async () => {
      const res = await updateUserProfile({ name, avatarUrl })
      if (res?.error) {
        setProfileError(res.error)
      } else {
        setProfileSuccess('Perfil atualizado com sucesso!')
        router.refresh()
      }
    })
  }

  // Submit Security Changes
  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityError(null)
    setSecuritySuccess(null)

    if (!email) {
      setSecurityError('O campo e-mail não pode ficar em branco.')
      return
    }

    startSecurityTransition(async () => {
      const payload: any = {}
      if (email !== initialData.email) payload.email = email
      if (password) payload.password = password

      if (Object.keys(payload).length === 0) {
        setSecurityError('Nenhuma alteração de segurança inserida.')
        return
      }

      const res = await updateUserProfile(payload)
      if (res?.error) {
        setSecurityError(res.error)
      } else {
        setSecuritySuccess('Credenciais atualizadas com sucesso!')
        setPassword('')
        router.refresh()
      }
    })
  }

  // Submit Reset Dashboard Action
  const handleResetDashboard = (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)

    if (!confirmPassword) {
      setResetError('Por favor, digite sua senha de confirmação.')
      return
    }

    startResetTransition(async () => {
      const res = await resetDashboard(confirmPassword)
      if (res?.error) {
        setResetError(res.error)
      } else {
        setIsResetOpen(false)
        setConfirmPassword('')
        router.refresh()
        router.push('/')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. Profile Panel */}
      <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="space-y-1 pb-4 border-b border-slate-900/60">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Editar Perfil
          </h3>
          <p className="text-xs text-slate-450">
            Altere seu nome público e imagem de perfil da conta.
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {profileError && (
            <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-400">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-xs text-emerald-400">
              {profileSuccess}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-slate-350 text-xs">Nome de Exibição</Label>
              <Input
                id="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Roberto Dias"
                className="bg-slate-900 border-slate-800 focus:border-indigo-650 focus:ring-0 text-xs text-white"
                disabled={isProfilePending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl" className="text-slate-350 text-xs">URL da Foto de Perfil</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Ex: https://github.com/diasdevvv.png"
                className="bg-slate-900 border-slate-800 focus:border-indigo-650 focus:ring-0 text-xs text-white"
                disabled={isProfilePending}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isProfilePending}
              className="bg-indigo-650 hover:bg-indigo-550 text-white font-medium text-xs py-2 px-4 rounded-lg flex items-center gap-1.5"
            >
              {isProfilePending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Security Panel */}
      <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="space-y-1 pb-4 border-b border-slate-900/60">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            Conta & Segurança
          </h3>
          <p className="text-xs text-slate-450">
            Atualize suas credenciais de login e e-mail de acesso.
          </p>
        </div>

        <form onSubmit={handleUpdateSecurity} className="space-y-4">
          {securityError && (
            <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-400">
              {securityError}
            </div>
          )}
          {securitySuccess && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-xs text-emerald-400">
              {securitySuccess}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="settingsEmail" className="text-slate-350 text-xs">Endereço de E-mail</Label>
              <Input
                id="settingsEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="robertodiasdev@gmail.com"
                className="bg-slate-900 border-slate-800 focus:border-indigo-650 focus:ring-0 text-xs text-white"
                disabled={isSecurityPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settingsPassword" className="text-slate-350 text-xs">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="settingsPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                  className="bg-slate-900 border-slate-800 focus:border-indigo-650 focus:ring-0 text-xs text-white pr-10"
                  disabled={isSecurityPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSecurityPending}
              className="bg-indigo-650 hover:bg-indigo-550 text-white font-medium text-xs py-2 px-4 rounded-lg flex items-center gap-1.5"
            >
              {isSecurityPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Atualizar Segurança
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Danger Zone Panel */}
      <div className="border border-red-950/20 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="space-y-1 pb-4 border-b border-red-950/20">
          <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            Zona de Perigo
          </h3>
          <p className="text-xs text-slate-550">
            Ações irreversíveis de exclusão e redefinição da plataforma.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-950/10 border border-red-900/10 rounded-xl">
          <div className="space-y-1 max-w-lg">
            <h4 className="text-xs font-bold text-white">Resetar Meu Dashboard</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Apaga permanentemente todas as suas ofertas de mercado cadastradas, estatísticas diárias e histórico do AdTracker. Esta ação não poderá ser desfeita.
            </p>
          </div>
          
          <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
            <DialogTrigger className="bg-red-600 hover:bg-red-550 text-white font-medium text-xs shrink-0 px-4 py-2 rounded-lg cursor-pointer transition-colors">
              Zerar Dashboard
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Zerar Dashboard Completamente?
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Esta ação excluirá permanentemente todas as ofertas do banco de dados para o usuário logado. Digite sua senha atual para confirmar a operação.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleResetDashboard} className="space-y-4 pt-2">
                {resetError && (
                  <div className="p-2.5 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-400">
                    {resetError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPasswordInput" className="text-slate-350 text-xs">Senha de Confirmação</Label>
                  <div className="relative">
                    <Input
                      id="confirmPasswordInput"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                      className="bg-slate-955 border-slate-800 focus:border-red-500 focus:ring-0 text-xs text-white pr-10"
                      disabled={isResetPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <DialogFooter className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsResetOpen(false)
                      setConfirmPassword('')
                      setResetError(null)
                    }}
                    className="border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-300"
                    disabled={isResetPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isResetPending}
                    className="bg-red-600 hover:bg-red-500 text-white font-medium flex items-center gap-1.5"
                  >
                    {isResetPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirmar Reset
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
