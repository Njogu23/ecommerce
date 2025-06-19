import { hashPassword } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

  return Response.json(users);
}

export async function POST(request) {
  try {

    await prisma.$connect()

    const body = await request.json();
    const { email, username, phone, avatar, role, isActive, password } = body;

    const existingUser = await prisma.user.findUnique({
        where: { email }
        })

        if (existingUser){
            return Response.json({error: "user already exists!"}, {status: 409})
        }

        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.create({
            data: { email, username, phone, avatar, role, isActive, password: hashedPassword },
        });

        const { password: _, ...userWithoutPassword } = user;
        return Response.json(userWithoutPassword, {status: 200});

} catch (error){
    console.error("signup error:", error)
    return Response.json({error: "internal server error!"}, {status: 500})
}
}