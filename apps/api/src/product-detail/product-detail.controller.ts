import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProductDetailService } from './product-detail.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth()
@ApiTags('Product details')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product-details')
export class ProductDetailController{


constructor(
 private service:ProductDetailService
){}



@Get()
findAll(){

return this.service.findAll();

}

	@Get('search')
	search(@Query('q') query?: string, @Query('field') field?: string) {
	return this.service.search(query, field);
	}
}