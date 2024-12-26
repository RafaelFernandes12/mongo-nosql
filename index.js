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
  try{
    const collectionsName = await mongoose.connection.db.listCollections().toArray();
    let everyCollection = "";
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
  try{
    const{dynamic, value} =  req.params
    let objectId = new mongoose.Types.ObjectId(value);
    const idSearched = await mongoose.connection.db.collection(dynamic).findOne({_id: objectId})
    if(idSearched == null){
      res.send("Nenhum documento foi encontrado")
    }
    else{
      console.log(idSearched)
      res.send(idSearched)
    }
  }catch(error){
    res.status(500).json({ error: 'Erro ao listar por id'});
    console.error(error);
  }
})


app.put('/:dynamic/:id', async (req, res) => {
  const { dynamic, id } = req.params;

  //extraindo os tipos do json da entidade criada
  const schema = createDynamicSchema(req.body);
  const collectionSchema = new mongoose.Schema(schema);
  //books, {"name": "Poor things", "description": "an awesome book"}
  const Entity = mongoose.model(`${dynamic}`, collectionSchema);

  try {

    const updatedObject = await Entity.findByIdAndUpdate(
      id,
      req.body
    );

    res.send("Documento atualizado" + updatedObject);
    console.log("Documento atualizado" + updatedObject)

  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar documento'});
    console.error('Erro ao atualizar documento', err);
  }
})

app.get('/:dynamic', async (req, res) => {
  try {
    const {dynamic} = req.params
    const query = req.query.query ? JSON.parse(req.query.query) : {};
    const limit = parseInt(req.query.limit) || 10; 
    const skip = parseInt(req.query.skip) || 0;   

    const buscaPaginada = await mongoose.connection.db.collection(dynamic)
      .find(query)
      .limit(limit)
      .skip(skip)
      .toArray();

    if(buscaPaginada.length==0){
      res.send("Nenhum elemento retornado")
    }
    else{
      for(index in buscaPaginada){
          console.log(buscaPaginada[index])
          res.send(buscaPaginada[index])
      }
    }
  }catch (err) {
    res.status(500).json({err});
    console.error(err);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
