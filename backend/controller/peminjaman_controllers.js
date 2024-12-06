import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllPeminjaman = async (req, res) => {
  try {
    const result = await prisma.peminjaman.findMany();
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};

export const getPeminjamanById = async (req, res) => {
  try {
    const result = await prisma.presensi.findMany({
      where: {
        id_user: Number(req.params.id),
      },
    });
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });
    if (formattedData) {
      res.json({
        success: true,
        data: formattedData,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "data not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};

export const addPeminjaman = async (req, res) => {
  const { id_user, id_item, borrow_date, return_date, qty } = req.body;

  const formattedBorrowDate = new Date(borrow_date).toISOString();
  const formattedReturnDate = new Date(return_date).toISOString();

  const [getUserId, getBarangId] = await Promise.all([
    prisma.user.findUnique({ where: { id_user: Number(id_user) } }),
    prisma.barang.findUnique({ where: { id_item: Number(id_item) } }),
  ]);

  if (getUserId && getBarangId) {
    try {
      const result = await prisma.peminjaman.create({
        data: {
          user: {
            connect: {
              id_user: Number(id_user),
            },
          },
          barang: {
            connect: {
              id_item: Number(id_item),
            },
          },
          qty: qty,
          borrow_date: formattedBorrowDate,
          return_date: formattedReturnDate,
        },
      });
      if (result) {
        const item = await prisma.barang.findUnique({
          where: { id_item: Number(id_item) },
        });

        if (!item) {
          throw new Error(
            `barang dengan id_item ${id_item} tidak ditemukan`
          );
        } else {
          const minQty = item.quantity - qty;
          const result = await prisma.barang.update({
            where: {
              id_item: Number(id_item),
            },
            data: {
              quantity: minQty,
            },
          });
        }
      }
      res.status(201).json({
        success: true,
        message: "Peminjaman Berhasil Dicatat",
        data: {
          id_user: result.id_user,
          id_item: result.id_item,
          qty: result.qty,
          borrow_date: result.borrow_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
          return_date: result.return_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
          status: result.status,
        },
      });
    } catch (error) {
      console.log(error);
      res.json({
        msg: error,
      });
    }
  } else {
    res.json({ msg: "user dan barang belum ada" });
  }
};

export const pengembalianBarang = async (req, res) => {
  // `borrow_id` tetap sebagai string dalam permintaan
  const { borrow_id, return_date } = req.body;

  // Konversi `borrow_id` ke integer hanya saat digunakan dalam query Prisma
  const borrowIdInt = Number(borrow_id);

  // Validasi jika `borrow_id` bukan angka yang valid
  if (isNaN(borrowIdInt)) {
    return res.status(400).json({
      message: "borrow_id harus berupa angka",
    });
  }

  const formattedReturnDate = new Date(return_date).toISOString();

  // Cari data peminjaman berdasarkan `borrow_id`
  const cekBorrow = await prisma.peminjaman.findUnique({
    where: { borrow_id: borrowIdInt }, // Menggunakan integer di query Prisma
  });

  if (!cekBorrow) {
    return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
  }

  if (cekBorrow.status === "dipinjam") {
    try {
      const result = await prisma.peminjaman.update({
        where: {
          borrow_id: borrowIdInt, // Pastikan tipe data adalah integer di sini
        },
        data: {
          return_date: formattedReturnDate,
          status: "kembali",
        },
      });

      if (result) {
        const item = await prisma.barang.findUnique({
          where: { id_item: Number(cekBorrow.id_item) },
        });

        if (!item) {
          throw new Error(
            `Barang dengan id_item ${cekBorrow.id_item} tidak ditemukan`
          );
        } else {
          const restoreQty = cekBorrow.qty + item.quantity;
          await prisma.barang.update({
            where: {
              id_item: Number(cekBorrow.id_item),
            },
            data: {
              quantity: restoreQty,
            },
          });
        }
      }

      // Format response agar sesuai dengan keinginan
      res.status(201).json({
        success: true,
        message: "Pengembalian Berhasil Dicatat",
        data: {
          borrow_id: borrow_id, // Mengembalikan `borrow_id` sebagai string
          id_user: result.id_user,
          id_item: result.id_item,
          qty: result.qty,
          return_date: result.return_date.toISOString().split("T")[0],
          status: result.status,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Peminjaman sudah dikembalikan" });
  }
};


export const getUsageAnalysis = async (req, res) => {
  const { start_date, end_date, group_by } = req.body;

  // Validasi input
  if (!start_date || !end_date || !group_by) {
    return res.status(400).json({
      status: "error",
      message: "start_date, end_date, and group_by are required",
    });
  }

  try {
    // Filter data berdasarkan tanggal
    const borrowData = await prisma.peminjaman.findMany({
      where: {
        borrow_date: { gte: new Date(start_date) },
        return_date: { lte: new Date(end_date) },
      },
      include: {
        barang: true,
        user: true,
      },
    });

    // Debug log untuk memeriksa data
    console.log("Borrow Data:", borrowData);

    // Kelompokkan data berdasarkan parameter group_by
    const groupedData = borrowData.reduce((acc, record) => {
      let groupKey;
      if (group_by === "user") {
        groupKey = record.user ? record.user.name : "Unknown User";
      } else if (group_by === "item") {
        groupKey = record.barang ? record.barang.name : "Unknown Item";
      } else if (group_by === "category") {
        groupKey = record.barang ? record.barang.category : "Unknown Category";
      } else if (group_by === "location") {
        groupKey = record.barang ? record.barang.location : "Unknown Location";
      } else {
        throw new Error("Invalid group_by value");
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          group: groupKey,
          total_borrowed: 0,
          total_returned: 0,
          items_in_use: 0,
        };
      }

      acc[groupKey].total_borrowed += record.qty;
      acc[groupKey].total_returned += record.status === "kembali" ? record.qty : 0;
      acc[groupKey].items_in_use += record.status === "dipinjam" ? record.qty : 0;

      return acc;
    }, {});

    // Format data untuk respons
    const usageAnalysis = Object.values(groupedData);

    res.status(200).json({
      status: "success",
      data: {
        analysis_periode: {
          start_date,
          end_date,
        },
        usage_analysis: usageAnalysis,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const analyzeItems = async (req, res) => {
  const { start_date, end_date } = req.body;

  // Validasi input
  if (!start_date || !end_date) {
    return res.status(400).json({
      status: "error",
      message: "start_date and end_date are required",
    });
  }

  try {
    // Query untuk barang yang paling sering dipinjam
    const frequentlyBorrowed = await prisma.peminjaman.groupBy({
      by: ['id_item'],
      where: {
        borrow_date: {
          gte: new Date(start_date),
        },
        return_date: {
          lte: new Date(end_date),
        },
      },
      _sum: {
        qty: true,
      },
      orderBy: {
        _sum: {
          qty: 'desc',
        },
      },
      take: 10, // Ambil 10 barang paling sering dipinjam
    });

    // Ambil detail barang
    const frequentlyBorrowedItems = await Promise.all(
      frequentlyBorrowed.map(async (item) => {
        const barang = await prisma.barang.findUnique({
          where: { id_item: item.id_item },
        });
        return {
          item_id: item.id_item,
          name: barang.name,
          category: barang.category,
          total_borrowed: item._sum.qty,
        };
      })
    );

    // Query untuk barang dengan pengembalian terlambat
    const inefficientItemsData = await prisma.peminjaman.findMany({
      where: {
        borrow_date: {
          gte: new Date(start_date),
        },
        return_date: {
          lte: new Date(end_date),
        },
        status: 'kembali',
      },
    });

    const inefficientItems = await Promise.all(
      inefficientItemsData.reduce((acc, item) => {
        const lateReturn = new Date(item.return_date) > new Date(item.borrow_date);
        if (lateReturn) {
          const existing = acc.find((i) => i.id_item === item.id_item);
          if (existing) {
            existing.total_late_returns += 1;
          } else {
            acc.push({
              item_id: item.id_item,
              total_late_returns: 1,
            });
          }
        }
        return acc;
      }, [])
      .map(async (item) => {
        const barang = await prisma.barang.findUnique({
          where: { id_item: item.item_id },
        });
        return {
          item_id: item.item_id,
          name: barang.name,
          category: barang.category,
          total_late_returns: item.total_late_returns,
        };
      })
    );

    // Respons data
    res.status(200).json({
      status: "success",
      data: {
        analysis_period: {
          start_date,
          end_date,
        },
        frequently_borrowed_items: frequentlyBorrowedItems,
        inefficient_items: inefficientItems,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
