import { Module } from "@nestjs/common";
import { InternalPlannerController } from "./internal/internal.controller";
import { InternalPlannerService } from "./internal/internal.service";

@Module({
    controllers: [InternalPlannerController],
    providers: [InternalPlannerService]
})
export class PlannerModule { }