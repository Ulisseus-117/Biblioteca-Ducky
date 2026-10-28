/**
 * Genera el hash bcrypt de una contraseña, útil para insertar usuarios a mano.
 * Uso: npm run hash -- MiContrasena
 */
import bcrypt from 'bcryptjs';

const contrasena = process.argv[2];
if (!contrasena) {
  console.error('Uso: npm run hash -- <contraseña>');
  process.exit(1);
}
console.info(bcrypt.hashSync(contrasena, 10));
