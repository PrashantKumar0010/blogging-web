import person from '../model/user.model.js';
import bcrypt from 'bcrypt';
import { setUser } from '../service/auth.js';
import blog from '../model/blog.model.js';
import { name } from 'ejs';
// these are the static routers 
export async function ShowHomeHandler(req, res) {
    const allData = await blog.find({
        visibility: 'public' 
    })
    if (req.user) {
        return res.render('home', {
            role: req.user.role,
            allData: allData,
            name: req.user.FullName,
            title: 'Home Page'
        })
    }
    else {
        return res.render('home', {
            role: 'Guest',
            allData: allData,
            title: 'Home Page'
        });
    }
}

export async function RegisterUserHandler(req, res) {
    return res.render('register', { title: 'Register Page' });
}
export async function LoginUserHandler(req, res) {
    return res.render('login', { title: 'Login Page' });
}
// router for sigh up

export async function RegisterPersonHandler(req, res) {
    try {
        const { FullName, email, password } = req.body;

        // Check for missing fields
        if (!FullName || !email || !password) {
            return res.status(400).send({ error: 'All fields are required' });
        }
        const isAvailable = await person.findOne({ email });

        if (isAvailable) {
            return res.status(400).send({ error: 'Email is already in use' });
        }

        const newUser = await person.create({
            FullName,
            email,
            password,
        })
        return res.redirect('/')
    } catch (error) {
        // const { status, message } = handleError(error);
        // res.send({ status, message });
        console.log('error', error);
        res.json({ error: 'something is wrong: ' })
    }
}
// router for login/
export async function LoginPersonHandler(req, res) {
    try {
        const { Gmail, Password } = req.body;
        // Find the user by email
        const user = await person.findOne({ email: Gmail });
        if (!user) {
            return res.render('login', {
                error: 'incorrect email '
            })
        }
        // Check if the password matches
        const isMatch = await bcrypt.compare(Password, user.password);
        if (!isMatch) {
            return res.render('login', {
                error: 'incorrect password'
            })
        }

        const token = setUser(user)
        return res.cookie('token', token).redirect('/');
    } catch (error) {
        console.error('Internal error:', error);
        res.render('login', {
            error: 'incorrect username or password'
        })
    }
}

export async function LogOutHandler(req, res) {
    res.clearCookie('token');
    res.redirect('/');
}
export async function AdminHandler(req, res) {
    try {
        const user = await person.find({})
        res.render('admin', {
            users: user,
            name: req.user.FullName
        })
    } catch (error) {
        console.log(error)
        res.render('home')
    }
}
export async function UserEditHandler(req, res) {
    const id = req.params.id
    const user = await person.findById(id)
    res.render('edit-user', {
        user: user
    })
}
export async function UserDeleteHandler(req, res) {
    const id = req.params.id
    const user = await person.findByIdAndDelete(id)
    res.render('deleteUser', {
        user: user
    })
}
export async function UserUpdateHandler(req, res) {
    try {
        const id = req.params.id;
        // Prepare update object
        const updateData = {
            FullName: req.body.name,
            email: req.body.email
        };
        // Hash the password if it's provided
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            updateData.password = hashedPassword;
        }

        // Find the user by ID and update
        const updatedUser = await person.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            // Handle user not found case
            return res.status(404).render('error', { message: 'User not found' });
        }

        res.redirect('/admin');
    } catch (error) {
        console.log(error);
        res.status(500).render('error', { message: 'An error occurred while updating the user' });
    }
}
export async function SettingHandler(req, res) {

    return res.render('settings', {
        user: req.user
    })
}