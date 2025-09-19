const Joi = require("joi");
const Transaction = require("../models/transaction");

const transactionController = {
    // --- Create Transaction ---
    async create(req, res, next) {
        const schema = Joi.object({
            type: Joi.string().valid("income", "expense").required(),
            amount: Joi.number().required(),
            description: Joi.string().allow("").optional(),
            donor: Joi.string().allow("").optional(),
            date: Joi.string().required(),
            timestamp: Joi.number().required(),
        });

        const { error } = schema.validate(req.body);
        if (error) return next(error);

        try {
            const { type, amount, description, donor, date, timestamp } = req.body;
            // generate txnId server side
            const txnId = `TXN${Date.now()}${String(
                Math.floor(Math.random() * 1000)
            ).padStart(3, "0")}`;

            const newTxn = new Transaction({
                txnId,
                type,
                amount,
                description,
                donor,
                date,
                timestamp,
                author: req.user ? req.user._id : undefined,
            });

            await newTxn.save();
            return res.status(201).json({ transaction: newTxn });
        } catch (err) {
            return next(err);
        }
    },

    // --- Get All Transactions with filters, pagination, summary ---
    async getAll(req, res, next) {
        try {
            const { scope = "all", year, month, type, page = 1, limit = 10, search = "" } = req.query;

            const currentPage = parseInt(page, 10);
            const itemsPerPage = parseInt(limit, 10);
            const skip = (currentPage - 1) * itemsPerPage;

            let filter = {};
            if (type && (type === "income" || type === "expense")) {
                filter.type = type;
            }

            // Scope filter
            if (scope === "year" && year) {
                const y = parseInt(year, 10);
                const start = new Date(y, 0, 1).getTime();
                const end = new Date(y + 1, 0, 1).getTime();
                filter.timestamp = { $gte: start, $lt: end };
            } else if (scope === "month" && year && month !== undefined) {
                const y = parseInt(year, 10);
                const m = parseInt(month, 10);
                const start = new Date(y, m, 1).getTime();
                const end = new Date(y, m + 1, 1).getTime();
                filter.timestamp = { $gte: start, $lt: end };
            }

            // Search filter
            if (search) {
                const searchRegex = new RegExp(search, "i");
                const searchAmount = parseFloat(search);
                const isAmountSearch = !isNaN(searchAmount);

                const searchFilters = [
                    { description: { $regex: searchRegex } },
                    { donor: { $regex: searchRegex } },
                    { txnId: { $regex: searchRegex } },
                ];

                if (isAmountSearch) {
                    searchFilters.push({ amount: searchAmount });
                }

                filter.$or = searchFilters;
            }

            // Count
            const totalCount = await Transaction.countDocuments(filter);

            // Fetch transactions
            let txns;
            if (itemsPerPage === 0) {
                txns = await Transaction.find(filter).sort({ timestamp: -1 });
            } else {
                txns = await Transaction.find(filter)
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(itemsPerPage);
            }

            // Summary (income, expense, balance)
            const [income] = await Transaction.aggregate([
                { $match: { ...filter, type: "income" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            const [expense] = await Transaction.aggregate([
                { $match: { ...filter, type: "expense" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            const incomeTotal = income ? income.total : 0;
            const expenseTotal = expense ? expense.total : 0;

            return res.status(200).json({
                transactions: txns,
                totalCount,
                totalPages: itemsPerPage === 0 ? 1 : Math.ceil(totalCount / itemsPerPage),
                currentPage,
                summary: {
                    income: incomeTotal,
                    expense: expenseTotal,
                    balance: incomeTotal - expenseTotal
                }
            });

        } catch (err) {
            return next(err);
        }
    },

    // --- Get By ID ---
    async getById(req, res, next) {
        try {
            const id = req.params.id;
            let txn = await Transaction.findOne({ txnId: id });
            if (!txn) {
                txn = await Transaction.findById(id);
            }
            if (!txn) return res.status(404).json({ message: "Not found" });
            return res.status(200).json({ transaction: txn });
        } catch (err) {
            return next(err);
        }
    },

    // --- Delete Transaction ---
    async delete(req, res, next) {
        try {
            const id = req.params.id;
            let result = await Transaction.findOneAndDelete({ txnId: id });
            if (!result) result = await Transaction.findByIdAndDelete(id);
            if (!result) return res.status(404).json({ message: "Not found" });
            return res.status(200).json({ message: "Deleted" });
        } catch (err) {
            return next(err);
        }
    },

    // --- Update Transaction ---
    async update(req, res, next) {
        // ✅ Only allow safe fields to be updated
        const schema = Joi.object({
            type: Joi.string().valid("income", "expense").optional(),
            amount: Joi.number().optional(),
            description: Joi.string().allow("").optional(),
            donor: Joi.string().allow("").optional(),
            date: Joi.string().optional(),
            timestamp: Joi.number().optional(),
        }).unknown(false); // 🚫 reject unknown fields

        const { error } = schema.validate(req.body);
        if (error) return next(error);

        try {
            const id = req.params.id;

            // ✅ Whitelist fields to prevent unwanted updates
            const allowedUpdates = ['type', 'amount', 'description', 'donor', 'date', 'timestamp'];
            const updates = {};
            for (let key of allowedUpdates) {
                if (req.body[key] !== undefined) updates[key] = req.body[key];
            }

            let txn = await Transaction.findOneAndUpdate(
                { txnId: id },
                updates,
                { new: true }
            );
            if (!txn) {
                txn = await Transaction.findByIdAndUpdate(id, updates, { new: true });
            }
            if (!txn) return res.status(404).json({ message: "Not found" });
            return res.status(200).json({ transaction: txn });
        } catch (err) {
            return next(err);
        }
    }

};

module.exports = transactionController;
