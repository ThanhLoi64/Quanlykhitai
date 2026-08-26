import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';


@Injectable()
export class ProductDetailService {


constructor(
 private prisma:PrismaService
){}



findAll(){

return this.prisma.productDetail.findMany({

where:{
 status:"AVAILABLE"
},


include:{


product:true


},


orderBy:{
 id:"desc"
}


});


}


	search(query?: string, field?: string) {
	const value = query?.trim();
		const where: Prisma.ProductDetailWhereInput = value
			? field === 'serial'
				? { serialNumber: { contains: value, mode: 'insensitive' } }
				: field === 'owner'
					? {
							OR: [
								{ owner: { fullName: { contains: value, mode: 'insensitive' } } },
								{ registrations: { some: { owner: { fullName: { contains: value, mode: 'insensitive' } } } } },
							],
						}
					: { product: { name: { contains: value, mode: 'insensitive' } } }
			: {};

	return this.prisma.productDetail.findMany({
		where,
		include: {
			product: { select: { id: true, name: true, unit: true } },
			warehouse: { select: { id: true, name: true } },
			owner: { select: { id: true, fullName: true, rank: true, position: true, department: true } },
			registrations: {
				orderBy: { registeredAt: 'desc' },
				take: 1,
				include: { owner: { select: { fullName: true } } },
			},
		},
		orderBy: { id: 'desc' },
	});
}
}