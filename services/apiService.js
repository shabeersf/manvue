import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, getApiUrl } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  // Add basic authentication
  auth: {
    username: API_CONFIG.BASIC_AUTH.USERNAME,
    password: API_CONFIG.BASIC_AUTH.PASSWORD
  }
});

// Request interceptor to add auth headers
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth key if required
    if (API_CONFIG.AUTH_KEY) {
      config.headers['Auth-Key'] = API_CONFIG.AUTH_KEY;
    }

    // Add JWT token if available
    try {
      const token = await SecureStore.getItemAsync('jwt_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Failed to get token from SecureStore:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          clearStoredToken();
          break;
        case 422:
          // Validation errors
          break;
        case 500:
          // Server error
          break;
        default:
          break;
      }

      return Promise.reject(data || error.response);
    } else if (error.request) {
      // Network error
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'network_error'
      });
    } else {
      // Other error
      return Promise.reject({
        message: 'Something went wrong. Please try again.',
        type: 'unknown_error'
      });
    }
  }
);

// Token management functions using SecureStore
export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync('jwt_token');
  } catch (error) {
    console.log('Failed to get token from SecureStore:', error);
    return null;
  }
};

export const setStoredToken = async (token) => {
  try {
    await SecureStore.setItemAsync('jwt_token', token);
    return true;
  } catch (error) {
    console.log('Failed to store token:', error);
    return false;
  }
};

export const clearStoredToken = async () => {
  try {
    await SecureStore.deleteItemAsync('jwt_token');
    return true;
  } catch (error) {
    console.log('Failed to clear token:', error);
    return false;
  }
};

// User type management functions using SecureStore
export const getStoredUserType = async () => {
  try {
    return await SecureStore.getItemAsync('user_type');
  } catch (error) {
    console.log('Failed to get user type from SecureStore:', error);
    return null;
  }
};

export const setStoredUserType = async (userType) => {
  try {
    await SecureStore.setItemAsync('user_type', userType);
    return true;
  } catch (error) {
    console.log('Failed to store user type:', error);
    return false;
  }
};

export const clearStoredUserType = async () => {
  try {
    await SecureStore.deleteItemAsync('user_type');
    return true;
  } catch (error) {
    console.log('Failed to clear user type:', error);
    return false;
  }
};

// User ID management functions using SecureStore
export const getStoredUserId = async () => {
  try {
    return await SecureStore.getItemAsync('user_id');
  } catch (error) {
    console.log('Failed to get user ID from SecureStore:', error);
    return null;
  }
};

export const setStoredUserId = async (userId) => {
  try {
    await SecureStore.setItemAsync('user_id', userId.toString());
    return true;
  } catch (error) {
    console.log('Failed to store user ID:', error);
    return false;
  }
};

export const clearStoredUserId = async () => {
  try {
    await SecureStore.deleteItemAsync('user_id');
    return true;
  } catch (error) {
    console.log('Failed to clear user ID:', error);
    return false;
  }
};

// API Service class
class ApiService {
  // Test signup with simple JSON first
  async testSignup(userData) {
    try {
      console.log('🧪 Testing simple JSON signup...');
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.SIGNUP, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data.data,
        token: response.data.jwt_token,
        message: response.data.message
      };
    } catch (error) {
      console.log('🧪 JSON test failed, trying FormData...');
      return null; // Fall back to FormData method
    }
  }

  // Signup API
  async signup(userData) {
    try {
      // First try simple JSON if userData is not FormData
      if (!(userData instanceof FormData)) {
        const jsonResult = await this.testSignup(userData);
        if (jsonResult) return jsonResult;
      }

      // If userData is already FormData, use it directly, otherwise create new FormData
      let formData;
      if (userData instanceof FormData) {
        formData = userData;
      } else {
        formData = new FormData();
        // Add all form fields
        Object.keys(userData).forEach(key => {
          if (key === 'skills' && Array.isArray(userData[key])) {
            // Handle skills array
            userData[key].forEach((skill, index) => {
              formData.append(`skills[${index}][skill_name]`, skill.skill_name);
              formData.append(`skills[${index}][proficiency]`, skill.proficiency || 'intermediate');
              formData.append(`skills[${index}][years_of_experience]`, skill.years_of_experience || 0);
            });
          } else if (key === 'profile_image' && userData[key]) {
            // Handle profile image
            formData.append('profile_image', userData[key]);
          } else if (userData[key] !== null && userData[key] !== undefined) {
            formData.append(key, userData[key]);
          }
        });
      }

      // Log the FormData contents for debugging
      if (__DEV__) {
        console.log('🚀 Signup FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.SIGNUP, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      // Store JWT token if provided
      if (response.data.jwt_token) {
        setStoredToken(response.data.jwt_token);
      }

      // Store user type and user ID for routing
      if (response.data.data) {
        if (response.data.data.user_type) {
          setStoredUserType(response.data.data.user_type);
        }
        if (response.data.data.user_id) {
          setStoredUserId(response.data.data.user_id);
        }
      }

      return {
        success: true,
        data: response.data.data,
        token: response.data.jwt_token,
        message: response.data.message
      };
    } catch (error) {
      // Enhanced error logging
      if (__DEV__) {
        console.log('❌ Signup API Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
          console.log('❌ Error Response Headers:', error.response.headers);
        } else if (error.request) {
          console.log('❌ Error Request:', error.request);
        } else {
          console.log('❌ Error Message:', error.message);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Signup failed'],
        message: error.response?.data?.message || error.data?.message || 'Registration failed',
        data: error.response?.data || null
      };
    }
  }

  // Employer Signup API
  async employerSignup(companyData) {
    try {
      if (__DEV__) {
        console.log('🏢 Employer Signup Request:', companyData);
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.EMPLOYER_SIGNUP, companyData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('🏢 Employer Signup Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        requiresApproval: response.data.requires_approval || false
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Employer Signup Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Employer signup failed'],
        message: error.response?.data?.message || error.data?.message || 'Registration failed'
      };
    }
  }

  // Employer Login API
  async employerLogin(credentials) {
    try {
      if (__DEV__) {
        console.log('🏢 Employer Login Request:', { emailOrMobile: credentials.emailOrMobile });
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.EMPLOYER_LOGIN, credentials, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('🏢 Employer Login Response:', response.data);
      }

      // Store JWT token if provided
      if (response.data.jwt_token) {
        await setStoredToken(response.data.jwt_token);
      }

      // Store user data from login response
      if (response.data.data) {
        // Store user_id
        if (response.data.data.user_id) {
          await setStoredUserId(response.data.data.user_id);
        }

        // Store user_type (employer)
        await setStoredUserType('employer');

        // Store company_id for employer
        if (response.data.data.company && response.data.data.company.company_id) {
          try {
            await SecureStore.setItemAsync('company_id', response.data.data.company.company_id.toString());
          } catch (storageError) {
            console.log('Failed to store company_id:', storageError);
          }
        }

        // Store additional user profile data in SecureStore
        const userData = response.data.data;
        try {
          await SecureStore.setItemAsync('user_name', `${userData.first_name} ${userData.last_name}` || '');
          await SecureStore.setItemAsync('user_email', userData.email || '');
          await SecureStore.setItemAsync('user_phone', userData.phone || '');
          await SecureStore.setItemAsync('user_status', userData.status || '');
          await SecureStore.setItemAsync('profile_image', userData.profile_image || '');
        } catch (storageError) {
          console.log('Failed to store user profile data:', storageError);
        }
      }

      return {
        success: true,
        data: response.data.data,
        token: response.data.jwt_token,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Employer Login Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Login failed'],
        message: error.response?.data?.message || error.data?.message || 'Invalid credentials or login failed'
      };
    }
  }

  // Login API for jobseekers
  async login(credentials) {
    try {
      if (__DEV__) {
        console.log('🔑 Login Request:', { email: credentials.email, user_type: credentials.user_type });
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);

      if (__DEV__) {
        console.log('🔑 Login Response:', response.data);
      }

      // Store JWT token if provided
      if (response.data.jwt_token) {
        await setStoredToken(response.data.jwt_token);
      }

      // Store user data from login response
      if (response.data.data) {
        // Store user_id
        if (response.data.data.user_id) {
          await setStoredUserId(response.data.data.user_id);
        }

        // Store user_type
        if (response.data.data.user_type) {
          await setStoredUserType(response.data.data.user_type);
        }

        // Store additional user profile data in SecureStore
        const userData = response.data.data;
        try {
          await SecureStore.setItemAsync('user_name', userData.name || '');
          await SecureStore.setItemAsync('user_email', userData.email || '');
          await SecureStore.setItemAsync('user_phone', userData.phone_number || '');
          await SecureStore.setItemAsync('user_status', userData.status || '');
          await SecureStore.setItemAsync('profile_image', userData.profile_image || '');
        } catch (storageError) {
          console.log('Failed to store user profile data:', storageError);
        }
      }

      return {
        success: true,
        data: response.data.data,
        token: response.data.jwt_token,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Login API Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Login failed'],
        message: error.response?.data?.message || error.data?.message || 'Invalid credentials or login failed'
      };
    }
  }

  // Get user profile (legacy method)
  async getProfile(userId) {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PROFILE}?user_id=${userId}`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [error.message || 'Failed to get profile'],
        message: error.data?.message || 'Failed to get profile'
      };
    }
  }

  // Get comprehensive profile data
  async getFullProfile(userId) {
    try {
      if (__DEV__) {
        console.log('📊 Getting Full Profile for userId:', userId, typeof userId);
      }

      if (!userId) {
        return {
          success: false,
          errors: ['User ID is required'],
          message: 'User ID is required',
          data: null
        };
      }

      const requestData = {
        user_id: parseInt(userId) // Ensure it's an integer
      };

      if (__DEV__) {
        console.log('📤 Full Profile Request Data:', requestData);
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.GET_PROFILE, requestData);

      if (__DEV__) {
        console.log('👤 Full Profile Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Get Full Profile Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Failed to get profile data'],
        message: error.response?.data?.message || error.data?.message || 'Failed to get profile data',
        data: null
      };
    }
  }

  // Update specific profile field
  async updateProfileField(userId, fieldName, fieldValue) {
    try {
      if (__DEV__) {
        console.log('✏️ Updating Profile Field:', { userId, fieldName, fieldValue });
      }

      if (!userId) {
        return {
          success: false,
          errors: ['User ID is required'],
          message: 'User ID is required',
          data: null
        };
      }

      const requestData = {
        user_id: parseInt(userId), // Ensure it's an integer
        field_name: fieldName,
        field_value: fieldValue
      };

      if (__DEV__) {
        console.log('📤 Update Profile Request Data:', requestData);
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, requestData);

      if (__DEV__) {
        console.log('✏️ Update Profile Field Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        requiresApproval: response.data.requires_approval || false
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Update Profile Field Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Failed to update profile field'],
        message: error.response?.data?.message || error.data?.message || 'Failed to update profile field',
        data: null
      };
    }
  }

  // Get user data for home screen (legacy method)
  async getUserData(userId, userType = null) {
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (userType) {
        params.append('user_type', userType);
      }

      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.USER_DATA}?${params.toString()}`);

      if (__DEV__) {
        console.log('👤 User Data Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Get User Data Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Failed to get user data'],
        message: error.response?.data?.message || error.data?.message || 'Failed to get user data',
        data: null
      };
    }
  }

  // Get comprehensive home dashboard data
  async getHomeDashboard(userId, userType = null) {
    try {
      if (__DEV__) {
        console.log('🏠 Getting Home Dashboard for userId:', userId, 'userType:', userType);
      }

      if (!userId) {
        return {
          success: false,
          errors: ['User ID is required'],
          message: 'User ID is required',
          data: null
        };
      }

      const requestData = {
        user_id: parseInt(userId) // Ensure it's an integer
      };

      if (userType) {
        requestData.user_type = userType;
      }

      if (__DEV__) {
        console.log('📤 Home Dashboard Request Data:', requestData);
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.HOME, requestData);

      if (__DEV__) {
        console.log('🏠 Home Dashboard Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Get Home Dashboard Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Failed to get home dashboard data'],
        message: error.response?.data?.message || error.data?.message || 'Failed to get home dashboard data',
        data: null
      };
    }
  }

  // Update profile
  async updateProfile(userData) {
    try {
      const formData = new FormData();

      Object.keys(userData).forEach(key => {
        if (key === 'profile_image' && userData[key]) {
          formData.append('profile_image', userData[key]);
        } else if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [error.message || 'Update failed'],
        message: error.data?.message || 'Update failed'
      };
    }
  }

  // Get skills list
  async getSkills(category = null) {
    try {
      const url = category
        ? `${API_CONFIG.ENDPOINTS.SKILLS}?category=${category}`
        : API_CONFIG.ENDPOINTS.SKILLS;

      const response = await apiClient.get(url);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [error.message || 'Failed to get skills'],
        message: error.data?.message || 'Failed to get skills'
      };
    }
  }

  // Get jobs
  async getJobs(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams
        ? `${API_CONFIG.ENDPOINTS.JOBS}?${queryParams}`
        : API_CONFIG.ENDPOINTS.JOBS;

      const response = await apiClient.get(url);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [error.message || 'Failed to get jobs'],
        message: error.data?.message || 'Failed to get jobs'
      };
    }
  }

  // Apply for job
  async applyForJob(applicationData) {
    try {
      const formData = new FormData();

      Object.keys(applicationData).forEach(key => {
        if (key === 'resume_file' && applicationData[key]) {
          formData.append('resume_file', applicationData[key]);
        } else if (applicationData[key] !== null && applicationData[key] !== undefined) {
          formData.append(key, applicationData[key]);
        }
      });

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.APPLICATIONS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [error.message || 'Application failed'],
        message: error.data?.message || 'Application failed'
      };
    }
  }

  // Post Job API (Employer)
  async postJob(jobData) {
    try {
      if (__DEV__) {
        console.log('💼 Post Job Request:', jobData);
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.POST_JOB, jobData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('💼 Post Job Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Post Job Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Failed to post job'],
        message: error.response?.data?.message || error.data?.message || 'Failed to post job'
      };
    }
  }

  // Get Company Profile
  async getCompanyProfile(userId, companyId) {
    try {
      if (__DEV__) {
        console.log('🏢 Get Company Profile Request:', { userId, companyId });
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.GET_COMPANY, {
        userId: parseInt(userId),
        companyId: companyId ? parseInt(companyId) : null
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('🏢 Get Company Profile Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Get Company Profile Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Failed to get company profile'],
        message: error.response?.data?.message || error.data?.message || 'Failed to get company profile',
        data: null
      };
    }
  }

  // Update Company Field
  async updateCompanyField(companyId, userId, fieldName, fieldValue) {
    try {
      if (__DEV__) {
        console.log('✏️ Update Company Field Request:', { companyId, userId, fieldName, fieldValue });
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.UPDATE_COMPANY, {
        companyId: parseInt(companyId),
        userId: parseInt(userId),
        fieldName,
        fieldValue
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('✏️ Update Company Field Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Update Company Field Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Failed to update company field'],
        message: error.response?.data?.message || error.data?.message || 'Failed to update company field',
        data: null
      };
    }
  }

  // Get Jobs (Employer)
  async getJobs(companyId, userId, filters = {}) {
    try {
      if (__DEV__) {
        console.log('💼 Get Jobs Request:', { companyId, userId, filters });
      }

      const requestData = {
        companyId: companyId ? parseInt(companyId) : null,
        userId: userId ? parseInt(userId) : null,
        status: filters.status || 'all',
        searchQuery: filters.searchQuery || '',
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      };

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.GET_JOBS, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('💼 Get Jobs Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Get Jobs Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Failed to get jobs'],
        message: error.response?.data?.message || error.data?.message || 'Failed to get jobs',
        data: null
      };
    }
  }

  // Verify Email API
  async verifyEmail(data) {
    try {
      if (__DEV__) {
        console.log('📧 Verify Email Request:', { email: data.email, user_type: data.user_type });
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.VERIFY_EMAIL, data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('📧 Verify Email Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Verify Email Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Verification failed'],
        message: error.response?.data?.message || error.data?.message || 'Invalid verification code'
      };
    }
  }

  // Resend Verification Code API
  async resendVerificationCode(data) {
    try {
      if (__DEV__) {
        console.log('🔄 Resend Verification Code Request:', { email: data.email, user_type: data.user_type });
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.RESEND_VERIFICATION, data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('🔄 Resend Verification Code Response:', response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ Resend Verification Code Error:', error);
        if (error.response) {
          console.log('❌ Error Response Status:', error.response.status);
          console.log('❌ Error Response Data:', error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || error.data?.data?.errors || [error.message || 'Failed to resend code'],
        message: error.response?.data?.message || error.data?.message || 'Failed to resend verification code'
      };
    }
  }

  // Logout
  async logout() {
    try {
      // Clear all stored user data
      await Promise.all([
        clearStoredToken(),
        clearStoredUserType(),
        clearStoredUserId()
      ]);

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.log('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }
}

// Create and export service instance
const apiService = new ApiService();
export default apiService;