import { JwtService } from "@nestjs/jwt"

export  const responseMessageGenerator = (status:string,message:string,data:any)=>{
    return {status:status,message:message,data:data == null ? []:data}
} 

export const errorResponse =(data:any)=>{
     return {status:"failure",message:"something went wrong",data:data == null ? []:data}
}


export const decodeAccessToken = async (headers: any): Promise<any> => {
    const jwtService = new JwtService()
    const authToken = headers && headers.split(' ')[1]; // Assuming 'Bearer <token>'
    return await jwtService.decode(authToken)
}

