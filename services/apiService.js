import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_CONFIG } from "../config/api";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  // Add basic authentication
  auth: {
    username: API_CONFIG.BASIC_AUTH.USERNAME,
    password: API_CONFIG.BASIC_AUTH.PASSWORD,
  },
});

// Request interceptor to add auth headers
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth key if required
    if (API_CONFIG.AUTH_KEY) {
      config.headers["Auth-Key"] = API_CONFIG.AUTH_KEY;
    }

    // Add JWT token if available
    try {
      const token = await SecureStore.getItemAsync("jwt_token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Failed to get token from SecureStore:", error);
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
        message: "Network error. Please check your connection.",
        type: "network_error",
      });
    } else {
      // Other error
      return Promise.reject({
        message: "Something went wrong. Please try again.",
        type: "unknown_error",
      });
    }
  }
);

// Token management functions using SecureStore
export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync("jwt_token");
  } catch (error) {
    console.log("Failed to get token from SecureStore:", error);
    return null;
  }
};

export const setStoredToken = async (token) => {
  try {
    await SecureStore.setItemAsync("jwt_token", token);
    return true;
  } catch (error) {
    console.log("Failed to store token:", error);
    return false;
  }
};

export const clearStoredToken = async () => {
  try {
    await SecureStore.deleteItemAsync("jwt_token");
    return true;
  } catch (error) {
    console.log("Failed to clear token:", error);
    return false;
  }
};

// User type management functions using SecureStore
export const getStoredUserType = async () => {
  try {
    return await SecureStore.getItemAsync("user_type");
  } catch (error) {
    console.log("Failed to get user type from SecureStore:", error);
    return null;
  }
};

export const setStoredUserType = async (userType) => {
  try {
    await SecureStore.setItemAsync("user_type", userType);
    return true;
  } catch (error) {
    console.log("Failed to store user type:", error);
    return false;
  }
};

export const clearStoredUserType = async () => {
  try {
    await SecureStore.deleteItemAsync("user_type");
    return true;
  } catch (error) {
    console.log("Failed to clear user type:", error);
    return false;
  }
};

// User ID management functions using SecureStore
export const getStoredUserId = async () => {
  try {
    return await SecureStore.getItemAsync("user_id");
  } catch (error) {
    console.log("Failed to get user ID from SecureStore:", error);
    return null;
  }
};

export const setStoredUserId = async (userId) => {
  try {
    await SecureStore.setItemAsync("user_id", userId.toString());
    return true;
  } catch (error) {
    console.log("Failed to store user ID:", error);
    return false;
  }
};

export const clearStoredUserId = async () => {
  try {
    await SecureStore.deleteItemAsync("user_id");
    return true;
  } catch (error) {
    console.log("Failed to clear user ID:", error);
    return false;
  }
};

// API Service class
class ApiService {
  // Test signup with simple JSON first
  async testSignup(userData) {
    try {
      console.log("🧪 Testing simple JSON signup...");
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.SIGNUP,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        token: response.data.jwt_token,
        message: response.data.message,
      };
    } catch (error) {
      console.log("🧪 JSON test failed, trying FormData...");
      return null; // Fall back to FormData method
    }
  }

  // Signup API
  async signup(userData) {
    try {
      // Ensure userData is FormData
      let formData;
      if (userData instanceof FormData) {
        formData = userData;
      } else {
        formData = new FormData();
        // Add all form fields
        Object.keys(userData).forEach((key) => {
          if (key === "skills" && Array.isArray(userData[key])) {
            formData.append("skills", JSON.stringify(userData[key]));
          } else if (
            key === "preferred_locations" &&
            Array.isArray(userData[key])
          ) {
            formData.append(
              "preferred_locations",
              JSON.stringify(userData[key])
            );
          } else if (
            key === "job_type_preference" &&
            Array.isArray(userData[key])
          ) {
            formData.append(
              "job_type_preference",
              JSON.stringify(userData[key])
            );
          } else if (
            key === "work_mode_preference" &&
            Array.isArray(userData[key])
          ) {
            formData.append(
              "work_mode_preference",
              JSON.stringify(userData[key])
            );
          } else if (key === "educationList" && Array.isArray(userData[key])) {
            formData.append("educationList", JSON.stringify(userData[key]));
          } else if (key === "workList" && Array.isArray(userData[key])) {
            formData.append("workList", JSON.stringify(userData[key]));
          } else if (key === "profile_image" && userData[key]) {
            formData.append("profile_image", userData[key]);
          } else if (userData[key] !== null && userData[key] !== undefined) {
            formData.append(key, userData[key]);
          }
        });
      }

      // Log the FormData contents for debugging
      if (__DEV__) {
        console.log("🚀 Signup FormData contents:");
        for (let [key, value] of formData.entries()) {
          if (key === "profile_image") {
            console.log(`${key}:`, "File object");
          } else {
            console.log(`${key}:`, value);
          }
        }
      }

      // Important: Don't set Content-Type header for FormData
      // Axios will automatically set it with correct boundary
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.SIGNUP,
        formData,
        {
          headers: {
            // Remove Content-Type - let axios handle it automatically
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Signup API Response:", response.data);
      }

      // Store JWT token if provided
      if (response.data?.jwt_token || response.data?.token) {
        const token = response.data.jwt_token || response.data.token;
        await SecureStore.setItemAsync("jwt_token", token);
      }

      return {
        success: response.data?.success || false,
        data: response.data?.data || {},
        token: response.data?.jwt_token || response.data?.token || null,
        message: response.data?.message || "Signup successful",
        payment_required: response.data?.payment_required || false,
        errors: response.data?.errors || [],
      };
    } catch (error) {
      // Enhanced error logging
      if (__DEV__) {
        console.log("❌ Signup API Error Details:");
        if (error.response) {
          console.log("❌ Status:", error.response.status);
          console.log("❌ Data:", error.response.data);
          console.log("❌ Message:", error.response.data?.message);
          console.log("❌ Errors:", error.response.data?.errors);
        } else if (error.request) {
          console.log("❌ No response received:", error.request);
        } else {
          console.log("❌ Error:", error.message);
        }
      }

      // Extract error details from response
      const errorData = error.response?.data || {};

      return {
        success: false,
        errors: errorData?.errors || [error.message || "Signup failed"],
        message:
          errorData?.message ||
          error.message ||
          "Registration failed. Please try again.",
        data: null,
        payment_required: false,
      };
    }
  }

  // Employer Signup API
  async employerSignup(companyData) {
    try {
      if (__DEV__) {
        console.log("🏢 Employer Signup Request:", companyData);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.EMPLOYER_SIGNUP,
        companyData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("🏢 Employer Signup Response:", response.data);
      }

      // Check if the response indicates success
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          token: response.data.token || response.data.jwt_token,
          message: response.data.message,
          requiresApproval: response.data.data?.status === "inactive",
        };
      } else {
        // Backend returned errors in success response (shouldn't happen but handle it)
        return {
          success: false,
          errors: response.data.errors || [
            response.data.message || "Registration failed",
          ],
          message: response.data.message || "Registration failed",
        };
      }
    } catch (error) {
      if (__DEV__) {
        console.error("❌ Employer Signup Error:", error);
        if (error.response) {
          console.error("❌ Error Response Status:", error.response.status);
          console.error("❌ Error Response Data:", error.response.data);
        }
      }

      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status (422, 500, etc.)
        return {
          success: false,
          errors: error.response.data?.errors || [
            error.response.data?.message || "Registration failed",
          ],
          message: error.response.data?.message || "Registration failed",
        };
      } else if (error.request) {
        // Request was made but no response received (network error)
        return {
          success: false,
          errors: ["Network error. Please check your internet connection."],
          message: "Network error. Please check your internet connection.",
        };
      } else {
        // Something else went wrong
        return {
          success: false,
          errors: [error.message || "An unexpected error occurred"],
          message: error.message || "An unexpected error occurred",
        };
      }
    }
  }

  // Employer Login API
  async employerLogin(credentials) {
    try {
      if (__DEV__) {
        console.log("🏢 Employer Login Request:", {
          emailOrMobile: credentials.emailOrMobile,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.EMPLOYER_LOGIN,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("🏢 Employer Login Response:", response.data);
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
        await setStoredUserType("employer");

        // Store company_id for employer
        if (
          response.data.data.company &&
          response.data.data.company.company_id
        ) {
          try {
            await SecureStore.setItemAsync(
              "company_id",
              response.data.data.company.company_id.toString()
            );
          } catch (storageError) {
            console.log("Failed to store company_id:", storageError);
          }
        }

        // Store additional user profile data in SecureStore
        const userData = response.data.data;
        try {
          await SecureStore.setItemAsync(
            "user_name",
            `${userData.first_name} ${userData.last_name}` || ""
          );
          await SecureStore.setItemAsync("user_email", userData.email || "");
          await SecureStore.setItemAsync("user_phone", userData.phone || "");
          await SecureStore.setItemAsync("user_status", userData.status || "");
          await SecureStore.setItemAsync(
            "profile_image",
            userData.profile_image || ""
          );
        } catch (storageError) {
          console.log("Failed to store user profile data:", storageError);
        }
      }

      return {
        success: true,
        data: response.data.data,
        token: response.data.jwt_token,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Employer Login Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [error.message || "Login failed"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Invalid credentials or login failed",
      };
    }
  }

  // Login API for jobseekers
  async login(credentials) {
    try {
      if (__DEV__) {
        console.log("🔑 Login Request:", {
          email: credentials.email,
          user_type: credentials.user_type,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.LOGIN,
        credentials
      );

      if (__DEV__) {
        console.log("🔑 Login Response:", response.data);
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
          await SecureStore.setItemAsync("user_name", userData.name || "");
          await SecureStore.setItemAsync("user_email", userData.email || "");
          await SecureStore.setItemAsync(
            "user_phone",
            userData.phone_number || ""
          );
          await SecureStore.setItemAsync("user_status", userData.status || "");
          await SecureStore.setItemAsync(
            "profile_image",
            userData.profile_image || ""
          );
        } catch (storageError) {
          console.log("Failed to store user profile data:", storageError);
        }
      }

      return {
        success: true,
        data: response.data.data,
        token: response.data.jwt_token,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Login API Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [error.message || "Login failed"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Invalid credentials or login failed",
      };
    }
  }

  // Get user profile (legacy method)
  async getProfile(userId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PROFILE}?user_id=${userId}`
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [
          error.message || "Failed to get profile",
        ],
        message: error.data?.message || "Failed to get profile",
      };
    }
  }

  // Get comprehensive profile data
  async getFullProfile(userId) {
    try {
      if (__DEV__) {
        console.log(
          "📊 Getting Full Profile for userId:",
          userId,
          typeof userId
        );
      }

      if (!userId) {
        return {
          success: false,
          errors: ["User ID is required"],
          message: "User ID is required",
          data: null,
        };
      }

      const requestData = {
        user_id: parseInt(userId), // Ensure it's an integer
      };

      if (__DEV__) {
        console.log("📤 Full Profile Request Data:", requestData);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_PROFILE,
        requestData
      );

      if (__DEV__) {
        console.log("👤 Full Profile Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Full Profile Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to get profile data",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to get profile data",
        data: null,
      };
    }
  }

  // Update specific profile field
  async updateProfileField(userId, fieldName, fieldValue) {
    try {
      if (__DEV__) {
        console.log("✏️ Updating Profile Field:", {
          userId,
          fieldName,
          fieldValue,
        });
      }

      if (!userId) {
        return {
          success: false,
          errors: ["User ID is required"],
          message: "User ID is required",
          data: null,
        };
      }

      const requestData = {
        user_id: parseInt(userId), // Ensure it's an integer
        field_name: fieldName,
        field_value: fieldValue,
      };

      if (__DEV__) {
        console.log("📤 Update Profile Request Data:", requestData);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.UPDATE_PROFILE,
        requestData
      );

      if (__DEV__) {
        console.log("✏️ Update Profile Field Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        requiresApproval: response.data.requires_approval || false,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Update Profile Field Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to update profile field",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to update profile field",
        data: null,
      };
    }
  }

  // Get user data for home screen (legacy method)
  async getUserData(userId, userType = null) {
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (userType) {
        params.append("user_type", userType);
      }

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.USER_DATA}?${params.toString()}`
      );

      if (__DEV__) {
        console.log("👤 User Data Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get User Data Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to get user data",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to get user data",
        data: null,
      };
    }
  }

  // Get comprehensive home dashboard data
  async getHomeDashboard(userId, userType = null) {
    try {
      if (__DEV__) {
        console.log(
          "🏠 Getting Home Dashboard for userId:",
          userId,
          "userType:",
          userType
        );
      }

      if (!userId) {
        return {
          success: false,
          errors: ["User ID is required"],
          message: "User ID is required",
          data: null,
        };
      }

      const requestData = {
        user_id: parseInt(userId), // Ensure it's an integer
      };

      if (userType) {
        requestData.user_type = userType;
      }

      if (__DEV__) {
        console.log("📤 Home Dashboard Request Data:", requestData);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.HOME,
        requestData
      );

      if (__DEV__) {
        console.log("🏠 Home Dashboard Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Home Dashboard Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to get home dashboard data",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to get home dashboard data",
        data: null,
      };
    }
  }

  // Update profile
  async updateProfile(userData) {
    try {
      const formData = new FormData();

      Object.keys(userData).forEach((key) => {
        if (key === "profile_image" && userData[key]) {
          formData.append("profile_image", userData[key]);
        } else if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PROFILE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [error.message || "Update failed"],
        message: error.data?.message || "Update failed",
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
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [
          error.message || "Failed to get skills",
        ],
        message: error.data?.message || "Failed to get skills",
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
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [
          error.message || "Failed to get jobs",
        ],
        message: error.data?.message || "Failed to get jobs",
      };
    }
  }

  // Apply for job
  async applyForJob(applicationData) {
    try {
      const formData = new FormData();

      Object.keys(applicationData).forEach((key) => {
        if (key === "resume_file" && applicationData[key]) {
          formData.append("resume_file", applicationData[key]);
        } else if (
          applicationData[key] !== null &&
          applicationData[key] !== undefined
        ) {
          formData.append(key, applicationData[key]);
        }
      });

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.APPLICATIONS,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        errors: error.data?.data?.errors || [
          error.message || "Application failed",
        ],
        message: error.data?.message || "Application failed",
      };
    }
  }

  // Post Job API (Employer)
  async postJob(jobData) {
    try {
      if (__DEV__) {
        console.log("💼 Post Job Request:", jobData);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.POST_JOB,
        jobData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("💼 Post Job Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Post Job Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [error.message || "Failed to post job"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to post job",
      };
    }
  }

  // Get Company Profile
  async getCompanyProfile(userId, companyId) {
    try {
      if (__DEV__) {
        console.log("🏢 Get Company Profile Request:", { userId, companyId });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_COMPANY,
        {
          userId: parseInt(userId),
          companyId: companyId ? parseInt(companyId) : null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("🏢 Get Company Profile Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Company Profile Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to get company profile",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to get company profile",
        data: null,
      };
    }
  }

  // Update Company Field
  async updateCompanyField(companyId, userId, fieldName, fieldValue) {
    try {
      if (__DEV__) {
        console.log("✏️ Update Company Field Request:", {
          companyId,
          userId,
          fieldName,
          fieldValue,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.UPDATE_COMPANY,
        {
          companyId: parseInt(companyId),
          userId: parseInt(userId),
          fieldName,
          fieldValue,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✏️ Update Company Field Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Update Company Field Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to update company field",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to update company field",
        data: null,
      };
    }
  }

  // Get Jobs (Employer)
  async getJobs(companyId, userId, filters = {}) {
    try {
      if (__DEV__) {
        // console.log("💼 Get Jobs Request:", { companyId, userId, filters });
      }

      const requestData = {
        companyId: companyId ? parseInt(companyId) : null,
        userId: userId ? parseInt(userId) : null,
        status: filters.status || "all",
        searchQuery: filters.searchQuery || "",
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_JOBS,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("💼 Get Jobs Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Jobs Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [error.message || "Failed to get jobs"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to get jobs",
        data: null,
      };
    }
  }

  // Verify Email API
  async verifyEmail(data) {
    try {
      if (__DEV__) {
        console.log("📧 Verify Email Request:", {
          email: data.email,
          user_type: data.user_type,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.VERIFY_EMAIL,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("📧 Verify Email Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        token: response.data.token || response.data.jwt_token,
        payment_required: response.data.payment_required || false,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Verify Email Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [error.message || "Verification failed"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Invalid verification code",
      };
    }
  }

  // Resend Verification Code API
  async resendVerificationCode(data) {
    try {
      if (__DEV__) {
        console.log("🔄 Resend Verification Code Request:", {
          email: data.email,
          user_type: data.user_type,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESEND_VERIFICATION,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("🔄 Resend Verification Code Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Resend Verification Code Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to resend code",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to resend verification code",
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
        clearStoredUserId(),
      ]);

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      console.log("Logout error:", error);
      return {
        success: false,
        message: "Logout failed",
      };
    }
  }

  // ============================================
  // RAZORPAY PAYMENT APIs
  // ============================================

  /**
   * Get Subscription Plans
   * @param {Object} params - { user_type: 'jobseeker' | 'employer' | 'all' }
   */
  async getSubscriptionPlans(params = {}) {
    try {
      if (__DEV__) {
        console.log("💰 Get Subscription Plans Request:", params);
      }

      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_CONFIG.ENDPOINTS.GET_SUBSCRIPTION_PLANS}?${queryParams}`;

      const response = await apiClient.get(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (__DEV__) {
        console.log("💰 Get Subscription Plans Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Subscription Plans Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to get subscription plans",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to get subscription plans",
        data: [],
      };
    }
  }

  /**
   * Create Razorpay Order
   * @param {Object} orderData - { plan_id, user_id, coupon_code (optional) }
   */
  async createRazorpayOrder(orderData) {
    try {
      if (__DEV__) {
        console.log("💳 Create Razorpay Order Request:", orderData);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CREATE_RAZORPAY_ORDER,
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("💳 Create Razorpay Order Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Create Razorpay Order Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to create order",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to create payment order",
      };
    }
  }

  /**
   * Verify Razorpay Payment
   * @param {Object} paymentData - { razorpay_payment_id, razorpay_order_id, razorpay_signature, user_id }
   */
  async verifyRazorpayPayment(paymentData) {
    try {
      if (__DEV__) {
        console.log("✅ Verify Razorpay Payment Request:", {
          payment_id: paymentData.razorpay_payment_id,
          order_id: paymentData.razorpay_order_id,
          user_id: paymentData.user_id,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.VERIFY_RAZORPAY_PAYMENT,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Verify Razorpay Payment Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Verify Razorpay Payment Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Payment verification failed",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to verify payment",
      };
    }
  }

  /**
   * Get User Subscription
   * @param {number} userId - User ID
   */
  async getUserSubscription(userId) {
    try {
      if (__DEV__) {
        console.log("📋 Get User Subscription Request:", { userId });
      }

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.GET_USER_SUBSCRIPTION}?user_id=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("📋 Get User Subscription Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get User Subscription Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to get subscription",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to get subscription details",
        data: null,
      };
    }
  }

  /**
   * Get Matching Candidates for Employer
   * @param {Object} params - { employer_user_id, company_id, status, search_query, limit, offset }
   */
  async getMatchingCandidates(params) {
    try {
      if (__DEV__) {
        console.log("👥 Get Matching Candidates Request:", params);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_MATCHING_CANDIDATES,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("👥 Get Matching Candidates Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Matching Candidates Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [
            error.message || "Failed to get matching candidates",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to get matching candidates",
        data: null,
      };
    }
  }
  /**
   * Get Job By ID
   * @param {Object} params - { jobId, userId }
   */
  async getJobById(params) {
    try {
      if (__DEV__) {
        console.log("📋 Get Job By ID Request:", params);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_JOB_BY_ID,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // if (__DEV__) {
      //   console.log("📋 Get Job By ID Response:", response.data);
      // }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Job By ID Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [error.message || "Failed to get job"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to get job",
        data: null,
      };
    }
  }

  /**
   * Update Job
   * @param {Object} jobData - Complete job data with jobId, userId, companyId, and all job fields
   */
  async updateJob(jobData) {
    try {
      if (__DEV__) {
        console.log("✏️ Update Job Request:", jobData);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.UPDATE_JOB,
        jobData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✏️ Update Job Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Update Job Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [error.message || "Failed to update job"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to update job",
        data: null,
      };
    }
  }

  /**
   * Delete Job
   * @param {Object} params - {jobId, userId, companyId }
   */
  async deleteJob(params) {
    try {
      if (DEV) {
        console.log("🗑️ Delete Job Request:", params);
      }
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.DELETE_JOB,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("🗑️ Delete Job Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (DEV) {
        console.log("❌ Delete Job Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }
      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.data?.errors || [error.message || "Failed to delete job"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to delete job",
        data: null,
      };
    }
  }
  /**
   * Get employer's active jobs for proposal sending
   */
  async getEmployerActiveJobs() {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      const companyId = await SecureStore.getItemAsync("company_id");

      if (!userId || !companyId) {
        throw new Error("User or company ID not found");
      }

      if (__DEV__) {
        console.log("📋 Get Employer Active Jobs Request:", {
          userId,
          companyId,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_EMPLOYER_ACTIVE_JOBS,
        {
          employer_user_id: parseInt(userId),
          company_id: parseInt(companyId),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("📋 Get Employer Active Jobs Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Employer Active Jobs Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [error.message || "Failed to fetch jobs"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to fetch jobs",
        data: null,
      };
    }
  }

  /**
   * Send job proposal to a candidate
   */
  async sendJobProposal(proposalData) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      const companyId = await SecureStore.getItemAsync("company_id");

      if (!userId || !companyId) {
        throw new Error("User or company ID not found");
      }

      const payload = {
        employer_user_id: parseInt(userId),
        company_id: parseInt(companyId),
        job_id: proposalData.jobId,
        jobseeker_id: proposalData.jobseekerId,
        proposal_message: proposalData.proposalMessage,
        application_type: proposalData.applicationType || "manual",
        match_score: proposalData.matchScore || null,
      };

      if (__DEV__) {
        console.log("📤 Send Job Proposal Request:", payload);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.SEND_JOB_PROPOSAL,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("📤 Send Job Proposal Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Send Job Proposal Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [error.message || "Failed to send proposal"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to send proposal",
        data: null,
      };
    }
  }

  /**
   * Get candidate details for proposal
   */
  async getCandidateDetails(params) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      const companyId = await SecureStore.getItemAsync("company_id");

      if (!userId || !companyId) {
        throw new Error("User or company ID not found");
      }

      if (__DEV__) {
        console.log("👤 Get Candidate Details Request:", params);
        console.log("👤 Get Candidate userId:", userId);
        console.log("👤 Get Candidate companyId:", companyId);
      }

      const payload = {
        employer_user_id: userId || parseInt(userId),
        company_id: companyId || parseInt(companyId),
        candidate_id: parseInt(params),
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_CANDIDATE_DETAILS,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("👤 Get Candidate Details Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Candidate Details Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [
            error.message || "Failed to fetch candidate details",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to fetch candidate details",
        data: null,
      };
    }
  }

  /**
   * Get jobseeker's pending proposals (for jobseeker side)
   */
  async getJobseekerProposals(status = "all") {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("📨 Get Jobseeker Proposals Request:", { userId, status });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_JOBSEEKER_PROPOSALS,
        {
          jobseeker_id: parseInt(userId),
          status: status, // 'all', 'submitted', 'under_review', 'shortlisted', 'rejected', etc.
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("📨 Get Jobseeker Proposals Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Jobseeker Proposals Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [error.message || "Failed to fetch proposals"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to fetch proposals",
        data: null,
      };
    }
  }

  /**
   * Jobseeker accepts/rejects a proposal
   */
  async respondToProposal(applicationId, action, responseMessage = "") {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("✅ Respond to Proposal Request:", {
          applicationId,
          action,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESPOND_TO_PROPOSAL,
        {
          jobseeker_id: parseInt(userId),
          application_id: parseInt(applicationId),
          action: action, // 'accept' or 'reject'
          response_message: responseMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Respond to Proposal Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Respond to Proposal Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [
            error.message || "Failed to respond to proposal",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to respond to proposal",
        data: null,
      };
    }
  }
  /**
   * Get jobseeker's received proposals/applications
   * Fetches all job proposals sent to the jobseeker
   * @param {Object} params - Filter parameters
   * @param {string} params.status - Filter by status: 'all', 'pending', 'accepted', 'rejected'
   * @param {string} params.search_query - Search in company name, job title, location
   * @param {number} params.limit - Number of results per page (default: 50)
   * @param {number} params.offset - Offset for pagination (default: 0)
   * @returns {Promise} API response with applications and stats
   */
  async getJobseekerProposals(params = {}) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      const payload = {
        jobseeker_id: parseInt(userId),
        status: params.status || "all",
        search_query: params.search_query || "",
        limit: params.limit || 50,
        offset: params.offset || 0,
      };

      if (__DEV__) {
        console.log("📨 Get Jobseeker Proposals Request:", payload);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_JOBSEEKER_PROPOSALS,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("📨 Get Jobseeker Proposals Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Jobseeker Proposals Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [error.message || "Failed to fetch proposals"],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to fetch proposals",
        data: null,
      };
    }
  }

  /**
   * Respond to a job proposal (accept or reject)
   * @param {number} applicationId - The application ID to respond to
   * @param {string} action - 'accept' or 'reject'
   * @param {string} responseMessage - Optional message from jobseeker
   * @returns {Promise} API response
   */
  async respondToProposal(applicationId, action, responseMessage = "") {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("✅ Respond to Proposal Request:", {
          applicationId,
          action,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESPOND_TO_PROPOSAL,
        {
          jobseeker_id: parseInt(userId),
          application_id: parseInt(applicationId),
          action: action, // 'accept' or 'reject'
          response_message: responseMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Respond to Proposal Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Respond to Proposal Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [
            error.message || "Failed to respond to proposal",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to respond to proposal",
        data: null,
      };
    }
  }

  /**
   * Get detailed information about a specific job application
   * @param {number} applicationId - The application ID
   * @returns {Promise} API response with detailed application data
   */
  async getApplicationDetails(applicationId) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("📋 Get Application Details Request:", { applicationId });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_APPLICATION_DETAILS,
        {
          user_id: parseInt(userId),
          application_id: parseInt(applicationId),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("📋 Get Application Details Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Application Details Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [
            error.message || "Failed to fetch application details",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to fetch application details",
        data: null,
      };
    }
  }
  /**
   * Get employer's conversations with accepted jobseekers
   * Fetches all chat conversations for employer
   * @param {Object} params - Filter parameters
   * @param {string} params.filter - Filter: 'all', 'unread', 'interviews', 'proposals'
   * @param {string} params.search_query - Search in candidate name, job title, messages
   * @returns {Promise} API response with conversations and stats
   */
  async getEmployerConversations(params = {}) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      const payload = {
        employer_id: parseInt(userId),
        filter: params.filter || "all",
        search_query: params.search_query || "",
      };

      if (__DEV__) {
        // console.log("💬 Get Employer Conversations Request:", payload);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_EMPLOYER_CONVERSATIONS,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        // console.log("💬 Get Employer Conversations Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Employer Conversations Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [
            error.message || "Failed to fetch conversations",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to fetch conversations",
        data: null,
      };
    }
  }

  /**
   * Block or unblock a conversation
   * @param {number} conversationId - The conversation ID
   * @param {string} action - 'block' or 'unblock'
   * @returns {Promise} API response
   */
  async blockConversation(conversationId, action = "block") {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("🚫 Block Conversation Request:", {
          conversationId,
          action,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.BLOCK_CONVERSATION,
        {
          user_id: parseInt(userId),
          conversation_id: parseInt(conversationId),
          action: action,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("🚫 Block Conversation Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Block Conversation Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [
            error.message || "Failed to block conversation",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to block conversation",
        data: null,
      };
    }
  }

  /**
   * Get conversation details including messages
   * @param {number} conversationId - The conversation ID
   * @param {number} limit - Number of messages to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Promise} API response with conversation and messages
   */
  async getConversationDetails(conversationId, limit = 50, offset = 0) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("💬 Get Conversation Details Request:", {
          conversationId,
          limit,
          offset,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_CONVERSATION_DETAILS,
        {
          user_id: parseInt(userId),
          conversation_id: parseInt(conversationId),
          limit: limit,
          offset: offset,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("💬 Get Conversation Details Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Conversation Details Error:", error);
        if (error.response) {
          console.log("❌ Error Response Status:", error.response.status);
          console.log("❌ Error Response Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [
            error.message || "Failed to fetch conversation",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to fetch conversation",
        data: null,
      };
    }
  }

  /**
   * Mark messages as read in a conversation
   * @param {number} conversationId - The conversation ID
   * @returns {Promise} API response
   */
  async markMessagesAsRead(conversationId) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("✅ Mark Messages Read Request:", { conversationId });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.MARK_MESSAGES_READ,
        {
          user_id: parseInt(userId),
          conversation_id: parseInt(conversationId),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Mark Messages Read Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Mark Messages Read Error:", error);
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [
            error.message || "Failed to mark messages as read",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to mark messages as read",
        data: null,
      };
    }
  }
  /**
   * Get Conversation Messages
   * Fetches all messages in a conversation
   * @param {number} conversationId - The conversation ID
   * @param {number} limit - Number of messages to fetch (default: 50)
   * @param {number} offset - Offset for pagination (default: 0)
   * @returns {Promise} API response with messages and conversation info
   */
  async getConversationMessages({
    conversationId = null,
    applicationId = null,
    jobseekerId = null,
    limit = 50,
    offset = 0,
  }) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      if (!userId) throw new Error("User ID not found");
      // console.log("conversationId applicationId jobseekerId", conversationId);

      if (!conversationId && !applicationId && !jobseekerId) {
        throw new Error(
          "Either conversationId, applicationId, or jobseekerId is required"
        );
      }

      const payload = {
        user_id: parseInt(userId),
        conversation_id: conversationId ? parseInt(conversationId) : null,
        application_id: applicationId ? parseInt(applicationId) : null,
        jobseeker_id: jobseekerId ? parseInt(jobseekerId) : null,
        limit,
        offset,
      };

      // if (__DEV__) console.log("💬 Get Messages Request:", payload);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_CONVERSATION_MESSAGES,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // if (__DEV__) console.log("💬 Get Messages Response:", response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Messages Error:", error);
        if (error.response)
          console.log("❌ Error Response:", error.response.data);
      }

      return {
        success: false,
        errors: error.response?.data?.errors || [
          error.message || "Failed to fetch messages",
        ],
        message: error.response?.data?.message || "Failed to fetch messages",
        data: null,
      };
    }
  }

  /**
   * Send Message
   * Sends a text or file message in a conversation
   * Supports 2 ways to send:
   * 1. By conversation_id (if you already have it)
   * 2. By application_id (creates conversation if needed)
   *
   * @param {number} conversationId - Optional: The conversation ID
   * @param {number} applicationId - Optional: The application ID (creates conversation if needed)
   * @param {string} messageText - The message text
   * @param {string} messageType - 'text' or 'file'
   * @param {Object} fileData - Optional file data for file messages
   * @param {string} fileData.uri - File URI
   * @param {string} fileData.type - File MIME type
   * @param {string} fileData.name - File name
   * @returns {Promise} API response
   */
  async sendMessage(
    jobseekerId,
    applicationId = null,
    conversationId = null,
    messageText,
    messageType = "text",
    fileData = null
  ) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (!conversationId && !applicationId) {
        throw new Error("Either conversationId or applicationId is required");
      }

      const formData = new FormData();
      formData.append("user_id", userId);

      if (conversationId) {
        formData.append("conversation_id", conversationId.toString());
      }
      if (applicationId) {
        formData.append("application_id", applicationId.toString());
      }

      formData.append("jobseeker_id", jobseekerId);
      formData.append("message_text", messageText);
      formData.append("message_type", messageType);

      // If file is being sent
      if (fileData && messageType === "file") {
        formData.append("file", {
          uri: fileData.uri,
          type: fileData.type || "application/octet-stream",
          name: fileData.name || "file",
        });
      }

      if (__DEV__) {
        console.log("📤 Send Message Request:", {
          conversationId,
          applicationId,
          messageType,
          hasFile: !!fileData,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.SEND_MESSAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          timeout: 30000, // 30 seconds for file uploads
        }
      );

      if (__DEV__) {
        console.log("📤 Send Message Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Send Message Error:", error);
        if (error.response) {
          console.log("❌ Error Response:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || [
          error.message || "Failed to send message",
        ],
        message: error.response?.data?.message || "Failed to send message",
        data: null,
      };
    }
  }

  /**
   * Block/Unblock Conversation
   * @param {number} conversationId - The conversation ID
   * @param {string} action - 'block' or 'unblock'
   * @returns {Promise} API response
   */
  async blockConversation(conversationId, action = "block") {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("🚫 Block Conversation Request:", {
          conversationId,
          action,
        });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.BLOCK_CONVERSATION,
        {
          user_id: parseInt(userId),
          conversation_id: parseInt(conversationId),
          action: action,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("🚫 Block Conversation Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Block Conversation Error:", error);
        if (error.response) {
          console.log("❌ Error Response:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors || [
          error.message || "Failed to block conversation",
        ],
        message:
          error.response?.data?.message || "Failed to block conversation",
        data: null,
      };
    }
  }

  /**
   * Mark Messages as Read
   * Marks all unread messages from the other participant as read
   * @param {number} conversationId - The conversation ID
   * @returns {Promise} API response
   */
  async markMessagesAsRead(conversationId) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("✅ Mark Messages Read Request:", { conversationId });
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.MARK_MESSAGES_READ,
        {
          user_id: parseInt(userId),
          conversation_id: parseInt(conversationId),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Mark Messages Read Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Mark Messages Read Error:", error);
      }

      return {
        success: false,
        errors: error.response?.data?.errors || [
          error.message || "Failed to mark messages as read",
        ],
        message:
          error.response?.data?.message || "Failed to mark messages as read",
        data: null,
      };
    }
  }

  /**
   * Get Chat Attachments
   * Fetches all attachments in a conversation
   * @param {number} conversationId - The conversation ID
   * @param {string} fileType - Optional filter by file type ('pdf', 'image', 'document')
   * @returns {Promise} API response with attachments list
   */
  async getChatAttachments(conversationId, fileType = null) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      const payload = {
        user_id: parseInt(userId),
        conversation_id: parseInt(conversationId),
      };

      if (fileType) {
        payload.file_type = fileType;
      }

      if (__DEV__) {
        console.log("📎 Get Attachments Request:", payload);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_CHAT_ATTACHMENTS,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("📎 Get Attachments Response:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Attachments Error:", error);
      }

      return {
        success: false,
        errors: error.response?.data?.errors || [
          error.message || "Failed to fetch attachments",
        ],
        message: error.response?.data?.message || "Failed to fetch attachments",
        data: null,
      };
    }
  }
  /**
   * Get Jobseeker Chat List
   * Fetches all conversations for a jobseeker with filtering and search
   * @param {string} searchQuery - Search term (optional)
   * @param {string} filter - Filter type: 'all', 'unread', 'blocked' (default: 'all')
   * @param {number} limit - Number of conversations to fetch (default: 50)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise} API response with conversations array
   */
  async getJobseekerChatList(
    searchQuery = "",
    filter = "all",
    limit = 50,
    offset = 0
  ) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("📥 Jobseeker Chat List Request:", {
          userId,
          searchQuery,
          filter,
          limit,
          offset,
        });
      }

      const formData = new FormData();
      formData.append("user_id", userId);

      if (searchQuery && searchQuery.trim()) {
        formData.append("search_query", searchQuery.trim());
      }

      if (filter && filter !== "all") {
        formData.append("filter", filter);
      }

      formData.append("limit", limit.toString());
      formData.append("offset", offset.toString());

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.JOBSEEKER_CHAT_LIST,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Jobseeker Chat List Success:", {
          count: response.data.data?.conversations?.length || 0,
          filterCounts: response.data.data?.filter_counts,
        });
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Jobseeker Chat List Error:", error);
        if (error.response) {
          console.log("❌ Error Status:", error.response.status);
          console.log("❌ Error Data:", error.response.data);
        }
      }

      return {
        success: false,
        errors: error.response?.data?.errors ||
          error.data?.errors || [
            error.message || "Failed to fetch conversations",
          ],
        message:
          error.response?.data?.message ||
          error.data?.message ||
          "Failed to fetch conversations",
        data: null,
      };
    }
  }

  async sendMessage2(conversationId, messageText, messageType = "text") {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("📤 Send Message:", {
          userId,
          conversationId,
          messageType,
        });
      }

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("conversation_id", conversationId.toString());
      formData.append("message_text", messageText);
      formData.append("message_type", messageType);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.SEND_MESSAGE2,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Message Sent:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Send Message Error:", error);
      }

      return {
        success: false,
        errors: error.response?.data?.errors || [
          error.message || "Failed to send message",
        ],
        message: error.response?.data?.message || "Failed to send message",
        data: null,
      };
    }
  }

  async sendMessageWithFile(conversationId, messageText = "", file) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("📤 Send File:", {
          userId,
          conversationId,
          fileName: file.name,
        });
      }

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("conversation_id", conversationId.toString());
      formData.append("message_text", messageText);
      formData.append("message_type", "file");

      formData.append("file", {
        uri: file.uri,
        type: file.mimeType || "application/octet-stream",
        name: file.name,
      });

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.SEND_MESSAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ File Sent:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Send File Error:", error);
      }

      return {
        success: false,
        errors: error.response?.data?.errors || [
          error.message || "Failed to send file",
        ],
        message: error.response?.data?.message || "Failed to send file",
        data: null,
      };
    }
  }
  async getConversationMessages2(conversationId, limit = 50, offset = 0) {
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (__DEV__) {
        console.log("📥 Get Conversation Messages:", {
          userId,
          conversationId,
          limit,
          offset,
        });
      }

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("conversation_id", conversationId.toString());
      formData.append("limit", limit.toString());
      formData.append("offset", offset.toString());

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GET_CONVERSATION_MESSAGES2,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Messages Success:", {
          count: response.data.data?.messages?.length || 0,
        });
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Get Messages Error:", error);
      }

      return {
        success: false,
        errors: error.response?.data?.errors || [
          error.message || "Failed to fetch messages",
        ],
        message: error.response?.data?.message || "Failed to fetch messages",
        data: null,
      };
    }
  }

  // Add this method to your ApiService class in apiService.js

  /**
   * Get Employer Home Dashboard
   * Fetches statistics and recent candidate matches for employer home screen
   * @param {Object} params - { employer_user_id, company_id, match_limit }
   * @returns {Promise} API response with dashboard data
   */
  async getEmployerHomeDashboard(params) {
    try {
      const { employer_user_id, company_id, match_limit = 5 } = params;

      if (__DEV__) {
        console.log("🏠 Get Employer Home Dashboard Request:", params);
      }

      const formData = new FormData();
      formData.append("employer_user_id", employer_user_id.toString());
      formData.append("company_id", company_id.toString());
      formData.append("match_limit", match_limit.toString());

      const response = await apiClient.post(
        "/employer-home-dashboard.php", // Add this endpoint to API_CONFIG.ENDPOINTS
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (__DEV__) {
        console.log("✅ Employer Home Dashboard Success:", response.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Employer Home Dashboard Error:", error);
      }

      return {
        success: false,
        errors: error.response?.data?.errors || [
          error.message || "Failed to fetch dashboard data",
        ],
        message:
          error.response?.data?.message || "Failed to fetch dashboard data",
        data: null,
      };
    }
  }
}

// Create and export service instance
const apiService = new ApiService();
export default apiService;
