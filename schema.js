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

const CalorieType = new GraphQLObjectType({
  name: "Calorie",
  fields: () => ({
    id: { type: GraphQLString },
    user_id: { type: GraphQLInt },
    amount: { type: GraphQLInt },
  })
})

// Root query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentValue, args) {
        var res = await knex.select().table("user")
        return res
      }
    },
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLInt }
      },
      async resolve(parentValue, args) {
        var res = await knex.select().table("user")
        for (var i = 0; i < data.length; i++) {
          if (data[i].id == args.id) {
            return data[i]
          }
        }
        return res
      }
    },
    getCalorieIntake: {
      type: CalorieType,
      args: {
        uid: { type: new GraphQLNonNull(GraphQLInt) }
      },
      async resolve(parentValue, args) {
        var res = await knex.select().table("calorie-intake").where("user_id", args.uid)
        return { id: res[0].id, user_id: res[0].user_id, amount: res[0].intake }
      }
    },
    getCalorieSpent: {
      type: CalorieType,
      args: {
        uid: { type: new GraphQLNonNull(GraphQLInt) }
      },
      async resolve(parentValue, args) {
        var res = await knex.select().table("calorie-spent").where("user_id", args.uid)
        return { id: res[0].id, user_id: res[0].user_id, amount: res[0].spent }
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
      async resolve(parentValue, args) {
        var res = await knex("user").insert({ username: args.username, password: args.password })
        return { username: args.username, password: args.password }
      }
    },
    addCalorieIntake: {
      type: CalorieType,
      args: {
        uid: { type: new GraphQLNonNull(GraphQLInt) },
        amount: { type: new GraphQLNonNull(GraphQLInt) }
      },
      async resolve(parentValue, args) {
        let currentIntake = await knex.select("id", "intake").table("calorie-intake").where("user_id", args.uid)
        let res = await knex("calorie-intake").where("user_id", '=', args.uid).update({ intake: currentIntake[0].intake + args.amount }, ["id", "user_id", "intake"])
        return { id: res[0].id, user_id: res[0].user_id, amount: res[0].intake }
      }
    },
    addCalorieSpent: {
      type: CalorieType,
      args: {
        uid: { type: new GraphQLNonNull(GraphQLInt) },
        amount: { type: new GraphQLNonNull(GraphQLInt) }
      },
      async resolve(parentValue, args) {
        let currentSpent = await knex.select("id", "spent").table("calorie-spent").where("user_id", args.uid)
        let res = await knex("calorie-spent").where("user_id", '=', args.uid).update({ spent: currentSpent[0].spent + args.amount }, ["id", "user_id", "spent"])
        return { id: res[0].id, user_id: res[0].user_id, amount: res[0].spent }
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutationQuery
});