// utils/prisma.ts
export function serializePrismaData(data){
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (value?.constructor?.name === 'Decimal') {
      return value.toNumber();
    }
    return value;
  }));
}