import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { checkAllWebsites, getWebsiteStatuses } from './status-checker.js';
import { db } from './database.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get('/api/websites', async (req, res) => {
  try {
    console.log('Fetching website statuses...');
    const statuses = await getWebsiteStatuses();
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching website statuses:', error);
    res.status(500).json({ error: 'Failed to fetch website statuses' });
  }
});

app.post('/api/websites/check', async (req, res) => {
  try {
    console.log('Checking all websites...');
    const statuses = await checkAllWebsites();
    res.json(statuses);
  } catch (error) {
    console.error('Error checking websites:', error);
    res.status(500).json({ error: 'Failed to check websites' });
  }
});

app.post('/api/websites', async (req, res) => {
  try {
    const { name, url } = req.body;
    
    if (!name || !url) {
      res.status(400).json({ error: 'Name and URL are required' });
      return;
    }
    
    console.log(`Adding new website: ${name} - ${url}`);
    
    await db.insertInto('websites').values({
      name,
      url
    }).execute();
    
    res.json({ message: 'Website added successfully' });
  } catch (error) {
    console.error('Error adding website:', error);
    res.status(500).json({ error: 'Failed to add website' });
  }
});

app.delete('/api/websites/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    console.log(`Deleting website with ID: ${id}`);
    
    await db.deleteFrom('status_checks').where('website_id', '=', id).execute();
    await db.deleteFrom('websites').where('id', '=', id).execute();
    
    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
