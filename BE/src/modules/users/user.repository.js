import User from "./user.model.js";

const UserRepositpry = {
    createUser: async (userData) => {
        return await User.create(userData);
    },
    findUserByWalletAddress: async (walletAddress) => {
        return await User.findOne({ walletAddress });
    },
    updateUserRole: async (walletAddress, role) => {
        return await User.updateOne({ walletAddress }, { role });
    },
    updateUserStatus: async (walletAddress, status) => {
        return await User.updateOne({ walletAddress }, { status });
    }
}

export default UserRepositpry;