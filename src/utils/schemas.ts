import { z } from "zod";

export const OptionalTextSchema = z.string().trim().min(1).optional();

export const PaginationSchema = {
  limit: z.number().int().min(1).max(50).default(10),
  offset: z.number().int().min(0).default(0)
};
