exports.up = function (knex, Promise) {
  return knex.schema.createTable("friend", (table) => {
    table.integer("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE")
      .index();
    table.integer("friend_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable("friend");
};
