import { Injectable } from '@nestjs/common';
import { CreateUserDto, logInDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from 'src/common/common_interface';
import { errorResponse, responseMessageGenerator } from 'src/common/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserRepository } from './entities/user.entity';
import * as bcrypt  from "bcrypt"
import { JwtService } from '@nestjs/jwt';
 

@Injectable()
export class UsersService {

   constructor(
    @InjectModel(UserRepository) private  UserModel :typeof UserRepository,
    private readonly jwtService :JwtService
   ){}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  
   async signUp(userData:CreateUserDto):Promise<ApiResponse>{
    try{

        let usersDetails :any = await this.UserModel.findOne({where:{user_email:userData.user_email}})
      
        if(usersDetails){
            return responseMessageGenerator("failure","Email already exists",[])
        }
        if(usersDetails?.mobile_number ==userData.mobile_number){
            return responseMessageGenerator("failure","Mobile number already exists",[])
        }
        //hash the password for security reason

        let salt = await bcrypt.genSalt(10)
        let hashpassword = await bcrypt.hash(userData.password,salt);
         userData.password =hashpassword
        // create userdata 
         let createdData = await this.UserModel.create(userData);
        let token = await this.generateAccessToken({id:createdData.id,user_name:createdData.user_name,user_email:createdData.user_email})

     return await responseMessageGenerator("success","Signup successful. You can now log in.",token)
    }catch(error){
         console.log(error);
         return errorResponse(error.message)
    }
   }

   async signIn(logInData:logInDto):Promise<any>{
    try{

      let {email,password} =logInData

       let userData = await this.UserModel.findOne({where:{user_email:email}})
       if(userData == null){
          return responseMessageGenerator('failure',"Warning! The provided Email is incorrect. Please check and try again.",[])
       }

       let isPasswordMatch = await bcrypt.comapre(password,userData.password)
       if(!isPasswordMatch){
         return responseMessageGenerator('failure',"Warning! The provided password is incorrect. Please check and try again.",[])
       }

        let payload ={id:userData.id,user_name:userData.user_name,user_email:userData.user_email,is_admin:userData.is_admin}
        let token = await this.generateAccessToken(payload)
          payload = {user:payload,...token}
         return responseMessageGenerator('success',"Login successful",payload)

    }catch(error){
      return errorResponse(error.message)
    }

   }

   async signUpDuplicateValidation(email:string,mobile_number:string,type:"email"|"mobile"):Promise<any>{
     try{
       let whereCondition ={}
       
      type =="email" ? whereCondition['user_email'] =email :whereCondition['mobile_number'] =mobile_number 
      let usersDetails = await this.UserModel.findOne({where:whereCondition})
      let message ="no data found";
      let data =0;
      
      usersDetails && type =="email" && (message ="Email already exists",data=1) 
      usersDetails && type =="mobile" && (message ="Mobile number already exists",data=1) 
       
      return await responseMessageGenerator(data ==1 ?"failure":"success",message,data)

     }catch(error){
      console.log(error);
      return errorResponse(error.message)

     }

   }

    async generateAccessToken(payload:any):Promise<any>{
      try{

         let accessToken = await this.jwtService.sign(payload,{
           secret:process.env.JWT_SECRET,
           expiresIn:process.env.JWT_EXPIRES_IN
         })
        let refreshToken = await this.jwtService.sign(payload,{
           secret:process.env.JWT_REFRESH_SECRET,
           expiresIn:process.env.JWT_REFRESH_EXPIRES_IN
         })

         return { "accessToken":accessToken, "refreshToken":refreshToken }

      }catch(error){
          console.log(error);
          return errorResponse(error.message)
      }

    }
}
