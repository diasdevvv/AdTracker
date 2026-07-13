import fs from 'fs'
import path from 'path'

const MOCK_FILE_PATH = path.join(process.cwd(), 'src/lib/mock-db.json')

export interface MockOffer {
  id: string
  user_id: string
  title: string
  product_name: string | null
  niche: string | null
  advertiser_name: string | null
  page_name: string | null
  ad_library_url: string
  sales_page_url: string | null
  current_ads_count: number
  oldest_ad_date: string | null
  country: string | null
  platform: string | null
  creative_type: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  ads_history?: Record<string, number>
  is_favorite?: boolean
}

function initMockFile() {
  if (!fs.existsSync(MOCK_FILE_PATH)) {
    fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify([], null, 2))
  }
}

export function getMockOffers(): MockOffer[] {
  initMockFile()
  try {
    const data = fs.readFileSync(MOCK_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function saveMockOffers(offers: MockOffer[]) {
  initMockFile()
  fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify(offers, null, 2))
}
