'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { login, signup, resetPassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Loader2, BarChart2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email({ message: 'Insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
})

const signupSchema = z.object({
  email: z.string().email({ message: 'Insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  confirmPassword: z.string().min(6, { message: 'A confirmação de senha é obrigatória.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
})

const recoverySchema = z.object({
  email: z.string().email({ message: 'Insira um e-mail válido.' }),
})

type LoginInput = z.infer<typeof loginSchema>
type SignupInput = z.infer<typeof signupSchema>
type RecoveryInput = z.infer<typeof recoverySchema>

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'recovery'>('login')
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const {
    register: recoveryRegister,
    handleSubmit: handleRecoverySubmit,
    formState: { errors: recoveryErrors },
    reset: resetRecoveryForm,
  } = useForm<RecoveryInput>({
    resolver: zodResolver(recoverySchema),
  })

  const clearMessages = () => {
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  const switchMode = (newMode: 'login' | 'signup' | 'recovery') => {
    clearMessages()
    setMode(newMode)
    resetLoginForm()
    resetSignupForm()
    resetRecoveryForm()
  }

  const onLogin = (data: LoginInput) => {
    clearMessages()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      const res = await login(formData)
      if (res?.error) {
        setErrorMsg(res.error)
      }
    })
  }

  const onSignup = (data: SignupInput) => {
    clearMessages()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      const res = await signup(formData)
      if (res?.error) {
        setErrorMsg(res.error)
      } else if (res?.success) {
        setSuccessMsg(res.success)
        switchMode('login')
      }
    })
  }

  const onRecovery = (data: RecoveryInput) => {
    clearMessages()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      const res = await resetPassword(formData)
      if (res?.error) {
        setErrorMsg(res.error)
      } else if (res?.success) {
        setSuccessMsg(res.success)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans text-slate-100">
      <div className="w-full max-w-md space-y-6">
        
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">AdTracker</h1>
          </div>
          <p className="text-sm text-slate-400">
            Encontre sinais. Monitore ofertas. Identifique escala.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl shadow-black/40">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              {mode === 'login' && 'Entrar na sua conta'}
              {mode === 'signup' && 'Criar uma nova conta'}
              {mode === 'recovery' && 'Recuperar senha'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {mode === 'login' && 'Insira seus dados abaixo para acessar a plataforma.'}
              {mode === 'signup' && 'Preencha os campos para registrar seu acesso.'}
              {mode === 'recovery' && 'Insira seu e-mail para receber as instruções.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-950/80 border border-red-800 rounded-lg text-red-200 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-200 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Mode Forms */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-600"
                    {...loginRegister('email')}
                  />
                  {loginErrors.email && (
                    <p className="text-xs text-red-400 font-medium">{loginErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-slate-300">Senha</Label>
                    <button
                      type="button"
                      onClick={() => switchMode('recovery')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-600"
                    {...loginRegister('password')}
                  />
                  {loginErrors.password && (
                    <p className="text-xs text-red-400 font-medium">{loginErrors.password.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Entrar
                </Button>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-300">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-600"
                    {...signupRegister('email')}
                  />
                  {signupErrors.email && (
                    <p className="text-xs text-red-400 font-medium">{signupErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-300">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-600"
                    {...signupRegister('password')}
                  />
                  {signupErrors.password && (
                    <p className="text-xs text-red-400 font-medium">{signupErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirmPassword" className="text-slate-300">Confirmar Senha</Label>
                  <Input
                    id="signup-confirmPassword"
                    type="password"
                    placeholder="Confirme a senha cadastrada"
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-600"
                    {...signupRegister('confirmPassword')}
                  />
                  {signupErrors.confirmPassword && (
                    <p className="text-xs text-red-400 font-medium">{signupErrors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Criar Conta
                </Button>
              </form>
            )}

            {mode === 'recovery' && (
              <form onSubmit={handleRecoverySubmit(onRecovery)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="text-slate-300">E-mail</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-600"
                    {...recoveryRegister('email')}
                  />
                  {recoveryErrors.email && (
                    <p className="text-xs text-red-400 font-medium">{recoveryErrors.email.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Enviar Link de Recuperação
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-slate-800/60 pt-4">
            {mode === 'login' && (
              <div className="text-sm text-slate-400">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Criar conta
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="text-sm text-slate-400">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Entrar
                </button>
              </div>
            )}

            {mode === 'recovery' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Voltar para o Login
              </button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
