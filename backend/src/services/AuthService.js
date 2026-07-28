import { User } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { generateAccessAndRefreshTokens } from '../helpers/token.helper.js';

class AuthService {
  async registerStudent(studentData) {
    const existingStudent = await User.findOne({
      $or: [{ email: studentData.email }, { rollNumber: studentData.rollNumber }]
    });
    if (existingStudent) {
      throw new ApiError(409, 'Student with this email or roll number already exists');
    }
    
    const student = await User.create({ ...studentData, role: 'student' });
    const studentObj = student.toObject();
    delete studentObj.password;
    return studentObj;
  }

  async loginUser(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new ApiError(401, 'Invalid email or password');
    
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, 'Invalid email or password');
    
    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    
    return { user: userObj, accessToken, refreshToken };
  }

  async registerOrganizer(organizerData) {
    const existing = await User.findOne({ email: organizerData.email });
    if (existing) {
      throw new ApiError(409, 'Organizer with this email already exists');
    }
    
    const organizer = await User.create({ ...organizerData, role: 'organiser' });
    const organizerObj = organizer.toObject();
    delete organizerObj.password;
    return organizerObj;
  }
}

export const authService = new AuthService();
