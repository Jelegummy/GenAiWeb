import { getSession } from "next-auth/react";
import { CreatePlannerArgs, Planner } from "./types";
import { ENDPOINT, fetchers, HttpStatus } from "@/utils";

export const createPlanner = async (args: CreatePlannerArgs) => {
    const session = await getSession()

    const res = await fetchers.Post<{ accessToken: string }>(
        `${ENDPOINT}/planner/internal/create`,
        {
            data: args,
            token: session?.user.accessToken
        })
    if (res.statusCode >= HttpStatus.BAD_REQUEST) {
        throw new Error(res.message)
    }

    return res.data as { accessToken: string }
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