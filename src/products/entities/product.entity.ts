import { Column, DataType, Table,Model, BelongsTo, ForeignKey, } from "sequelize-typescript";
import {InferCreationAttributes,InferAttributes} from "sequelize";
import { CatogryType, statusType } from "../enum/product.enum";
import { UserRepository } from "src/users/entities/user.entity";


@Table({tableName:"products"})
export class ProductRepository extends Model<InferAttributes<ProductRepository>,InferCreationAttributes<ProductRepository>>{
   
   @Column(DataType.ENUM(...Object.values(CatogryType)))
   leather_category:string

   @Column
   leather_name:string

   @Column
   tannery:string

   @Column
   tannery_location:string

   @Column
   season_introduced:string

   @Column(DataType.DECIMAL(2,2))
   season_price:number

   @Column
   moq:string

   @Column
   shoe_factories:string

   @Column
   style_used:string

   @Column
   leather_image:string

   @Column
   shoe_image:string

   @Column
   uploaded_date:Date

   // @BelongsTo(()=>UserRepository,{as:"user",foreignKey: 'uploaded_by'})
   // users:UserRepository
   @ForeignKey(()=>UserRepository)
   @Column
   uploaded_by:number

   @Column(DataType.ENUM(...Object.values(statusType)))
   status:string

    
}
