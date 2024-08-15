const express = require('express');
const { dbRun, dbQuery, getGameData, searchGame } = require('./utils');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { login, password } = req.body;
    // Checa se o login já existe
    const data = await dbQuery("SELECT id FROM users WHERE login = ?", [login]);
    if (data.length) {
        res.json({ success: false });
    } else {
        // Cria o usuário no DB
        await dbRun("INSERT INTO users (login, password) VALUES(?, ?)", [login, password]);
        res.json({ success: true });
    }
});

router.post('/login', async (req, res) => {
    const { login, password } = req.body;
    // Busca um usuário com o login e senha fornecidos
    const data = await dbQuery("SELECT id FROM users WHERE login = ? AND password = ?", [login, password]);
    if (data.length) {
        // Retorna um token base64 do ID do usuário
        res.json({ success: true, token: btoa(data[0].id) });
    } else {
        res.json({ success: false });
    }
});

router.get('/search', async (req, res) => {
    const query = req.query.query;
    const data = await searchGame(query);
    res.json(data);
});

router.get('/reviews', async (req, res) => {
    // Decodifica o token base64 do cabeçalho, obtendo o id do usuário
    const user_id = atob(req.headers.authorization);
    // Obtém as reviews do usuário
    const data = await dbQuery("SELECT id, game_id, review FROM reviews WHERE user_id = ?", [user_id]);
    const reviews = [];
    // Para cada review, busca os dados do jogo e adiciona ao array de reviews
    for (const { id, game_id, review } of data) {
        const { name, short_description, capsule_image } = await getGameData(game_id);
        reviews.push({
            id,
            title: name,
            description: short_description,
            image: capsule_image,
            review
        });
    }
    res.json(reviews);
});

router.get('/reviews/:id', async (req, res) => {
    const id = req.params.id;
    const data = await dbQuery("SELECT game_id, review FROM reviews WHERE id = ?", [id]);
    const { name, capsule_image } = await getGameData(data[0].game_id);
    if (data.length) {
        res.json({ 
            name,
            tiny_image: capsule_image,
            review: data[0].review
        });
    } else {
        res.json({});
    }
});

router.post('/reviews', async (req, res) => {
    const user_id = atob(req.headers.authorization);
    const { game_id, review } = req.body;
    await dbRun("INSERT INTO reviews (user_id, game_id, review) VALUES(?, ?, ?)", [user_id, game_id, review]);
    res.json({ success: true });
});

router.put('/reviews/:id', async (req, res) => {
    const user_id = atob(req.headers.authorization);
    const { review } = req.body;
    const id = req.params.id;
    await dbRun("UPDATE reviews SET review = ? WHERE id = ? AND user_id = ?", [review, id, user_id]);
    res.json({ success: true });
});

router.delete('/reviews/:id', async (req, res) => {
    const user_id = atob(req.headers.authorization);
    const id = req.params.id;
    if (user_id == 1) {
        await dbRun("DELETE FROM reviews WHERE id = ?", [id]);
    } else {
        await dbRun("DELETE FROM reviews WHERE id = ? AND user_id = ?", [id, user_id]);
    }
    res.json({ success: true });
});

router.get('/users', async (req, res) => {
    const user_id = atob(req.headers.authorization);
    const query = req.query.query;
    if (user_id == 1) {
        const data = await dbQuery("SELECT id, login FROM users WHERE login LIKE ?", [`%${query}%`]);
        res.json(data);
    } else {
        res.json([]);
    }
});

router.get('/users/:id/reviews', async (req, res) => {
    // Decodifica o token base64 do cabeçalho, obtendo o id do usuário
    const user_id = atob(req.headers.authorization);
    const id = req.params.id;
    if (user_id == 1) {
        // Obtém as reviews do usuário
        const data = await dbQuery("SELECT id, game_id, review FROM reviews WHERE user_id = ?", [id]);
        const reviews = [];
        // Para cada review, busca os dados do jogo e adiciona ao array de reviews
        for (const { id, game_id, review } of data) {
            const { name, capsule_image } = await getGameData(game_id);
            reviews.push({
                id,
                title: name,
                image: capsule_image,
                review
            });
        }
        res.json(reviews);
    } else {
        res.json([]);
    }
});

router.delete('/users/:id', async (req, res) => {
    const user_id = atob(req.headers.authorization);
    const id = req.params.id;

    // Checa se é o admin
    if (user_id == 1) {
        await dbRun("DELETE FROM users WHERE id = ?", [id]);
        await dbRun("DELETE FROM reviews WHERE user_id = ?", [id]);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

module.exports = router;