import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { UpdateTnvedDto } from './dto/update-tnved.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { GetProductsDto } from './dto/get-products.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ApiKeyGuard)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  async updateProduct(@Body() dto: CreateProductDto) {
    return this.productService.updateProduct(dto);
  }

  @Get('existing-ids/:clientId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  async getExistingProductIds(@Param('clientId') clientId: number) {
    return this.productService.getExistingProductIds(clientId);
  }

  @Post('add-tnved')
  @UseGuards(ApiKeyGuard)
  async addTnved(@Body() dto: UpdateTnvedDto) {
    return this.productService.updateTnved(dto);
  }

  @Post('update-tnved')
  @UseGuards(JwtAuthGuard)
  async updateTnved(@Body() dto: UpdateTnvedDto) {
    return this.productService.updateTnved(dto);
  }

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  async getProducts(@Query() dto: GetProductsDto) {
    return this.productService.getProducts(dto);
  }
}
