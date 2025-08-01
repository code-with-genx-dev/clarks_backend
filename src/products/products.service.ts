import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { errorResponse, responseMessageGenerator } from 'src/common/common';
import { writeFileSync } from 'fs';
import { InjectModel } from '@nestjs/sequelize';
import { UserRepository } from 'src/users/entities/user.entity';
import { ProductRepository } from './entities/product.entity';
import path, { join } from 'path';
import * as fs from 'fs';
import { statusType } from './enum/product.enum';
import * as moment from "moment";
import { Op } from 'sequelize';

@Injectable()
export class ProductsService {

    
  constructor(
    @InjectModel(UserRepository) private userModel :typeof UserRepository,
    @InjectModel(ProductRepository) private ProductModel :typeof ProductRepository,
  ){}
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

   private readonly uploadPath = 'public/uploads';


   async saveProduct(current_user_id:number,productData:CreateProductDto):Promise<any>{
    try{

       let productDetails:any = await this.ProductModel.findOne({ where: { leather_name:productData.leather_name, leather_category:productData.leather_category} })
       
       let leatherImage =await this.uploadUserDetails(productDetails?.id,productData.leather_image, productData.leather_name,"leather")
       let shoeImage =await this.uploadUserDetails(productDetails?.id,productData.shoe_image, productData.leather_name,"shoe")

       productData.leather_image  = leatherImage?.data
       productData.shoe_image  = shoeImage?.data
       productData.uploaded_by  = current_user_id
       productData.uploaded_date  = new Date()
       productData.status  = statusType.Pending

      let updateProductData = await this.ProductModel.upsert({
              id:productDetails?.id,
              ...productData})
       return responseMessageGenerator('success', "data  saved successfully",[])
    }catch(error){
      return errorResponse(error.message)
    }
   }
   async approveRejectProductData(current_user_id:number,record_id:number,status:string,approved_comments:string):Promise<any>{
    try{

      let payload ={
        status:status,
        approved_comments:approved_comments,
        approved_user_id:current_user_id,
        approved_date:new Date()
      }
       let productDetails:any = await this.ProductModel.findOne({ where: {id:record_id} })

       if(productDetails == null){
             return responseMessageGenerator('failure',"record not found",[])
       }
       //update product
       await this.ProductModel.update(payload,{where:{id:productDetails?.id}})
       
       return responseMessageGenerator('success', `product ${status} successfully`,[])
    }catch(error){
      return errorResponse(error.message)
    }
   }

   async getProductApprovalData(user_id:number,selected:Date,status:string,filter:{status:string[]}):Promise<any>{
    try{

      let whereCondition ={}
  
       let startOfMonth  = moment(selected).startOf('month').format('YYYY-MM-DD HH:mm:ss')
       let endOfMonth = moment(selected).endOf('month').format('YYYY-MM-DD HH:mm:ss')
       let productDetails:any = await this.ProductModel.findOne({ where: {
            createdAt:{[Op.between]:[startOfMonth,endOfMonth]},
            ...(filter.status.length > 0 &&  {status:filter.status} )
          },
          include:[
            {association:"user",attributes:['user_name']}
          ]
    })

       let responseData = productDetails.map(singleData =>({
           uploaded_date: moment(singleData.uploaded_date).format('DD-MMM-YYYY,ddd'),
           uploaded_by: singleData.users.user_name,
           upload_category:singleData.leather_category,
           upload_sub_category:singleData.leather_category,
           upload_file_name:singleData.leather_category,
           upload_status:singleData.status
       }))
       
      return responseMessageGenerator('success', "data  saved successfully",responseData)
    }catch(error){
      return errorResponse(error.message)
    }
   }
   async uploadUserDetails(product_id: string, base64Image: string, product_name: string,type:string): Promise<any> {
        try {
            // Extract base64 data
            const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!matches) return responseMessageGenerator('failure', "Invalid image format", null)

            let productData :any = await this.ProductModel.findOne({ where: { id: product_id } })
            let imagePath =productData.shoe_image
            type =="leather" && (imagePath  =productData.leather_image)

            if (productData && productData.shoe_image) {
                const oldImagePath = path.join(__dirname, '..', '..', productData.shoe_image);

                // Delete old signature file if it exists
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            let saveSignature = await this.saveSignature(product_id, base64Image,type)
            if (saveSignature.status == 'failure') {
                return saveSignature
            }
           
            return responseMessageGenerator('success', "image saved successfully", saveSignature.data)
        } catch (error) {
            console.log(error);
            return errorResponse(error.message)
        }
    }
    async saveSignature(productId: string, base64Image: string,type:string): Promise<any> {
        try {
            // Extract base64 data
            const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!matches) throw new Error('Invalid image format');

            const extension = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');

            let productData:any = await this.userModel.findOne({ where: { id: productId } })
            // Define file path
            const fileName = `${(productData.leather_name).toLowerCase()}_${productId}_image.${extension}`;
            let path = type =="shoe" ? this.uploadPath+"/shoe" : this.uploadPath+"/leather"
            const filePath = join(path, fileName);

            // Save image
            writeFileSync(filePath, buffer);

            return responseMessageGenerator('success', "image saved successfully", filePath)
        } catch (error) {
            console.log(error);
            return responseMessageGenerator('failure', error.message, null)
        }
    }
}
