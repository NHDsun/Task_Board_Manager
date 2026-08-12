import { IsOptional, IsString } from 'class-validator';

export type UserStatusSignalType = 'ONLINE' | 'BUSY' | 'IN_MEETING' | 'AWAY' | 'OFFLINE';

export class UpdateStatusSignalDto {
  @IsOptional()
  @IsString()
  statusSignal?: UserStatusSignalType;

  @IsOptional()
  @IsString()
  customStatus?: string;
}
