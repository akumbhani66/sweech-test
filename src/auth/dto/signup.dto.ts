import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(12, 20)
  @Matches(/^(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*[0-9])/, {
    message:
      'Password must contain lowercase letters, special characters, and numbers',
  })
  password: string;

  @IsString()
  @Length(1, 10)
  @Matches(/^[가-힣]+$/, {
    message: 'Username must be in Korean',
  })
  username: string;
}
