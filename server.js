const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose
  .connect(
    "mongodb+srv://jgcleite:JGLC1710@cluster0.xiqqp.mongodb.net/?authSource=admin&retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Conectado ao MongoDB Atlas"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

// Modelo para o Convidado
const Guest = mongoose.model("Guest", {
  name: String,
  rsvp: String,
  drink: [String],
  inviteId: String,
});

// Rota para buscar informações do convidado com base no ID
app.get("/invite/:inviteId", async (req, res) => {
  try {
    const { inviteId } = req.params;
    const guest = await Guest.findOne({ inviteId });
    if (!guest) {
      return res.status(404).send("Convidado não encontrado");
    }
    res.json(guest);
  } catch (err) {
    res.status(500).send("Erro ao buscar o convidado");
  }
});

// Rota para salvar as bebidas selecionadas por um convidado
app.post("/invite/:inviteId/rsvp", async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { rsvp, drink } = req.body;

    const guest = await Guest.findOneAndUpdate(
      { inviteId },
      { rsvp, drink }, // Atualiza RSVP e bebidas
      { new: true, upsert: true } // Atualiza ou cria se não existir
    );

    res.json(guest);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao salvar os dados de RSVP e bebidas");
  }
});

// Rota para criar um novo convite (apenas para fins de teste)
app.post("/invite", async (req, res) => {
  try {
    const { name, inviteId } = req.body;
    const newGuest = new Guest({ name, inviteId });
    await newGuest.save();
    res.status(201).json(newGuest);
  } catch (err) {
    res.status(500).send("Erro ao criar o convite");
  }
});

app.delete("/invite/:inviteId", async (req, res) => {
  try {
    const { inviteId } = req.params;
    const guest = await Guest.findOneAndDelete({ inviteId });

    if (!guest) {
      return res.status(404).send("Convidado não encontrado");
    }

    res.status(200).send(`Convidado com inviteId ${inviteId} foi excluído`);
  } catch (err) {
    res.status(500).send("Erro ao excluir o convidado");
  }
});

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});
