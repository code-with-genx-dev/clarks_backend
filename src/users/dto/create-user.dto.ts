import { IsBoolean, IsString } from "class-validator";


export class CreateUserDto {
      
        @IsString()
        user_name:string
        @IsString()
        user_email:string
        @IsString()
        mobile_number:string
        @IsString()
        password:string
        @IsString()
        user_temp_password: string;
        @IsString()
        verification_code: number;
        @IsBoolean()
        is_verified: boolean;
        @IsBoolean()
        is_admin: boolean;
}
export class logInDto {
        @IsString()
        email:string
        @IsString()
        password:string
}
