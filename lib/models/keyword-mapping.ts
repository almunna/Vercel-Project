import type { ObjectId } from "mongodb"

export interface KeywordMapping {
  _id?: ObjectId
  keyword: string
  status: "deductible" | "non-deductible"
  atoCategory: string | null
  confidenceLevel: number // 0-100
  createdAt: Date
  updatedAt: Date
  usageCount: number
}

export interface KeywordMappingCreate {
  keyword: string
  status: "deductible" | "non-deductible"
  atoCategory: string | null
  confidenceLevel: number
}
