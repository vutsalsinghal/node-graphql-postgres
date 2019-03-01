
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('calorie-spent').del()
    .then(function () {
      // Inserts seed entries
      return knex('calorie-spent').insert([
        { user_id: 1, spent: 400 },
        { user_id: 2, spent: 600 }
      ]);
    });
};
