import axios from 'axios';
import { API_URL } from '@/config/env';
import portfolioStorage from './portfolioStorage';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const portfolioApi = {
  /**
   * Save portfolio data to a JSON file via the server
   */
  async savePortfolioToFile(portfolioData) {
    try {
      await api.post('/portfolio/save-to-file', portfolioData);
      console.log('Portfolio data saved to JSON file');
      return true;
    } catch (error) {
      console.error('Error saving portfolio data to file:', error);
      return false;
    }
  },

  /**
   * Get the complete portfolio data
   * This uses portfolioStorage.getPortfolio to get from localStorage or file first
   */
  async getPortfolio() {
    try {
      // Use portfolioStorage to get from localStorage or file
      const data = await portfolioStorage.getPortfolio();
      return data;
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      throw error;
    }
  },

  /**
   * Update portfolio from GitHub username
   */
  async updateFromGitHub(username: string) {
    try {
      const response = await api.post('/github/update', { username });
      return response.data;
    } catch (error) {
      console.error('Error updating from GitHub:', error);
      throw error;
    }
  },

  /**
   * Update portfolio from LinkedIn profile URL
   */
  async updateFromLinkedIn(linkedinUrl: string) {
    try {
      const response = await api.post('/linkedin/update', { url: linkedinUrl });
      return response.data;
    } catch (error) {
      console.error('Error updating from LinkedIn:', error);
      throw error;
    }
  },

  /**
   * Upload and process resume PDF
   */
  async uploadResume(file: File) {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  },

  /**
   * Generate AI insights from portfolio data
   */
  async generateInsights() {
    try {
  
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  },
};

export default portfolioApi;