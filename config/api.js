// API Configuration for Manvue App
export const API_CONFIG = {
  // Base URLs
  BASE_URL: "https://work.phpwebsites.in/manvue/api",
  BASE_IMG_URL: "https://work.phpwebsites.in/manvue/photos",

  // API Endpoints
  ENDPOINTS: {
    // Jobseeker endpoints
    SIGNUP: "/signup.php",
    LOGIN: "/login.php",
    PROFILE: "/profile.php",
    USER_DATA: "/profile.php", // User profile data endpoint (legacy)
    HOME: "/home.php", // New home dashboard endpoint
    GET_PROFILE: "/get-profile.php",
    UPDATE_PROFILE: "/update-profile.php",

    // Employer endpoints
    EMPLOYER_SIGNUP: "/employer-signup.php",
    EMPLOYER_LOGIN: "/employer-login.php",
    POST_JOB: "/post-job.php",
    GET_COMPANY: "/get-company.php",
    UPDATE_COMPANY: "/update-company.php",
    GET_JOBS: "/get-jobs.php",

    // Common endpoints
    JOBS: "/jobs.php",
    APPLICATIONS: "/applications.php",
    SKILLS: "/skills.php",
    GET_SKILLS: "/skills.php",
    COMPANIES: "/companies.php",
    MATCHES: "/matches.php",
    MESSAGES: "/messages.php",
    NOTIFICATIONS: "/notifications.php",
    UPLOAD: "/upload.php",
  },

  // Request headers
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // File upload headers
  UPLOAD_HEADERS: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },

  // Request timeout
  TIMEOUT: 30000, // 30 seconds

  // Authentication key (if required)
  AUTH_KEY: "your_auth_key_here", // Replace with actual auth key

  // Basic Authentication credentials
  BASIC_AUTH: {
    USERNAME: "swebapuser",
    PASSWORD: "2074@seb#209Y",
  },
};

// Image URL helper function
export const getImageUrl = (imageName, size = "large") => {
  if (!imageName) return null;

  const sizeUrls = {
    large: "https://work.phpwebsites.in/manvue/photos/large",
    medium: "https://work.phpwebsites.in/manvue/photos/medium",
    small: "https://work.phpwebsites.in/manvue/photos/small",
  };

  return `${sizeUrls[size] || sizeUrls.large}/${imageName}`;
};

// API URL helper function
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint] || endpoint}`;
};

// Logging functions for debugging
export const logApiRequest = (method, url, body) => {
  if (__DEV__) {
    console.log(`🚀 API Request: ${method} ${url}`, body ? { body } : "");
  }
};

export const logApiResponse = (url, data) => {
  if (__DEV__) {
    console.log(`📦 API Response: ${url}`, data);
  }
};

// File validation helper
export const validateFile = (file, type = "image") => {
  if (!file || !file.uri) {
    return {
      isValid: false,
      errors: ["No file selected"],
    };
  }

  const maxSizes = {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
  };

  const allowedTypes = {
    image: ["image/jpeg", "image/jpg", "image/png"],
    document: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  };

  const errors = [];

  // Check file size if available
  if (file.fileSize && file.fileSize > maxSizes[type]) {
    errors.push(
      `File size must be less than ${maxSizes[type] / (1024 * 1024)}MB`
    );
  }

  // Check file type if available
  if (file.mimeType && !allowedTypes[type].includes(file.mimeType)) {
    errors.push(
      `Invalid file type. Allowed types: ${allowedTypes[type].join(", ")}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default API_CONFIG;
