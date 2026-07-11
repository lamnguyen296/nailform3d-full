const mysql = require('mysql2/promise');

async function updateDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'identity_service'
  });
  
  await connection.execute("UPDATE subscription_plan_entity SET price = 1999000 WHERE code = 'STUDIO_5'");
  console.log("Database updated successfully");
  await connection.end();
}

updateDb().catch(console.error);
