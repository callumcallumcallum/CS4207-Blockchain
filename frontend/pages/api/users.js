import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function createUser(req, res) {
  let body;
  try {
    body = await parseBody(req);
    console.log("Parsed body:", body);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { username, password, isTeacher, email } = body;

  if (!username || !password || isTeacher === undefined || !email) {
    console.error("Validation failed:", body);
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        name: username,
        password,
        isTeacher,
        email,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function updateUser(req, res) {
  let body;
  try {
    body = await parseBody(req);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { username: updateUsername, password: updatePassword, isTeacher: updateIsTeacher, email: updateEmail } = body;
  try {
    const updatedUser = await prisma.user.update({
      where: { name: req.query.username },
      data: {
        name: updateUsername,
        password: updatePassword,
        isTeacher: updateIsTeacher,
        email: updateEmail,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(404).json({ error: 'User not found' });
  }
}

async function deleteUser(req, res) {
  try {
    await prisma.user.delete({
      where: { name: req.query.username },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(404).json({ error: 'User not found' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await createUser(req, res);
  } else if (req.method === 'GET') {
    await getUsers(req, res);
  } else if (req.method === 'PUT') {
    await updateUser(req, res);
  } else if (req.method === 'DELETE') {
    await deleteUser(req, res);
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}