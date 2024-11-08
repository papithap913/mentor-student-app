const express = require('express');
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');

const router = express.Router();

// 1. Create Mentor
router.post('/mentors', async (req, res) => {
  try {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).json(mentor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Create Student
router.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Assign Student to Mentor
router.put('/assign-student', async (req, res) => {
  const { studentId, mentorId } = req.body;
  try {
    const student = await Student.findById(studentId);
    const mentor = await Mentor.findById(mentorId);

    if (!student || !mentor) {
      return res.status(404).json({ error: 'Student or Mentor not found' });
    }

    // Update student's mentor history
    if (student.mentor) {
      student.previousMentors.push(student.mentor);
    }

    student.mentor = mentor._id;
    await student.save();

    mentor.students.push(student._id);
    await mentor.save();

    res.status(200).json({ message: 'Student assigned to mentor' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Change Mentor for a Student
router.put('/change-mentor', async (req, res) => {
  const { studentId, newMentorId } = req.body;
  try {
    const student = await Student.findById(studentId);
    const newMentor = await Mentor.findById(newMentorId);

    if (!student || !newMentor) {
      return res.status(404).json({ error: 'Student or Mentor not found' });
    }

    if (student.mentor) {
      student.previousMentors.push(student.mentor);
    }

    student.mentor = newMentor._id;
    await student.save();

    res.status(200).json({ message: 'Mentor changed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Get All Students for a Mentor
router.get('/mentors/:id/students', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate('students');
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    res.status(200).json(mentor.students);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Get Previously Assigned Mentor for a Student
router.get('/students/:id/previous-mentors', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('previousMentors');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json(student.previousMentors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
