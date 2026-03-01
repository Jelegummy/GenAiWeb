import { Body, Controller, Get, HttpStatus, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InternalPlannerService } from "./internal.service";
import { CreatePlannerDto } from "./internal.dto";
import { Context } from "@app/common";

@ApiTags("planner")
@Controller('planner/internal')
export class InternalPlannerController {
    constructor(private readonly service: InternalPlannerService) { }

    @Post('/create')
    async createPlanner(@Body() args: CreatePlannerDto, @Req() ctx: Context) {
        const res = await this.service.createPlanner(args, ctx)

        return { statusCode: HttpStatus.OK, data: res }
    }

    @Get('/history')
    async getHistory(@Req() ctx: Context) {
        const res = await this.service.getHistory(ctx)

        return { statusCode: HttpStatus.OK, data: res }
    }

    @Get('/history/:id')
    async getHistoryById(@Req() ctx: Context, @Param('id') id: string) {
        const res = await this.service.getHistoryById(ctx, id)

        return { statusCode: HttpStatus.OK, data: res }
    }
}