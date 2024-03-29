const validator = {
  
    email: {
      rules: [
        {
          test:/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,})$/i,
          message: 'Please Enter Valid Email',
        },
      ],
      errors: [],
      valid: false,
      state: '',
    },
    password: {
      rules: [
        {
          test: (value) => {
            return value.length >= 8;
          },
          message: 'Password must not be shorter than 8 characters',
        },
        {
            test: /^[a-z0-9A-Z_!@#$%&*]+$/,
            message: 'Enter Valid Password',
        },
      ],
      errors: [],
      valid: false,
      state: ''
    },
    currentPassword: {
      rules: [
        {
          test: (value) => {
            return value.length >= 8;
          },
          message: 'Password must not be shorter than 8 characters',
        },
        {
            test: /^[a-z0-9A-Z_!@#$%&*]+$/,
            message: 'Enter Valid Password',
        },
      ],
      errors: [],
      valid: false,
      state: ''
    },
    confirmPassword: {
      rules: [
        {
          test: (value) => {
            return value.length >= 8;
          },
          message: 'Password must not be shorter than 8 characters',
        },
        {
            test: /^[a-z0-9A-Z_!@#$%&*]+$/,
            message: 'Enter Valid Password',
        },
      ],
      errors: [],
      valid: false,
      state: ''
    },
    firstname: {
      rules: [
        {
          test:/^[a-zA-Z_]+$/i,
          message: 'number not allowed',
        },
      ],
      errors: [],
      valid: false,
      state: '',
    },
    lastname: {
      rules: [
        {
          test:/^[a-zA-Z_]+$/i,
          message: 'number not allowed',
        },
      ],
      errors: [],
      valid: false,
      state: '',
    },
    principal: {
      rules: [
        /*{
          test:/^\s*(?=.*[1-9])\d*(?:\.\d{1,3})?\s*$/i,
          message: 'Enter Valid Principal Amount',
        },*/
        {
            test: /^[0-9.]+$/,
            message: 'Enter Valid Principal Amount',
        },
      ],
      errors: [],
      valid: false,
      state: ''
    },
    collateral: {
      rules: [
        /*{
          test:/^\s*(?=.*[1-9])\d*(?:\.\d{1,3})?\s*$/i,
          message: 'Enter Valid Collateral Amount',
        },*/
        {
            test: /^[0-9.]+$/,
            message: 'Enter Valid Collateral Amount',
        },
      ],
      errors: [],
      valid: false,
      state: ''
    },
    termLength: {
      rules: [
        /*{
          test:/^\s*(?=.*[1-9])\d*(?:\.\d{1,3})?\s*$/i,
          message: 'Term Length must be greater then zero',
        },*/
        {
            test: /^[0-9]+$/,
            message: 'Enter Valid Term Length',
        },
      ],
      errors: [],
      valid: false,
      state: ''
    },
    interestRate: {
      rules: [
        /*{
          test:/^\s*(?=.*[1-9])\d*(?:\.\d{1,3})?\s*$/i,
          message: 'Enter valid interest rate.',
        },*/
        {
            test: /^[0-9.]+$/,
            message: 'Enter valid interest rate.',
        },
      ],
      errors: [],
      valid: false,
      state: ''
    }
  };
  
  export default validator;