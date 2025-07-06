const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Test server-side CSV storage functionality
async function testServerStorage() {
    console.log('🧪 Testing server-side CSV storage functionality...\n');

    // Test 1: Create and save a CSV file
    await testCSVSave();
    
    // Test 2: List saved files
    await testListFiles();
    
    // Test 3: Get storage statistics
    await testStorageStats();
    
    // Test 4: Download a file
    await testDownloadFile();
    
    // Test 5: Clean up test files
    await testCleanup();
}

async function testCSVSave() {
    console.log('📝 Test 1: Saving CSV to server...');
    
    const sampleData = {
        totalUrls: 2,
        successfulUrls: 2,
        failedUrls: 0,
        totalEmails: 3,
        results: [
            {
                url: 'https://example.com',
                success: true,
                emails: ['contact@example.com', 'info@example.com'],
                totalEmails: 2,
                pagesVisited: 5,
                personalData: {
                    'contact@example.com': {
                        names: ['John Doe'],
                        jobTitles: ['CEO'],
                        companies: ['Example Corp']
                    }
                }
            },
            {
                url: 'https://example.org',
                success: true,
                emails: ['hello@example.org'],
                totalEmails: 1,
                pagesVisited: 3,
                personalData: {}
            }
        ],
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch('http://localhost:3001/api/export/csv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: sampleData }),
        });

        if (response.ok) {
            const csvContent = await response.text();
            console.log('✅ CSV saved to server successfully');
            console.log(`   Content length: ${csvContent.length} characters`);
            console.log(`   Lines: ${csvContent.split('\n').length}`);
        } else {
            console.log('❌ Failed to save CSV to server');
        }
    } catch (error) {
        console.error('❌ Error saving CSV:', error.message);
    }
}

async function testListFiles() {
    console.log('\n📋 Test 2: Listing saved CSV files...');
    
    try {
        const response = await fetch('http://localhost:3001/api/csv-files?limit=10');
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Files listed successfully');
            console.log(`   Total files: ${data.data.total}`);
            
            if (data.data.files.length > 0) {
                console.log('   Recent files:');
                data.data.files.slice(0, 3).forEach((file, index) => {
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    console.log(`     ${index + 1}. ${file.filename} (${sizeMB} MB, ${file.metadata.rowCount || 'Unknown'} rows)`);
                });
            } else {
                console.log('   No files found');
            }
        } else {
            console.log('❌ Failed to list files:', data.error);
        }
    } catch (error) {
        console.error('❌ Error listing files:', error.message);
    }
}

async function testStorageStats() {
    console.log('\n📊 Test 3: Getting storage statistics...');
    
    try {
        const response = await fetch('http://localhost:3001/api/storage/stats');
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Storage stats retrieved successfully');
            console.log(`   Total files: ${data.data.totalFiles}`);
            console.log(`   Total size: ${data.data.totalSizeMB} MB`);
            console.log(`   Total rows: ${data.data.totalRows}`);
            console.log(`   Storage directory: ${data.data.storageDir}`);
        } else {
            console.log('❌ Failed to get storage stats:', data.error);
        }
    } catch (error) {
        console.error('❌ Error getting storage stats:', error.message);
    }
}

async function testDownloadFile() {
    console.log('\n📥 Test 4: Downloading a CSV file...');
    
    try {
        // First, get the list of files
        const listResponse = await fetch('http://localhost:3001/api/csv-files?limit=1');
        const listData = await listResponse.json();
        
        if (listData.success && listData.data.files.length > 0) {
            const filename = listData.data.files[0].filename;
            console.log(`   Attempting to download: ${filename}`);
            
            const downloadResponse = await fetch(`http://localhost:3001/api/csv-files/${filename}`);
            
            if (downloadResponse.ok) {
                const content = await downloadResponse.text();
                console.log('✅ File downloaded successfully');
                console.log(`   Content length: ${content.length} characters`);
                console.log(`   Lines: ${content.split('\n').length}`);
            } else {
                console.log('❌ Failed to download file');
            }
        } else {
            console.log('   No files available for download test');
        }
    } catch (error) {
        console.error('❌ Error downloading file:', error.message);
    }
}

async function testCleanup() {
    console.log('\n🧹 Test 5: Testing cleanup functionality...');
    
    try {
        // Test cleanup with a very old date (should not delete recent files)
        const response = await fetch('http://localhost:3001/api/storage/cleanup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ daysOld: 1 }) // Only delete files older than 1 day
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Cleanup completed successfully');
            console.log(`   Files deleted: ${data.deletedCount}`);
        } else {
            console.log('❌ Cleanup failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
    }
}

// Test file storage utility directly
function testFileStorageUtility() {
    console.log('\n🔧 Test 6: Testing file storage utility directly...');
    
    const fileStorage = require('./scraper-everthing/src/utils/fileStorage');
    
    // Test saving a file
    const testContent = 'Email,Source URL,Names\njohn@example.com,https://example.com,John Doe\n';
    const saveResult = fileStorage.saveCSV(testContent, { test: true });
    
    if (saveResult.success) {
        console.log('✅ Direct file save successful');
        console.log(`   Filename: ${saveResult.filename}`);
        console.log(`   Size: ${saveResult.metadata.size} bytes`);
        console.log(`   Rows: ${saveResult.metadata.rowCount}`);
        
        // Test getting files
        const filesResult = fileStorage.getCSVFiles(5);
        if (filesResult.success) {
            console.log(`   Total files in storage: ${filesResult.total}`);
        }
        
        // Test getting storage stats
        const statsResult = fileStorage.getStorageStats();
        if (statsResult.success) {
            console.log(`   Storage stats: ${statsResult.stats.totalFiles} files, ${statsResult.stats.totalSizeMB} MB`);
        }
    } else {
        console.log('❌ Direct file save failed:', saveResult.error);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting server storage tests...\n');
    
    await testServerStorage();
    testFileStorageUtility();
    
    console.log('\n✨ Server storage tests completed!');
    console.log('\n📁 CSV files are now saved in:');
    console.log('   scraper-everthing/storage/csv-exports/');
}

// Run if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { 
    testServerStorage, 
    testCSVSave, 
    testListFiles, 
    testStorageStats, 
    testDownloadFile, 
    testCleanup,
    testFileStorageUtility 
}; 