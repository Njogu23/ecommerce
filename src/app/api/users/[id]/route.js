import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request, {params}) {
    try {
    const { id } = await params
    const user = await prisma.user.findUnique({
        where : {
            id: id
        },
    })
    if (!user) {
        return Response.json({ error: "User not found!" }, { status: 404})
    }

    return Response.json(user)
} catch (error) {
    console.error(error)
    return Response.json({error: "Internal Server Error!"}, {status: 500})
}
}

export async function PUT(request, props) {
    const params = await props.params
    try {
        const { id } = params
        const body = await request.json()
        const existingUser = await prisma.user.findUnique({
            where: {id:id},
        })

        if (!existingUser){
            return Response.json({error: "user not found!"}, {status: 404})
        }

        const updateData = {...body}
        if(body.password) {
            updateData.password = await hashPassword(body.password, 10)
        }

        const updateUser = await prisma.user.update({
            where: {id:id},
            data: updateData,
        })

        return Response.json(updateUser)
    } catch(error){
        console.error(error)
        return Response.json({error: "insternal server error!"}, {status: 500})
    }
}

export async function DELETE(_request, {params}) {
    try {
        const { id } = await params

        const existingUser = await prisma.user.findUnique({
            where : {id:id}
        })

        if (!existingUser) {
            return Response.json({error: "user not found!"}, {status: 404})
        }
        
        // soft delete by setting isActive to false
        const deletedUser = await prisma.user.update({
            where: {id:id},
            data: {isActive: false}
        })

        return Response.json({message: "user deleted successfully"})
    } catch (error){
        console.error(error)
        return Response.json({error: "internal server error!"}, {status: 500})
    }
}