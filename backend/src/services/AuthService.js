import { studentRepository } from '../repositories/StudentRepository.js';
import { organizerRepository } from '../repositories/OrganizerRepository.js';
import ApiError from '../utils/ApiError.js';
import { generateAccessAndRefreshTokens } from '../helpers/token.helper.js';

class AuthService {
  async registerStudent(studentData) {
    const existingStudent = await studentRepository.checkExists(studentData.email, studentData.rollNumber);
    if (existingStudent) {
      throw new ApiError(409, 'Student with this email or roll number already exists');
    }
    
    const student = await studentRepository.create(studentData);
    student.password = undefined;
    return student;
  }

  async loginStudent(email, password) {
    const student = await studentRepository.findByEmailWithPassword(email);
    if (!student) throw new ApiError(401, 'Invalid email or password');
    
    const isPasswordValid = await student.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, 'Invalid email or password');
    
    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(student._id, student.role);
    student.refreshToken = refreshToken;
    await student.save({ validateBeforeSave: false });
    
    student.password = undefined;
    student.refreshToken = undefined;
    
    return { user: student, accessToken, refreshToken };
  }

  async registerOrganizer(organizerData) {
    const existing = await organizerRepository.checkExists(organizerData.email, organizerData.employeeRollNumber);
    if (existing) {
      throw new ApiError(409, 'Organizer with this email or roll number already exists');
    }
    
    const organizer = await organizerRepository.create(organizerData);
    organizer.password = undefined;
    return organizer;
  }
}

export const authService = new AuthService();
