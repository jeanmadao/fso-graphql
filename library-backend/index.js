const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Author = require("./models/author");
const Book = require("./models/book");
const { GraphQLError } = require("graphql");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount(author: String): Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`;

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
  },
  Author: {
    bookCount: async (root) => Book.countDocuments({ author: root.id }),
  },
  Book: {
    author: ({ author }) => {
      return { id: author.id, name: author.name, born: author.born };
    },
  },
  Mutation: {
    addBook: async (root, args) => {
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
        author = await new Author({ name: args.author }).save();
      }

      const book = await new Book({ ...args, author: author.id }).save();
      return book.populate("author");
    },

    editAuthor: async (root, args) => {
      const updatedAuthor = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo }
      );
      if (!updatedAuthor)
        throw new GraphQLError("Author not found", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
          },
        });

      return updatedAuthor;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
