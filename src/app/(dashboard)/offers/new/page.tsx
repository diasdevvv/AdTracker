'use client'

import { useState, useTransition } from 'react'
import { createOffer } from '../actions'
import { OfferForm } from '@/components/offer-form'
import { OfferFormValues } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewOfferPage() {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (data: OfferFormValues) => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await createOffer(data)
      if (res?.error) {
        setErrorMsg(res.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-350 hover:text-white hover:bg-slate-800/80">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white animate-fade-in">Adicionar Nova Oferta</h1>
          <p className="text-sm text-slate-400">
            Cadastre uma nova oferta encontrada para iniciar o monitoramento.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-950/80 border border-red-800 rounded-lg text-red-205 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="border border-slate-900 bg-slate-900/40 rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-lg">
        <OfferForm onSubmit={handleSubmit} isPending={isPending} />
      </div>
    </div>
  )
}
