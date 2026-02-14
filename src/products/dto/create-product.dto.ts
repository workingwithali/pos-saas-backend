import { IsInt, IsNumber, IsString } from "class-validator";

export class CreateProductDto {
  @IsString() 
  name: string;

  @IsString() 
  sku: string;

  @IsNumber() 
  price: number;

  @IsInt() 
  stock: number;

  @IsInt() 
  lowStockThreshold: number;

  @IsString() 
  categoryId: string;
}
