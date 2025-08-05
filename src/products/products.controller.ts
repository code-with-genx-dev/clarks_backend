import { Controller, Get, Post, Body, Patch, Param, Delete,Headers, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { approveRejectProductDto, CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { decodeAccessToken } from 'src/common/common';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post("save-product")
  async saveProduct(@Headers("Authorization") headers:any,@Body() CreateProductData:CreateProductDto):Promise<any>{
     let token = await decodeAccessToken(headers)
     return await this.productsService.saveProduct(+token.user_id,CreateProductData)
  }
  @Post("approve-reject-product")
  async approveRejectProductData(@Headers("Authorization") headers:any,@Body() approveRejectData:approveRejectProductDto):Promise<any>{
     let token = await decodeAccessToken(headers)
     approveRejectData.current_user_id =+token.user_id
     return await this.productsService.approveRejectProductData(approveRejectData)
  }
  @Get("get-product-details")
  async getProductDetails(@Headers("Authorization") headers:any,@Query("sub_category")sub_category:string):Promise<any>{
     let token = await decodeAccessToken(headers)
    return  await this.productsService.getProductDetails(sub_category)
  }
  @Post("get-product-approval-data")
  async getProductApprovalData(@Headers("Authorization") headers:any,@Body() data:{user_id: number, selected_date: Date, status: string, filter: { status: string[] }}):Promise<any>{
     let token = await decodeAccessToken(headers)
    return await this.productsService.getProductApprovalData(+token.user_id, data.selected_date, data.status, data.filter)
  }
  @Post("get-product-approval-card-data")
  async getProductApprovalcardData(@Headers("Authorization") headers:any,@Body() data:{selected: Date}):Promise<any>{
     let token = await decodeAccessToken(headers)
    return await this.productsService.getProductApprovalcardData( data.selected)
  }
}
