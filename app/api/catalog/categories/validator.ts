import type { CategoryPayload } from "@/types/catalog"

export class CategoryValidationError extends Error {}

export const parseCategoryPayload = async (request: Request): Promise<CategoryPayload> => {
  const body = await request.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const heroLine = typeof body.heroLine === "string" ? body.heroLine.trim() : ""
  const description = typeof body.description === "string" ? body.description.trim() : ""
  const image = typeof body.image === "string" ? body.image.trim() : ""

  if (!name || !heroLine || !description) {
    throw new CategoryValidationError("Name, hero line, and description are required")
  }

  return { name, heroLine, description, image }
}
