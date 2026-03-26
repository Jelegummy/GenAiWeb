import { PrismaService } from "@app/db";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
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

        let chatHistory: any[] = []
        const currentTripId = args.tripId

        if (currentTripId) {
            const history = await this.db.tripHistory.findUnique({
                where: { id: currentTripId, userId: user.id }
            })

            if (!history) {
                throw new NotFoundException("Trip history not found")
            }

            chatHistory = (history.messages as any) || []
        }

        chatHistory.push({ role: 'user', content: args.question });

        const response = await fetch('http://localhost:8000/ai/planning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory }),
            signal: AbortSignal.timeout(180000)
        })

        if (!response.ok) {
            throw new Error('Failed to get response from AI planning service')
        }

        const aiData = await response.json()

        chatHistory.push({ role: 'ai', content: aiData.plan });

        let planner;

        if (currentTripId) {
            planner = await this.db.tripHistory.update({
                where: { id: currentTripId },
                data: {
                    budget: aiData.budget || null,
                    city: aiData.city || "",
                    travelDates: aiData.travel_dates || "",
                    preferences: aiData.preferences || "",
                    planResult: aiData.plan,
                    messages: chatHistory
                }
            });
        } else {
            planner = await this.db.tripHistory.create({
                data: {
                    userId: user.id,
                    question: args.question,
                    budget: aiData.budget || null,
                    city: aiData.city || "",
                    travelDates: aiData.travel_dates || "",
                    preferences: aiData.preferences || "",
                    planResult: aiData.plan,
                    messages: chatHistory
                }
            });
        }

        return planner
    }

    async getHistory(ctx: Context) {
        const user = getUserFromContext(ctx)

        if (!user) {
            throw new UnauthorizedException("Unauthorized")
        }

        const history = await this.db.tripHistory.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })

        return history
    }

    async getHistoryById(ctx: Context, id: string) {
        const user = getUserFromContext(ctx)

        if (!user) {
            throw new UnauthorizedException("Unauthorized")
        }

        const history = await this.db.tripHistory.findFirst({
            where: { id, userId: user.id }
        })

        return history
    }

    async deleteHistory(ctx: Context, id: string) {
        const user = getUserFromContext(ctx)

        if (!user) {
            throw new UnauthorizedException("Unauthorized")
        }

        await this.db.tripHistory.deleteMany({
            where: { id, userId: user.id }
        })

        return { success: true }
    }
}