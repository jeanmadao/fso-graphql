const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const resolvers = {
  Query: {
    bookCount: async () => Book.countDocuments(),

    authorCount: () => Author.countDocuments(),

    allBooks: async (root, args) => {
      const filter = {};
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        filter.author = author ? author.id : null;
      }
      if (args.genre) {
        filter.genres = args.genre;
      }
      const books = await Book.find(filter).populate("author");
      return books;
    },
    allAuthors: async () => await Author.find(),

    me: async (root, args, context) => {
      return context.currentUser;
    },
  },
  Book: {
    author: ({ author }) => {
      return {
        id: author.id,
        name: author.name,
        born: author.born,
        bookCount: author.bookCount,
      };
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("Invalid Token", {
          extensions: {
            code: "BAD_REQUEST",
            invalidArgs: context.currentUser,
          },
        });
      }
      if (args.author.length < 4) {
        throw new GraphQLError("Name must be at least 4 characters long", {
          extensions: {
            code: "GRAPHQL_VALIDATION_FAILED",
            invalidArgs: args.author,
          },
        });
      }
      if (args.title.length < 5) {
        throw new GraphQLError("Title must be at least 5 characters long", {
          extensions: {
            code: "GRAPHQL_VALIDATION_FAILED",
            invalidArgs: args.title,
          },
        });
      }
      const bookCheck = await Book.findOne({ title: args.title });
      if (bookCheck) {
        throw new GraphQLError("Title must be unique", {
          extensions: {
            code: "GRAPHQL_VALIDATION_FAILED",
            invalidArgs: args.title,
          },
        });
      }
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = await new Author({ name: args.author, bookCount: 0 }).save();
      }

      author.bookCount = author.bookCount + 1;
      author.save();

      const book = await new Book({ ...args, author: author.id }).save();

      const populatedBook = await book.populate("author");

      pubsub.publish("BOOK_ADDED", { bookAdded: populatedBook });
      return populatedBook;
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("Invalid Token", {
          extensions: {
            code: "BAD_REQUEST",
            invalidArgs: context.currentUser,
          },
        });
      }

      const updatedAuthor = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true }
      );
      if (!updatedAuthor) {
        throw new GraphQLError("Author not found", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
          },
        });
      }

      return updatedAuthor;
    },

    createUser: async (root, args) => {
      const user = new User({ ...args });
      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };
      const token = jwt.sign(userForToken, process.env.JWT_SECRET);

      return { value: token };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
