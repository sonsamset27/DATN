import UserService from "./user.service.js";

const UserController = {
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
    }
}

export default UserController;
