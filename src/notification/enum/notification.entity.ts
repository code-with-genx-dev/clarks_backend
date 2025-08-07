import { Column, DataType, Table,Model, BelongsTo, ForeignKey, } from "sequelize-typescript";
import {InferCreationAttributes,InferAttributes} from "sequelize";
import { UserRepository } from "src/users/entities/user.entity";

@Table({ tableName: 'notification' })
export class NotificationRepository extends Model<InferCreationAttributes<NotificationRepository>,InferAttributes<NotificationRepository>> {

    @ForeignKey(() => UserRepository)
    @Column
    user_id: number;  // Foreign key referencing the User table

    @Column
    title: string;  // Notification title

    @Column
    body: string;  // Notification body text

    @Column(DataType.JSON)
    data: any;  // Data field to store any additional data (JSON format)

    @BelongsTo(() => UserRepository)
    user: UserRepository;  // Optional: Add relationship if you need to access user data easily
}