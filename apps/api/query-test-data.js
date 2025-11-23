const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const member = await prisma.member.findFirst({
    include: { user: true }
  });
  
  const copy = await prisma.materialCopy.findFirst({
    where: { status: 'AVAILABLE' },
    include: { material: true }
  });
  
  console.log(JSON.stringify({
    memberId: member?.userId,
    memberName: member ? `${member.user.firstName} ${member.user.lastName}` : 'No member',
    copyId: copy?.id,
    materialTitle: copy?.material.title || 'No copy'
  }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
