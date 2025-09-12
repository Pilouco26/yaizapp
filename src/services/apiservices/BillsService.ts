import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';

export type APIRawBill = {
  Data: string;
  'Descripció': string;
  Import: string;
  Moneda: string;
};

/**
 * Llama a la API Mockoon y devuelve el listado crudo de facturas.
 * Uses configuration from config.ts for the API endpoint.
 */
export const getBills = async (): Promise<any[]> => {
  try {
    const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.BILLS);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch bills: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Sube las facturas a la API Mockoon usando POST /api/bills
 * Sends the CSV data as JSON to the API endpoint
 */
export const uploadBills = async (billsData: any[]): Promise<any> => {
  try {
    const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.UPLOAD_BILLS);
    
    console.log('📤 Uploading bills to API:', apiUrl);
    console.log('📊 Data being sent:', JSON.stringify(billsData, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(billsData),
    });

    console.log('📥 API Response Status:', response.status);
    console.log('📥 API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Success Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Upload Bills Error:', error);
    throw new Error(`Failed to upload bills: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
