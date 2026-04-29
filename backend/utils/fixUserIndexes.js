const User = require("../models/User");

async function fixUserIndexes() {
  const collection = User.collection;

  // Clean old documents that store an empty roll number so sparse indexing works correctly.
  await collection.updateMany(
    { rollNumber: "" },
    {
      $unset: {
        rollNumber: 1,
      },
    }
  );

  const indexes = await collection.indexes();
  const rollNumberIndex = indexes.find((index) => index.name === "rollNumber_1");

  if (rollNumberIndex && !rollNumberIndex.sparse) {
    await collection.dropIndex("rollNumber_1");
  }

  await User.syncIndexes();
}

module.exports = { fixUserIndexes };
