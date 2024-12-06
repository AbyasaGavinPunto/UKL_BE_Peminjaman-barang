import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllBarang = async(req, res) => {
    console.log("cek");
    try {
        const result = await prisma.barang.findMany()
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

export const getBarangById = async(req, res) => {
    try {
        const result = await prisma.barang.findUnique({
            where: {
                id_item: Number(req.params.id)
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

export const addBarang = async(req, res) => {
    const {name, category, location, quantity} = req.body //req.body karena dia text
        try {
            const result = await prisma.barang.create({
                data: {
                    name: name,
                    category: category,
                    location: location,
                    quantity: Number(quantity)
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


export const updateBarang = async(req, res) => {
const {name, category, location, quantity} = req.body //req.body karena dia text
        try {
            const result = await prisma.barang.update({
                where:{
                    id_item: Number(req.params.id)
                },
                data: {
                    name: name,
                    category: category,
                    location: location,
                    quantity: Number(quantity)
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


export const deleteBarang = async(req, res) => {
    try {
        const result = await prisma.barang.delete({
            where: {
                id_item: Number(req.params.id)
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