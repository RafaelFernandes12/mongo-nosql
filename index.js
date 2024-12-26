const express = require('express');
const req = require('express/lib/request');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conexão com MongoDB bem-sucedida!'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));


function createDynamicSchema(jsonInput){
  const buildingDynamic = {}
  Object.keys(jsonInput).forEach(key =>{
    if(typeof jsonInput[key] == "string"){
      console.log("a")
      buildingDynamic[key] = {type: String}
    }
    if(typeof jsonInput[key] == "number"){
      buildingDynamic[key] = Number
    }
  })
  return buildingDynamic
}

app.post('/:dynamic', async (req, res)=>{
  const { dynamic } = req.params;

  //extraindo os tipos do json da entidade criada
  const schema = createDynamicSchema(req.body);
  console.log(schema);
  const collectionSchema = new mongoose.Schema(schema);
  //books, {"name": "Poor things", "description": "an awesome book"}
  const Entity = mongoose.model(`${dynamic}`, collectionSchema);

  try {

    //criando o documento do post inicial
    const collection = new Entity(req.body);
    const savedCollection = await collection.save();


    res.status(201).json(savedCollection);
    console.log(savedCollection)

  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar entidade'});
    console.log('Erro ao criar entidade');
  }
});

app.get('/', async(req, res)=>{
  const collectionsName = await mongoose.connection.db.listCollections().toArray();
  let everyCollection = "";
  try{
    for(value in collectionsName){
      everyCollection = everyCollection + collectionsName[value].name + " "
    }
    res.send(everyCollection)
    console.log(collectionsName)
  }
  catch(error){
    res.status(500).json({ error: 'Erro ao listar entidades do banco'});
    console.log('Erro ao listar entidades do banco');
  }
})
app.get('/:dynamic/:value', async(req, res)=>{
  const{dynamic, value} =  req.params
  const idSearched = await mongoose.connection.db.collection(dynamic).find().toArray()
  try{
    if(idSearched.length==0){
      res.send("Coleção vazia")
    }
    else{
      for(index in idSearched){
        if(index+1==Number(value)){
          console.log(idSearched[index])
          res.send(idSearched[index])
        }
      }
    }
  }catch(error){
    res.status(500).json({ error: 'Erro ao listar por id'});
    console.log('Erro ao listar por id');
  }
})


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
