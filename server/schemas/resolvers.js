const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.fineOne({ _id: context.user._id })
                   .select('-__V -password')
                   //.populate('books');

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user  };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new AuthenticationError('Invalid credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new AuthenticationError('Invalid credentials');
            }

            const token = signToken(user);
            return { token, user  };
        },
        saveBook: async (parent, { bookData }, context) => {
            if(context.user) {
                const updatedUser = await findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedbooks: bookData } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('Not logged in');
        },
        removeBook: async (parent, args, context) => {
            if(context.user) {
                const updatedUser = await findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedbooks: args.bookId } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('Not logged in');
        }
    }
};

module.exports = resolvers;