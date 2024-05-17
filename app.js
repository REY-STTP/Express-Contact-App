const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts } = require('./utils/contacts')
const { body, validationResult, check } = require('express-validator')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const app = express()
const port = 3000

// Gunakan ejs
app.set('view engine', 'ejs');

// Third-Party Middleware
app.use(expressLayouts);

// Built in Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Flash
app.use(cookieParser('secret'));
app.use(
     session({
          cookie: { maxAge: 6000 },
          secret: 'secret',
          resave: true,
          saveUninitialized: true,
     })
);
app.use(flash());

// Layout
app.get('/', (req, res) => {
     res.render('index', {
          title: 'Home',
          layout: 'layouts/main-layouts.ejs',
     });
});

app.get('/about', (req, res) => {
     res.render('about', {
          title: 'About',
          layout: 'layouts/main-layouts.ejs',
     });
});

app.get('/contact', (req, res) => {
     const contacts = loadContact();

     res.render('contact', {
          title: 'Contact',
          layout: 'layouts/main-layouts.ejs',
          contacts,
          msg: req.flash('msg'),
     });
});

// Halaman form tambah data contact
app.get('/contact/add', (req, res) => {

     res.render('add-contact', {
          title: 'Form Tambah Data Contact',
          layout: 'layouts/main-layouts.ejs',
     });
});

// Proses data contact
app.post('/contact', 
[
     body('nama').custom((value) => {
          const duplikat = cekDuplikat(value);
          if (duplikat) {
               throw new Error('Nama contact telah digunakan.');
          }
          return true;
     }),
     check('email', 'Email tidak valid.').isEmail(),
     check('noHP', 'No HP tidak valid.').isMobilePhone('id-ID'),
],
(req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          // return res.status(400).json({ errors: errors.array() });

          res.render('add-contact', {
               title: 'Form Tambah Data Contact',
               layout: 'layouts/main-layouts.ejs',
               errors: errors.array(),
          });
     } else {
          addContact(req.body);
          // Kirimkan flash massage
          req.flash('msg', `Data contact ${req.body.nama} berhasil ditambahkan!`); 
          res.redirect('/contact');
     }
});

// Proses delete contact
app.get('/contact/delete/:nama', (req, res) => {
     const contact = findContact(req.params.nama);

     // Jika contact tidak ada
     if (!contact) {
          res.status(404);
          res.send('Error 404: Nama contact tidak ditemukan!');
     } else {
          deleteContact(req.params.nama);
          req.flash('msg', `Data contact ${req.params.nama} berhasil dihapus!`); 
          res.redirect('/contact');
     }
});

// Form ubah data contact
app.get('/contact/edit/:nama', (req, res) => {
     const contact = findContact(req.params.nama);

     res.render('edit-contact', {
          title: 'Form Ubah Data Contact',
          layout: 'layouts/main-layouts.ejs',
          contact,
     });
});

// Proses ubah data contact
app.post('/contact/update', 
[
     body('nama').custom((value, { req }) => {
          const duplikat = cekDuplikat(value);
          if (value !== req.body.oldNama && duplikat) {
               throw new Error('Nama contact telah digunakan.');
          }
          return true;
     }),
     check('email', 'Email tidak valid.').isEmail(),
     check('noHP', 'No HP tidak valid.').isMobilePhone('id-ID'),
],
(req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          // return res.status(400).json({ errors: errors.array() });

          res.render('edit-contact', {
               title: 'Form Ubah Data Contact',
               layout: 'layouts/main-layouts.ejs',
               errors: errors.array(),
               contact: req.body,
          });
     } else {
          updateContacts(req.body);
          // Kirimkan flash massage
          req.flash('msg', `Data contact ${req.body.nama} berhasil diubah!`); 
          res.redirect('/contact');
     }
});

// Halaman Detail Contact
app.get('/contact/:nama', (req, res) => {
     const contact = findContact(req.params.nama);

     res.render('detail', {
          title: 'Halaman Detail Contact',
          layout: 'layouts/main-layouts.ejs',
          contact,
     });
});

 // Middleware untuk menangani halaman 404
 app.use((req, res) => {
     res.status(404);
     res.render('error-msg', {
         title: 'Error 404',
         layout: 'error-msg.ejs',
     });
 });

app.listen(port, () => {
  console.log(`Contact application listening at (http://localhost:${port})`)
});