const commandSchema = require('../../model/command')

class CommandHandle {
    static async create(req, res) {
        try {
            const { command, content } = req.body;
            let newCommand = {
                command: command,
                content: content,
                created_time: Date.now(),
                updated_time: Date.now()
            }
            let cmd = await commandSchema.create(newCommand)
            if(!cmd) throw new Error('Command handle failed')
            return res.send({ success: true, message: "Done!" });
        } catch (error) {
            return res.status(500).send({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            
        } catch (error) {
            return res.status(500).send({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            
        } catch (error) {
            return res.status(500).send({ success: false, message: error.message });
        }
    }

    static async get(req, res) {
        try {
            
        } catch (error) {
            return res.status(500).send({ success: false, message: error.message });
        }
    }

    static async list(req, res) {
        try {
            
        } catch (error) {
            return res.status(500).send({ success: false, message: error.message });
        }
    }

}

module.exports = CommandHandle