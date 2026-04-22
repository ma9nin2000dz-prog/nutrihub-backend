router.post('/register', async (req, res) => {

  const { name, email, password, role } = req.body;

  const user = new User({
    name,
    email,
    password,
    role
  });

  await user.save();

  res.json({
    message: "User created successfully"
  });
});