import UserService from "./user.service.js";

const UserController = {
    findUserById: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await UserService.findUserById(id);
            res.status(200).json({
                status: 200,
                message: "User found successfully",
                data: result
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Error finding user",
                error: error.message
            });
        }
    },
    getMe: async (req, res) => {
        try {
            const id = req.user.id;
            const result = await UserService.findUserById(id);
            res.status(200).json({
                status: 200,
                message: "User found successfully",
                data: result
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Error finding user",
                error: error.message
            });
        }
    },
    updateUserName: async (req, res) => {
        try {
            const { userName } = req.body;
            const id = req.user.id;
            const result = await UserService.updateUserName(id, userName);
            res.status(200).json({
                status: 200,
                message: "User name updated successfully",
                data: result
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Error updating user name",
                error: error.message
            });
        }
    },
    findAllUsers: async (req, res) => {
        try {
            const users = await UserService.findAllUsers();
            res.status(200).json({
                status: 200,
                message: "Users found successfully",
                data: users
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Error finding users",
                error: error.message
            });
        }
    },
    updateUserRole: async (req, res) => {
        try {
            const { role } = req.body;
            const id = req.params.id;
            const result = await UserService.updateUserRole(id, role);
            res.status(200).json({
                status: 200,
                message: "User role updated successfully",
                data: result
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Error updating user role",
                error: error.message
            });
        }
    },
    updateUserStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const id = req.params.id;
            const result = await UserService.updateUserStatus(id, status);
            res.status(200).json({
                status: 200,
                message: "User status updated successfully",
                data: result
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Error updating user status",
                error: error.message
            });
        }
    }
}

export default UserController;
