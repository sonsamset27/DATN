import User from "./user.model.js";

const UserRepositpry = {
    createUser: async (userData) => {
        return await User.create(userData);
    },
    updateUserName: async (id, userName) => {
        return await User.findOneAndUpdate({ _id: id }, { userName }, { new: true });
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
    updateUserRole: async (walletAddress, role) => {
        return await User.updateOne({ walletAddress }, { role });
    },
    updateUserStatus: async (walletAddress, status) => {
        return await User.updateOne({ walletAddress }, { status });
    }
}

export default UserRepositpry;