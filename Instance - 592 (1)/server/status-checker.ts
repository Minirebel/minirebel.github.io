import { db } from './database.js';

export interface WebsiteStatus {
  id: number;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  response_time: number | null;
  last_checked: string;
}

export async function checkWebsiteStatus(url: string): Promise<{ status: 'online' | 'offline', response_time: number | null }> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Website Status Checker'
      }
    });
    
    clearTimeout(timeoutId);
    const response_time = Date.now() - startTime;
    
    return {
      status: response.ok ? 'online' : 'offline',
      response_time
    };
  } catch (error) {
    const response_time = Date.now() - startTime;
    console.log(`Error checking ${url}:`, error);
    return {
      status: 'offline',
      response_time
    };
  }
}

export async function checkAllWebsites(): Promise<WebsiteStatus[]> {
  const websites = await db.selectFrom('websites').selectAll().execute();
  
  const statusPromises = websites.map(async (website) => {
    const { status, response_time } = await checkWebsiteStatus(website.url);
    
    await db.insertInto('status_checks').values({
      website_id: website.id,
      status,
      response_time,
      checked_at: new Date().toISOString()
    }).execute();
    
    return {
      id: website.id,
      name: website.name,
      url: website.url,
      status,
      response_time,
      last_checked: new Date().toISOString()
    };
  });
  
  return Promise.all(statusPromises);
}

export async function getWebsiteStatuses(): Promise<WebsiteStatus[]> {
  const websites = await db.selectFrom('websites').selectAll().execute();
  
  const statusPromises = websites.map(async (website) => {
    const lastCheck = await db
      .selectFrom('status_checks')
      .selectAll()
      .where('website_id', '=', website.id)
      .orderBy('checked_at', 'desc')
      .limit(1)
      .executeTakeFirst();
    
    return {
      id: website.id,
      name: website.name,
      url: website.url,
      status: (lastCheck?.status as 'online' | 'offline') || 'checking',
      response_time: lastCheck?.response_time || null,
      last_checked: lastCheck?.checked_at || new Date().toISOString()
    };
  });
  
  return Promise.all(statusPromises);
}
