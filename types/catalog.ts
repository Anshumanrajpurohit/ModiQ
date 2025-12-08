export type CategoryRow = {
  id: string
  name: string
  hero_line: string
  description: string | null
  image_url: string | null
  created_at: string | null
  updated_at: string | null
}

export type ProductRow = {
  id: string
  category_id: string
  name: string
  description: string | null
  image_url: string | null
  rate: string | null
  specs: string[] | null
  highlights: string[] | null
  created_at: string | null
  updated_at: string | null
}

export type CatalogCategory = {
  id: string
  name: string
  heroLine: string
  description: string
  image: string
  createdAt?: string | null
}

export type CatalogProduct = {
  id: string
  categoryId: string
  name: string
  description: string
  image: string
  price: number | null
  specs: string[]
  highlights: string[]
  createdAt?: string | null
}

export type CategoryPayload = Omit<CatalogCategory, "id" | "createdAt">

export type ProductPayload = {
  categoryId: string
  name: string
  description: string
  image: string
  price: number | null
  specs: string[]
  highlights: string[]
}
