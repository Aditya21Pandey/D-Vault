const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the user by googleId (camelCase in Prisma)
  const user = await prisma.user.findFirst({
    where: { googleId: '112846080344379098220' },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user) {
    // Try by email as fallback
    console.log('Not found by googleId, listing all users to debug:');
    const all = await prisma.user.findMany({ select: { id: true, email: true, googleId: true, authProvider: true, userRoles: { include: { role: true } } } });
    all.forEach(u => console.log(`  ${u.email} | googleId=${u.googleId} | roles=${u.userRoles.map(r => r.role.name).join(',')}`));
    return;
  }

  console.log(`✅ Found user: ${user.email} (id: ${user.id})`);
  console.log(`   Current roles: ${user.userRoles.map(r => r.role.name).join(', ') || 'none'}`);

  // Find ADMIN role
  const adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
  if (!adminRole) {
    console.log('❌ ADMIN role not found. Available roles:');
    const roles = await prisma.role.findMany();
    roles.forEach(r => console.log(`  ${r.id}: ${r.name}`));
    return;
  }

  const existing = user.userRoles.find(r => r.roleId === adminRole.id);
  if (existing) {
    console.log('✅ Already has ADMIN role — no change needed');
    return;
  }

  // Remove old roles and assign ADMIN
  await prisma.userRole.deleteMany({ where: { userId: user.id } });
  await prisma.userRole.create({
    data: { userId: user.id, roleId: adminRole.id },
  });

  console.log(`✅ Role updated to ADMIN for ${user.email}`);
}

main()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect());
