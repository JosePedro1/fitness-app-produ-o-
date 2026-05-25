import axios from 'axios';

const API_URL = 'http://localhost:3000';

/**
 * Login do usuário. Salva user_id e email no localStorage.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials, {
      withCredentials: true,
    });

    if (response.status === 200) {
      localStorage.setItem('user_id', response.data.user.user_id);
      localStorage.setItem('email', response.data.user.email);
      console.log('Login bem-sucedido');
    }

    return response.data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

/**
 * Registro de novo usuário.
 */
export const registerUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, credentials, {
      withCredentials: true,
    });

    console.log('Cadastro bem-sucedido');
    return response.data;
  } catch (error) {
    console.error('Erro no cadastro:', error);
    throw error;
  }
};

/**
 * Valida o token JWT via cookie HttpOnly.
 */
export const validateToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/validate`, {
      withCredentials: true,
    });

    if (response.status === 200 && response.data.valid) {
      console.log('Token válido via cookie');
      return true;
    }

    console.log('Token inválido');
    return false;
  } catch (error) {
    console.error('Erro na validação do token:', error);
    return false;
  }
};

/**
 * Logout: limpa cookie no backend e dados locais, redireciona para /login.
 */
export const logoutUser = async () => {
  try {
    await axios.post(`${API_URL}/auth/logout`, null, {
      withCredentials: true,
    });
    console.log('Logout bem-sucedido');
  } catch (error) {
    console.error('Erro no logout:', error);
  } finally {
    removeAuthToken();
    window.location.href = '/login';
  }
};

/**
 * Remove dados locais do usuário.
 */
export const removeAuthToken = () => {
  localStorage.removeItem('user_id');
  localStorage.removeItem('email');
  console.log('Dados de autenticação removidos.');
};
