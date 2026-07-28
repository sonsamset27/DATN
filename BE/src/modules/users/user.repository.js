import User from "./user.model.js";

const UserRepositpry = {
    createUser: async (userData) => {
        return await User.create(userData);
    },
    updateUserName: async (id, userName) => {
        return await User.findOneAndUpdate({ _id: id }, { userName }, { new: true });
    },
    findAllUsers: async (filter = {}, page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            User.find(filter).skip(skip).limit(limit).lean(),
            User.countDocuments(filter)
        ]);

        if (data.length > 0) {
            const { default: DidModel } = await import('../dids/did.model.js');
            const userIds = data.map(u => u._id);
            const dids = await DidModel.find({ ownerId: { $in: userIds } }).lean();
            const didMap = {};
            dids.forEach(d => { didMap[d.ownerId.toString()] = d.did; });
            data.forEach(u => {
                u.did = didMap[u._id.toString()];
            });
        }

        return { data, total, page, limit };
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
    },
    promoteToIssuer: async (id, organizationName, organizationCode) => {
        return await User.findOneAndUpdate({ _id: id }, { role: "ISSUER", organizationName, organizationCode }, { returnDocument: 'after' });
    },
    demoteToHolder: async (id) => {
        return await User.findOneAndUpdate({ _id: id }, { role: "HOLDER", organizationName: "", organizationCode: "" }, { returnDocument: 'after' });
    }
}

export default UserRepositpry;