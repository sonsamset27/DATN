import UserRepository from "./user.repository.js";

const UserService = {
    updateUserName: async (id, userName) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return await UserRepository.updateUserName(id, userName);
        } catch (error) {
            throw error;
        }
    },
    findAllUsers: async () => {
        try {
            const users = await UserRepository.findAllUsers();
            if (!users) {
                throw new Error("No users found");
            }
            return users;
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;