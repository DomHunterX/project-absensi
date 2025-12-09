const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth'); // Middleware token Anda

// Get Notifikasi User
router.get('/', auth, async (req, res) => {
    try {
        const notifs = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Tandai sudah dibaca
router.put('/:id/read', auth, async (req, res) => {
    try {
        await Notification.update({ isRead: true }, { where: { id: req.params.id, userId: req.user.id } });
        res.json({ msg: 'Read' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;