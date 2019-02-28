
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('calorie-intake').del()
    .then(function () {
      // Inserts seed entries
      return knex('calorie-intake').insert([
        { user_id: 1, intake: 500 },
        { user_id: 2, intake: 1000 }
      ]);
    });
};
