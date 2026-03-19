import { normaliseList } from "@/lib/catalog-utils"
import type { ProductPayload } from "@/types/catalog"

export class ProductValidationError extends Error {}

export const parseProductPayload = async (request: Request): Promise<ProductPayload> => {
  const body = await request.json()
  const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : ""
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const description = typeof body.description === "string" ? body.description.trim() : ""
  const image = typeof body.image === "string" ? body.image.trim() : ""
  const rawPrice = body.price
  const price =
    rawPrice === null || rawPrice === undefined || rawPrice === ""
      ? null
      : typeof rawPrice === "number"
        ? rawPrice
        : Number(rawPrice)

  if (!categoryId || !name || !description) {
    throw new ProductValidationError("Category, name, and description are required")
  }

  return {
    categoryId,
    name,
    description,
    image,
    price: price !== null && Number.isFinite(price) ? price : null,
    specs: normaliseList(body.specs ?? ""),
    highlights: normaliseList(body.highlights ?? ""),
  }
}
