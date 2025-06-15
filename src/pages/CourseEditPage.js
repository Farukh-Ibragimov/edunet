import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Upload, Image, Trash2 } from 'lucide-react';
import { useJsonAuth } from '../context/JsonAuthContext';

const categories = ['Technology', 'Design', 'Languages', 'Business', 'Creativity', 'Professions'];

const CourseEditPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useJsonAuth();
  const isNewCourse = courseId === 'new';
  
  const [course, setCourse] = useState(null);
  const [newContent, setNewContent] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isNewCourse) {
      setCourse({
        id: null,
        title: '',
        description: '',
        price: 0,
        duration: '',
        maxStudents: null,
        category: 'Technology',
        image: '',
        content: [],
        requirements: [],
        outcomes: [],
        qrCode: ''
      });
      setImagePreview('');
    } else {
      // Load specific course data from JSON Server
      const loadCourseFromServer = async () => {
        try {
          const response = await fetch(`http://localhost:3003/courses/${courseId}`);
          if (!response.ok) {
            throw new Error('Course not found');
          }
          const courseData = await response.json();
          // Convert server course format to edit format
          setCourse({
            id: courseData.id,
            title: courseData.title,
            description: courseData.description,
            price: courseData.price,
            duration: courseData.duration,
            maxStudents: courseData.maxStudents,
            category: courseData.category,
            image: courseData.image,
            content: courseData.lessons?.map(lesson => lesson.title) || [],
            requirements: [], // Not stored in server format, will be empty
            outcomes: [], // Not stored in server format, will be empty
            qrCode: courseData.qrCode || ''
          });
          setImagePreview(courseData.image);
        } catch (error) {
          console.error('Error loading course:', error);
          navigate('/my-courses');
        }
      };
      loadCourseFromServer();
    }
  }, [courseId, isNewCourse, navigate]);

  const addCourseToServer = async (courseData) => {
    try {
      const newCourse = {
        title: courseData.title,
        description: courseData.description,
        teacher: user.name,
        teacherId: user.id,
        category: courseData.category,
        price: courseData.price,
        duration: courseData.duration,
        maxStudents: courseData.maxStudents || null,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        rating: 0,
        reviews: 0,
        students: 0,
        level: 'Beginner',
        status: 'not-started',
        image: courseData.image,
        lessons: courseData.content.map((content, index) => ({
          id: index + 1,
          title: content,
          duration: '45 minutes',
          completed: false
        })),
        qrCode: courseData.qrCode || '',
        createdAt: new Date().toISOString()
      };

      const addResponse = await fetch('http://localhost:3003/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse),
      });

      if (!addResponse.ok) {
        throw new Error('Failed to add course to server');
      }

      const addedCourse = await addResponse.json();
      return addedCourse.id;
    } catch (error) {
      console.error('Error adding course to server:', error);
      throw error;
    }
  };

  const updateCourseOnServer = async (courseId, courseData) => {
    try {
      // Get the existing course to preserve server-specific fields
      const response = await fetch(`http://localhost:3003/courses/${courseId}`);
      if (!response.ok) {
        throw new Error('Course not found');
      }
      const existingCourse = await response.json();

      // Update the course data while preserving server fields
      const updatedCourse = {
        ...existingCourse,
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        price: courseData.price,
        duration: courseData.duration,
        maxStudents: courseData.maxStudents || null,
        image: courseData.image,
        lessons: courseData.content.map((content, index) => ({
          id: index + 1,
          title: content,
          duration: '45 minutes',
          completed: false
        })),
        qrCode: courseData.qrCode || '',
      };

      // Update course on JSON Server
      const updateResponse = await fetch(`http://localhost:3003/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCourse),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update course on server');
      }

      return courseId;
    } catch (error) {
      console.error('Error updating course on server:', error);
      throw error;
    }
  };

  const deleteCourseFromServer = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3003/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course from server');
      }

      return true;
    } catch (error) {
      console.error('Error deleting course from server:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!course.title.trim()) {
      alert('Please enter a course title');
      return;
    }

    setIsSaving(true);
    try {
      if (isNewCourse) {
        // Add new course to JSON Server
        const newId = await addCourseToServer(course);
        console.log('Added new course with ID:', newId);
      } else {
        // Update existing course on JSON Server
        const updatedId = await updateCourseOnServer(courseId, course);
        console.log('Updated course with ID:', updatedId);
      }
      navigate('/my-courses');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (file) => {
    console.log('Handling image upload:', file);
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('FileReader result:', e.target.result);
        const newImageUrl = e.target.result;
        setImagePreview(newImageUrl);
        setCourse(prev => ({ ...prev, image: newImageUrl }));
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Invalid file type:', file?.type);
      alert('Please select a valid image file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    console.log('Dropped files:', files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    console.log('File input selected:', file);
    if (file) {
      handleImageUpload(file);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const addContent = () => {
    if (newContent.trim()) {
      setCourse(prev => ({
        ...prev,
        content: [...prev.content, newContent.trim()]
      }));
      setNewContent('');
    }
  };

  const removeContent = (index) => {
    setCourse(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setCourse(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setCourse(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addOutcome = () => {
    if (newOutcome.trim()) {
      setCourse(prev => ({
        ...prev,
        outcomes: [...prev.outcomes, newOutcome.trim()]
      }));
      setNewOutcome('');
    }
  };

  const removeOutcome = (index) => {
    setCourse(prev => ({
      ...prev,
      outcomes: prev.outcomes.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async () => {
    if (!course.id) {
      alert('Cannot delete a course that has not been saved yet');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this course? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCourseFromServer(course.id);
      console.log('Deleted course with ID:', course.id);
      navigate('/my-courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/my-courses')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-text-dark">
            {isNewCourse ? 'Create New Course' : 'Edit Course'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Course'}
          </button>
          {!isNewCourse && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete Course'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Course Title</label>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  placeholder="Enter course title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Description</label>
                <textarea
                  value={course.description}
                  onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  placeholder="Describe what students will learn in this course"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={course.price}
                    onChange={(e) => setCourse(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-1">Duration</label>
                  <input
                    type="text"
                    value={course.duration}
                    onChange={(e) => setCourse(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    placeholder="e.g., 12 weeks"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-1">Max Students</label>
                  <input
                    type="number"
                    value={course.maxStudents || ''}
                    onChange={(e) => setCourse(prev => ({ ...prev, maxStudents: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-1">Category</label>
                  <select
                    value={course.category}
                    onChange={(e) => setCourse(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* QR Code Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-text-gray mb-2">Payment QR Code</label>
                <div className="space-y-3">
                  {course.qrCode && (
                    <div className="relative">
                      <img 
                        src={course.qrCode} 
                        alt="Payment QR Code" 
                        className="w-32 h-32 object-contain border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => setCourse(prev => ({ ...prev, qrCode: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <input
                    type="url"
                    value={course.qrCode || ''}
                    onChange={(e) => setCourse(prev => ({ ...prev, qrCode: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    placeholder="Enter QR code URL (e.g., https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT_URL)"
                  />
                  <p className="text-xs text-text-gray">
                    Enter the URL of your payment QR code. You can generate QR codes using services like QR Server or similar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">What Will Be Taught</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addContent()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  placeholder="Add what students will learn..."
                />
                <button
                  onClick={addContent}
                  className="btn-primary px-4 py-2"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {course.content.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{item}</span>
                    <button
                      onClick={() => removeContent(index)}
                      className="p-1 hover:bg-red-100 rounded-full text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  placeholder="Add requirement..."
                />
                <button
                  onClick={addRequirement}
                  className="btn-primary px-4 py-2"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {course.requirements.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{item}</span>
                    <button
                      onClick={() => removeRequirement(index)}
                      className="p-1 hover:bg-red-100 rounded-full text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Learning Outcomes</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOutcome()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  placeholder="Add learning outcome..."
                />
                <button
                  onClick={addOutcome}
                  className="btn-primary px-4 py-2"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {course.outcomes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{item}</span>
                    <button
                      onClick={() => removeOutcome(index)}
                      className="p-1 hover:bg-red-100 rounded-full text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Image */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Course Image</h3>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Course preview" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Preview
                  </div>
                </div>
              )}
              
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary-purple bg-primary-purple/10' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop an image here, or click to select
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn-secondary cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose Image
                </label>
              </div>
              
              {imageFile && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Selected:</strong> {imageFile.name}
                  <br />
                  <strong>Size:</strong> {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                  <br />
                  <strong>Type:</strong> {imageFile.type}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Preview</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Title:</strong> {course.title || 'Not set'}</div>
              <div><strong>Price:</strong> ${course.price}</div>
              <div><strong>Duration:</strong> {course.duration || 'Not set'}</div>
              <div><strong>Category:</strong> {course.category}</div>
              <div><strong>Content Items:</strong> {course.content.length}</div>
              <div><strong>Requirements:</strong> {course.requirements.length}</div>
              <div><strong>Outcomes:</strong> {course.outcomes.length}</div>
              <div><strong>Image:</strong> {imageFile ? 'Custom uploaded' : 'Default'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEditPage; 