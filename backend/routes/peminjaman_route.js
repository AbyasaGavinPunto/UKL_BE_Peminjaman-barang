import express from 'express'

import {
    getAllPeminjaman,
    getPeminjamanById,
    addPeminjaman,
    pengembalianBarang,
    getUsageAnalysis,
    analyzeItems
} from '../controller/peminjaman_controllers.js'

const app = express()
app.use(express.json())

app.get('/borrow',getAllPeminjaman)
app.get('/borrow/:id', getPeminjamanById)
app.post('/borrow', addPeminjaman)
app.post('/return/:id', pengembalianBarang)
app.post('/usage-report', getUsageAnalysis)
app.post('/borrow-analysis', analyzeItems)

export default app