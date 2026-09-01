import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter admin password to hash: ', (password) => {
  if (!password) {
    console.error('Password cannot be empty');
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 12);
  console.log('\nAdd this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);

  rl.close();
});