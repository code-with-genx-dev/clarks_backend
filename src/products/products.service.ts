import { Injectable } from '@nestjs/common';
import { approveRejectProductDto, CreateProductDto } from './dto/create-product.dto';
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
    @InjectModel(UserRepository) private userModel: typeof UserRepository,
    @InjectModel(ProductRepository) private ProductModel: typeof ProductRepository,
  ) { }
  
  private readonly uploadPath = 'src/uploads';


  async saveProduct(current_user_id: number, productData: CreateProductDto): Promise<any> {
    try {
       let productDetails
      if(productData.sub_category =="non_leather"){
          productDetails = await this.ProductModel.findOne({ where: { leather_file_name: productData.leather_file_name, category: productData.category,sub_category:productData.sub_category } })
      }else{
         productDetails = await this.ProductModel.findOne({ where: { leather_name: productData.leather_name, leather_category: productData.leather_category ,sub_category:productData.sub_category } })
         
      }
       

      let leatherImage = await this.uploadUserDetails(productDetails?.id, productData.leather_image, productData.leather_name, "leather",productData)
    
      let fileType = await this.getFileType(productData.leather_image)
      // let shoeImage = await this.uploadUserDetails(productDetails?.id, productData.shoe_image, productData.leather_name, "shoe")
      
      productData.leather_image = leatherImage?.data
      // productData.shoe_image = shoeImage?.data
      productData.uploaded_by = current_user_id
      productData.file_type = fileType
      productData.uploaded_date = new Date()
      productData.status = statusType.Pending

      let updateProductData = await this.ProductModel.upsert({
        id: productDetails?.id,
        ...productData
      })
      return responseMessageGenerator('success', "data  saved successfully", [])
    } catch (error) {
      console.log(error);
      
      return errorResponse(error.message)
    }
  }

  async getProductDetails(sub_category:string): Promise<any> {
    try {

      let productDetails: any = await this.ProductModel.findAll({
        // where: { status: "Approved",sub_category:sub_category},
        where: { sub_category:sub_category},
        include: [
          { association: "users", attributes: ['user_name'] }
        ],raw:true
      })
      
      let responseData = await Promise.all(productDetails.map(async singleData => {
        return {
          uploaded_date: moment(singleData.uploaded_date).format('DD-MMM-YYYY,ddd'),
          uploaded_by: singleData['users.user_name'],
          upload_category: singleData.category,
          upload_sub_category: singleData.sub_category,
          upload_file_name: singleData.leather_file_name,
          upload_status: singleData.status,
          leather_image: (await this.getSignatureAsBase64(singleData.leather_image,singleData.file_type))?.data,
          show_image: (await this.getSignatureAsBase64(singleData.shoe_image,singleData.file_type)).data
        }}))

      return responseMessageGenerator('success', "data fetched successfully", responseData)
    } catch (error) {
      return errorResponse(error.message)
    }
  }
  async approveRejectProductData(approveRejectProduct:approveRejectProductDto): Promise<any> {
    try {

         let {current_user_id, record_id, status, approved_comments} = approveRejectProduct
      let payload = {
        status: status,
        approved_comments: approved_comments,
        approved_user_id: current_user_id,
        approved_date: new Date()
      }
      let productDetails: any = await this.ProductModel.findOne({ where: { id: record_id } })

      if (productDetails == null) {
        return responseMessageGenerator('failure', "record not found", [])
      }
      //update product
      await this.ProductModel.update(payload, { where: { id: productDetails?.id } })

      return responseMessageGenerator('success', `product ${status} successfully`, [])
    } catch (error) {
      return errorResponse(error.message)
    }
  }
  async getProductApprovalData(user_id: number, selected: Date, status: string, filter: { status: string[] }): Promise<any> {
    try {

      let startOfMonth = moment(selected).startOf('month').format('YYYY-MM-DD HH:mm:ss')
      let endOfMonth = moment(selected).endOf('month').format('YYYY-MM-DD HH:mm:ss')
      let productDetails: any = await this.ProductModel.findAll({
        where: {
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
          ...(filter?.status?.length == 0 && { status:"Pending" }),
          ...(filter?.status?.length > 0 && { status: filter?.status })
        },
        include: [
          { association: "users", attributes: ['user_name'] }
        ],raw:true
      })

      let responseData = productDetails.map(singleData => ({
        id:singleData?.id,
        uploaded_date: moment(singleData.uploaded_date).format('DD-MMM-YYYY,ddd'),
        uploaded_by: singleData['users.user_name'],
        upload_category: singleData.leather_category,
        upload_sub_category: singleData.sub_category,
        upload_file_name: singleData.leather_file_name,
        upload_status: singleData.status
      }))

      return responseMessageGenerator('success', "data  saved successfully", responseData)
    } catch (error) {
      return errorResponse(error.message)
    }
  }
  async getProductApprovalcardData( selected: Date): Promise<any> {
    try {

      let startOfMonth = moment(selected).startOf('month').format('YYYY-MM-DD HH:mm:ss')
      let endOfMonth = moment(selected).endOf('month').format('YYYY-MM-DD HH:mm:ss')

      let getProductData = async (startOfMonth,endOfMonth,status)=>{
         let productDetails: any = await this.ProductModel.findAndCountAll({
        where: {
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
          ...( status != "Uploads" && {status: status})
        },
        include: [
          { association: "users", attributes: ['user_name'] }
        ]
      })
       return productDetails.count
    }

      let statusArray = ["Uploads","Approved","Rejected","Pending"]
    
      let responseJson:any =[]

      for(let singleStatus  of statusArray){
        let Object = {}
         
          let statusCount = await getProductData(startOfMonth,endOfMonth,singleStatus)
           Object['tittle'] = "Total "+singleStatus;
           Object['count'] = statusCount;
           responseJson.push(Object);

      }

      return responseMessageGenerator('success', "data  saved successfully", responseJson)
    } catch (error) {
      return errorResponse(error.message)
    }
  }
  async uploadUserDetails(product_id: string, base64Image: string, product_name: string, type: string,productDetails:any): Promise<any> {
    try {
      // Extract base64 data
      const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return responseMessageGenerator('failure', "Invalid image format", null)

      let productData: any = null
      if(product_id){
         productData= await this.ProductModel.findOne({ where: { id: product_id } })
      }
      
      if (productData && productData.shoe_image) {
        const oldImagePath = path.join(__dirname, '..', '..', productData.shoe_image);

        // Delete old signature file if it exists
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      let saveSignature = await this.saveSignature(product_id, base64Image, type,productDetails)
       
      if (saveSignature?.status == 'failure') {
        return saveSignature
      }

      return responseMessageGenerator('success', "image saved successfully", saveSignature.data)
    } catch (error) {
      console.log(error);
      return errorResponse(error.message)
    }
  }
  async saveSignature(productId: string, base64Image: string, type: string,productDetails:any): Promise<any> {
    try {
      // Extract base64 data
      const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid image format');

      const extension = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');

      let productData: any =null
      if(productId){
           productData =await this.ProductModel.findOne({ where: { id: productId },raw:true })
      }
      
      let  fileName :any= null
     
       if(productDetails?.leather_name != null ){
       fileName = `${(productDetails?.leather_name).toLowerCase()}_${productId}_image.${extension}`;
      }else{
        fileName =productDetails?.leather_file_name;
      }
      // Define file path
     
      
      let path = type == "shoe" ? this.uploadPath + "/shoe" : this.uploadPath + "/leather"
    
      const filePath = join(path, fileName);

      // Save image
      writeFileSync(filePath, buffer);

      return responseMessageGenerator('success', "image saved successfully", filePath)
    } catch (error) {
      console.log(error);
      return responseMessageGenerator('failure', error.message, null)
    }
  }
  async getSignatureAsBase64(filename: string,file_type:string): Promise<any> {
    try {
      // Define the file path
    
      const filePath = filename

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return responseMessageGenerator('failure', "File not found", null)
      }

      // Read file and convert to Base64
      const fileBuffer = fs.readFileSync(filePath);
      const base64Image = fileBuffer.toString('base64');

      // Return the Base64 response
      return responseMessageGenerator('success', 'data fetch successfully', `data:image/${file_type};base64,${base64Image}`);
    } catch (error) {
      console.error('Error fetching image:', error);
      responseMessageGenerator('failure', "Error fetching image", null)

    }
  }
  async getFileType(base64Data: string): Promise<any> {
  const match = base64Data.match(/^data:(image\/\w+);base64,/);
  if (match) {
    const mimeType = match[1]; // e.g., 'image/png'
    const fileExtension = mimeType.split('/')[1]; // e.g., 'png'
    return fileExtension;
  }
  return null;
}

}
