const knex = require("./db/knex")

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = require("graphql");

// UserType
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    username: { type: GraphQLString },
    password: { type: GraphQLString }
  })
})

// Root query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        var res = knex.select().table("user").then((data, err) => {
          return data
        });
        return res
      }
    },
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLInt }
      },
      resolve(parentValue, args) {
        var res = knex.select().table("user").then((data, err) => {
          for (var i = 0; i < data.length; i++) {
            if (data[i].id == args.id) {
              return data[i]
            }
          }
        });
        return res
      }
    }
  }
});

// Muatation
const mutationQuery = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, args) {
        var res = knex("user").insert({ username: args.username, password: args.password }).then((data, err) => {
          console.log(data);
          return data
        });
        return res
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutationQuery
});