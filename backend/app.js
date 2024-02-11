// importing modules 
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path=require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//rendering frontend
app.use(express.static(path.join(__dirname,'build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'build', 'index.html'));
});


const PORT = 5000;

// reading data 
let students;
 students = JSON.parse(fs.readFileSync('student.json', 'utf8'));

function saveInFile() {
    fs.writeFileSync('student.json', JSON.stringify(students, null, 2), 'utf8');
}


app.get('/getStudent', (req, res) => {
    try {
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({error: "unable to fetch all student"});
    }
});

app.get('/getSearch', (req, res) => {
    try {
        const query = req.query.name;
        const result = students.filter(student => student.fullName.toLowerCase().includes(query.toLowerCase()));
        // console.log(result);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({error: "error in serching records"})
    }
});

const getHighestStudentID = (students) => {
    let highestID = 0;
  
    students.forEach((student) => {
      const studentID = parseInt(student.id, 10);
      console.log(studentID);
      if (studentID > highestID) {
        highestID = studentID;
      }
    });
    console.log(highestID);
  
    return highestID;
  };

app.post('/addStudent',(req,res)=>{
    try{
        const addedStu=req.body;
        console.log(addedStu);
        const id=getHighestStudentID(students)+1;
        console.log(id);
        students.push({
            id: id,
            "fullName": addedStu.fullName,
            "age": addedStu.age,
            "dob": addedStu.dob,
            "class": addedStu.class,
            "marks": addedStu.marks,
            "grade": addedStu.grade

        })
        saveInFile();
        res.status(200).json(students);
    }catch (error) {
        res.status(500).json({error: "error adding student"})
    }
})

app.post('/updateStudent', (req, res) => {
    try {
        const studentId = req.body.id;
        const updatedData = req.body.updatedStu;
        for (let key in updatedData) {
            if (updatedData[key] === null || updatedData[key] === undefined || updatedData[key] === '') {
                res.json({error:'please fill all the fields'});
        }  
    }
        const studentIndex = students.findIndex(student => student.id === studentId);
        if (studentIndex !== -1) {
            console.log(updatedData);
            students[studentIndex] = {...updatedData,id:studentId};
            saveInFile();
            res.status(200).json(students);
         } else {
            res.status(404).json({ error: 'student not found.' });
        }
    } catch (error) {
        res.status(500).json({error: "error updating student"})
    }
  });

  
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

  
  app.post('/filterstudent',(req,res)=>
  {
    try {
        const option=req.body.option;
        if(option==="Name(A-Z)")
        {
            const Ascdata = students.sort((a,b)=>
            {
                return a.fullName.localeCompare(b.fullName);
            });
            
            res.status(200).json(Ascdata);
        }
        else if(option==="Name(Z-A)")
        {
            const Dscdata = students.sort((a,b)=>
            {
                return b.fullName.localeCompare(a.fullName);
            });
            res.status(200).json(Dscdata);
        }
        else if(option==="Lowestmarks")
        {
            const Lowdata = students.sort((a,b)=>
            {
                return a.marks-b.marks;
            });
            res.status(200).json(Lowdata);
        }
        else if(option==="Highestmarks")
        {
            const Highdata = students.sort((a,b)=>
            {
                return b.marks-a.marks;
            });
            res.status(200).json(Highdata);
        }
    } catch (error) {
        res.status(500).json({error: "error in sorting"});
    } 
  });
 
  app.get('/calcutateAvg', (req, res) => {
    if (students.length === 0) {
      res.json({ error: 'Number of students are zero' });
    } else {
      let averagemarks =  students.reduce((acc, student) => acc + parseInt(student.marks), 0);
      averagemarks=averagemarks/students.length;
      res.json( {averagemarks:averagemarks.toFixed(2)});
    }
  });


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});