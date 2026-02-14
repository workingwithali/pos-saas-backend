import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  cost: number = 0;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number = 5;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
