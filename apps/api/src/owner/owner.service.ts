import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.owner.findMany({
      orderBy: {
        id: 'desc',
      },
    });
  }

  create(dto: CreateOwnerDto) {
    return this.prisma.owner.create({
      data: {
        fullName: dto.fullName,

        rank: dto.rank,

        position: dto.position,

        department: dto.department,
      },
    });
  }
  remove(id: number) {
    return this.prisma.owner.delete({
      where: {
        id,
      },
    });
  }

  async update(
 id:number,
 dto:UpdateOwnerDto
){

 return this.prisma.owner.update({

  where:{
    id
  },

  data:{

    fullName:dto.fullName,

    rank:dto.rank,

    position:dto.position,

    department:dto.department

  }

 });


}
async import(
 owners: CreateOwnerDto[]
){

 return this.prisma.owner.createMany({

  data: owners.map(o=>({

    fullName:o.fullName,

    position:o.position,

    rank:o.rank,

    department:o.department

  }))

 });

}
  
}
