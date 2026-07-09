const UserValidator = {
    updateUserName: (req, res, next) => {
        const { userName } = req.body;
        if (!userName) {
            return res.status(400).json({
                message: "User name is required"
            });
        }
        next();
    },
    updateUserRole: (req, res, next) => {
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({
                message: "Role is required"
            });
        }
        if (!["ADMIN", "ISSUER", "HOLDER"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }
        next();
    },
    updateUserStatus: (req, res, next) => {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }
        if (!["ACTIVE", "DISABLE"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }
        next();
    }
}

export default UserValidator;