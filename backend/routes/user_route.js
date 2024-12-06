import express from 'express'
import {
    getAllUser,
    getUserById,
    addUser,
    updateUser,
    deleteUser
} from '../controller/user_controller.js'

const app = express()

app.get('/', getAllUser)
app.get('/:id', getUserById)
app.post('/addUser',addUser)
app.put('/:id',updateUser)
app.delete('/:id',deleteUser)

export default app // harus di export supaya bisa terbaca 