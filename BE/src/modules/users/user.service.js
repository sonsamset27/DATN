import UserRepository from "./user.repository.js";

const UserService = {
    findUserById: async (id) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (error) {
            throw error;
        }
    },
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
    },
    updateUserRole: async (id, role) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return await UserRepository.updateUserRole(id, role);
        } catch (error) {
            throw error;
        }
    },
    updateUserStatus: async (id, status) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return await UserRepository.updateUserStatus(id, status);
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;