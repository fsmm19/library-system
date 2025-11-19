import { OmitType } from '@nestjs/mapped-types';
import { CreateMemberDto } from 'src/members/dto/create-member.dto';

export class RegisterMemberDto extends OmitType(CreateMemberDto, [] as const) {}
