import { PrismaService } from "@app/db";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreatePlannerDto } from "./internal.dto";
import { Context, getUserFromContext } from "@app/common";

@Injectable()
export class InternalPlannerService {
    constructor(private readonly db: PrismaService) { }

    async createPlanner(args: CreatePlannerDto, ctx: Context) {
        const user = getUserFromContext(ctx)

        if (!user) {
            throw new UnauthorizedException("Unauthorized")
        }

        const response = await fetch('http://localhost:8000/ai/planning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: args.question }),
            signal: AbortSignal.timeout(180000)
        })

        if (!response.ok) {
            throw new Error('Failed to get response from AI planning service')
        }

        const aiData = await response.json()

        const planner = await this.db.tripHistory.create({
            data: {
                userId: user.id,
                question: args.question,
                budget: aiData.budget,
                city: aiData.city,
                travelDates: aiData.travel_dates,
                preferences: aiData.preferences,
                planResult: aiData.plan,
            }
        })

        return planner
    }
}