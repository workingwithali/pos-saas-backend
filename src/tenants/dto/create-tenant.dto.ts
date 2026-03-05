import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTenantDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false, default: 'USD' })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({ required: false, default: 0 })
    @IsNumber()
    @IsOptional()
    taxRate?: number;
}
