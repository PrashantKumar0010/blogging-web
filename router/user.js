import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import { 
    ShowHomeHandler, RegisterUserHandler, LoginUserHandler, 
    RegisterPersonHandler, LoginPersonHandler, LogOutHandler, 
    AdminHandler, UserEditHandler, UserDeleteHandler, 
    UserUpdateHandler, SettingHandler 
} from '../controller/user.js';

import { 
    AddBlogPageHandler, AddBlogHandle, ShowAllBlogsHandler, 
    showFullBlog, showBlog, CommentHandler, SearchHandler, likeBlog
} from '../controller/blog.js';

import { cookieCheckHandler, restriction } from '../middleware/authentication.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.resolve('./public/uploads/')),// FOR REMOTE DATA BASE
    // destination: (req, file, cb) => cb(null, './public/upload/'), // FOR LOCAL DATA BASE
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

const router = Router();

// User-related routes
router.get('/', ShowHomeHandler);
router.get('/register', RegisterUserHandler);
router.post('/register', RegisterPersonHandler);
router.get('/login', LoginUserHandler);
router.post('/login', LoginPersonHandler);
router.get('/logout', LogOutHandler);

// Admin routes with authentication and role-based access control
router.get('/admin', cookieCheckHandler(), restriction(['admin']), AdminHandler);
router.route('/admin/edit/:id')
    .get(cookieCheckHandler(), restriction(['admin']), UserEditHandler)
    .post(cookieCheckHandler(), restriction(['admin']), UserUpdateHandler);
router.get('/admin/delete/:id', cookieCheckHandler(), restriction(['admin']), UserDeleteHandler);
router.get('/settings', cookieCheckHandler(), restriction(['admin']), SettingHandler);

// Blog-related routes with authentication for adding blogs
router.get('/addBlog', AddBlogPageHandler);
router.post('/addingBlog', upload.single('image'), (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    AddBlogHandle(req, res, next);
});
router.get('/allBlogs', ShowAllBlogsHandler);
router.get('/allBlogs/blogs/:id', showBlog);
router.get('/posts/:id', showBlog);
router.post('/posts/comment/:id', cookieCheckHandler(), CommentHandler); // Authentication added for commenting
router.get('/search', SearchHandler); 
router.post('/blog/:id/like', likeBlog);
export default router;
