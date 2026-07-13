import * as z from 'zod'

const validateUrl = (val: string | undefined | null) => {
  if (!val || val.trim() === '') return true
  try {
    new URL(val)
    return true
  } catch {
    return false
  }
}

export const offerFormSchema = z.object({
  title: z.string().min(1, 'O título da oferta é obrigatório.'),
  product_name: z.string().optional(),
  niche: z.string().optional(),
  advertiser_name: z.string().optional(),
  page_name: z.string().optional(),
  ad_library_url: z.string()
    .min(1, 'O link da Meta Ad Library é obrigatório.')
    .refine(validateUrl, { message: 'Insira uma URL válida (ex: https://facebook.com/...)' }),
  sales_page_url: z.string()
    .optional()
    .refine(validateUrl, { message: 'Insira uma URL válida (ex: https://...)' }),
  current_ads_count: z.number()
    .int('Deve ser um número inteiro.')
    .min(0, 'A quantidade de anúncios não pode ser negativa.'),
  oldest_ad_date: z.string().optional(),
  country: z.string().optional(),
  platform: z.string().optional(),
  creative_type: z.string().optional(),
  status: z.enum(['discovery', 'watching', 'growing', 'stable', 'scaling', 'declining', 'ended', 'archived']),
  notes: z.string().optional(),
})

export type OfferFormValues = z.infer<typeof offerFormSchema>
