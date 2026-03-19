const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.$queryRaw`SELECT n.nspname as enum_schema, t.typname as enum_name, e.enumlabel as enum_value FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'QuestionType';`;
    console.log("Current QuestionType enum values by Schema:");
    console.table(result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
