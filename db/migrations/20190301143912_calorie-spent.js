exports.up = function (knex, Promise) {
  return knex.schema.createTable("calorie-spent", (table) => {
    table.increments();
    table.integer("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE")
      .defaultTo(0)
      .index();
    table.integer("spent");
    table.timestamps(true, true);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable("calorie-spent");
};
