'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { statusMap } from './status-badge'
import { Loader2, Save } from 'lucide-react'
import { offerFormSchema, type OfferFormValues } from '@/lib/schemas'

interface OfferFormProps {
  initialData?: Partial<OfferFormValues>
  onSubmit: (data: OfferFormValues) => Promise<void>
  isPending: boolean
  submitButtonText?: string
}

export function OfferForm({
  initialData,
  onSubmit,
  isPending,
  submitButtonText = 'Salvar Oferta',
}: OfferFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      product_name: initialData?.product_name || '',
      niche: initialData?.niche || '',
      advertiser_name: initialData?.advertiser_name || '',
      page_name: initialData?.page_name || '',
      ad_library_url: initialData?.ad_library_url || '',
      sales_page_url: initialData?.sales_page_url || '',
      current_ads_count: initialData?.current_ads_count !== undefined ? initialData.current_ads_count : 0,
      oldest_ad_date: initialData?.oldest_ad_date || '',
      country: initialData?.country || '',
      platform: initialData?.platform || '',
      creative_type: initialData?.creative_type || '',
      status: initialData?.status || 'discovery',
      notes: initialData?.notes || '',
    },
  })

  const currentStatus = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Título da Oferta */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title" className="text-slate-300">
            Título da Oferta <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Ex: Oferta Nova de Emagrecimento - Meta Ads"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('title')}
          />
          {errors.title && <p className="text-xs text-red-400 font-medium">{errors.title.message}</p>}
        </div>

        {/* Link Meta Ad Library */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ad_library_url" className="text-slate-300">
            Link da Meta Ad Library <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ad_library_url"
            placeholder="https://www.facebook.com/ads/library/?id=..."
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('ad_library_url')}
          />
          {errors.ad_library_url && (
            <p className="text-xs text-red-400 font-medium">{errors.ad_library_url.message}</p>
          )}
        </div>

        {/* Link da Página de Vendas */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="sales_page_url" className="text-slate-300">Link da Página de Vendas</Label>
          <Input
            id="sales_page_url"
            placeholder="https://seusite.com/oferta"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('sales_page_url')}
          />
          {errors.sales_page_url && (
            <p className="text-xs text-red-400 font-medium">{errors.sales_page_url.message}</p>
          )}
        </div>

        {/* Quantidade atual de anúncios */}
        <div className="space-y-2">
          <Label htmlFor="current_ads_count" className="text-slate-300">
            Quantidade Atual de Anúncios <span className="text-red-500">*</span>
          </Label>
          <Input
            id="current_ads_count"
            type="number"
            min="0"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('current_ads_count', { valueAsNumber: true })}
          />
          {errors.current_ads_count && (
            <p className="text-xs text-red-400 font-medium">{errors.current_ads_count.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-slate-300">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={currentStatus}
            onValueChange={(val: any) => setValue('status', val, { shouldValidate: true })}
          >
            <SelectTrigger className="bg-slate-900 border-slate-800 text-white focus:ring-indigo-650">
              <SelectValue placeholder="Selecione o status">
                {statusMap[currentStatus as keyof typeof statusMap]?.label || currentStatus}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              {Object.entries(statusMap).map(([key, value]) => (
                <SelectItem key={key} value={key} className="focus:bg-slate-800 focus:text-white">
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && <p className="text-xs text-red-400 font-medium">{errors.status.message}</p>}
        </div>

        {/* Nome do Produto */}
        <div className="space-y-2">
          <Label htmlFor="product_name" className="text-slate-300">Nome do Produto</Label>
          <Input
            id="product_name"
            placeholder="Ex: SlimCaps"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('product_name')}
          />
        </div>

        {/* Nicho */}
        <div className="space-y-2">
          <Label htmlFor="niche" className="text-slate-300">Nicho</Label>
          <Input
            id="niche"
            placeholder="Ex: Saúde, Finanças, Relacionamento"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('niche')}
          />
        </div>

        {/* Nome do Anunciante */}
        <div className="space-y-2">
          <Label htmlFor="advertiser_name" className="text-slate-300">Nome do Anunciante</Label>
          <Input
            id="advertiser_name"
            placeholder="Ex: Empresa X LTDA"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('advertiser_name')}
          />
        </div>

        {/* Nome da página ou conta */}
        <div className="space-y-2">
          <Label htmlFor="page_name" className="text-slate-300">Nome da Página / Conta</Label>
          <Input
            id="page_name"
            placeholder="Ex: @slimcaps_oficial"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('page_name')}
          />
        </div>

        {/* País */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-slate-300">País</Label>
          <Input
            id="country"
            placeholder="Ex: Brasil, EUA"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('country')}
          />
        </div>

        {/* Plataforma */}
        <div className="space-y-2">
          <Label htmlFor="platform" className="text-slate-300">Plataforma</Label>
          <Input
            id="platform"
            placeholder="Ex: Hotmart, Kiwify"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('platform')}
          />
        </div>

        {/* Tipo de criativo */}
        <div className="space-y-2">
          <Label htmlFor="creative_type" className="text-slate-300">Tipo de Criativo</Label>
          <Input
            id="creative_type"
            placeholder="Ex: Imagem, Vídeo VSL, Carrossel"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650"
            {...register('creative_type')}
          />
        </div>

        {/* Data do anúncio mais antigo */}
        <div className="space-y-2">
          <Label htmlFor="oldest_ad_date" className="text-slate-300">Data do Anúncio Mais Antigo</Label>
          <Input
            id="oldest_ad_date"
            type="date"
            className="bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-650 dark:[color-scheme:dark]"
            {...register('oldest_ad_date')}
          />
        </div>

        {/* Observações */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes" className="text-slate-300">Observações</Label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Adicione anotações, estratégias encontradas, detalhes da oferta..."
            className="flex w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-650 focus-visible:ring-offset-0 focus-visible:border-slate-800"
            {...register('notes')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-indigo-650 hover:bg-indigo-550 text-white font-medium px-6"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {submitButtonText}
        </Button>
      </div>
    </form>
  )
}
