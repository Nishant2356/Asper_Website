const { PrismaClient } = require('@prisma/client');

async function check() {
    const prisma = new PrismaClient();
    try {
        console.log("Testing insert...");
        await prisma.quiz.create({
            data: {
                title: "Test connection pool enum",
                department: "DSA",
                createdBy: "test_user_id_123",
                questions: {
                    create: [
                        {
                            type: "TRUE_FALSE",
                            text: "Is this working?",
                            marks: 1
                        }
                    ]
                }
            }
        });
        console.log("Success! TRUE_FALSE accepted.");
    } catch (e) {
        console.error("FAIL:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
