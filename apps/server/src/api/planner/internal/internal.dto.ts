import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class CreatePlannerDto extends createZodDto(
    z.object({
        tripId: z.string().optional(),
        question: z.string(),
        travelDate: z.string().optional(),
        preferences: z.string().optional(),
        budget: z.number().optional(),
        city: z.string().optional(),
    })
) { }