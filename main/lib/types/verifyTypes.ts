import z from "zod";

export const verifySchema = z.object({
    _id: z.string().optional(),
    email: z.email(),
    hash: z.string(),
    code: z.number(),
    expiresAt: z.date().default(new Date(Date.now() + 1000 * 60 * 60 * 24)).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    __v: z.number().optional(),
});

export type Verify = z.infer<typeof verifySchema>;