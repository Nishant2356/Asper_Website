const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.$queryRaw`SELECT enumtype.typname, enumlabel.enumlabel FROM pg_enum AS enumlabel JOIN pg_type AS enumtype ON enumlabel.enumtypid = enumtype.oid WHERE enumtype.typname = 'QuestionType';`;
    console.log("Current QuestionType enum values:");
    console.log(result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
