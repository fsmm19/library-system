import { OmitType } from '@nestjs/mapped-types';
import { CreateLibrarianDto } from 'src/librarians/dto/create-librarian.dto';

export class RegisterLibrarianDto extends OmitType(
  CreateLibrarianDto,
  [] as const,
) {}
