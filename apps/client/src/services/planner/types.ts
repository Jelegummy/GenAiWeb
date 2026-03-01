export type CreatePlannerArgs = {
    question: string
    travelDate?: string
    preferences?: string
    budget?: number
    city?: string
}

export type Planner = {
    id: string
    question: string
    budget: number | null
    city: string | null
    travelDates: string | null
    preferences: string | null
    planResult: string | null
    createdAt: string
}