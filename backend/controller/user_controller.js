import { PrismaClient } from "@prisma/client";
import md5 from "md5";
const prisma = new PrismaClient()

export const getAllUser = async(req, res) => {
    console.log("cek");
    try {
        const result = await prisma.user.findMany()
        console.log(result);
        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log("cek "+error);
        res.json({
            msg: error
        })
    }
}

export const getUserById = async(req, res) => {
    try {
        const result = await prisma.user.findUnique({
            where: {
                id_user: Number(req.params.id)
            }
        })
        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: error
        })
    }
}

export const addUser = async(req, res) => {
    try {
        const {nama_user, username, password, role} = req.body
        const result = await prisma.user.create({
            data: {
                nama_user: nama_user,
                username: username,
                password: md5(password),
                role: role
            }
        })
        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: error
        })
    }
}

export const updateUser = async(req, res) => {
    try {
        const {nama_user, username, password} = req.body
        const result = await prisma.user.update({
            where: {
                id_user: Number(req.params.id)
            },
            data: {
                nama_user: nama_user,
                username: username,
                password: password
            }
        })
        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: error
        })
    }
}

export const deleteUser = async(req, res) => {
    try {
        const result = await prisma.user.delete({
            where: {
                id_user: Number(req.params.id)
            }
        })
        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: error
        })
    }
}