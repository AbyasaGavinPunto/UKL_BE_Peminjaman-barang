import express from 'express'

import {
    getAllBarang,
    getBarangById,
    addBarang,
    updateBarang,
    deleteBarang
} from '../controller/barang_controller.js'

const app = express()
app.use(express.json())

import { authenticate,authorize } from '../controller/auth_controller.js'
import { IsAdmin } from '../middleware/role_validation.js'

app.get('/',getAllBarang)
app.get('/:id', getBarangById)
app.post('/addBarang', authorize,[IsAdmin], addBarang)
app.put('/:id', authorize,[IsAdmin], updateBarang)
app.delete('/:id', deleteBarang)

export default app