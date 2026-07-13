'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Credenciais incorretas. Verifique seu e-mail e senha.'
  }
  if (message.includes('User already registered') || message.includes('already exists')) {
    return 'Este e-mail já está cadastrado.'
  }
  if (message.includes('Password should be at least')) {
    return 'A senha deve conter no mínimo 6 caracteres.'
  }
  if (message.includes('Email not confirmed')) {
    return 'E-mail não confirmado. Verifique sua caixa de entrada.'
  }
  return message
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: mapAuthError(error.message) }
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
    }
  })

  if (error) {
    return { error: mapAuthError(error.message) }
  }

  return { success: 'Conta criada! Faça login agora.' }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'O e-mail é obrigatório.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
  })

  if (error) {
    return { error: mapAuthError(error.message) }
  }

  return { success: 'E-mail de recuperação enviado!' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
