import axios from 'axios';

const KEYAUTH_API_URL = 'https://keyauth.win/api/1.1/';
const SELLER_API_URL = 'https://keyauth.win/api/seller/';

export class KeyAuth {
  private name: string;
  private ownerid: string;
  private version: string;
  private sellerkey: string;

  constructor() {
    this.name = process.env.NEXT_PUBLIC_KEYAUTH_NAME || '';
    this.ownerid = process.env.NEXT_PUBLIC_KEYAUTH_OWNER || '';
    this.version = process.env.NEXT_PUBLIC_KEYAUTH_VERSION || '';
    this.sellerkey = process.env.KEYAUTH_SELLER_KEY || '';
  }

  async login(username: string, pass: string) {
    // Note: KeyAuth 1.1 requires an 'init' call first usually, 
    // but we can wrap it or use a simplified approach for the admin panel login.
    // For this dashboard, we'll assume a direct login or credentials check.
    
    try {
      const initResp = await axios.get(`${KEYAUTH_API_URL}?type=init&name=${this.name}&ownerid=${this.ownerid}&ver=${this.version}`);
      const sessionid = initResp.data.sessionid;

      if (!initResp.data.success) {
        throw new Error(initResp.data.message || 'Initialization failed');
      }

      const loginResp = await axios.get(`${KEYAUTH_API_URL}?type=login&name=${this.name}&ownerid=${this.ownerid}&ver=${this.version}&username=${username}&pass=${pass}&sessionid=${sessionid}`);
      
      return loginResp.data;
    } catch (error: any) {
      console.error('KeyAuth Login Error:', error.response?.data || error.message);
      return { success: false, message: error.message };
    }
  }

  async banUser(user: string, reason: string = 'Banned from Admin Panel') {
    try {
      const response = await axios.get(`${SELLER_API_URL}?sellerkey=${this.sellerkey}&type=banuser&user=${user}&reason=${reason}`);
      return response.data;
    } catch (error: any) {
      console.error('KeyAuth Ban Error:', error.response?.data || error.message);
      return { success: false, message: error.message };
    }
  }

  async fetchUser(user: string) {
    try {
      const response = await axios.get(`${SELLER_API_URL}?sellerkey=${this.sellerkey}&type=userdata&user=${user}`);
      return response.data;
    } catch (error: any) {
      console.error('KeyAuth Fetch Error:', error.response?.data || error.message);
      return { success: false, message: error.message };
    }
  }

  async fetchAllUsers() {
    try {
      const response = await axios.get(`${SELLER_API_URL}?sellerkey=${this.sellerkey}&type=fetchallusers`);
      return response.data;
    } catch (error: any) {
      console.error('KeyAuth Fetch All Error:', error.response?.data || error.message);
      return { success: false, message: error.message };
    }
  }
}

export const keyAuth = new KeyAuth();
