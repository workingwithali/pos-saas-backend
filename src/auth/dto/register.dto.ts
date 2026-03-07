import { IsEmail, IsString, MinLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  shopName: string;

  @ApiProperty()
  @IsString()
  OwnerName: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsNumber()
  taxRate: number;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}