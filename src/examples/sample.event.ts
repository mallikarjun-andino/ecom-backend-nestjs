import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class SampleEvent {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsISO8601()
  at!: string;
}
