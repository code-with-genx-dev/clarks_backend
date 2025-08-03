import { Controller, Get, Post, Body, Patch, Param, Delete,Headers } from '@nestjs/common';
import { ProductsService } from './products.service';
import { approveRejectProductDto, CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { decodeAccessToken } from 'src/common/common';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Post("save-product")
  async saveProduct(@Headers("Authorization") headers:any,@Body() CreateProductData:CreateProductDto):Promise<any>{
     let token = await decodeAccessToken(headers)
     await this.productsService.saveProduct(+token.user_id,CreateProductData)
  }
  @Post("approve-reject-product")
  async approveRejectProductData(@Headers("Authorization") headers:any,@Body() approveRejectData:approveRejectProductDto):Promise<any>{
     let token = await decodeAccessToken(headers)
     approveRejectData.current_user_id =+token.user_id
     await this.productsService.approveRejectProductData(approveRejectData)
  }
  @Get("get-product-details")
  async getProductDetails(@Headers("Authorization") headers:any):Promise<any>{
     let token = await decodeAccessToken(headers)
     await this.productsService.getProductDetails()
  }
  @Post("get-product-approval-data")
  async getProductApprovalData(@Headers("Authorization") headers:any,@Body() data:{user_id: number, selected: Date, status: string, filter: { status: string[] }}):Promise<any>{
     let token = await decodeAccessToken(headers)
     await this.productsService.getProductApprovalData(data.user_id, data.selected, data.status, data.filter)
  }
  @Post("get-product-approval-card-data")
  async getProductApprovalcardData(@Headers("Authorization") headers:any,@Body() data:{user_id: number, selected: Date, status: string, filter: { status: string[] }}):Promise<any>{
     let token = await decodeAccessToken(headers)
     await this.productsService.getProductApprovalcardData(data.user_id, data.selected, data.status, data.filter)
  }
}
