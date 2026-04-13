import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  DefaultValuePipe,
  Body,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminOrderListDto } from "./dto/admin-order-list.dto";
import { AdminOrderDetailDto } from "./dto/admin-order-detail.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AdminJwtAuthGuard } from "../auth/guards/admin-jwt-auth.guard";
import { OrderStatus } from "../orders/entities/order.entity";

@ApiTags("admin/orders")
@ApiBearerAuth()
@Controller("admin/orders")
@UseGuards(AdminJwtAuthGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @ApiOkResponse({ type: AdminOrderListDto })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"],
  })
  async findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query("status") status?: OrderStatus,
  ): Promise<AdminOrderListDto> {
    return this.adminOrdersService.findAll(page, limit, status);
  }

  @Get(":id")
  @ApiOkResponse({ type: AdminOrderDetailDto })
  async findById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<AdminOrderDetailDto> {
    return this.adminOrdersService.findById(id);
  }

  @Patch(":id/status")
  @HttpCode(204)
  @ApiNoContentResponse({ description: "ステータス更新成功" })
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<void> {
    return this.adminOrdersService.updateStatus(id, dto.status);
  }

  @Post(":id/cancel")
  @HttpCode(204)
  @ApiNoContentResponse({ description: "キャンセル・返金成功" })
  async cancelOrder(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<void> {
    return this.adminOrdersService.cancelOrder(id);
  }
}
