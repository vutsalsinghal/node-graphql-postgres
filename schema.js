require('dotenv').config()
const knex = require("./db/knex")
const _ = require("lodash")

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
      async resolve(parentValue, args, { session }) {
        if (!session.user) {
          throw new Error("Not logged in!");
        } else {
          var res = await knex.select().table("user").where("id", session.user.id)
          return res[0]
        }
      }
    },
    getCalorieIntake: {
      type: CalorieType,
      async resolve(parentValue, args, { session }) {
        if (!session.user) {
          throw new Error("Not logged in!");
        } else {
          var res = await knex.select().table("calorie-intake").where("user_id", session.user.id)
          return { id: res[0].id, user_id: res[0].user_id, amount: res[0].intake }
        }
      }
    },
    getCalorieSpent: {
      type: CalorieType,
      async resolve(parentValue, args, { session }) {
        if (!session.user) {
          throw new Error("Not logged in!");
        } else {
          let res = await knex.select().table("calorie-spent").where("user_id", session.user.id)
          return { id: res[0].id, user_id: res[0].user_id, amount: res[0].spent }
        }
      }
    },
    getFriends: {
      type: new GraphQLList(UserType),
      async resolve(parentValue, args, { session }) {
        if (!session.user) {
          throw new Error("Not logged in!");
        } else {
          let friends = await knex.select("friend_id").table("friend").where("user_id", session.user.id)
          let result = [];
          for (let i = 0; i < friends.length; i++) {
            let res = await knex.select().table("user").where("id", friends[i].friend_id)
            result.push({ id: res[0].id, username: res[0].username });
          }
          return result
        }
      }
    }
  }
});

// Muatation
const mutationQuery = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    register: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parentValue, args, { session }) {
        if (!session.user) {
          let res = await knex("user").insert({ username: args.username, password: args.password }, ["id", "username", "password"])
          await knex("calorie-intake").insert({ user_id: res[0].id, intake: 0 })
          await knex("calorie-spent").insert({ user_id: res[0].id, spent: 0 })
          return { username: res[0].username, id: res[0].id, password: res[0].password }
        } else {
          throw new Error("Already registered/loggedin!");
        }
      }
    },
    login: {
      type: GraphQLString,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parentValue, args, { session }) {
        console.log(session);
        let checkUser = await knex.select().table("user").where("username", args.username)
        if (session.user) {
          throw new Error("Already Logged in!");
        } else if (!checkUser.length > 0) {
          throw new Error("User doesn't exist!");
        } else if (checkUser[0].password !== args.password) {
          throw new Error("Password doesn't match!");
        }
        session.user = _.pick(checkUser[0], ["id", "username"]);
        return "Successfully Loggedin!"
      }
    },
    logout: {
      type: GraphQLString,
      async resolve(parentValue, args, { session }) {
        console.log(session);
        if (!session.user) {
          throw new Error("Not logged in!");
        }
        session.user = null;
        return "Successfully Logged out!"
      }
    },
    addCalorieIntake: {
      type: CalorieType,
      args: {
        amount: { type: new GraphQLNonNull(GraphQLInt) }
      },
      async resolve(parentValue, args, { session }) {
        if (session.user) {
          let currentIntake = await knex.select("id", "intake").table("calorie-intake").where("user_id", session.user.id)
          let res = await knex("calorie-intake").where("user_id", '=', session.user.id).update({ intake: currentIntake[0].intake + args.amount }, ["id", "user_id", "intake"])
          return { id: res[0].id, user_id: res[0].user_id, amount: res[0].intake }
        } else {
          throw new Error("Not logged in!");
        }
      }
    },
    addCalorieSpent: {
      type: CalorieType,
      args: {
        amount: { type: new GraphQLNonNull(GraphQLInt) }
      },
      async resolve(parentValue, args, { session }) {
        if (session.user) {
          let currentSpent = await knex.select("id", "spent").table("calorie-spent").where("user_id", session.user.id)
          let res = await knex("calorie-spent").where("user_id", '=', session.user.id).update({ spent: currentSpent[0].spent + args.amount }, ["id", "user_id", "spent"])
          return { id: res[0].id, user_id: res[0].user_id, amount: res[0].spent }
        } else {
          throw new Error("Not logged in!");
        }
      }
    },
    addfriend: {
      type: GraphQLString,
      args: {
        fid: { type: new GraphQLNonNull(GraphQLInt) }
      },
      async resolve(parentValue, args, { session }) {
        if (session.user) {
          if (session.user.id == args.fid) {
            throw new Error("uid cannot be equal to fid!");
          } else {
            let isFriend = await knex.select("user_id", "friend_id").table("friend").where({ user_id: session.user.id, friend_id: args.fid })
            if (isFriend.length === 1) {
              throw new Error("Is an existing friend!");
            } else {
              await knex("friend").insert({ user_id: session.user.id, friend_id: args.fid })
              await knex("friend").insert({ user_id: args.fid, friend_id: session.user.id })
            }
          }
          return "Friend added!"
        } else {
          throw new Error("Not logged in!");
        }
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutationQuery
});