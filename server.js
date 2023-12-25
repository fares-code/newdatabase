const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const ejs = require('ejs');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'fares6867',
  database: 'check_user',
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('MySQL connected');
  }
});

const universityDb = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'fares6867',
  database: 'university',
  port: 3306,
});
// MIDDEL WARES0
// Add a middleware to check if the user is not an admin
const checkUser = (req, res, next) => {
  const { username, password } = req.body;

  // Check if the user is not the admin
  if (!(username === 'admin' && password === 'admin')) {
    return next();
  } else {
    res.status(403).send('Forbidden: Admins cannot access this page');
  }
};

// Apply the checkUser middleware to the /user route
app.use('/user', checkUser);
universityDb.connect((err) => {
  if (err) {
    console.error('University MySQL connection error:', err);
  } else {
    console.log('University MySQL connected');
  }
});

const saltRounds = 10;

// Middleware to check if the user is an admin
const checkAdmin = (req, res, next) => {
  const { username, password } = req.body;

  // Check if the user is the admin
  app.get('/you need to be admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'youadmin.html'));
});
  if (username === 'admin' && password === 'admin' && role === 'admin') {
    return next();
  } else {
    res.status(403).redirect('/you need to be admin');
  }// Check if the user is not the admin
  if (!(username === 'admin' && password === 'admin' && role ==='admin')) {
    return next();
  } else {
    res.status(403).send('Forbidden: Admins cannot access this page');
  }

};

//GETS METHODS

app.get('/user/courses', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inert_course_user.html'));
});
  
app.get('/admin', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'admin.html');
  res.sendFile(filePath);
});
// Route for regular users
app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});
app.get('/tryagin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tryagin.html'));
  
});
app.get('/erropage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'erorrpage.html'));
  
});
app.get('/sucsesspage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','succespage.html'));
  
});
app.get('/admincannot', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','admincannot.html'));
});
app.get('/admin/insert', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'insert.html'));
});
app.get('/user/faculty',(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inser_faculty_user.html'))
});
// Route for inserting department
app.get('/user/department', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inserted_department_student.html'));
});
// Route for inserting courses
app.get('/admin/course', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'insert_course.html'));
});
// Route for inserting staff
app.get('/admin/insert/staff', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'insert_staff.html'));
});
// Route for rendering the student insertion form
app.get('/admin/insert/student', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'insert_student.html'));
}); 

// Route to display student information
app.get('/student/:studentId', (req, res) => {
  const studentId = req.params.studentId;

  // Fetch student data from the database
  const query = 'SELECT * FROM student WHERE student_id = ?';
  universityDb.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('University MySQL query error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Render the EJS page with the student data
    res.render('student.ejs', { student: results[0] });
  });
});



//POSTS ROUTES

app.post('/login', (req, res) => {
  const { username, password ,role} = req.body;

  // Check if the user is the admin
  if (username === 'admin' && password === 'admin'&& role==='admin') {
    // Redirect to the admin dashboard page
    res.redirect('/admin');
  } else {
    // For regular users, you can continue with the database query
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.redirect('/tryagin');
        return;
      }

      if (results.length > 0) {
        const hashedPassword = results[0].password;

        // Compare the hashed password
        bcrypt.compare(password, hashedPassword, (bcryptErr, bcryptResult) => {
          if (bcryptErr) {
            console.error('Password comparison error:', bcryptErr);
            res.redirect('/tryagin');
            return;
          }

          if (bcryptResult) {
            const isAdmin = results[0].role === 'admin';

            if (isAdmin) {
              // Redirect to the admin dashboard page
              res.redirect('/admin');
            } else {
              // For regular users, you can redirect them to a different page
              res.redirect('/user');
            }
          } else {
            res.redirect('/tryagin');
          }
        });
      } else {
        res.redirect('/tryagin');
      }
    });
  }
});

app.post('/register', (req, res) => {
  const { username, password, role } = req.body;

  if (role !== 'user') {
    res.status(403).redirect('/admincannot');
    return;
  }

  // Hash the password
  bcrypt.hash(password, saltRounds, (hashErr, hash) => {
    if (hashErr) {
      console.error('Password hashing error:', hashErr);
      res.status(500).redirect('/tryagin');
      return;
    }

    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.query(query, [username, hash, role], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).redirect('/tryagin')
        return;
      }

      res.redirect('/');
    });
  });
});

app.post('/admin/insert', (req, res) => {
  const { faculty_name, zip, street, city, country } = req.body;

  const query = 'INSERT INTO faculty (faculty_name, zip, street, city, country) VALUES (?, ?, ?, ?, ?)';
  universityDb.query(query, [faculty_name, zip, street, city, country], (err, results) => {
    if (err) {
      console.error('University MySQL query error:', err);
      res.status(500).redirect('/erropage');
      return;
    }

    res.redirect('/user/faculty');
  });
});

app.post('/user/faculty', (req, res) => {
  const { faculty_name, zip, street, city, country } = req.body;

  const query = 'INSERT INTO faculty (faculty_name, zip, street, city, country) VALUES (?, ?, ?, ?, ?)';
  universityDb.query(query, [faculty_name, zip, street, city, country], (err, results) => {
    if (err) {
      console.error('University MySQL query error:', err);
      res.status(500).redirect('/erropage');
      return;
    }

    res.redirect('/user/faculty');
  });
});

app.post('/user/courses', (req, res) => {
  const { course_id, student_id } = req.body;

  const query = 'INSERT INTO enrollment ( student_id, course_id) VALUES (?, ?)';
  
  universityDb.query(query, [student_id, course_id], (err, results) => {
    if (err) {
      console.error('University MySQL query error:', err);
      res.status(500).redirect('/erropage');
      return;
    }

    res.redirect('/user/courses');
  });
});

app.post('/user/department', (req, res) => {
  const {  department_id,department_name } = req.body;

  const query = 'INSERT INTO department ( department_id,department_name) VALUES (?, ?)';
  universityDb.query(query, [ department_id,department_name], (err, results) => {
    if (err) {
      console.error('University MySQL query error:', err);
      res.status(500).redirect('/erropage');
      return;
    }

    res.redirect('/user/department');
  });
});

app.post('/admin/insert/course', (req, res) => {
  const { course_id, course_name, credit_hours } = req.body;

  const query = 'INSERT INTO course (course_id, course_name, credit_hours) VALUES (?, ?, ?)';
  universityDb.query(query, [course_id, course_name, credit_hours], (err, results) => {
    if (err) {
      console.error('University MySQL query error:', err);
      res.status(500).redirect('/erropage');
      return;
    }

    res.redirect('/admin/course')
  });
});

app.post('/admin/insert/staff', (req, res) => {
  const { staff_id, first_name, middle_name, last_name, university_email, password, birth_date, salary } = req.body;

  const query = 'INSERT INTO staff (staff_id, first_name, middle_name, last_name, university_email, password, birth_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  //orm
  universityDb.query(
    query,
    [staff_id, first_name, middle_name, last_name, university_email, password, birth_date, salary],
    (err, results) => {
      if (err) {
        console.error('University MySQL query error:', err);
        res.status(500).redirect('/erropage');
        return;
      }

      res.redirect('/admin/insert/staff');
    }
  );
});



// Route for handling the student insertion form submission
app.post('/admin/insert/student', (req, res) => {
  const { student_id, first_name, middle_name, last_name, birth_date, university_email, password, cgpa, department_id, faculty_name } = req.body;

  const query = 'INSERT INTO student (student_id, first_name, middle_name, last_name, birth_date, university_email, password, cgpa, department_id, faculty_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  universityDb.query(
    query,
    [student_id, first_name, middle_name, last_name, birth_date, university_email, password, cgpa, department_id, faculty_name],
    (err, results) => {
      if (err) {
        console.error('University MySQL query error:', err);
        res.status(500).redirect('/erropage');
        return;
      }

      res.redirect('/admin/insert/student'); // Redirect to the student insertion form
    }
  );
});




app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

