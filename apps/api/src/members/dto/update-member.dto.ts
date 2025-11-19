import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { AccountState, MemberCondition } from 'generated/prisma/enums';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsOptional()
  @IsEnum(AccountState)
  accountState?: AccountState;

  @IsOptional()
  @IsArray()
  @IsEnum(MemberCondition, { each: true })
  conditions?: MemberCondition[];
}
