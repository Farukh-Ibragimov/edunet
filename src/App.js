import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { CourseProvider } from './context/CourseContext';
import { JsonAuthProvider } from './context/JsonAuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import MyCoursesPage from './pages/MyCoursesPage';
import MyCoursePage from './pages/MyCoursePage';
import StudentCoursePage from './pages/StudentCoursePage';
import TeacherCoursePage from './pages/TeacherCoursePage';
import CourseInformationPage from './pages/CourseInformationPage';
import CourseEditPage from './pages/CourseEditPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <JsonAuthProvider>
      <UserProvider>
        <CourseProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/my-courses" element={<MyCoursesPage />} />
                  <Route path="/my-course/:id" element={<MyCoursePage />} />
                  <Route path="/student-course/:id" element={<StudentCoursePage />} />
                  <Route path="/teacher-course/:id" element={<TeacherCoursePage />} />
                  <Route path="/course/:id" element={<CourseInformationPage />} />
                  <Route path="/edit-course/:courseId" element={<CourseEditPage />} />
                  <Route path="/register" element={<RegistrationPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CourseProvider>
      </UserProvider>
    </JsonAuthProvider>
  );
}

export default App; 