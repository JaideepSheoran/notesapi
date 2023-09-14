const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const authuser = require('../middleware/authuser');

require('../db/conn'); // db connection

const User = require('../model/userSchema');
const Notebook = require('../model/noteSchema');

router.get('/', (req, res) => {
    res.send('<h1>Home Page</h1>');
});

router.post('/authuser', async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json(422, { message: "Empty Fields !" });
    }
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json(422, { message: "Incorrect Email or Password" });
        }
        const isUser = await bcrypt.compare(password, user.password);
        if (!isUser) {
            return res.json(422, { message: "Incorrect Email or Password" });
        }
        user.getAuthToken();
        res.cookie("Token", user.token, {
            maxAge: 900000,
            httpOnly: true
        });
        return res.json(200, { name: user.name, email: user.email, work: user.work, phone: user.phone });
    } catch (error) {
        console.log(error);
    }

});

router.post('/adduser', async(req, res) => {
    const { name, email, phone, work, password } = req.body;
    if (!name || !email || !phone || !work || !password) {
        return res.json(421, { message: "Empty Fields" })
    }
    try {
        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.json(422, { message: "Email/Username already present." });
        }
        const user = new User(req.body);
        const regStatus = await user.save();
        if (regStatus) {
            return res.status(201).json({ message: "Added Succesfully!" });
        } else {
            return res.status(500).json({ message: "Failed to Add User" });
        }
    } catch (error) {
        console.log(error);
    }
});

router.post('/register', (req, res) => {
    const { name, email, phone, work, password } = req.body;
    if (!name || !email || !phone || !work || !password) {
        return res.status(422).json({ error: "Empty Fields" })
    }
    User.findOne({ email: email })
        .then((userExist) => {
            if (userExist) {
                return res.status(422).json({ error: "Email/Username already present." });
            }
            const user = new User(req.body);
            user.save()
                .then(() => {
                    res.status(201).json({ message: "Registered Succesfully!" });
                })
                .catch((err) => {
                    res.status(500).json({ error: "Failed :(" });
                })
        }).catch(err => console.log(err));
});

router.get('/logout', (req, res) => {
    res.clearCookie('Token');
    res.status(200).send({ message: 'Logged Out Successfully.' });
});

router.get('/about', authuser, (req, res) => {
    res.send(req.rootUser);
});

router.get('/contact', authuser, (req, res) => {
    res.send(req.rootUser);
});

router.post('/searchnote', async(req, res) => {
    const { user, tags } = req.body;
    if (!tags || !user) {
        return res.status(421).json({ message: "Empty Fields." });
    }
    try {
        const tagsArray = tags.replace(/\s+/g, '').split(',').filter((value, index, arr) => {
            if (value == '') {
                return false;
            } else {
                return true;
            }
        });
        let searchedContent = [];
        for (let i = 0; i < tagsArray.length; i++) {

            var data = await Notebook.findOne({
                user: user
            }, {
                notes: {
                    $filter: {
                        input: "$notes",
                        as: "note",
                        cond: {
                            $in: [
                                `${tagsArray[i]}`,
                                "$$note.tags"
                            ]
                        }
                    }
                }
            });
            if (data.notes.length !== 0)
                searchedContent = searchedContent.concat(data);
        }
        const hashmap = new Map();
        for (const element of searchedContent) {
            for (const e of element.notes) {
                hashmap.set(`${e._id}`, e);
            }
        }

        let reqData = [];
        for (const [key, value] of hashmap) {
            reqData.push(value);
        }

        return res.status(200).json({ data: reqData });

    } catch (error) {
        console.log(error);
    }
});

router.post('/addnote', async(req, res) => {
    const { user, title, tags, note } = req.body;
    if (!user || !title || !tags || !note) {
        return res.status(421).json({ message: "Empty Fields" })
    }
    try {
        const tagsArray = tags.replace(/\s+/g, '').split(',').filter((value, index, arr) => {
            if (value == '') {
                return false;
            } else {
                return true;
            }
        });
        const userExist = await Notebook.findOne({ user: user });
        if (userExist) {
            userExist.notes.unshift({
                title: title,
                tags: tagsArray,
                note: note
            });
            const isAdded = await userExist.save();
            if (isAdded) {
                return res.status(200).send({ message: 'Added Successfully.' });
            } else {
                return res.status(500).send({ message: "Can't add note." });
            }
        }
        const mynote = {
            user: user,
            notes: [{
                title: title,
                tags: tagsArray,
                note: note
            }]
        }
        const notebook = new Notebook(mynote);
        const regStatus = await notebook.save();
        if (regStatus) {
            return res.status(201).json({ message: "Note Added Succesfully!" });
        } else {
            return res.status(500).json({ message: "Failed to Add Note" });
        }
    } catch (error) {
        console.log(error);
    }
});


router.post('/delete', async(req, res) => {
    const { user, noteid } = req.body;
    if (!user || !noteid) {
        return res.status(404).send({ message: `Error : Unable to delete Note !!!` });
    }
    try {
        const data = await Notebook.updateMany({ user: user }, {
            $pull: {
                notes: {
                    '_id': noteid
                }
            }
        });
        if (!data) res.status(404).send({ message: "Error : Can't Delete !!! " });
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
    }
});

router.post('/getnotes', async(req, res) => {
    const { user } = req.body;
    if (!user) {
        return res.status(404).send({ message: `Undefined User ${user}` });
    }
    try {
        const userPresent = await Notebook.findOne({ user: user });
        if (!userPresent) {
            return res.status(500).send({ message: 'Add Your First Note' });
        } else {
            return res.status(200).send(userPresent);
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/signup', (req, res) => {
    res.send('<h1>SignUp Page</h1>');
});

router.get('/signin', (req, res) => {
    res.send('<h1>SignIn Page</h1>');
});

module.exports = router;