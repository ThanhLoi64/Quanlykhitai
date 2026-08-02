import { Controller, Get } from '@nestjs/common';
import { ProductDetailService } from './product-detail.service';


@Controller("product-details")
export class ProductDetailController{


constructor(
 private service:ProductDetailService
){}



@Get()
findAll(){

return this.service.findAll();

}


}