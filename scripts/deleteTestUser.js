const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const emailToDelete = 'arjzenimato1706@gmail.com';

try {
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const filteredUsers = users.filter(u => u.email !== emailToDelete);
  
  if (users.length === filteredUsers.length) {
    console.log('User not found or already deleted.');
  } else {
    fs.writeFileSync(usersPath, JSON.stringify(filteredUsers, null, 2));
    console.log(`Successfully deleted user: ${emailToDelete}`);
  }
} catch (error) {
  console.error('Error deleting user:', error);
}
