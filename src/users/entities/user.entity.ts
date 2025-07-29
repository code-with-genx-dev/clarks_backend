import { Table ,Column, DataType,Model} from "sequelize-typescript";
import {InferCreationAttributes,InferAttributes} from "sequelize"


@Table({tableName:"users"})
export class UserRepository extends Model<InferAttributes<UserRepository>,InferCreationAttributes<UserRepository>>{
   
    @Column
    user_name:string

    @Column
    user_email:string

    @Column({type:DataType.STRING(15),allowNull:true})
    mobile_number:string

    @Column({type:DataType.STRING,allowNull:false})
    password:string

    @Column
    user_temp_password: string;

    @Column
    verification_code: number;

    @Column({defaultValue:false})
    is_verified: boolean;

    @Column({defaultValue:false})
    is_admin: boolean;

}