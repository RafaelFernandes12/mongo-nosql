const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conexão com MongoDB bem-sucedida!'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));




app.post('/:dynamic', async (req, res)=>{
  const { dynamic } = req.params;
  const collectionSchema = new mongoose.Schema(JSON.parse(req.body));
  const User = mongoose.model({dynamic}, collectionSchema);

  try {
    const everything = req.body;
    const collection = new User(everything);
    const savedCollection = await collection.save();


    res.status(201).json(savedCollection);

  } catch (err) {
    console.error('Erro ao criar usuario:', err);
    res.status(500).json({ error: 'Erro ao criar collection' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const { name, age } = req.body;
    const foundUser = await User.findOne({ _id: req.params.id });
    const newUser = new User({ name, age });
    foundUser.name = newUser.name
    foundUser.age = newUser.age
    const savedUser = await foundUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Erro ao criar usuario:', err);
    res.status(500).json({ error: 'Erro ao criar usuario' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const query = req.query.query ? JSON.parse(req.query.query) : {};
    const limit = parseInt(req.query.limit) || 10; // Limite padrão de 10
    const skip = parseInt(req.query.skip) || 0
    const users = await User.find(query).limit(limit).skip(skip);
    const total = await User.countDocuments(query);
    res.status(200).json({
      data: users,
      pagination: {
          total,
          limit,
          skip,
      },
  });
  } catch (err) {
    console.error('Erro ao listar usuarios:', err);
    res.status(500).json({ error: 'Erro ao listar usuarios' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
