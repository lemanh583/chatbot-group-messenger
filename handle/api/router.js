const express = require('express');
const router = express.Router()
const commandHandle = require('./command-handle')
const optionHandle = require('./option-handle')

router.get('/command', commandHandle.get)
router.post('/command', commandHandle.create)

router.get('/option', optionHandle.get)
router.post('/option', optionHandle.create)

module.exports = router;