// importing modules 
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path=require('path');
const cors = require('cors');

const app = express();
// setting cors policy
app.use(cors());

//rendering frontend
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


const PORT = 5000;

// reading data 
let students;
try {
    students = JSON.parse(fs.readFileSync('student.json', 'utf8'));
} catch (error) {
    console.error('Error reading file:', err.message);
}
// save the data back to file
function saveInFile() {
    fs.writeFileSync('student.json', JSON.stringify(students, null, 2), 'utf8');
}

// parser setup
app.use(bodyParser.json());

// get Api to get all students
app.get('/getAllStudent', (req, res) => {
    try {
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({error: "unable to fetch all student"});
    }
});

// Api to search student by name
app.get('/getAllOnSearch', (req, res) => {
    try {
        const query = req.query.name;
        console.log(query); 
        const result = students.filter(student => student.fullName.toLowerCase().includes(query.toLowerCase()));
        // console.log(result);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({error: "error in serching records"})
    }
});

// Update the details of student
app.post('/updateStudent/', (req, res) => {
    try {
        const studentId = req.body.id;
        const updatedData = req.body.updatedStu;
        console.log(updatedData)
        // verify all values are entered correctly
        for (let key in updatedData) {
            if (updatedData[key] === null || updatedData[key] === undefined || updatedData[key] === '') {
                res.json({error:'please fill all the fields'});
        }  
    }
        // find the indec of student and update it 
        const studentIndex = students.findIndex(student => student.id === studentId);
        if (studentIndex !== -1) {
            console.log(updatedData);
          students[studentIndex] = {...updatedData,id:studentId};
          console.log("THIS IS A UPDATE", students[studentIndex]);
          saveInFile();
          res.status(200).json(students);
        } else {
          res.status(404).json({ error: 'student not found.' });
        }
    } catch (error) {
        res.status(500).json({error: "error updating student"})
    }
  });

  // delete student details 
  app.delete('/delete/:id', (req, res) => {
    try {
        const studentId = req.params.id;
        students = students.filter(student => student.id !== parseInt(studentId));
        saveInFile();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({error: " error deleting student"})
    }
  });

  // sort students
  app.post('/filterstudent',(req,res)=>
  {
    try {
        const option=req.body.option;
        console.log(students);

        // any one will run based on condition
        if(option=="nameAsc")
        {
            console.log("ara h");
            const nameAsc = students.sort((a,b)=>
            {
                return a.fullName.localeCompare(b.fullName);
            });
            
            res.status(200).json(nameAsc);
        }
        else if(option=="nameDesc")
        {
            const nameDesc = students.sort((a,b)=>
            {
                return b.fullName.localeCompare(a.fullName);
            });
            res.status(200).json(nameDesc);
        }
        else if(option=="marksLow")
        {
            const marksLow = students.sort((a,b)=>
            {
                return a.marks-b.marks;
            });
            res.status(200).json(marksLow);
        }
        else if(option=="marksHigh")
        {
            const marksHigh = students.sort((a,b)=>
            {
                return b.marks-a.marks;
            });
            res.status(200).json(marksHigh);
        }
    } catch (error) {
        res.status(500).json({error: "error in sorting"});
    } 
  });

  // calculate average marks of student 
  app.get('/calcutateAvgSal', (req, res) => {
    // check if no student is present
    if (students.length === 0) {
      res.json({ error: 'Number of students are zero' });
    } else {
      let averagemarks =  students.reduce((acc, student) => acc + parseInt(student.marks), 0);
      averagemarks=averagemarks/students.length;
      res.json( {averagemarks:averagemarks.toFixed(2)});
    }
  });


  // start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
