import User from "./user.model.js";

const UserRepositpry = {
    createUser: async (userData) => {
        return await User.create(userData);
    },
    updateUserName: async (id, userName) => {
        return await User.findOneAndUpdate({ _id: id }, { userName }, { returnDocument: 'after' });
    },
    findAllUsers: async () => {
        return await User.find();
    },
    findUserByWalletAddress: async (walletAddress) => {
        return await User.findOne({ walletAddress });
    },
    findUserById: async (id) => {
        return await User.findById(id);
    },
    updateUserRole: async (id, role) => {
        return await User.findOneAndUpdate({ _id: id }, { role }, { returnDocument: 'after' });
    },
    updateUserStatus: async (id, status) => {
        return await User.findOneAndUpdate({ _id: id }, { status }, { returnDocument: 'after' });
    }
}

export default UserRepositpry;