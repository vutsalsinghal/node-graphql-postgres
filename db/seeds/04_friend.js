
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('friend').del()
    .then(function () {
      // Inserts seed entries
      return knex('friend').insert([
        { user_id: 1, friend_id: 2 },
        { user_id: 2, friend_id: 1 },
      ]);
    });
};
