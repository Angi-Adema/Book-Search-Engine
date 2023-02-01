const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id });

        return userData;
      }
      throw new AuthenticationError("Please log in!");
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect email!");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: book },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      throw new AuthenticationError("Please log in!");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const userData = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $pull: { savedBooks: { bookId } },
          },
          { new: true }
        );

        return userData;
      }
      throw new AuthenticationError("Please log in!");
    },
  },
};

module.exports = resolvers;
