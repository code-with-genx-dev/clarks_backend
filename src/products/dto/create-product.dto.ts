export class CreateProductDto {
   
       leather_category:string
       sub_category:string
       leather_name:string
       tannery:string
       tannery_location:string
       season_introduced:string
       season_price:number
       users:any
       moq:string
       shoe_factories:string
       style_used:string
       leather_image:string
       shoe_image:string
       leather_file_name:string
       shoe_file_name:string
        uploaded_date:Date
        uploaded_by:number
        status:string
        approved_user_id:number
        approved_date:Date
        approved_comments:string
        file_type:string
        
    
}

export class approveRejectProductDto {
   
       current_user_id: number
       record_id: number
       status: string
       approved_comments: string
    
}
