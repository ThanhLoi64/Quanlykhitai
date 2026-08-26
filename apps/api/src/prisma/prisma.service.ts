import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly tenantStorage = new AsyncLocalStorage<number | null>();
    private scopedClient: any;
  private readonly modelNames = new Set([
    'user',
    'category',
    'product',
    'registration',
    'owner',
    'productDetail',
    'repairRecord',
    'warehouse',
    'appLog',
    'transfer',
  ]);

  constructor() {
    super();

    const baseClient = this;
    this.scopedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            const currentTenantId = baseClient.tenantStorage.getStore();
            const delegateName = model[0].toLowerCase() + model.slice(1);
            if (!currentTenantId || !baseClient.modelNames.has(delegateName)) {
              return query(args);
            }

            const scopedWhere = (where: Record<string, unknown> = {}) => ({
              AND: [where, { tenantId: currentTenantId }],
            });
            const compoundIdWhere = (where: Record<string, any>) =>
              where.id !== undefined
                ? { id_tenantId: { id: where.id, tenantId: currentTenantId } }
                : where;

            if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
              args.where = compoundIdWhere(args.where);
            } else if (['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'aggregate', 'groupBy', 'updateMany', 'deleteMany'].includes(operation)) {
              args.where = scopedWhere(args.where);
            } else if (operation === 'create') {
              args.data = baseClient.addTenantToNestedCreates({ ...args.data, tenantId: currentTenantId }, currentTenantId);
            } else if (operation === 'createMany') {
              args.data = Array.isArray(args.data)
                ? args.data.map((item: Record<string, unknown>) => baseClient.addTenantToNestedCreates({ ...item, tenantId: currentTenantId }, currentTenantId))
                : { ...args.data, tenantId: currentTenantId };
            } else if (['update', 'delete', 'upsert'].includes(operation)) {
              const existing = await (baseClient as any)[delegateName].findFirst({
                where: scopedWhere(args.where),
                select: { id: true },
              });
              if (!existing) throw new Error(`${model} record not found in current tenant`);
              args.where = compoundIdWhere(args.where);
              if (operation === 'upsert') args.create = baseClient.addTenantToNestedCreates({ ...args.create, tenantId: currentTenantId }, currentTenantId);
            }

            return query(args);
          },
        },
      },
    });

    return new Proxy(this, {
      get: (target, property, receiver) => {
        if (typeof property === 'string' && this.modelNames.has(property)) {
          return baseClient.scopedClient[property];
        }

        return Reflect.get(target, property, receiver);
      },
    });
  }

  async onModuleInit() {
    await this.$connect();

    console.log('✅ PostgreSQL Connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  runWithTenant<T>(tenantId: number | undefined, callback: () => T): T {
    return this.tenantStorage.run(tenantId ?? null, callback);
  }

  getCurrentTenantId(): number | null | undefined {
    return this.tenantStorage.getStore();
  }

  runWithoutTenant<T>(callback: () => T): T {
    return this.tenantStorage.run(null, callback);
  }

  private addTenantToNestedCreates(value: any, tenantId: number): any {
    if (Array.isArray(value)) return value.map((item) => this.addTenantToNestedCreates(item, tenantId));
    if (!value || typeof value !== 'object' || value instanceof Date) return value;
    const result: Record<string, any> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = key === 'create'
        ? Array.isArray(child)
          ? child.map((item) => this.addTenantToNestedCreates({ ...item, tenantId }, tenantId))
          : this.addTenantToNestedCreates({ ...(child as object), tenantId }, tenantId)
        : this.addTenantToNestedCreates(child, tenantId);
    }
    return result;
  }

  async $transaction(arg: any, options?: any): Promise<any> {
    return super.$transaction(arg, options);
  }
}