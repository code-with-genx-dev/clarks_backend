import { IsBoolean, IsString } from "class-validator";


export class CreateUserDto {
        id:number
        user_name:string
        user_email:string
        mobile_number:string
        password:string
        user_temp_password: string;
        verification_code: number;
        is_verified: boolean;
        is_admin: boolean;
}
export class logInDto {
        email:string
        password:string
}
