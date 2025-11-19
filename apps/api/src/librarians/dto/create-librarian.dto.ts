import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateLibrarianDto extends CreateUserDto {
  @Transform(({ value }) => new Date(value))
  @IsDate()
  hireDate: Date;
}
