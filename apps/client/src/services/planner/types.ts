export type CreatePlannerArgs = {
    tripId?: string
    question: string
    travelDate?: string
    preferences?: string
    budget?: number
    city?: string
}

export type Planner = {
    id: string
    question: string
    title: string | null
    budget: number | null
    city: string | null
    travelDates: string | null
    preferences: string | null
    planResult: string | null
    createdAt: string
}

export type CreatePlannerResponse = {
    id: string
    question: string
    title: string | null
    city: string
    travelDates: string
    preferences: string
    planResult: string
    createdAt: string
}