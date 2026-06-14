const fs = require('fs');
const crypto = require('crypto');

// Names to generate realistic emails and names
const firstNames = ["Lam", "Thanh", "Minh", "Hoang", "Tuan", "Anh", "Linh", "Trang", "Huong", "Duc", "Kien", "Son", "Hai", "Phuong", "Dung", "Hoa", "Lan", "Nga", "Quang", "Long"];
const lastNames = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Vo", "Dang", "Bui", "Do", "Ho", "Ngo", "Duong", "Ly"];

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsers() {
    let sql = "INSERT INTO user (id, username, password, first_name, last_name, dob, role, current_plan, created_at, status, phone_number) VALUES\n";
    let values = [];
    
    // BCrypt Hash for '123456'
    const passwordHash = "$2a$10$fWJ.A.X.vXyI6T2j0T1N.e3e2b1/I9hD1M2U8rM5M4u6m1eY1c6F6";

    // 80 USERs
    for (let i = 0; i < 80; i++) {
        const id = crypto.randomUUID();
        const fName = randomChoice(firstNames);
        const lName = randomChoice(lastNames);
        const num = Math.floor(Math.random() * 100000);
        const username = `${fName.toLowerCase()}${lName.toLowerCase()}${num}@gmail.com`;
        const dob = `199${Math.floor(Math.random() * 10)}-0${Math.floor(Math.random() * 8) + 1}-1${Math.floor(Math.random() * 8) + 1}`;
        const role = 'USER';
        const plan = 'FREE';
        const createdAt = '2026-06-13';
        const status = 'ACTIVE';
        const phone = `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

        values.push(`('${id}', '${username}', '${passwordHash}', '${fName}', '${lName}', '${dob}', '${role}', '${plan}', '${createdAt}', '${status}', '${phone}')`);
    }

    // 20 SALONs
    for (let i = 0; i < 20; i++) {
        const id = crypto.randomUUID();
        const fName = randomChoice(firstNames);
        const lName = randomChoice(lastNames);
        const num = Math.floor(Math.random() * 100000);
        const username = `${fName.toLowerCase()}${lName.toLowerCase()}${num}salon@gmail.com`;
        const dob = `198${Math.floor(Math.random() * 10)}-0${Math.floor(Math.random() * 8) + 1}-1${Math.floor(Math.random() * 8) + 1}`;
        const role = 'SALON';
        const plan = 'FREE';
        const createdAt = '2026-06-13';
        const status = 'ACTIVE';
        const phone = `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

        values.push(`('${id}', '${username}', '${passwordHash}', '${fName}', '${lName}', '${dob}', '${role}', '${plan}', '${createdAt}', '${status}', '${phone}')`);
    }

    sql += values.join(",\n") + ";\n";
    
    fs.writeFileSync('d:/nailform3d be-fe/fake_data_100_users.sql', sql, { encoding: 'utf8' });
    console.log("SQL script generated at d:/nailform3d be-fe/fake_data_100_users.sql");
}

generateUsers();
