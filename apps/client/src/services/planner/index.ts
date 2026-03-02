import { getSession } from "next-auth/react";
import { CreatePlannerArgs, CreatePlannerResponse, Planner } from "./types";
import { ENDPOINT, fetchers, HttpStatus } from "@/utils";

export const createPlanner = async (args: CreatePlannerArgs) => {
    const session = await getSession()

    const res = await fetchers.Post<CreatePlannerResponse>(
        `${ENDPOINT}/planner/internal/create`,
        {
            data: args,
            token: session?.user.accessToken
        })
    if (res.statusCode >= HttpStatus.BAD_REQUEST) {
        throw new Error(res.message)
    }

    return res.data
}

export const getHistory = async () => {
    const session = await getSession()

    const res = await fetchers.Get<Planner[]>(`${ENDPOINT}/planner/internal/history`, {
        token: session?.user.accessToken
    })
    if (res.statusCode >= HttpStatus.BAD_REQUEST) {
        throw new Error(res.message)
    }

    return res.data
}

export const getHistoryById = async (id: string) => {
    const session = await getSession()

    const res = await fetchers.Get<Planner>(`${ENDPOINT}/planner/internal/history/${id}`, {
        token: session?.user.accessToken
    })
    if (res.statusCode >= HttpStatus.BAD_REQUEST) {
        throw new Error(res.message)
    }

    return res.data
}